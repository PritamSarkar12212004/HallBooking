jest.mock('react-native-flash-message', () => ({
  showMessage: jest.fn(),
}));

jest.mock('../src/services/Cloudinary/uploadImg', () => ({
  __esModule: true,
  default: jest.fn(async () => ({
    secure_url: 'https://cdn.test/event.jpg',
    public_id: 'event',
  })),
}));

// react-native-compressor ek native module hai — test me stub kar diya jaata hai.
jest.mock('react-native-compressor', () => ({
  Image: {
    compress: jest.fn(async (uri: string) => `compressed-${uri}`),
  },
}));

import { showMessage } from 'react-native-flash-message';
import { Image as CompressorImage } from 'react-native-compressor';

import uploadImage from '../src/services/Cloudinary/uploadImg';
import {
  IMAGE_COMPRESSION_OPTIONS,
  compressImage,
} from '../src/services/Compressor/ImgCompressor';
import {
  buildHallBookingDraft,
  getDaysInMonth,
  getMonthLabel,
  getNextMonth,
  getPreviousMonth,
  getStartDayOfRange,
  isHallBookingFormValid,
  isOneDayBookingType,
  processPhoto,
  removePhoto,
  resolveCalendarSelection,
  resolveConfirmedRange,
} from '../src/functions/booking/HallCalenderFunction';
import type { HallBookingFormValues } from '../src/functions/booking/HallCalenderFunction';

const validValues: HallBookingFormValues = {
  selectedDayType: ['1 Day'],
  startDate: '17 Sep 2026',
  endDate: '17 Sep 2026',
  startTime: '10:00',
  endTime: '14:00',
  bookingName: 'Sharma Wedding',
  bookingTakenBy: 'Rahul',
  eventImageUrl: 'https://cdn.test/event.jpg',
};

describe('month helpers', () => {
  it('returns the days of a month by index', () => {
    expect(getDaysInMonth(0)).toBe(31);
    expect(getDaysInMonth(1)).toBe(28);
    expect(getDaysInMonth(8)).toBe(30);
  });

  it('builds the calendar label', () => {
    expect(getMonthLabel(8, 2026)).toBe('September 2026');
  });

  it('rolls the year over in both directions', () => {
    expect(getPreviousMonth(0, 2026)).toEqual({ monthIndex: 11, year: 2025 });
    expect(getPreviousMonth(5, 2026)).toEqual({ monthIndex: 4, year: 2026 });
    expect(getNextMonth(11, 2026)).toEqual({ monthIndex: 0, year: 2027 });
    expect(getNextMonth(5, 2026)).toEqual({ monthIndex: 6, year: 2026 });
  });

  it('reads the start day from the display date', () => {
    expect(getStartDayOfRange('17 Sep 2026')).toBe(17);
    expect(getStartDayOfRange('')).toBeNull();
  });
});

describe('resolveCalendarSelection', () => {
  it('opens on the field that was tapped and preselects its day', () => {
    expect(
      resolveCalendarSelection('start', {
        startDate: '17 Sep 2026',
        endDate: '25 Sep 2026',
      }),
    ).toEqual({ activeField: 'start', selectedDay: 17 });

    expect(
      resolveCalendarSelection('end', {
        startDate: '17 Sep 2026',
        endDate: '25 Sep 2026',
      }),
    ).toEqual({ activeField: 'end', selectedDay: 25 });
  });
});
describe('resolveConfirmedRange', () => {
  const base = {
    viewMonthIndex: 8,
    viewYear: 2026,
    startDate: '17 Sep 2026',
    endDate: '20 Sep 2026',
    selectedDay: 22,
  };

  it('moves the end date along in "1 Day" mode', () => {
    expect(
      resolveConfirmedRange({
        ...base,
        activeField: 'start',
        isOneDayBooking: true,
      }),
    ).toEqual({
      startDate: '22 Sep 2026',
      endDate: '22 Sep 2026',
    });
  });

  it('also moves the end date when the new start date is later ("More Day")', () => {
    expect(
      resolveConfirmedRange({
        ...base,
        activeField: 'start',
        isOneDayBooking: false,
      }),
    ).toEqual({
      startDate: '22 Sep 2026',
      endDate: '22 Sep 2026',
    });
  });

  it('keeps the old end date when the new start date is earlier', () => {
    expect(
      resolveConfirmedRange({
        ...base,
        selectedDay: 10,
        activeField: 'start',
        isOneDayBooking: false,
      }),
    ).toEqual({
      startDate: '10 Sep 2026',
      endDate: '20 Sep 2026',
    });
  });

  it('only touches the end date when the end field is active', () => {
    expect(
      resolveConfirmedRange({
        ...base,
        activeField: 'end',
        isOneDayBooking: true,
      }),
    ).toEqual({
      startDate: '17 Sep 2026',
      endDate: '22 Sep 2026',
    });
  });

  it('returns null while no day is selected', () => {
    expect(
      resolveConfirmedRange({
        ...base,
        selectedDay: null,
        activeField: 'start',
        isOneDayBooking: true,
      }),
    ).toBeNull();
  });
});
describe('isOneDayBookingType', () => {
  it('is true unless "More Day" is selected', () => {
    expect(isOneDayBookingType(['1 Day'])).toBe(true);
    expect(isOneDayBookingType(['More Day'])).toBe(false);
  });
});

describe('isHallBookingFormValid', () => {
  it('accepts a fully filled form', () => {
    expect(isHallBookingFormValid(validValues)).toBe(true);
  });

  it('rejects an empty or whitespace-only field', () => {
    expect(isHallBookingFormValid({ ...validValues, bookingName: '   ' })).toBe(
      false,
    );
    expect(isHallBookingFormValid({ ...validValues, startTime: '' })).toBe(false);
  });

  it('requires the uploaded photo URL', () => {
    expect(isHallBookingFormValid({ ...validValues, eventImageUrl: null })).toBe(
      false,
    );
  });

  it('requires at least one booking type', () => {
    expect(isHallBookingFormValid({ ...validValues, selectedDayType: [] })).toBe(
      false,
    );
  });
});

describe('buildHallBookingDraft', () => {
  it('maps the form values to the draft booking base fields', () => {
    expect(buildHallBookingDraft(validValues)).toEqual({
      bookingType: '1 Day',
      startDate: '17 Sep 2026',
      endDate: '17 Sep 2026',
      startTime: '10:00',
      endTime: '14:00',
      eventName: 'Sharma Wedding',
      bookedByStaff: 'Rahul',
      eventImage: 'https://cdn.test/event.jpg',
    });
  });

  it('falls back to "1 Day" and drops a missing photo', () => {
    const draft = buildHallBookingDraft({
      ...validValues,
      selectedDayType: [],
      eventImageUrl: null,
    });

    expect(draft.bookingType).toBe('1 Day');
    expect(draft.eventImage).toBeUndefined();
  });
});

describe('compressImage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('compresses with the tuned defaults (1200x1200 @ quality 0.5)', async () => {
    const compressed = await compressImage('file:///event.jpg');

    expect(CompressorImage.compress).toHaveBeenCalledWith(
      'file:///event.jpg',
      IMAGE_COMPRESSION_OPTIONS,
    );
    expect(compressed).toBe('compressed-file:///event.jpg');
  });

  it('accepts custom options', async () => {
    await compressImage('file:///event.jpg', {
      compressionMethod: 'manual',
      maxWidth: 800,
      maxHeight: 800,
      quality: 0.8,
    });

    expect(CompressorImage.compress).toHaveBeenCalledWith(
      'file:///event.jpg',
      expect.objectContaining({ maxWidth: 800, quality: 0.8 }),
    );
  });

  it('returns null for an empty uri', async () => {
    expect(await compressImage(null)).toBeNull();
    expect(CompressorImage.compress).not.toHaveBeenCalled();
  });

  it('falls back to the original uri when compression fails', async () => {
    (CompressorImage.compress as jest.Mock).mockRejectedValueOnce(
      new Error('native failure'),
    );

    expect(await compressImage('file:///event.jpg')).toBe('file:///event.jpg');
  });
});

describe('processPhoto / removePhoto', () => {
  const createSetters = () => ({
    setEventPhotoUri: jest.fn(),
    setEventImageUrl: jest.fn(),
    setUploadingImage: jest.fn(),
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('previews the local uri, compresses it, uploads it and stores the url', async () => {
    const setters = createSetters();

    await processPhoto({ uri: 'file:///event.jpg' } as any, setters);

    expect(setters.setEventPhotoUri).toHaveBeenCalledWith('file:///event.jpg');
    expect(CompressorImage.compress).toHaveBeenCalledWith(
      'file:///event.jpg',
      IMAGE_COMPRESSION_OPTIONS,
    );
    // Upload compressed file se hota hai, original bhaari file se nahi.
    expect(uploadImage).toHaveBeenCalledWith('compressed-file:///event.jpg');
    expect(setters.setEventImageUrl).toHaveBeenCalledWith(
      'https://cdn.test/event.jpg',
    );
    expect(setters.setUploadingImage).toHaveBeenCalledWith(true);
    expect(setters.setUploadingImage).toHaveBeenLastCalledWith(false);
  });

  it('does nothing when the picker was cancelled', async () => {
    const setters = createSetters();

    await processPhoto(null, setters);

    expect(setters.setEventPhotoUri).not.toHaveBeenCalled();
    expect(uploadImage).not.toHaveBeenCalled();
  });

  it('drops the preview and shows an error when the upload fails', async () => {
    const setters = createSetters();

    (uploadImage as jest.Mock).mockRejectedValueOnce(new Error('boom'));

    await processPhoto({ uri: 'file:///event.jpg' } as any, setters);

    expect(setters.setEventImageUrl).toHaveBeenCalledWith(null);
    expect(setters.setEventPhotoUri).toHaveBeenLastCalledWith(null);
    expect(setters.setUploadingImage).toHaveBeenLastCalledWith(false);
    expect(showMessage).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Upload Failed', type: 'danger' }),
    );
  });

  it('clears both photo states on remove', () => {
    const setters = createSetters();

    removePhoto(setters);

    expect(setters.setEventPhotoUri).toHaveBeenCalledWith(null);
    expect(setters.setEventImageUrl).toHaveBeenCalledWith(null);
  });
});
