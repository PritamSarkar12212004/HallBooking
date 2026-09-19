import type { Asset } from 'react-native-image-picker';
import { showMessage } from 'react-native-flash-message';

import uploadImage from '../../services/Cloudinary/uploadImg';
import { compressImage } from '../../services/Compressor/ImgCompressor';
import type { DraftBookingData } from '../../manager/draftBookingStore';
import {
  formatDisplayDate,
  isLaterDay,
  monthNames,
  parseDisplayDate,
} from './BookingDateTimeRules';

export const HALL_DAY_TYPES: string[] = ['1 Day', 'More Day'];

export const ONE_DAY_BOOKING_TYPE = '1 Day';
export const MORE_DAY_BOOKING_TYPE = 'More Day';

export const DEFAULT_BOOKING_TYPE = ONE_DAY_BOOKING_TYPE;

export const daysInMonths: number[] = [
  31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31,
];

export type HallCalendarField = 'start' | 'end';

export interface HallCalendarSelection {
  activeField: HallCalendarField;
  selectedDay: number | null;
}

export interface HallCalendarRange {
  startDate: string;
  endDate: string;
}

export interface HallConfirmedRangeArgs {
  activeField: HallCalendarField;
  selectedDay: number | null;
  viewMonthIndex: number;
  viewYear: number;
  startDate: string;
  endDate: string;
  isOneDayBooking: boolean;
}

export interface HallBookingFormValues {
  selectedDayType: string[];
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  bookingName: string;
  bookingTakenBy: string;
  eventImageUrl: string | null;
}

const normalizeMonthIndex = (monthIndex: number) =>
  ((monthIndex % 12) + 12) % 12;

export const getDaysInMonth = (monthIndex: number): number =>
  daysInMonths[normalizeMonthIndex(monthIndex)];

export const getMonthLabel = (monthIndex: number, year: number): string =>
  `${monthNames[normalizeMonthIndex(monthIndex)]} ${year}`;

export const getPreviousMonth = (monthIndex: number, year: number) =>
  monthIndex === 0
    ? { monthIndex: 11, year: year - 1 }
    : { monthIndex: monthIndex - 1, year };

export const getNextMonth = (monthIndex: number, year: number) =>
  monthIndex === 11
    ? { monthIndex: 0, year: year + 1 }
    : { monthIndex: monthIndex + 1, year };

export const getStartDayOfRange = (startDate: string): number | null =>
  parseDisplayDate(startDate)?.getDate() ?? null;

export const resolveCalendarSelection = (
  field: HallCalendarField,
  { startDate, endDate }: Pick<HallBookingFormValues, 'startDate' | 'endDate'>,
): HallCalendarSelection => {
  const existingDate = field === 'start' ? startDate : endDate;
  const parsed = parseDisplayDate(existingDate);

  return {
    activeField: field,
    selectedDay: parsed ? parsed.getDate() : null,
  };
};

export const resolveConfirmedRange = ({
  activeField,
  selectedDay,
  viewMonthIndex,
  viewYear,
  startDate,
  endDate,
  isOneDayBooking,
}: HallConfirmedRangeArgs): HallCalendarRange | null => {
  if (!selectedDay) return null;

  const dateStr = formatDisplayDate(
    new Date(viewYear, viewMonthIndex, selectedDay),
  );

  if (activeField === 'end') {
    return { startDate, endDate: dateStr };
  }

  const shouldMoveEndDate = isOneDayBooking || isLaterDay(dateStr, endDate);

  return { startDate: dateStr, endDate: shouldMoveEndDate ? dateStr : endDate };
};

export const isOneDayBookingType = (selectedDayType: string[]): boolean =>
  !selectedDayType?.includes(MORE_DAY_BOOKING_TYPE);

const isFilled = (value?: string | null) => (value ?? '').trim().length > 0;

export const isHallBookingFormValid = ({
  selectedDayType,
  startDate,
  endDate,
  startTime,
  endTime,
  bookingName,
  bookingTakenBy,
  eventImageUrl,
}: HallBookingFormValues): boolean =>
  selectedDayType.length > 0 &&
  isFilled(startDate) &&
  isFilled(endDate) &&
  isFilled(startTime) &&
  isFilled(endTime) &&
  isFilled(bookingName) &&
  isFilled(bookingTakenBy) &&
  !!eventImageUrl;

export const buildHallBookingDraft = ({
  selectedDayType,
  startDate,
  endDate,
  startTime,
  endTime,
  bookingName,
  bookingTakenBy,
  eventImageUrl,
}: HallBookingFormValues): DraftBookingData => ({
  bookingType: selectedDayType[0] || DEFAULT_BOOKING_TYPE,
  startDate,
  endDate,
  startTime,
  endTime,
  eventName: bookingName,
  bookedByStaff: bookingTakenBy,
  eventImage: eventImageUrl ?? undefined,
});

export interface HallPhotoSetters {
  setEventPhotoUri: (uri: string | null) => void;
  setEventImageUrl: (url: string | null) => void;
  setUploadingImage: (uploading: boolean) => void;
}

export const processPhoto = async (
  photo: Asset | null,
  { setEventPhotoUri, setEventImageUrl, setUploadingImage }: HallPhotoSetters,
): Promise<void> => {
  if (!photo?.uri) return;

  const localUri = photo.uri as string;
  setEventPhotoUri(localUri);
  setEventImageUrl(null);
  setUploadingImage(true);

  try {
    const compressedUri = await compressImage(localUri);
    const uploaded = await uploadImage(compressedUri ?? localUri);
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

export const removePhoto = ({
  setEventPhotoUri,
  setEventImageUrl,
}: Pick<HallPhotoSetters, 'setEventPhotoUri' | 'setEventImageUrl'>): void => {
  setEventPhotoUri(null);
  setEventImageUrl(null);
};
