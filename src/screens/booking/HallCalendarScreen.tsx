import React, { useState } from 'react';
import { ScrollView, View } from '../../lib/style/withTailwind';

import Wrapper from '../../layouts/wraper/Wraper';
import MainDerder from '../../components/header/MainDerder';

import DateButton from '../../components/buttons/DateButton';
import InputField from '../../components/input/InputField';
import MultiSelector from '../../components/Selector/MultiSelector';
import MainButton from '../../components/buttons/MainButton';
import DatePickerModal from '../../components/picker/DatePickerModal';
import { Building2, PanelsTopLeft, UserRound } from 'lucide-react-native';
import { Divider } from 'react-native-paper';
import { MainRoute } from '../../const/routes/route';
import TimePicker from '../../components/picker/TimePicker';
import useCreateBooking from '../../api/booking/hooks/useCreateBooking';
import { useAppSelector } from '../../hooks/redux/redux';
import { showMessage } from 'react-native-flash-message';
import SubHeader from '../../components/header/SubHeader';

const staffMembers = [
    'Rahul Kumar',
    'Priya Singh',
    'Amit Verma',
    'Sneha Gupta',
];

const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

const daysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

const today = new Date();
const currentYear = today.getFullYear();
const currentMonthIndex = today.getMonth();
const todayDay = today.getDate();

const formatDate = (date: Date) =>
    `${date.getDate()} ${monthNames[date.getMonth()].slice(0, 3)} ${date.getFullYear()}`;

const todayString = formatDate(today);

const HallCalendarScreen = ({ navigation }: any) => {
    const user = useAppSelector((state) => state.user.user);
    const { createBookingAsync, isLoading: creatingBooking } = useCreateBooking();

    const [startDate, setStartDate] = useState(todayString);
    const [endDate, setEndDate] = useState(todayString);

    const [bookingName, setBookingName] = useState('');
    const [bookingTakenBy, setBookingTakenBy] = useState('');

    const [selectedStaff, setSelectedStaff] = useState<string[]>([]);

    const [calendarVisible, setCalendarVisible] = useState(false);

    const [activeField, setActiveField] = useState<'start' | 'end'>('start');

    const [selectedDay, setSelectedDay] = useState<number | null>(null);

    const [viewMonthIndex, setViewMonthIndex] = useState(currentMonthIndex);
    const [viewYear, setViewYear] = useState(currentYear);

    const [loader, setLoader] = useState<boolean>(false)

    const toggleStaff = (name: string) => {
        setSelectedStaff(prev =>
            prev.includes(name)
                ? prev.filter(n => n !== name)
                : [...prev, name]
        );
    };

    const openCalendar = (field: 'start' | 'end') => {
        setActiveField(field);

        const existingDate =
            field === 'start'
                ? startDate
                : endDate;

        const day = Number(existingDate.split(' ')[0]);

        setSelectedDay(
            Number.isNaN(day) ? null : day
        );

        setCalendarVisible(true);
    };

    const closeCalendar = () => {
        setCalendarVisible(false);
        setSelectedDay(null);
    };

    const confirmDate = () => {
        if (!selectedDay) return;

        const dateStr = `${selectedDay} ${monthNames[viewMonthIndex].slice(0, 3)} ${viewYear}`;

        if (activeField === 'start') {
            setStartDate(dateStr);
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

    const isCurrentMonth = viewMonthIndex === currentMonthIndex && viewYear === currentYear;

    const monthName = `${monthNames[viewMonthIndex]} ${viewYear}`;
    const daysInMonth = daysInMonths[viewMonthIndex];

    const startDayNum = Number(startDate.split(' ')[0]);
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

    const isFormValid =
        selectedDayType.length > 0 &&
        startDate.trim().length > 0 &&
        endDate.trim().length > 0 &&
        startTime.trim().length > 0 &&
        endTime.trim().length > 0 &&
        bookingName.trim().length > 0 &&
        bookingTakenBy.trim().length > 0;

    const actionPress = async () => {
        if (!isFormValid || loader || creatingBooking) {
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
            const res = await createBookingAsync({
                bookingType: selectedDayType[0] || '1 Day',
                startDate,
                endDate,
                startTime,
                endTime,
                eventName: bookingName,
                bookedByStaff: bookingTakenBy,
                allocatedTeam: selectedStaff,
                token: user.token,
            });

            // res.data = { booking, nextSteps }
            const booking = res?.booking;
            if (!booking?._id) {
                throw new Error('Booking id missing in response');
            }

            navigation.navigate(MainRoute.NewBooking, {
                bookingId: booking._id,
                bookingNumber: booking.bookingNumber,
            });
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
                            disabled={!startTime}
                            minTime={startTime}
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
                            <TimePicker
                                title="Start Time *"
                                value={startTime}
                                onChange={setStartTime}
                            />
                            <TimePicker
                                title="End Time *"
                                value={endTime}
                                onChange={setEndTime}
                                disabled={!startTime}
                                minTime={startTime}
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
                <View className="mb-3">
                    <Divider />
                </View>
                <MultiSelector
                    title="Allocate Team"
                    list={staffMembers}
                    value={selectedStaff}
                    actionFunc={toggleStaff}
                    selection="Multiple select"
                    Icon={PanelsTopLeft}
                />
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
                minDay={isCurrentMonth ? todayDay : undefined}
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