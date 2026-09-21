/**
 * Event Details step (Step2EventScreen) ke reusable rules.
 *
 * Isme aata hai:
 *  - Type of Event ke extra options ("For Me" / "Other") + option merging
 *  - "Other" select hone par naam ka sanitize/validate + evidence photo rules
 *  - Hall requirement quantities (sanitize/parse/validate)
 *  - Form validation, draft/payload builder
 *  - Evidence photo upload (compress + Cloudinary)
 */
import uploadImage from '../../services/Cloudinary/uploadImg';
import { compressImage } from '../../services/Compressor/ImgCompressor';
import {
  MOBILE_LENGTH,
  getMobileError,
  isMobileValidOrEmpty,
} from './PhoneFunction';
import type { DraftBookingData } from '../../manager/draftBookingStore';

/* -------------------------------- constants -------------------------------- */

export const EVENT_TYPE_FOR_ME = 'For Me';
export const EVENT_TYPE_OTHER = 'Other';

/** Client-side extra options jo hamesha list me dikhte hain. */
export const EXTRA_EVENT_TYPE_OPTIONS: string[] = [
  EVENT_TYPE_FOR_ME,
  EVENT_TYPE_OTHER,
];

/** Persisted custom additions (navigation + app restart ke baad bhi rehte hain). */
export const CUSTOM_EVENT_TYPES_KEY = 'CUSTOM_EVENT_TYPES';
export const CUSTOM_REQUIREMENTS_KEY = 'CUSTOM_REQUIREMENTS';

export const OTHER_EVENT_NAME_MIN_LENGTH = 3;
export const OTHER_EVENT_NAME_MAX_LENGTH = 40;

export const MAX_REQUIREMENT_QUANTITY = 99999;

/* ------------------------------ booking for ------------------------------ */

/** Booking applicant khud ke liye hai. */
export const BOOKING_FOR_SELF = 'Myself';
/** Booking kisi aur ke liye hai — tab us person ki details + optional photo. */
export const BOOKING_FOR_OTHER = 'Someone Else';

export const BOOKING_FOR_OPTIONS: string[] = [
  BOOKING_FOR_SELF,
  BOOKING_FOR_OTHER,
];

export const BOOKING_FOR_NAME_MIN_LENGTH = 3;
export const BOOKING_FOR_NAME_MAX_LENGTH = 60;
export const BOOKING_FOR_RELATION_MAX_LENGTH = 40;
/** Contact number bhi baaki app ki tarah 10 digits ka hi hota hai. */
export const BOOKING_FOR_MOBILE_MAX_LENGTH = MOBILE_LENGTH;

/** Booking "kisi aur" ke liye hai? */
export const isBookingForOther = (value?: string | null): boolean =>
  (value ?? '').trim() === BOOKING_FOR_OTHER;

/** Naam — letters/digits + basic punctuation, max 60. */
export const sanitizeBookingForName = (text: string): string =>
  (text ?? '')
    .replace(/[^A-Za-z0-9 .&'-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, BOOKING_FOR_NAME_MAX_LENGTH);

/** Rishta — sirf letters/spaces (e.g. "Brother", "Friend"). */
export const sanitizeBookingForRelation = (text: string): string =>
  (text ?? '')
    .replace(/[^A-Za-z ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, BOOKING_FOR_RELATION_MAX_LENGTH);

/**
 * Contact number — sirf digits, leading zero hataya gaya, max 10 digits.
 * (Zeros pehle hataate hain, taake "09800000001" jaisa paste kiya number
 * sahi 10 digits ka bane.)
 */
export const sanitizeBookingForMobile = (text: string): string =>
  (text ?? '')
    .replace(/[^0-9]/g, '')
    .replace(/^0+(?=\d)/, '')
    .slice(0, MOBILE_LENGTH);

/** Contact optional hai — khaali chalega, bhara ho to 10 digits ka. */
export const isValidBookingForMobile = (mobile: string): boolean =>
  isMobileValidOrEmpty(mobile);

/** Contact number ke liye inline error (optional field). */
export const getBookingForMobileError = (
  mobile: string,
  touched: boolean,
): string => getMobileError(mobile, touched, { required: false });

export const isValidBookingForName = (name: string): boolean => {
  const trimmed = (name ?? '').trim();

  return (
    trimmed.length >= BOOKING_FOR_NAME_MIN_LENGTH &&
    trimmed.length <= BOOKING_FOR_NAME_MAX_LENGTH &&
    /[A-Za-z]/.test(trimmed)
  );
};

/** Sirf "Someone Else" par hi error dikhta hai (Myself par naam chahiye hi nahi). */
export const getBookingForNameError = (
  name: string,
  touched: boolean,
  isOther: boolean,
): string => {
  if (!isOther || !touched) return '';

  const trimmed = (name ?? '').trim();

  if (trimmed.length === 0) return 'Please enter the name of the person';

  if (!isValidBookingForName(trimmed)) {
    return `Enter ${BOOKING_FOR_NAME_MIN_LENGTH}-${BOOKING_FOR_NAME_MAX_LENGTH} characters (letters included)`;
  }

  return '';
};

/* ----------------------------- requirement qty ----------------------------- */

/** Digits only, max 5 — leading zeros hata diye jaate hain. */
export const sanitizeRequirementQuantity = (text: string): string => {
  const digits = (text ?? '').replace(/[^0-9]/g, '').slice(0, 5);

  return digits.replace(/^0+(?=\d)/, '');
};

export const parseRequirementQuantity = (text: string): number => {
  const value = Number(sanitizeRequirementQuantity(text));

  if (!Number.isFinite(value) || value < 0) return 0;

  return Math.min(value, MAX_REQUIREMENT_QUANTITY);
};

export const isValidRequirementQuantity = (text: string): boolean =>
  parseRequirementQuantity(text) > 0;

/** Selected requirement ke liye quantity missing ho to message. */
export const getRequirementQuantityError = (
  text: string,
  touched: boolean,
): string =>
  touched && !isValidRequirementQuantity(text) ? 'Enter quantity' : '';

export interface RequirementQuantity {
  label: string;
  quantity: number;
}

/**
 * Requirement labels + typed quantities -> backend payload.
 * Har selected requirement ke liye ek entry (quantity 0 bhi bhej dete hain
 * taaki backend par list complete rahe).
 */
export const buildRequirementQuantities = (
  requirements: string[],
  quantities: Record<string, string>,
): RequirementQuantity[] =>
  requirements.map((label) => ({
    label,
    quantity: parseRequirementQuantity(quantities[label] ?? ''),
  }));

/* -------------------------------- form rules -------------------------------- */

export interface EventFormValues {
  expectedAttendance: string;
  selectedEventType: string[];
  /** "Other" chip ke saath type kiya gaya naam. */
  otherEventName?: string;
  requirements: string[];
  /** label -> typed quantity string. */
  requirementQuantities?: Record<string, string>;
  /** Booking kis ke liye hai — "Myself" | "Someone Else". */
  bookingFor?: string;
  bookingForName?: string;
  bookingForRelation?: string;
  bookingForMobile?: string;
}

export const isEventFormValid = ({
  expectedAttendance,
  selectedEventType,
  otherEventName,
  requirements = [],
  requirementQuantities = {},
  bookingFor,
  bookingForName,
  bookingForMobile,
}: EventFormValues): boolean => {
  const attendance = Number(expectedAttendance);

  if (
    (expectedAttendance ?? '').trim().length === 0 ||
    !Number.isFinite(attendance) ||
    attendance <= 0
  ) {
    return false;
  }

  if (selectedEventType.length === 0) return false;

  // "Other" maange naam, taaki booking me kuch readable aaye.
  if (
    isOtherEventType(selectedEventType) &&
    !isValidOtherEventName(otherEventName ?? '')
  ) {
    return false;
  }

  // "Someone Else" ke liye booking me us person ka naam zaroori hai
  // (relation/photo optional). Contact optional hai, par diya ho to poora
  // 10-digit number hona chahiye.
  if (isBookingForOther(bookingFor)) {
    if (!isValidBookingForName(bookingForName ?? '')) return false;
    if (!isValidBookingForMobile(bookingForMobile ?? '')) return false;
  }

  // Har selected requirement ki quantity honi chahiye.
  return requirements.every((label) =>
    isValidRequirementQuantity(requirementQuantities[label] ?? ''),
  );
};

export type EventSectionValues = NonNullable<DraftBookingData['event']>;

/** Form values -> draft/backend event section (Step6 isi object ko bhejta hai). */
export const buildEventSection = ({
  expectedAttendance,
  selectedEventType,
  otherEventName,
  requirements = [],
  requirementQuantities = {},
  bookingFor,
  bookingForName,
  bookingForRelation,
  bookingForMobile,
}: EventFormValues): EventSectionValues => {
  const type = selectedEventType[0] ?? '';
  const bookedForOther = isBookingForOther(bookingFor);

  return {
    expectedAttendance: Number(expectedAttendance) || undefined,
    type: type || undefined,
    customType: isOtherEventType(selectedEventType)
      ? sanitizeOtherEventName(otherEventName ?? '')
      : '',
    requirements,
    requirementQuantities: buildRequirementQuantities(
      requirements,
      requirementQuantities,
    ),
    bookingFor: (bookingFor ?? '').trim() || undefined,
    // "Myself" par kisi aur ki details save nahi hoti.
    bookingForName: bookedForOther
      ? sanitizeBookingForName(bookingForName ?? '')
      : '',
    bookingForRelation: bookedForOther
      ? sanitizeBookingForRelation(bookingForRelation ?? '')
      : '',
    bookingForMobile: bookedForOther
      ? sanitizeBookingForMobile(bookingForMobile ?? '')
      : '',
  };
};

/* ------------------------------ evidence photo ------------------------------ */

const isRemoteUrl = (uri: string) => /^https?:\/\//i.test(uri);

/** Evidence photo compress (react-native-compressor) + Cloudinary upload. */
export const uploadEventEvidencePhoto = async (uri: string): Promise<string> => {
  const compressedUri = await compressImage(uri);
  const uploaded = await uploadImage(compressedUri ?? uri);

  return uploaded.secure_url;
};

/** Draft/backend me pehle se URL ho to dobara upload nahi hoti. */
export const resolveEventEvidenceUrl = async (
  uri: string | null | undefined,
): Promise<string> => {
  if (!uri) return '';
  if (isRemoteUrl(uri)) return uri;

  return uploadEventEvidencePhoto(uri);
};
/* ------------------------------ option merging ------------------------------ */

/** Case-insensitive dedupe — backend options pehle, custom baad me. */
export const mergeUniqueOptions = (base: string[], extra: string[]): string[] => {
  const seen = new Set<string>();

  return [...base, ...extra].filter((option) => {
    const key = (option ?? '').trim().toLowerCase();
    const text = (option ?? '').trim();

    if (!text || seen.has(key)) return false;

    seen.add(key);
    return true;
  });
};

/** "Other" chip select hai? */
export const isOtherEventType = (selectedTypes: string[]): boolean =>
  selectedTypes[0] === EVENT_TYPE_OTHER;

/* --------------------------- "Other" event name --------------------------- */

export const sanitizeOtherEventName = (text: string): string =>
  (text ?? '')
    .replace(/[^A-Za-z0-9 &.,/'-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, OTHER_EVENT_NAME_MAX_LENGTH);

export const isValidOtherEventName = (name: string): boolean => {
  const trimmed = (name ?? '').trim();

  return (
    trimmed.length >= OTHER_EVENT_NAME_MIN_LENGTH &&
    trimmed.length <= OTHER_EVENT_NAME_MAX_LENGTH &&
    /[A-Za-z]/.test(trimmed)
  );
};

/** Sirf "Other" select hone par hi error dikhta hai. */
export const getOtherEventNameError = (
  name: string,
  touched: boolean,
  isOther: boolean,
): string => {
  if (!isOther || !touched) return '';

  const trimmed = (name ?? '').trim();

  if (trimmed.length === 0) return 'Please enter the event type name';

  if (!isValidOtherEventName(trimmed)) {
    return `Enter ${OTHER_EVENT_NAME_MIN_LENGTH}-${OTHER_EVENT_NAME_MAX_LENGTH} characters (letters included)`;
  }

  return '';
};