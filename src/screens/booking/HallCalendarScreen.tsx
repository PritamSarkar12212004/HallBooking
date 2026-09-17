import React, { useState } from 'react';
import { ScrollView, Image, Text, TouchableOpacity, View } from '../../lib/style/withTailwind';
import { Alert } from 'react-native';
import type { Asset } from 'react-native-image-picker';
import Wrapper from '../../layouts/wraper/Wraper';
import DateButton from '../../components/buttons/DateButton';
import InputField from '../../components/input/InputField';
import MultiSelector from '../../components/Selector/MultiSelector';
import MainButton from '../../components/buttons/MainButton';
import DatePickerModal from '../../components/picker/DatePickerModal';
import { Building2, Camera, ImagePlus, Trash2, UploadCloud, UserRound } from 'lucide-react-native';
import { Divider } from 'react-native-paper';
import { MainRoute } from '../../const/routes/route';
import TimePicker from '../../components/picker/TimePicker';
import { useAppSelector } from '../../hooks/redux/redux';
import { showMessage } from 'react-native-flash-message';
import SubHeader from '../../components/header/SubHeader';
import { Theme } from '../../const/theme/Theme';
import { capturePhoto, pickFromGallery } from '../../module/ImagePickerModule';
import uploadImage from '../../services/Cloudinary/uploadImg';
import { startDraft } from '../../manager/draftBookingStore';
import {
    formatDisplayDate,
    isLaterDay,
    monthNames,
    parseDisplayDate,
} from '../../functions/booking/BookingDateTimeRules';

const daysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

const today = new Date();
const currentYear = today.getFullYear();
const currentMonthIndex = today.getMonth();

/**
 * Only used as the *initial* value of the date fields.
 *
 * The calendar is intentionally unrestricted now: every day of every month is
 * selectable (past, today or future) and the time pickers have no minimum, so
 * the user is free to book any date / time in either "1 Day" or "More Day".
 */
const todayString = formatDisplayDate(today);

const HallCalendarScreen = ({ navigation }: any) => {
    const user = useAppSelector((state) => state.user.user);

    const [startDate, setStartDate] = useState(todayString);
    const [endDate, setEndDate] = useState(todayString);

    const [bookingName, setBookingName] = useState('');
    const [bookingTakenBy, setBookingTakenBy] = useState('');

    const [eventPhotoUri, setEventPhotoUri] = useState<string | null>(null);
    const [eventImageUrl, setEventImageUrl] = useState<string | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);

    const [calendarVisible, setCalendarVisible] = useState(false);

    const [activeField, setActiveField] = useState<'start' | 'end'>('start');

    const [selectedDay, setSelectedDay] = useState<number | null>(null);

    const [viewMonthIndex, setViewMonthIndex] = useState(currentMonthIndex);
    const [viewYear, setViewYear] = useState(currentYear);

    const [loader, setLoader] = useState<boolean>(false)

    const processPhoto = async (photo: Asset | null) => {
        if (!photo?.uri) return;

        const localUri = (photo.uri as string) ?? null;
        setEventPhotoUri(localUri);
        setEventImageUrl(null);
        setUploadingImage(true);

        try {
            const uploaded = await uploadImage(localUri);
            setEventImageUrl(uploaded.secure_url);
        } catch (error: any) {
            console.log('Upload Error:', error);
            showMessage({
                message: 'Upload Failed',
                description: 'Could not upload the photo. Please try again.',
                type: 'danger',
            });
            setEventPhotoUri(null);
        } finally {
            setUploadingImage(false);
        }
    };

    const choosePhotoSource = () => {
        Alert.alert(
            'Event Photo',
            'Choose where to take/select the photo',
            [
                {
                    text: 'Take Photo',
                    onPress: async () => {
                        const photo = await capturePhoto({ cameraType: 'back' });
                        await processPhoto(photo);
                    },
                },
                {
                    text: 'Choose from Gallery',
                    onPress: async () => {
                        const photo = await pickFromGallery();
                        await processPhoto(photo);
                    },
                },
                { text: 'Cancel', style: 'cancel' },
            ],
            { cancelable: true },
        );
    };

    const removePhoto = () => {
        setEventPhotoUri(null);
        setEventImageUrl(null);
    };

    const openCalendar = (field: 'start' | 'end') => {
        setActiveField(field);

        const existingDate =
            field === 'start'
                ? startDate
                : endDate;

        const parsed = parseDisplayDate(existingDate);

        setSelectedDay(parsed ? parsed.getDate() : null);

        setCalendarVisible(true);
    };

    const closeCalendar = () => {
        setCalendarVisible(false);
        setSelectedDay(null);
    };

    const confirmDate = () => {
        if (!selectedDay) return;

        const dateStr = formatDisplayDate(
            new Date(viewYear, viewMonthIndex, selectedDay)
        );

        // Dates are never validated: ANY day of ANY month is selectable —
        // past, today or future — in both "1 Day" and "More Day".
        //
        // The only adjustment kept is keeping the range ordered:
        // - "1 Day" is a single-day booking, so the end date mirrors the pick.
        // - "More Day" keeps the dates independent, but picking a start date
        //   later than the current end date pushes the end date along.
        // No picked time is ever cleared or clamped here.
        const shouldMoveEndDate =
            activeField === 'start' &&
            (isOneDayBooking || isLaterDay(dateStr, endDate));

        if (activeField === 'start') {
            setStartDate(dateStr);
            if (shouldMoveEndDate) {
                setEndDate(dateStr);
            }
        } else {
            setEndDate(dateStr);
        }

        closeCalendar();
    };

    const goPreviousMonth = () => {
        if (viewMonthIndex === 0) {
            setViewMonthIndex(11);
            setViewYear(viewYear - 1);
        } else {
            setViewMonthIndex(viewMonthIndex - 1);
        }
    };

    const goNextMonth = () => {
        if (viewMonthIndex === 11) {
            setViewMonthIndex(0);
            setViewYear(viewYear + 1);
        } else {
            setViewMonthIndex(viewMonthIndex + 1);
        }
    };

    const monthName = `${monthNames[viewMonthIndex]} ${viewYear}`;
    const daysInMonth = daysInMonths[viewMonthIndex];

    const startDayNum = parseDisplayDate(startDate)?.getDate() ?? null;
    const liveStartDay = activeField === 'end' ? startDayNum : null;
    const liveEndDay = activeField === 'end' ? selectedDay : null;
    const [selectedDayType, setSelectedDayType] =
        useState<string[]>(['1 Day']);
    const selectDayType = (name: string) => {
        setSelectedDayType([name]);
    };
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const dayType = [
        "1 Day",
        "More Day"
    ]

    // Both modes keep BOTH time wheels completely free: no minimum time, no
    // "must be after the start time" rule and no past-time cleanup.
    // "1 Day" additionally mirrors the picked date into the end date.
    const isOneDayBooking = !selectedDayType.includes('More Day');

    const isFormValid =
        selectedDayType.length > 0 &&
        startDate.trim().length > 0 &&
        endDate.trim().length > 0 &&
        startTime.trim().length > 0 &&
        endTime.trim().length > 0 &&
        bookingName.trim().length > 0 &&
        bookingTakenBy.trim().length > 0 &&
        !!eventImageUrl;

    const actionPress = async () => {
        if (!isFormValid || loader) {
            return;
        }

        if (!user?.token) {
            showMessage({
                message: 'Authentication Error',
                description: 'User token is missing. Please login again.',
                type: 'danger',
            });
            return;
        }

        setLoader(true)
        try {
            // DRAFT SYSTEM: nothing is created in the backend yet. The base
            // details are stored locally; the booking is created only when
            // the last step's "Done" is pressed.
            startDraft({
                bookingType: selectedDayType[0] || '1 Day',
                startDate,
                endDate,
                startTime,
                endTime,
                eventName: bookingName,
                bookedByStaff: bookingTakenBy,
                eventImage: eventImageUrl ?? undefined,
            });

            navigation.navigate(MainRoute.NewBooking, {});
        } catch (error: any) {
            showMessage({
                message: 'Booking Create Failed',
                description:
                    error?.response?.data?.message ||
                    error?.message ||
                    'Please try again.',
                type: 'danger',
                duration: 3000,
            });
        } finally {
            setLoader(false)
        }
    }

    return (
        <Wrapper safeBottom>
            <SubHeader
                navigation={navigation}
                title="Halls"
            />
            <ScrollView
                showsVerticalScrollIndicator={false}
                className="flex-1"
            >
                <MultiSelector
                    title="Booking Taken By"
                    list={dayType}
                    value={selectedDayType}
                    actionFunc={selectDayType}
                    selection="Single select"
                    Icon={UserRound}
                />
                {selectedDayType.includes('More Day') ? (
                    <>
                        <DateButton
                            title="Start Date *"
                            subTitle={startDate}
                            actionFunc={() => openCalendar('start')}
                        />

                        <View className="mb-2">
                            <Divider />
                        </View>

                        <TimePicker
                            title="Start Time *"
                            value={startTime}
                            onChange={setStartTime}
                        />

                        <View className="mb-2">
                            <Divider />
                        </View>

                        <DateButton
                            title="End Date *"
                            subTitle={endDate}
                            actionFunc={() => openCalendar('end')}
                        />

                        <View className="mb-2">
                            <Divider />
                        </View>

                        <TimePicker
                            title="End Time *"
                            value={endTime}
                            onChange={setEndTime}
                        />

                        <View className="mb-2">
                            <Divider />
                        </View>
                    </>
                ) : (
                    <>
                        <DateButton
                            title="Date *"
                            subTitle={startDate}
                            actionFunc={() => openCalendar('start')}
                        />

                        <View className="mb-2">
                            <Divider />
                        </View>
                        <View className="w-full flex gap-4">
                            {/* Both time wheels are completely free — any clock
                                time can be picked for start and end. */}
                            <TimePicker
                                title="Start Time *"
                                value={startTime}
                                onChange={setStartTime}
                            />
                            <TimePicker
                                title="End Time *"
                                value={endTime}
                                onChange={setEndTime}
                            />

                        </View>
                        <View className="mb-2 mt-2">
                            <Divider />
                        </View>
                    </>
                )}

                <InputField
                    title="Event / Hall Name *"
                    value={bookingName}
                    setvalue={setBookingName}
                    placeholder="Enter event / hall name"
                    keyType="default"
                    Icon={Building2}
                />
                <View className="mb-2">
                    <Divider />
                </View>
                <InputField
                    title="Booking Taken By *"
                    value={bookingTakenBy}
                    setvalue={setBookingTakenBy}
                    placeholder="Enter staff name"
                    keyType="default"
                    Icon={UserRound}
                />
                <View className="mb-3 mt-2">
                    <Divider />
                </View>

                <Text className="text-sm font-semibold mb-3" style={{ color: Theme.text.secondary }}>
                    EVENT PHOTO *
                </Text>

                {eventPhotoUri ? (
                    <View
                        className="rounded-2xl overflow-hidden mb-3"
                        style={{ backgroundColor: Theme.background.secondary }}
                    >
                        <Image
                            source={{ uri: eventPhotoUri }}
                            className="w-full"
                            style={{ height: 180 }}
                            resizeMode="cover"
                        />
                        <View className="flex-row items-center justify-between p-3">
                            <Text className="text-xs" style={{ color: Theme.text.secondary }}>
                                {uploadingImage ? 'Uploading photo...' : 'Photo ready to upload'}
                            </Text>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={removePhoto}
                                className="flex-row items-center px-3 py-2 rounded-lg"
                                style={{ backgroundColor: Theme.background.third }}
                            >
                                <Trash2 size={15} color="#F87171" />
                                <Text className="ml-1.5 text-xs font-semibold" style={{ color: '#F87171' }}>
                                    Remove
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={choosePhotoSource}
                        className="rounded-2xl border-2 border-dashed items-center justify-center py-10 mb-4"
                        style={{
                            borderColor: Theme.border.primary,
                            backgroundColor: Theme.background.secondary,
                        }}
                    >
                        {uploadingImage ? (
                            <>
                                <UploadCloud size={30} color={Theme.button.primary} />
                                <Text className="mt-2 text-sm font-semibold" style={{ color: Theme.text.primary }}>
                                    Uploading...
                                </Text>
                            </>
                        ) : (
                            <>
                                <ImagePlus size={30} color={Theme.button.primary} />
                                <Text className="mt-2 text-sm font-semibold" style={{ color: Theme.text.primary }}>
                                    Add Event Photo
                                </Text>
                                <Text className="mt-1 text-xs" style={{ color: Theme.text.secondary }}>
                                    Take a photo or choose from gallery
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                )}

                <View className="flex-row gap-3 mb-2">
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={async () => {
                            const photo = await capturePhoto({ cameraType: 'back' });
                            await processPhoto(photo);
                        }}
                        className="flex-1 flex-row items-center justify-center py-3 rounded-xl"
                        style={{ backgroundColor: Theme.background.third }}
                    >
                        <Camera size={16} color={Theme.button.primary} />
                        <Text className="ml-2 text-sm font-semibold" style={{ color: Theme.text.primary }}>
                            Camera
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={async () => {
                            const photo = await pickFromGallery();
                            await processPhoto(photo);
                        }}
                        className="flex-1 flex-row items-center justify-center py-4 rounded-xl"
                        style={{ backgroundColor: Theme.background.third }}
                    >
                        <ImagePlus size={16} color={Theme.button.primary} />
                        <Text className="ml-2 text-sm font-semibold" style={{ color: Theme.text.primary }}>
                            Gallery
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <MainButton
                title="Next"
                loader={loader}
                disabled={!isFormValid}
                actionFunc={actionPress}
            />

            <DatePickerModal
                visible={calendarVisible}
                title={
                    activeField === 'start'
                        ? 'Select Start Date'
                        : 'Select End Date'
                }
                selectedDay={selectedDay}
                monthName={monthName}
                daysInMonth={daysInMonth}
                startDay={liveStartDay}
                endDay={liveEndDay}
                onClose={closeCalendar}
                onSelectDay={setSelectedDay}
                onConfirm={confirmDate}
                onPreviousMonth={goPreviousMonth}
                onNextMonth={goNextMonth}
            />

        </Wrapper>
    );
};

export default HallCalendarScreen;