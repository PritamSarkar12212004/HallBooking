import uploadImage from '../../services/Cloudinary/uploadImg';
import { compressImage } from '../../services/Compressor/ImgCompressor';
import type { DraftBookingData } from '../../manager/draftBookingStore';

/* ------------------------------ government id ------------------------------ */

/** Fixed ID cards — backend ke `GOVERNMENT_ID_TYPES` se exactly match karte hain. */
export const FIXED_GOVERNMENT_ID_TYPES = [
  'Aadhaar Card',
  'PAN Card',
  'Driving Licence',
  'Passport',
  'ID Card',
] as const;

export type GovernmentIdType = (typeof FIXED_GOVERNMENT_ID_TYPES)[number];

/** Catch-all type — custom ("Other ID") naam ke saath backend ko yahi jaata hai. */
export const OTHER_ID_FALLBACK_TYPE: GovernmentIdType = 'ID Card';

export const isFixedGovernmentIdType = (
  value: string | null | undefined,
): value is GovernmentIdType =>
  !!value && (FIXED_GOVERNMENT_ID_TYPES as readonly string[]).indexOf(value) !== -1;

export const OTHER_ID_MIN_LENGTH = 3;
export const OTHER_ID_MAX_LENGTH = 30;

/** "Other ID" ka naam — supported chars rakhta hai, spaces collapse, max 30. */
export const sanitizeOtherIdName = (text: string): string =>
  (text ?? '')
    .replace(/[^A-Za-z0-9 &./-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, OTHER_ID_MAX_LENGTH);

/** Custom ID naam valid hai? (kam se kam 3 chars aur usme letters hone chahiye) */
export const isValidOtherIdName = (name: string): boolean => {
  const trimmed = (name ?? '').trim();

  return (
    trimmed.length >= OTHER_ID_MIN_LENGTH &&
    trimmed.length <= OTHER_ID_MAX_LENGTH &&
    /[A-Za-z]/.test(trimmed)
  );
};

/** "Other ID" field ka error — khaali theek hai, par bhara hua invalid nahi chalega. */
export const getOtherIdError = (name: string, touched: boolean): string => {
  const trimmed = (name ?? '').trim();

  if (!touched || trimmed.length === 0 || isValidOtherIdName(trimmed)) {
    return '';
  }

  if (trimmed.length < OTHER_ID_MIN_LENGTH) {
    return `ID name must be at least ${OTHER_ID_MIN_LENGTH} characters`;
  }

  return 'ID name must contain letters (e.g. Voter ID)';
};

/** Selected ID -> backend ke fields (custom naam = catch-all type + governmentIdName). */
const resolveGovernmentId = (selectedId: string | null) => {
  if (!selectedId) {
    return { governmentIdType: undefined, governmentIdName: '' };
  }

  if (isFixedGovernmentIdType(selectedId)) {
    return { governmentIdType: selectedId as string, governmentIdName: '' };
  }

  return {
    governmentIdType: OTHER_ID_FALLBACK_TYPE as string,
    governmentIdName: selectedId.trim(),
  };
};

// Mobile ke rules shared hain (PhoneFunction) — applicant, booking-for aur
// decorator/caterer contact sab ek hi validation use karte hain. Yahan se
// waise hi export hote hain taake purane imports na tootein.
import {
  MOBILE_LENGTH,
  getMobileError,
  isMobileValidOrEmpty,
  isValidMobileNumber,
  sanitizeMobileNumber,
} from './PhoneFunction';

export {
  MOBILE_LENGTH,
  getMobileError,
  isMobileValidOrEmpty,
  isValidMobileNumber,
  sanitizeMobileNumber,
};

export const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((email ?? '').trim());

/** Email optional hai — khaali theek, bhara to valid hona chahiye. */
export const isEmailValidOrEmpty = (email: string): boolean =>
  (email ?? '').trim().length === 0 || isValidEmail(email);

/** ID number manual input ke liye — extra spaces hata kar max 30 chars. */
export const sanitizeGovernmentIdNumber = (text: string): string =>
  (text ?? '').replace(/\s+/g, ' ').trim().slice(0, 30);

export const getEmailError = (email: string, touched: boolean): string => {
  // Email optional hai — khaali par koi error nahi, bhara invalid par hi dikhega.
  if (!touched || isEmailValidOrEmpty(email)) return '';

  return 'Enter a valid email address (e.g. name@example.com)';
};

export interface ApplicantFormValues {
  applicantName: string;
  organization: string;
  mobileNumber: string;
  address: string;
  /** Optional — khaali chhod sakte hain; bhara to valid hona chahiye. */
  email: string;
  /** Fixed ID card ka naam ya manually typed "Other ID" naam. */
  selectedId: string | null;
  /** "Other ID" input me manually type kiya gaya naam. */
  otherIdName?: string;
  /** ID card ka number (optional; backend ise store karta hai). */
  governmentIdNumber?: string;
  photoUri?: string | null;
}

export const isApplicantFormValid = ({
  applicantName,
  mobileNumber,
  address,
  email,
  selectedId,
  otherIdName,
  photoUri,
}: ApplicantFormValues): boolean =>
  applicantName.trim().length > 0 &&
  isValidMobileNumber(mobileNumber) &&
  isEmailValidOrEmpty(email) &&
  address.trim().length > 0 &&
  !!selectedId &&
  // Custom "Other ID" select ho to usi ka naam valid hona chahiye.
  (isFixedGovernmentIdType(selectedId) ||
    (selectedId === (otherIdName ?? '').trim() &&
      isValidOtherIdName(otherIdName ?? ''))) &&
  !!photoUri;

export type ApplicantDraftSection = NonNullable<DraftBookingData['applicant']>;

export const buildApplicantDraft = (
  {
    applicantName,
    organization,
    mobileNumber,
    address,
    email,
    selectedId,
    governmentIdNumber,
  }: ApplicantFormValues,
  governmentIdPhoto: string,
): ApplicantDraftSection => ({
  name: applicantName,
  organization,
  mobile: mobileNumber,
  address,
  email,
  ...resolveGovernmentId(selectedId),
  governmentIdNumber: governmentIdNumber ?? '',
  governmentIdPhoto,
});

export interface ApplicantStepPayload {
  applicantData: {
    applicantName: string;
    organization: string;
    mobileNumber: string;
    address: string;
    email: string;
    /** Fixed ID card ka naam (custom "Other ID" ke liye 'ID Card'). */
    governmentId: string | null;
    /** Custom "Other ID" ka manually typed naam (warna khaali). */
    governmentIdName: string;
    governmentIdNumber: string;
    governmentIdPhoto: string;
  };
  governmentIdPhoto: string;
}

export const buildApplicantStepPayload = (
  {
    applicantName,
    organization,
    mobileNumber,
    address,
    email,
    selectedId,
    governmentIdNumber,
  }: ApplicantFormValues,
  governmentIdPhoto: string,
): ApplicantStepPayload => {
  const id = resolveGovernmentId(selectedId);

  return {
    applicantData: {
      applicantName,
      organization,
      mobileNumber,
      address,
      email,
      governmentId: id.governmentIdType ?? null,
      governmentIdName: id.governmentIdName,
      governmentIdNumber: governmentIdNumber ?? '',
      governmentIdPhoto,
    },
    governmentIdPhoto,
  };
};

const isRemoteUrl = (uri: string) => /^https?:\/\//i.test(uri);

export const uploadGovernmentIdPhoto = async (uri: string): Promise<string> => {
  const compressedUri = await compressImage(uri);
  const uploaded = await uploadImage(compressedUri ?? uri);

  return uploaded.secure_url;
};

export const resolveGovernmentIdPhotoUrl = async (
  uri: string | null | undefined,
): Promise<string> => {
  if (!uri) return '';
  if (isRemoteUrl(uri)) return uri;

  return uploadGovernmentIdPhoto(uri);
};
