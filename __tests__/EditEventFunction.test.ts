jest.mock('../src/services/Cloudinary/uploadImg', () => ({
  __esModule: true,
  default: jest.fn(async () => ({
    secure_url: 'https://cdn.test/photo.jpg',
    public_id: 'photo',
  })),
}));

jest.mock('react-native-compressor', () => ({
  Image: {
    compress: jest.fn(async (uri: string) => `compressed-${uri}`),
  },
}));

import { BOOKING_FOR_OTHER, BOOKING_FOR_SELF } from '../src/functions/booking/EventFormFunction';
import {
  BookingForFields,
  bookingForFieldsFromBooking,
  buildBookingForPayload,
  hasBookingForChanges,
  isBookingForDraftValid,
  normalizeBookingForFields,
} from '../src/functions/booking/EditEventFunction';

const fields = (overrides: Partial<BookingForFields> = {}): BookingForFields => ({
  bookingFor: BOOKING_FOR_SELF,
  bookingForName: '',
  bookingForRelation: '',
  bookingForMobile: '',
  bookingForPhoto: '',
  ...overrides,
});

describe('bookingForFieldsFromBooking', () => {
  it('defaults old bookings to Myself', () => {
    expect(bookingForFieldsFromBooking(undefined)).toEqual(fields());
    expect(bookingForFieldsFromBooking({})).toEqual(fields());
  });

  it('reads the saved someone-else details', () => {
    expect(
      bookingForFieldsFromBooking({
        bookingFor: BOOKING_FOR_OTHER,
        bookingForName: 'Ramesh',
        bookingForRelation: 'Brother',
        bookingForMobile: '9800000001',
        bookingForPhoto: 'https://cdn.test/photo.jpg',
      }),
    ).toEqual(
      fields({
        bookingFor: BOOKING_FOR_OTHER,
        bookingForName: 'Ramesh',
        bookingForRelation: 'Brother',
        bookingForMobile: '9800000001',
        bookingForPhoto: 'https://cdn.test/photo.jpg',
      }),
    );
  });
});

describe('normalizeBookingForFields', () => {
  it('drops other-person details when Myself is selected', () => {
    expect(
      normalizeBookingForFields(
        fields({
          bookingFor: '',
          bookingForName: 'Ramesh',
          bookingForRelation: 'Brother',
          bookingForMobile: '9800000001',
          bookingForPhoto: 'https://cdn.test/photo.jpg',
        }),
      ),
    ).toEqual(fields());
  });

  it('sanitises the fields for Someone Else', () => {
    const out = normalizeBookingForFields(
      fields({
        bookingFor: BOOKING_FOR_OTHER,
        bookingForName: 'Ramesh 123',
        bookingForRelation: 'Brother!',
        bookingForMobile: '09800000001',
      }),
    );

    expect(out.bookingForName).toBe('Ramesh 123');
    expect(out.bookingForRelation).toBe('Brother');
    expect(out.bookingForMobile).toBe('9800000001');
  });
});

describe('buildBookingForPayload / hasBookingForChanges', () => {
  it('returns no payload when nothing changed', () => {
    const saved = fields({ bookingFor: BOOKING_FOR_OTHER, bookingForName: 'Ramesh' });

    expect(buildBookingForPayload(saved, { ...saved })).toEqual({});
    expect(hasBookingForChanges(saved, { ...saved })).toBe(false);
  });

  it('sends only the changed fields', () => {
    const saved = fields({ bookingFor: BOOKING_FOR_OTHER, bookingForName: 'Ramesh' });
    const draft = { ...saved, bookingForName: 'Suresh' };

    expect(buildBookingForPayload(saved, draft)).toEqual({
      bookingForName: 'Suresh',
    });
    expect(hasBookingForChanges(saved, draft)).toBe(true);
  });

  it('detects switching to Myself and clears the details in the payload', () => {
    const saved = fields({
      bookingFor: BOOKING_FOR_OTHER,
      bookingForName: 'Ramesh',
      bookingForRelation: 'Brother',
      bookingForMobile: '9800000001',
      bookingForPhoto: 'https://cdn.test/photo.jpg',
    });

    expect(buildBookingForPayload(saved, { ...saved, bookingFor: BOOKING_FOR_SELF })).toEqual({
      bookingFor: BOOKING_FOR_SELF,
      bookingForName: '',
      bookingForRelation: '',
      bookingForMobile: '',
      bookingForPhoto: '',
    });
  });

  it('counts a photo-only change', () => {
    const saved = fields({ bookingFor: BOOKING_FOR_OTHER, bookingForName: 'Ramesh' });
    const draft = { ...saved, bookingForPhoto: 'https://cdn.test/new.jpg' };

    expect(buildBookingForPayload(saved, draft)).toEqual({
      bookingForPhoto: 'https://cdn.test/new.jpg',
    });
  });

  it('ignores whitespace-only differences', () => {
    const saved = fields({ bookingFor: BOOKING_FOR_OTHER, bookingForName: 'Ramesh' });
    const draft = { ...saved, bookingForName: '  Ramesh  ' };

    expect(hasBookingForChanges(saved, draft)).toBe(false);
  });
});

describe('isBookingForDraftValid', () => {
  it('accepts Myself without details', () => {
    expect(isBookingForDraftValid(fields())).toBe(true);
  });

  it('needs a full 10-digit contact number when one is entered', () => {
    const draft = (bookingForMobile: string) =>
      fields({
        bookingFor: BOOKING_FOR_OTHER,
        bookingForName: 'Ramesh',
        bookingForMobile,
      });

    expect(isBookingForDraftValid(draft(''))).toBe(true);
    expect(isBookingForDraftValid(draft('98000'))).toBe(false);
    expect(isBookingForDraftValid(draft('9800000001'))).toBe(true);
  });

  it('needs a name for Someone Else', () => {
    expect(
      isBookingForDraftValid(
        fields({ bookingFor: BOOKING_FOR_OTHER, bookingForName: '' }),
      ),
    ).toBe(false);
    expect(
      isBookingForDraftValid(
        fields({ bookingFor: BOOKING_FOR_OTHER, bookingForName: 'Ra' }),
      ),
    ).toBe(false);
    expect(
      isBookingForDraftValid(
        fields({ bookingFor: BOOKING_FOR_OTHER, bookingForName: 'Ramesh' }),
      ),
    ).toBe(true);
  });
});
