/**
 * Update Event screen (EditEventScreen) ke pure rules.
 *
 * Screen sirf UI hai: yahan se "booking kis ke liye hai" ka data normalise
 * hota hai, sirf badle hue fields ka payload banta hai (jisse event ke baaki
 * fields — type, requirements, quantities — chhue bina update ho jaate hain),
 * aur "kuch change hua hi nahi" par Save disable rehta hai.
 */
import {
  BOOKING_FOR_SELF,
  isBookingForOther,
  isValidBookingForMobile,
  sanitizeBookingForMobile,
  sanitizeBookingForName,
  sanitizeBookingForRelation,
} from './EventFormFunction';

/** Event section ke sirf woh fields jo Update Event screen chhooti hai. */
export interface BookingForFields {
  bookingFor: string;
  bookingForName: string;
  bookingForRelation: string;
  bookingForMobile: string;
  bookingForPhoto: string;
}

export const EMPTY_BOOKING_FOR: BookingForFields = {
  bookingFor: BOOKING_FOR_SELF,
  bookingForName: '',
  bookingForRelation: '',
  bookingForMobile: '',
  bookingForPhoto: '',
};

const asText = (value: unknown): string => String(value ?? '').trim();

/** Backend booking ka event -> screen ke fields (purani booking = "Myself"). */
export const bookingForFieldsFromBooking = (event: any): BookingForFields => ({
  bookingFor: asText(event?.bookingFor) || BOOKING_FOR_SELF,
  bookingForName: asText(event?.bookingForName),
  bookingForRelation: asText(event?.bookingForRelation),
  bookingForMobile: asText(event?.bookingForMobile),
  bookingForPhoto: asText(event?.bookingForPhoto),
});

/**
 * Draft ko save karne layak normalise karta hai:
 * "Myself" par kisi aur ki details/photo rakhi hi nahi jaati, aur jab
 * "Someone Else" ho to wahi sanitizers lagte hain jo event step me lagte hain.
 */
export const normalizeBookingForFields = (
  draft: BookingForFields,
): BookingForFields => {
  const forWhom = asText(draft.bookingFor) || BOOKING_FOR_SELF;
  const someoneElse = isBookingForOther(forWhom);

  return {
    bookingFor: forWhom,
    bookingForName: someoneElse ? sanitizeBookingForName(draft.bookingForName) : '',
    bookingForRelation: someoneElse
      ? sanitizeBookingForRelation(draft.bookingForRelation)
      : '',
    bookingForMobile: someoneElse
      ? sanitizeBookingForMobile(draft.bookingForMobile)
      : '',
    bookingForPhoto: someoneElse ? asText(draft.bookingForPhoto) : '',
  };
};

/** Sirf badle hue fields — `{}` matlab kuch change nahi hua. */
export const buildBookingForPayload = (
  saved: BookingForFields,
  draft: BookingForFields,
): Record<string, string> => {
  const next = normalizeBookingForFields(draft);
  const before = normalizeBookingForFields(saved);
  const payload: Record<string, string> = {};

  (Object.keys(next) as (keyof BookingForFields)[]).forEach((key) => {
    if (next[key] !== before[key]) {
      payload[key] = next[key];
    }
  });

  return payload;
};

/** Save button isi par enable/disable hota hai. */
export const hasBookingForChanges = (
  saved: BookingForFields,
  draft: BookingForFields,
): boolean => Object.keys(buildBookingForPayload(saved, draft)).length > 0;

/**
 * "Someone Else" ke liye booking me naam zaroori hai aur contact diya ho to
 * poora 10-digit hona chahiye — Save isse rokta hai. (Server par bhi yahi
 * validation lagti hai.)
 */
export const isBookingForDraftValid = (draft: BookingForFields): boolean => {
  const next = normalizeBookingForFields(draft);

  if (!isBookingForOther(next.bookingFor)) return true;

  return next.bookingForName.length >= 3 && isValidBookingForMobile(next.bookingForMobile);
};
