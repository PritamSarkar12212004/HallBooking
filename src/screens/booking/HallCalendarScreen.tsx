import React from 'react';
import {
  ScrollView,
  Image,
  Text,
  TouchableOpacity,
  View,
} from '../../lib/style/withTailwind';
import Wrapper from '../../layouts/wraper/Wraper';
import DateButton from '../../components/buttons/DateButton';
import InputField from '../../components/input/InputField';
import MultiSelector from '../../components/Selector/MultiSelector';
import MainButton from '../../components/buttons/MainButton';
import DatePickerModal from '../../components/picker/DatePickerModal';
import {
  Building2,
  Camera,
  ImagePlus,
  Trash2,
  UploadCloud,
  UserRound,
} from 'lucide-react-native';
import { Divider } from 'react-native-paper';
import { MainRoute } from '../../const/routes/route';
import TimePicker from '../../components/picker/TimePicker';
import SubHeader from '../../components/header/SubHeader';
import { Theme } from '../../const/theme/Theme';
import useHallCalendarForm from '../../hooks/booking/useHallCalendarForm';



const HallCalendarScreen = ({ navigation }: any) => {
  const {
    dayTypes,
    selectedDayType,
    selectDayType,
    startDate,
    endDate,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    bookingName,
    setBookingName,
    bookingTakenBy,
    setBookingTakenBy,
    calendarVisible,
    activeField,
    selectedDay,
    selectDay,
    monthName,
    daysInMonth,
    liveStartDay,
    liveEndDay,
    openCalendar,
    closeCalendar,
    confirmDate,
    goPreviousMonth,
    goNextMonth,
    eventPhotoUri,
    uploadingImage,
    captureEventPhoto,
    pickEventPhoto,
    clearEventPhoto,
    isFormValid,
    loader,
    actionPress,
  } = useHallCalendarForm({
    onSubmit: () => navigation.navigate(MainRoute.NewBooking, {}),
  });

  return (
    <Wrapper safeBottom>
      <SubHeader navigation={navigation} title="Halls" />
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <MultiSelector
          title="Booking Taken By"
          list={dayTypes}
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
          title="Hall Name *"
          value={bookingName}
          setvalue={setBookingName}
          placeholder="Hall name"
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

        <Text
          className="text-sm font-semibold mb-3"
          style={{ color: Theme.text.secondary }}
        >
          EVENT / Hall PHOTO *
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
                {uploadingImage
                  ? 'Uploading photo...'
                  : 'Photo ready to upload'}
              </Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={clearEventPhoto}
                className="flex-row items-center px-3 py-2 rounded-lg"
                style={{ backgroundColor: Theme.background.third }}
              >
                <Trash2 size={15} color="#F87171" />
                <Text
                  className="ml-1.5 text-xs font-semibold"
                  style={{ color: '#F87171' }}
                >
                  Remove
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            activeOpacity={0.8}
            className="rounded-2xl border-2 border-dashed items-center justify-center py-10 mb-4"
            style={{
              borderColor: Theme.border.primary,
              backgroundColor: Theme.background.secondary,
            }}
          >
            {uploadingImage ? (
              <>
                <UploadCloud size={30} color={Theme.button.primary} />
                <Text
                  className="mt-2 text-sm font-semibold"
                  style={{ color: Theme.text.primary }}
                >
                  Uploading...
                </Text>
              </>
            ) : (
              <>
                <ImagePlus size={30} color={Theme.button.primary} />
                <Text
                  className="mt-2 text-sm font-semibold"
                  style={{ color: Theme.text.primary }}
                >
                  Add Event Photo
                </Text>
                <Text
                  className="mt-1 text-xs"
                  style={{ color: Theme.text.secondary }}
                >
                  Take a photo or choose from gallery
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}

        <View className="flex-row gap-3 mb-2">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => captureEventPhoto()}
            className="flex-1 flex-row items-center justify-center py-3 rounded-xl"
            style={{ backgroundColor: Theme.background.third }}
          >
            <Camera size={16} color={Theme.button.primary} />
            <Text
              className="ml-2 text-sm font-semibold"
              style={{ color: Theme.text.primary }}
            >
              Camera
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => pickEventPhoto()}
            className="flex-1 flex-row items-center justify-center py-4 rounded-xl"
            style={{ backgroundColor: Theme.background.third }}
          >
            <ImagePlus size={16} color={Theme.button.primary} />
            <Text
              className="ml-2 text-sm font-semibold"
              style={{ color: Theme.text.primary }}
            >
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
          activeField === 'start' ? 'Select Start Date' : 'Select End Date'
        }
        selectedDay={selectedDay}
        monthName={monthName}
        daysInMonth={daysInMonth}
        startDay={liveStartDay}
        endDay={liveEndDay}
        onClose={closeCalendar}
        onSelectDay={selectDay}
        onConfirm={confirmDate}
        onPreviousMonth={goPreviousMonth}
        onNextMonth={goNextMonth}
      />
    </Wrapper>
  );
};

export default HallCalendarScreen;
