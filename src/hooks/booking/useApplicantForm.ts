import { useCallback, useMemo, useState } from 'react';
import { showMessage } from 'react-native-flash-message';

import { capturePhoto, pickFromGallery } from '../../module/ImagePickerModule';
import { getDraft, updateDraft } from '../../manager/draftBookingStore';
import {
  buildApplicantDraft,
  buildApplicantStepPayload,
  getEmailError,
  getMobileError,
  isApplicantFormValid,
  resolveGovernmentIdPhotoUrl,
  sanitizeGovernmentIdNumber,
  sanitizeMobileNumber,
} from '../../functions/booking/ApplicantFormFunction';
import type {
  ApplicantFormValues,
  ApplicantStepPayload,
} from '../../functions/booking/ApplicantFormFunction';
import type { GovernmentIdType } from '../../components/Selector/GovernmentIdForm';

/** GovernmentIdForm ko sirf `uri` chahiye — picker asset ya draft URL. */
export type ApplicantPhoto = { uri?: string } | null;

export interface UseApplicantFormOptions {
  /** Draft save hone ke baad navigation — screen handle karti hai. */
  onSubmit?: (payload: ApplicantStepPayload) => void;
}

/**
 * Applicant Information step (Step1) ka poora form logic.
 *
 * State draft se prefill hoti hai, validation errors sirf touched fields par
 * dikhte hain, aur Next par ID photo compress + Cloudinary upload hokar draft
 * me save hoti hai. Routing is hook me nahi hai (`onSubmit` callback se aati
 * hai), isliye koi doosri screen bhi ise reuse kar sakti hai.
 */
const useApplicantForm = ({ onSubmit }: UseApplicantFormOptions = {}) => {
  // Draft se prefill — user wapas aaya ho to values bachi rehti hain.
  const [draftApplicant] = useState(() => getDraft()?.applicant);

  const [applicantName, setApplicantName] = useState(draftApplicant?.name ?? '');
  const [organization, setOrganization] = useState(
    draftApplicant?.organization ?? '',
  );
  const [mobileNumber, setMobileNumber] = useState(draftApplicant?.mobile ?? '');
  const [address, setAddress] = useState(draftApplicant?.address ?? '');
  const [email, setEmail] = useState(draftApplicant?.email ?? '');

  const [photo, setPhoto] = useState<ApplicantPhoto>(
    draftApplicant?.governmentIdPhoto
      ? { uri: draftApplicant.governmentIdPhoto }
      : null,
  );
  const [selectedId, setSelectedId] = useState<GovernmentIdType | null>(
    (draftApplicant?.governmentIdType as GovernmentIdType) ?? null,
  );
  const [governmentIdNumber, setGovernmentIdNumber] = useState(
    draftApplicant?.governmentIdNumber ?? '',
  );

  const [mobileTouched, setMobileTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [loader, setloader] = useState(false);

  const handleMobileChange = useCallback((text: string) => {
    setMobileNumber(sanitizeMobileNumber(text));
  }, []);

  const handleEmailChange = useCallback((text: string) => {
    setEmail(text.trim());
  }, []);

  const handleIdNumberChange = useCallback((text: string) => {
    setGovernmentIdNumber(sanitizeGovernmentIdNumber(text));
  }, []);

  const handleCapturePhoto = useCallback(async () => {
    const captured = await capturePhoto({ cameraType: 'back' });

    if (captured) {
      setPhoto(captured);
    }
  }, []);

  const handleGalleryPhoto = useCallback(async () => {
    const picked = await pickFromGallery();

    if (picked) {
      setPhoto(picked);
    }
  }, []);

  const handleRemovePhoto = useCallback(() => {
    setPhoto(null);
  }, []);

  const values: ApplicantFormValues = useMemo(
    () => ({
      applicantName,
      organization,
      mobileNumber,
      address,
      email,
      selectedId,
      governmentIdNumber,
      photoUri: photo?.uri,
    }),
    [
      applicantName,
      organization,
      mobileNumber,
      address,
      email,
      selectedId,
      governmentIdNumber,
      photo?.uri,
    ],
  );

  const mobileError = getMobileError(mobileNumber, mobileTouched);
  const emailError = getEmailError(email, emailTouched);
  const formValid = isApplicantFormValid(values);

  /** Next — validation, ID photo upload, draft save, phir `onSubmit`. */
  const handleNext = useCallback(async () => {
    if (loader) return;

    if (!formValid) {
      setMobileTouched(true);
      setEmailTouched(true);
      showMessage({
        message: 'Complete Required Fields',
        description: 'Please fill all required fields with valid details.',
        type: 'warning',
      });
      return;
    }

    // DRAFT SYSTEM: applicant section local me save hota hai — koi API call
    // nahi. Government ID photo yahan hi upload ho jaati hai taaki final
    // create ke waqt URL ready ho.
    setloader(true);
    try {
      const governmentIdPhoto = await resolveGovernmentIdPhotoUrl(values.photoUri);

      updateDraft('applicant', buildApplicantDraft(values, governmentIdPhoto));

      onSubmit?.(buildApplicantStepPayload(values, governmentIdPhoto));
    } catch (error: any) {
      showMessage({
        message: 'Upload Failed',
        description:
          error?.response?.data?.message ||
          error?.message ||
          'Please try again.',
        type: 'danger',
        duration: 3000,
      });
    } finally {
      setloader(false);
    }
  }, [loader, formValid, values, onSubmit]);

  return {
    /* text fields */
    applicantName,
    setApplicantName,
    organization,
    setOrganization,
    mobileNumber,
    handleMobileChange,
    address,
    setAddress,
    email,
    handleEmailChange,

    /* government id + photo */
    selectedId,
    setSelectedId,
    governmentIdNumber,
    handleIdNumberChange,
    photo,
    handleCapturePhoto,
    handleGalleryPhoto,
    handleRemovePhoto,

    /* validation */
    mobileError,
    emailError,
    formValid,

    /* submit */
    loader,
    handleNext,
  };
};

export default useApplicantForm;