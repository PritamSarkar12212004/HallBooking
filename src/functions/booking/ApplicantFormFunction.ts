import uploadImage from '../../services/Cloudinary/uploadImg';
import { compressImage } from '../../services/Compressor/ImgCompressor';
import type { GovernmentIdType } from '../../components/Selector/GovernmentIdForm';
import type { DraftBookingData } from '../../manager/draftBookingStore';

export const sanitizeMobileNumber = (text: string): string =>
  (text ?? '').replace(/[^0-9]/g, '').slice(0, 10);

export const isValidMobileNumber = (mobile: string): boolean =>
  /^\d{10}$/.test(mobile ?? '');

export const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((email ?? '').trim());

export const getMobileError = (mobile: string, touched: boolean): string => {
  if (!touched || isValidMobileNumber(mobile)) return '';

  if (mobile.length === 0) return 'Mobile number is required';
  if (mobile.length < 10) return `Enter all 10 digits (${mobile.length}/10)`;

  return 'Enter a valid 10-digit mobile number';
};

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
  selectedId: GovernmentIdType | null;
  /** ID card ka number — manually type kiya jaata hai (optional). */
  governmentIdNumber?: string;
  photoUri?: string | null;
}

export const isApplicantFormValid = ({
  applicantName,
  mobileNumber,
  address,
  email,
  selectedId,
  photoUri,
}: ApplicantFormValues): boolean =>
  applicantName.trim().length > 0 &&
  isValidMobileNumber(mobileNumber) &&
  isEmailValidOrEmpty(email) &&
  address.trim().length > 0 &&
  !!selectedId &&
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
  governmentIdType: selectedId ?? undefined,
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
    governmentId: GovernmentIdType | null;
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
): ApplicantStepPayload => ({
  applicantData: {
    applicantName,
    organization,
    mobileNumber,
    address,
    email,
    governmentId: selectedId,
    governmentIdNumber: governmentIdNumber ?? '',
    governmentIdPhoto,
  },
  governmentIdPhoto,
});

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
