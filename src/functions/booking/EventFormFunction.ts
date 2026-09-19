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
}

export const isEventFormValid = ({
  expectedAttendance,
  selectedEventType,
  otherEventName,
  requirements = [],
  requirementQuantities = {},
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
}: EventFormValues): EventSectionValues => {
  const type = selectedEventType[0] ?? '';

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