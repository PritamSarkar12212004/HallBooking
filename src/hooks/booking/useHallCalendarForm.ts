import { useCallback, useState } from 'react';
import { showMessage } from 'react-native-flash-message';

import { useAppSelector } from '../redux/redux';
import useHallEventPhoto from './useHallEventPhoto';
import { startDraft } from '../../manager/draftBookingStore';
import { formatDisplayDate } from '../../functions/booking/BookingDateTimeRules';
import {
  DEFAULT_BOOKING_TYPE,
  HALL_DAY_TYPES,
  buildHallBookingDraft,
  getDaysInMonth,
  getMonthLabel,
  getNextMonth,
  getPreviousMonth,
  getStartDayOfRange,
  isHallBookingFormValid,
  isOneDayBookingType,
  resolveCalendarSelection,
  resolveConfirmedRange,
} from '../../functions/booking/HallCalenderFunction';
import type { HallCalendarField } from '../../functions/booking/HallCalenderFunction';

export interface UseHallCalendarFormOptions {
  onSubmit?: () => void;
}

const useHallCalendarForm = ({ onSubmit }: UseHallCalendarFormOptions = {}) => {
  const user = useAppSelector(state => state.user.user);

  const photo = useHallEventPhoto();

  const [selectedDayType, setSelectedDayType] = useState<string[]>([
    DEFAULT_BOOKING_TYPE,
  ]);
  const [startDate, setStartDate] = useState(() =>
    formatDisplayDate(new Date()),
  );
  const [endDate, setEndDate] = useState(() => formatDisplayDate(new Date()));
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [bookingName, setBookingName] = useState('');
  const [bookingTakenBy, setBookingTakenBy] = useState(() => user?.name ?? '');

  const [calendarVisible, setCalendarVisible] = useState(false);
  const [activeField, setActiveField] = useState<HallCalendarField>('start');
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [viewMonthIndex, setViewMonthIndex] = useState(() =>
    new Date().getMonth(),
  );
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());

  const [loader, setLoader] = useState(false);

  const isOneDayBooking = isOneDayBookingType(selectedDayType);

  const closeCalendar = useCallback(() => {
    setCalendarVisible(false);
    setSelectedDay(null);
  }, []);

  /** Calendar kholta hai aur us field ki existing date select kar deta hai. */
  const openCalendar = useCallback(
    (field: HallCalendarField) => {
      const selection = resolveCalendarSelection(field, { startDate, endDate });

      setActiveField(selection.activeField);
      setSelectedDay(selection.selectedDay);
      setCalendarVisible(true);
    },
    [startDate, endDate],
  );

  const confirmDate = useCallback(() => {
    const nextRange = resolveConfirmedRange({
      activeField,
      selectedDay,
      viewMonthIndex,
      viewYear,
      startDate,
      endDate,
      isOneDayBooking,
    });

    if (!nextRange) return;

    setStartDate(nextRange.startDate);
    setEndDate(nextRange.endDate);
    closeCalendar();
  }, [
    activeField,
    selectedDay,
    viewMonthIndex,
    viewYear,
    startDate,
    endDate,
    isOneDayBooking,
    closeCalendar,
  ]);

  const goPreviousMonth = useCallback(() => {
    const previous = getPreviousMonth(viewMonthIndex, viewYear);

    setViewMonthIndex(previous.monthIndex);
    setViewYear(previous.year);
  }, [viewMonthIndex, viewYear]);

  const goNextMonth = useCallback(() => {
    const next = getNextMonth(viewMonthIndex, viewYear);

    setViewMonthIndex(next.monthIndex);
    setViewYear(next.year);
  }, [viewMonthIndex, viewYear]);

  const selectDayType = useCallback((name: string) => {
    setSelectedDayType([name]);
  }, []);

  const isFormValid = isHallBookingFormValid({
    selectedDayType,
    startDate,
    endDate,
    startTime,
    endTime,
    bookingName,
    bookingTakenBy,
    eventImageUrl: photo.eventImageUrl,
  });

  const actionPress = useCallback(async () => {
    if (!isFormValid || loader) return;

    if (!user?.token) {
      showMessage({
        message: 'Authentication Error',
        description: 'User token is missing. Please login again.',
        type: 'danger',
      });
      return;
    }

    setLoader(true);
    try {
      startDraft(
        buildHallBookingDraft({
          selectedDayType,
          startDate,
          endDate,
          startTime,
          endTime,
          bookingName,
          bookingTakenBy,
          eventImageUrl: photo.eventImageUrl,
        }),
      );

      onSubmit?.();
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
      setLoader(false);
    }
  }, [
    isFormValid,
    loader,
    user?.token,
    selectedDayType,
    startDate,
    endDate,
    startTime,
    endTime,
    bookingName,
    bookingTakenBy,
    photo.eventImageUrl,
    onSubmit,
  ]);
  const monthName = getMonthLabel(viewMonthIndex, viewYear);
  const daysInMonth = getDaysInMonth(viewMonthIndex);
  const startDayNum = getStartDayOfRange(startDate);
  const liveStartDay = activeField === 'end' ? startDayNum : null;
  const liveEndDay = activeField === 'end' ? selectedDay : null;

  return {
    /* booking type */
    dayTypes: HALL_DAY_TYPES,
    selectedDayType,
    selectDayType,
    isOneDayBooking,

    /* dates & times */
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
    selectDay: setSelectedDay,
    monthName,
    daysInMonth,
    liveStartDay,
    liveEndDay,
    openCalendar,
    closeCalendar,
    confirmDate,
    goPreviousMonth,
    goNextMonth,
    eventPhotoUri: photo.eventPhotoUri,
    eventImageUrl: photo.eventImageUrl,
    uploadingImage: photo.uploadingImage,
    captureEventPhoto: photo.captureEventPhoto,
    pickEventPhoto: photo.pickEventPhoto,
    clearEventPhoto: photo.clearEventPhoto,
    isFormValid,
    loader,
    actionPress,
  };
};

export default useHallCalendarForm;
