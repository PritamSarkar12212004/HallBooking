import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { showMessage } from 'react-native-flash-message';

import { useAppSelector } from '../redux/redux';
import { capturePhoto, pickFromGallery } from '../../module/ImagePickerModule';
import useBusyLock from '../busy/useBusyLock';
import { getDraft, updateDraft } from '../../manager/draftBookingStore';
import { readStorage, writeStorage } from '../../manager/storage/storageManager';
import useGetBookingById from '../../api/booking/hooks/useGetBookingById';
import useGetBookingMeta from '../../api/booking/hooks/useGetBookingMeta';
import {
  BOOKING_FOR_OPTIONS,
  BOOKING_FOR_SELF,
  CUSTOM_EVENT_TYPES_KEY,
  CUSTOM_REQUIREMENTS_KEY,
  EXTRA_EVENT_TYPE_OPTIONS,
  EVENT_TYPE_OTHER,
  buildEventSection,
  getBookingForMobileError,
  getBookingForNameError,
  getOtherEventNameError,
  isBookingForOther,
  isEventFormValid,
  isOtherEventType,
  mergeUniqueOptions,
  resolveEventEvidenceUrl,
  sanitizeBookingForMobile,
  sanitizeBookingForName,
  sanitizeBookingForRelation,
  sanitizeOtherEventName,
  sanitizeRequirementQuantity,
} from '../../functions/booking/EventFormFunction';
import type { EventFormValues } from '../../functions/booking/EventFormFunction';

/* ------------------------- persisted custom options ------------------------- */

const loadCustom = (key: string): string[] => {
  try {
    const raw = readStorage({ key });
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
};

const saveCustom = (key: string, list: string[]) => {
  try {
    writeStorage({ key, data: list });
  } catch (error) {
    console.log('save custom error', error);
  }
};

/* --------------------------------- the hook --------------------------------- */

export interface UseEventFormOptions {
  bookingId?: string;
  /** Draft save hone ke baad navigation — screen handle karti hai. */
  onNext?: () => void;
}

/**
 * Event Details step (Step2EventScreen) ka poora form logic.
 *
 * - Type of Event: backend options + client ke "For Me" / "Other" + custom types
 * - "Other" select hone par naam input + **evidence photo** (compress + upload)
 * - Booking For: "Myself" / "Someone Else" — "Someone Else" par us person ka
 *   naam (zaroori) + relation/contact + optional event photo (compress + upload)
 * - Hall Requirements: jo select hoga uska **quantity input**
 * - Validation/errors/loader + draft save; routing `onNext` callback se aati hai
 */
const useEventForm = ({ bookingId, onNext }: UseEventFormOptions = {}) => {
  const user = useAppSelector((state) => state.user.user);

  const { booking: existingBooking, isLoading: loadingBooking } =
    useGetBookingById(
      bookingId && user?.token ? { id: bookingId, token: user.token } : null,
    );
  const {
    meta,
    isLoading: loadingMeta,
    isError: metaError,
  } = useGetBookingMeta(user?.token);

  const eventTypes = useMemo(() => meta?.eventTypes ?? [], [meta]);
  const hallRequirements = useMemo(() => meta?.hallRequirements ?? [], [meta]);

  /* ---- custom options (persisted: navigation + app restart ke baad bhi rahen) ---- */

  const [extraEventTypes, setExtraEventTypes] = useState<string[]>(() =>
    loadCustom(CUSTOM_EVENT_TYPES_KEY),
  );
  const [extraRequirements, setExtraRequirements] = useState<string[]>(() =>
    loadCustom(CUSTOM_REQUIREMENTS_KEY),
  );
  const [customEventType, setCustomEventType] = useState('');
  const [customRequirement, setCustomRequirement] = useState('');

  /* ------------------------------- form state ------------------------------- */

  const [expectedAttendance, setExpectedAttendance] = useState(() => {
    const draftAttendance = getDraft()?.event?.expectedAttendance;
    return draftAttendance ? String(draftAttendance) : '';
  });

  const [selectedEventType, setSelectedEventType] = useState<string[]>(() => {
    const draftEvent = getDraft()?.event;
    if (!draftEvent?.type) return [];

    // Draft me "Other" + naam ho to chip "Other" hi selected rehta hai.
    return draftEvent.customType ? [EVENT_TYPE_OTHER] : [draftEvent.type];
  });

  const [otherEventName, setOtherEventName] = useState(
    () => getDraft()?.event?.customType ?? '',
  );

  /* ----------------------------- booking for ----------------------------- */

  // Booking kis ke liye hai — default "Myself" (purani flow jaisi hi).
  const [bookingFor, setBookingFor] = useState<string[]>(() => [
    getDraft()?.event?.bookingFor?.trim() || BOOKING_FOR_SELF,
  ]);
  const [bookingForName, setBookingForName] = useState(
    () => getDraft()?.event?.bookingForName ?? '',
  );
  const [bookingForRelation, setBookingForRelation] = useState(
    () => getDraft()?.event?.bookingForRelation ?? '',
  );
  const [bookingForMobile, setBookingForMobile] = useState(
    () => getDraft()?.event?.bookingForMobile ?? '',
  );
  const [bookingForPhotoUri, setBookingForPhotoUri] = useState<string | null>(
    () => getDraft()?.event?.bookingForPhoto || null,
  );
  const [uploadingBookingForPhoto, setUploadingBookingForPhoto] = useState(false);
  const [bookingForTouched, setBookingForTouched] = useState(false);
  // Backend prefill sirf pehli baar (refetch par user input na ude).
  const prefilledFromBooking = useRef(false);
  const [bookingForMobileTouched, setBookingForMobileTouched] = useState(false);

  const [selectedRequirements, setSelectedRequirements] = useState<string[]>(
    () => getDraft()?.event?.requirements ?? [],
  );

  const [requirementQuantities, setRequirementQuantities] = useState<
    Record<string, string>
  >(() => {
    const saved = getDraft()?.event?.requirementQuantities ?? [];

    return saved.reduce<Record<string, string>>((acc, item) => {
      if (item?.label) acc[item.label] = String(item.quantity ?? '');
      return acc;
    }, {});
  });

  const [evidenceUri, setEvidenceUri] = useState<string | null>(
    () => getDraft()?.event?.evidencePhoto || null,
  );
  const [uploadingEvidence, setUploadingEvidence] = useState(false);

  const [otherEventTouched, setOtherEventTouched] = useState(false);
  const [quantitiesTouched, setQuantitiesTouched] = useState(false);
  const [loader, setloader] = useState(false);

  const isOtherSelected = isOtherEventType(selectedEventType);
  // "Someone Else" par hi naam/details/photo ka block dikhta hai.
  const bookingForValue = bookingFor[0] ?? '';
  const isBookingForSomeoneElse = isBookingForOther(bookingForValue);
  /* -------------------------------- options -------------------------------- */

  const mergedEventTypes = useMemo(
    () =>
      mergeUniqueOptions(eventTypes, [
        ...EXTRA_EVENT_TYPE_OPTIONS,
        ...extraEventTypes,
      ]),
    [eventTypes, extraEventTypes],
  );

  const mergedRequirements = useMemo(
    () => mergeUniqueOptions(hallRequirements, extraRequirements),
    [hallRequirements, extraRequirements],
  );

  /** Selected requirements ke liye quantity rows (selection order me). */
  const quantityItems = useMemo(
    () =>
      selectedRequirements.map((label) => ({
        label,
        value: requirementQuantities[label] ?? '',
      })),
    [selectedRequirements, requirementQuantities],
  );

  /* -------------------------------- handlers -------------------------------- */

  const selectEventType = useCallback((name: string) => {
    setSelectedEventType((prev) => (prev[0] === name ? [] : [name]));
  }, []);

  /** Booking For — single select; wapas "Myself" par kisi aur ki details clear. */
  const selectBookingFor = useCallback((value: string) => {
    setBookingForTouched(true);
    setBookingFor([value]);

    if (!isBookingForOther(value)) {
      setBookingForName('');
      setBookingForRelation('');
      setBookingForMobile('');
      setBookingForPhotoUri(null);
    }
  }, []);

  const changeBookingForName = useCallback((text: string) => {
    setBookingForName(sanitizeBookingForName(text));
  }, []);

  const changeBookingForRelation = useCallback((text: string) => {
    setBookingForRelation(sanitizeBookingForRelation(text));
  }, []);

  const changeBookingForMobile = useCallback((text: string) => {
    setBookingForMobile(sanitizeBookingForMobile(text));
  }, []);

  /** Naam type karte hi "Other" selected rehta hai (input visible rehna chahiye). */
  const changeOtherEventName = useCallback((text: string) => {
    setOtherEventName(sanitizeOtherEventName(text));
    setSelectedEventType([EVENT_TYPE_OTHER]);
  }, []);

  const toggleRequirement = useCallback((name: string) => {
    setSelectedRequirements((prev) =>
      prev.includes(name)
        ? prev.filter((item) => item !== name)
        : [...prev, name],
    );
  }, []);

  const changeRequirementQuantity = useCallback(
    (label: string, text: string) => {
      setRequirementQuantities((prev) => ({
        ...prev,
        [label]: sanitizeRequirementQuantity(text),
      }));
    },
    [],
  );

  /** Evidence photo — compress (react-native-compressor) + Cloudinary upload. */
  const applyEvidencePhoto = useCallback(async (uri: string) => {
    setEvidenceUri(uri);
    setUploadingEvidence(true);

    try {
      const url = await resolveEventEvidenceUrl(uri);
      setEvidenceUri(url || null);
    } catch (error: any) {
      console.log('Evidence upload failed', error);
      setEvidenceUri(null);
      showMessage({
        message: 'Upload Failed',
        description: 'Could not upload the evidence photo. Please try again.',
        type: 'danger',
      });
    } finally {
      setUploadingEvidence(false);
    }
  }, []);

  const captureEvidence = useCallback(async () => {
    const photo = await capturePhoto({ cameraType: 'back' });

    if (photo?.uri) {
      await applyEvidencePhoto(photo.uri as string);
    }
  }, [applyEvidencePhoto]);

  const pickEvidenceFromGallery = useCallback(async () => {
    const photo = await pickFromGallery();

    if (photo?.uri) {
      await applyEvidencePhoto(photo.uri as string);
    }
  }, [applyEvidencePhoto]);

  const removeEvidence = useCallback(() => {
    setEvidenceUri(null);
  }, []);

  /* -------- booking-for photo (optional; compress + Cloudinary upload) -------- */

  const applyBookingForPhoto = useCallback(async (uri: string) => {
    setBookingForPhotoUri(uri);
    setUploadingBookingForPhoto(true);

    try {
      const url = await resolveEventEvidenceUrl(uri);
      setBookingForPhotoUri(url || null);
    } catch (error: any) {
      console.log('Booking-for photo upload failed', error);
      setBookingForPhotoUri(null);
      showMessage({
        message: 'Upload Failed',
        description: 'Could not upload the photo. Please try again.',
        type: 'danger',
      });
    } finally {
      setUploadingBookingForPhoto(false);
    }
  }, []);

  const captureBookingForPhoto = useCallback(async () => {
    const photo = await capturePhoto({ cameraType: 'back' });

    if (photo?.uri) {
      await applyBookingForPhoto(photo.uri as string);
    }
  }, [applyBookingForPhoto]);

  const pickBookingForPhotoFromGallery = useCallback(async () => {
    const photo = await pickFromGallery();

    if (photo?.uri) {
      await applyBookingForPhoto(photo.uri as string);
    }
  }, [applyBookingForPhoto]);

  const removeBookingForPhoto = useCallback(() => {
    setBookingForPhotoUri(null);
  }, []);

  const addCustomEventType = useCallback(() => {
    const name = customEventType.trim();

    if (!name) return;
    if (
      mergedEventTypes.some((type) => type.toLowerCase() === name.toLowerCase())
    ) {
      setCustomEventType('');
      return;
    }

    setExtraEventTypes((prev) => {
      const next = [...prev, name];
      saveCustom(CUSTOM_EVENT_TYPES_KEY, next);
      return next;
    });
    setSelectedEventType([name]);
    setCustomEventType('');
  }, [customEventType, mergedEventTypes]);

  const removeCustomEventType = useCallback((name: string) => {
    setExtraEventTypes((prev) => {
      const next = prev.filter((type) => type !== name);
      saveCustom(CUSTOM_EVENT_TYPES_KEY, next);
      return next;
    });
    setSelectedEventType((prev) => prev.filter((type) => type !== name));
  }, []);

  const addCustomRequirement = useCallback(() => {
    const name = customRequirement.trim();

    if (!name) return;
    if (
      mergedRequirements.some((item) => item.toLowerCase() === name.toLowerCase())
    ) {
      setCustomRequirement('');
      return;
    }

    setExtraRequirements((prev) => {
      const next = [...prev, name];
      saveCustom(CUSTOM_REQUIREMENTS_KEY, next);
      return next;
    });
    setSelectedRequirements((prev) => [...prev, name]);
    setCustomRequirement('');
  }, [customRequirement, mergedRequirements]);

  const removeCustomRequirement = useCallback((name: string) => {
    setExtraRequirements((prev) => {
      const next = prev.filter((item) => item !== name);
      saveCustom(CUSTOM_REQUIREMENTS_KEY, next);
      return next;
    });
    setSelectedRequirements((prev) => prev.filter((item) => item !== name));
    setRequirementQuantities((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);
  /* --------------------------- backend prefill --------------------------- */

  useEffect(() => {
    const bookingEvent = existingBooking?.event;
    if (!bookingEvent) return;

    // Sirf ek baar — warna background refetch user ke type kiye hue data ko
    // overwrite kar deta hai.
    if (prefilledFromBooking.current) return;
    prefilledFromBooking.current = true;

    if (bookingEvent.expectedAttendance) {
      setExpectedAttendance(String(bookingEvent.expectedAttendance));
    }

    if (bookingEvent.type) {
      const customName = (bookingEvent.customType ?? '').trim();

      if (customName) {
        // "Other" chip + readable naam.
        setSelectedEventType([EVENT_TYPE_OTHER]);
        setOtherEventName(customName);
      } else {
        setSelectedEventType([bookingEvent.type]);

        // Custom (non-backend) type ko chips list me bhi dikhao.
        const isBackendOption = eventTypes.some(
          (type) => type.toLowerCase() === bookingEvent.type.toLowerCase(),
        );
        if (!isBackendOption) {
          setExtraEventTypes((prev) => {
            if (prev.includes(bookingEvent.type)) return prev;
            const next = [...prev, bookingEvent.type];
            saveCustom(CUSTOM_EVENT_TYPES_KEY, next);
            return next;
          });
        }
      }
    }

    if (
      Array.isArray(bookingEvent.hallRequirements) &&
      bookingEvent.hallRequirements.length
    ) {
      setSelectedRequirements(bookingEvent.hallRequirements);
      setExtraRequirements((prev) => {
        const missing = bookingEvent.hallRequirements.filter(
          (req: string) =>
            !prev.some((item) => item.toLowerCase() === req.toLowerCase()) &&
            !hallRequirements.some(
              (item) => item.toLowerCase() === req.toLowerCase(),
            ),
        );
        if (!missing.length) return prev;

        const next = [...prev, ...missing];
        saveCustom(CUSTOM_REQUIREMENTS_KEY, next);
        return next;
      });
    }

    const savedQuantities: { label?: string; quantity?: number }[] =
      bookingEvent.requirementQuantities ?? [];

    if (savedQuantities.length) {
      const next: Record<string, string> = {};

      savedQuantities.forEach((item) => {
        if (item?.label) {
          next[item.label] = String(item.quantity ?? '');
        }
      });

      setRequirementQuantities(next);
    }

    if (bookingEvent.evidencePhoto) {
      setEvidenceUri(bookingEvent.evidencePhoto);
    }

    // Booking for — saved value ho to wahi, warna "Myself".
    setBookingFor([bookingEvent.bookingFor?.trim() || BOOKING_FOR_SELF]);
    if (bookingEvent.bookingForName) {
      setBookingForName(bookingEvent.bookingForName);
    }
    if (bookingEvent.bookingForRelation) {
      setBookingForRelation(bookingEvent.bookingForRelation);
    }
    if (bookingEvent.bookingForMobile) {
      setBookingForMobile(bookingEvent.bookingForMobile);
    }
    if (bookingEvent.bookingForPhoto) {
      setBookingForPhotoUri(bookingEvent.bookingForPhoto);
    }
  }, [existingBooking, eventTypes, hallRequirements]);

  /* ------------------------------ validation ------------------------------ */

  const values: EventFormValues = useMemo(
    () => ({
      expectedAttendance,
      selectedEventType,
      otherEventName,
      requirements: selectedRequirements,
      requirementQuantities,
      bookingFor: bookingForValue,
      bookingForName,
      bookingForRelation,
      bookingForMobile,
    }),
    [
      expectedAttendance,
      selectedEventType,
      otherEventName,
      selectedRequirements,
      requirementQuantities,
      bookingForValue,
      bookingForName,
      bookingForRelation,
      bookingForMobile,
    ],
  );

  const otherEventError = getOtherEventNameError(
    otherEventName,
    otherEventTouched,
    isOtherSelected,
  );

  const bookingForNameError = getBookingForNameError(
    bookingForName,
    bookingForTouched,
    isBookingForSomeoneElse,
  );

  const bookingForMobileError = isBookingForSomeoneElse
    ? getBookingForMobileError(bookingForMobile, bookingForMobileTouched)
    : '';

  // Evidence / booking-for photo upload chal rahi ho to Next band rehta hai
  // aur tab navigation bhi locked rehta hai.
  useBusyLock(
    uploadingEvidence || uploadingBookingForPhoto,
    'Uploading photo…',
  );

  const formValid =
    !uploadingEvidence &&
    !uploadingBookingForPhoto &&
    isEventFormValid(values);

  /* --------------------------------- next --------------------------------- */

  const handleNext = useCallback(async () => {
    if (loader) return;

    if (!formValid) {
      setOtherEventTouched(true);
      setQuantitiesTouched(true);
      setBookingForTouched(true);
      setBookingForMobileTouched(true);
      showMessage({
        message: 'Complete Required Fields',
        description:
          'Enter expected attendance, event type, the quantity for every selected requirement, and the name when the booking is for someone else.',
        type: 'warning',
      });
      return;
    }

    // DRAFT SYSTEM: event section local me save hota hai — koi API call nahi.
    setloader(true);
    try {
      updateDraft('event', {
        ...buildEventSection(values),
        evidencePhoto: evidenceUri ?? '',
        // "Someone Else" ki photo — warna khaali (Myself par kuch save nahi).
        bookingForPhoto: isBookingForSomeoneElse
          ? bookingForPhotoUri ?? ''
          : '',
      });

      onNext?.();
    } finally {
      setloader(false);
    }
  }, [
    loader,
    formValid,
    values,
    evidenceUri,
    isBookingForSomeoneElse,
    bookingForPhotoUri,
    onNext,
  ]);

  return {
    /* meta/loading */
    loadingBooking,
    loadingMeta,
    metaError,

    /* event type */
    eventTypeOptions: mergedEventTypes,
    selectedEventType,
    selectEventType,
    customEventType,
    setCustomEventType,
    addCustomEventType,
    removeCustomEventType,
    extraEventTypes,
    isOtherSelected,
    otherEventName,
    changeOtherEventName,
    otherEventError,

    /* booking for */
    bookingForOptions: BOOKING_FOR_OPTIONS,
    bookingFor,
    selectBookingFor,
    isBookingForSomeoneElse,
    bookingForName,
    changeBookingForName,
    bookingForRelation,
    changeBookingForRelation,
    bookingForMobile,
    changeBookingForMobile,
    bookingForNameError,
    bookingForPhotoUri,
    uploadingBookingForPhoto,
    captureBookingForPhoto,
    pickBookingForPhotoFromGallery,
    removeBookingForPhoto,
    bookingForMobileError,
    bookingForMobileTouched,
    touchBookingForMobile: () => setBookingForMobileTouched(true),

    /* attendance */
    expectedAttendance,
    setExpectedAttendance,

    /* requirements + quantities */
    requirementOptions: mergedRequirements,
    selectedRequirements,
    toggleRequirement,
    quantityItems,
    changeRequirementQuantity,
    quantitiesTouched,
    customRequirement,
    setCustomRequirement,
    addCustomRequirement,
    removeCustomRequirement,
    extraRequirements,

    /* evidence photo */
    evidenceUri,
    uploadingEvidence,
    captureEvidence,
    pickEvidenceFromGallery,
    removeEvidence,

    /* submit */
    formValid,
    loader,
    handleNext,
  };
};

export default useEventForm;
