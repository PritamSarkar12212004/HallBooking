import { useCallback, useEffect, useMemo, useState } from 'react';
import { showMessage } from 'react-native-flash-message';

import { useAppSelector } from '../redux/redux';
import { capturePhoto, pickFromGallery } from '../../module/ImagePickerModule';
import { getDraft, updateDraft } from '../../manager/draftBookingStore';
import { readStorage, writeStorage } from '../../manager/storage/storageManager';
import useGetBookingById from '../../api/booking/hooks/useGetBookingById';
import useGetBookingMeta from '../../api/booking/hooks/useGetBookingMeta';
import {
  CUSTOM_EVENT_TYPES_KEY,
  CUSTOM_REQUIREMENTS_KEY,
  EXTRA_EVENT_TYPE_OPTIONS,
  EVENT_TYPE_OTHER,
  buildEventSection,
  getOtherEventNameError,
  isEventFormValid,
  isOtherEventType,
  mergeUniqueOptions,
  resolveEventEvidenceUrl,
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
  }, [existingBooking, eventTypes, hallRequirements]);

  /* ------------------------------ validation ------------------------------ */

  const values: EventFormValues = useMemo(
    () => ({
      expectedAttendance,
      selectedEventType,
      otherEventName,
      requirements: selectedRequirements,
      requirementQuantities,
    }),
    [
      expectedAttendance,
      selectedEventType,
      otherEventName,
      selectedRequirements,
      requirementQuantities,
    ],
  );

  const otherEventError = getOtherEventNameError(
    otherEventName,
    otherEventTouched,
    isOtherSelected,
  );

  // Evidence upload chal rahi ho to Next band rehta hai.
  const formValid = !uploadingEvidence && isEventFormValid(values);

  /* --------------------------------- next --------------------------------- */

  const handleNext = useCallback(async () => {
    if (loader) return;

    if (!formValid) {
      setOtherEventTouched(true);
      setQuantitiesTouched(true);
      showMessage({
        message: 'Complete Required Fields',
        description:
          'Expected attendance, event type, aur har selected requirement ki quantity bhar dein.',
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
      });

      onNext?.();
    } finally {
      setloader(false);
    }
  }, [loader, formValid, values, evidenceUri, onNext]);

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
