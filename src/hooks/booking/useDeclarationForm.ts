import { useCallback, useMemo, useState } from 'react';
import { showMessage } from 'react-native-flash-message';

import { useAppSelector } from '../redux/redux';
import useCreateBooking from '../../api/booking/hooks/useCreateBooking';
import useUpdateBookingSection from '../../api/booking/hooks/useUpdateBookingSection';
import { clearDraft, getDraft } from '../../manager/draftBookingStore';
import {
    buildDeclarationPayload,
    draftSectionsToPush,
    isSignatureReady,
    toSignatureDataUrl,
    uploadSignatures,
} from '../../functions/booking/DeclarationFunction';

/** Kis card ka sign pad khula hai. */
export type SignatureTarget = 'applicant' | 'manager';

export interface UseDeclarationFormOptions {
    /** Booking ban jaane ke baad navigation — screen handle karti hai. */
    onNext?: (result: { bookingId: string; bookingNumber?: string }) => void;
}

/**
 * Declaration step (Step6DecorationScreen) ka poora logic.
 *
 * - Applicant + Manager ke **finger signatures** (react-native-signature-canvas
 *   ka PNG data URL) yahan state me rehte hain
 * - "Done" par: dono signatures compress (react-native-compressor, base64 →
 *   PNG) hokar Cloudinary par jaate hain, phir booking create hoti hai aur
 *   draft ke saare sections + declaration backend par push hote hain
 * - Validation / loader / errors yahan; routing `onNext` callback se
 */
const useDeclarationForm = ({ onNext }: UseDeclarationFormOptions = {}) => {
    const user = useAppSelector((state) => state.user.user);

    const { updateSectionAsync, isLoading: saving } = useUpdateBookingSection();
    const { createBookingAsync } = useCreateBooking();

    /** Dono signatures — PNG data URL (`data:image/png;base64,…`). */
    const [applicantSignature, setApplicantSignature] = useState<string | null>(null);
    const [managerSignature, setManagerSignature] = useState<string | null>(null);

    /** Kaun sa pad khula hai (null = band). */
    const [activePad, setActivePad] = useState<SignatureTarget | null>(null);

    const [loader, setLoader] = useState(false);

    const applicantSigned = isSignatureReady(applicantSignature);
    const managerSigned = isSignatureReady(managerSignature);

    // Done tabhi enable hota hai jab dono signatures lag chuke hain.
    const formValid = applicantSigned && managerSigned;

    const activePadTitle = useMemo(
        () =>
            activePad === 'manager' ? 'Manager Signature' : 'Applicant Signature',
        [activePad],
    );

    const openApplicantPad = useCallback(() => setActivePad('applicant'), []);
    const openManagerPad = useCallback(() => setActivePad('manager'), []);
    const closePad = useCallback(() => setActivePad(null), []);

    /** Pad ke "Save" par — jis card se khola tha usi me signature save hota hai. */
    const saveSignature = useCallback(
        (dataUrl: string) => {
            const signature = toSignatureDataUrl(dataUrl);
            if (!signature) return;

            if (activePad === 'manager') {
                setManagerSignature(signature);
            } else {
                setApplicantSignature(signature);
            }
            setActivePad(null);
        },
        [activePad],
    );

    const clearSignature = useCallback((target: SignatureTarget) => {
        if (target === 'manager') {
            setManagerSignature(null);
        } else {
            setApplicantSignature(null);
        }
    }, []);

    /* --------------------------------- submit --------------------------------- */

    const handleNext = useCallback(async () => {
        if (loader || saving) return;

        if (!formValid) {
            showMessage({
                message: 'Signatures Required',
                description:
                    'Capture both the Applicant and Manager finger signatures (tap a card).',
                type: 'warning',
            });
            return;
        }
        if (!user?.token) {
            showMessage({
                message: 'Authentication Error',
                description: 'User token is missing.',
                type: 'danger',
            });
            return;
        }

        setLoader(true);
        try {
            // Dono signatures: compress (PNG) + Cloudinary upload.
            const uploaded = await uploadSignatures({
                applicantSignature,
                managerSignature,
            });

            // DRAFT SYSTEM: booking sirf yahan, "Done" par banti hai.
            const draft = getDraft();
            if (!draft) {
                throw new Error(
                    'Draft booking data is missing. Please restart from Halls screen.',
                );
            }

            const res = await createBookingAsync({
                bookingType: draft.bookingType ?? '1 Day',
                startDate: draft.startDate ?? '',
                endDate: draft.endDate ?? '',
                startTime: draft.startTime ?? '',
                endTime: draft.endTime ?? '',
                eventName: draft.eventName ?? '',
                bookedByStaff: draft.bookedByStaff ?? '',
                eventImage: draft.eventImage,
                token: user.token,
            });

            const newBookingId = res?.booking?._id;
            if (!newBookingId) {
                throw new Error('Booking id missing in response');
            }

            // Draft ke bhare hue sections (applicant → event → arrangements → payment).
            for (const { section, data } of draftSectionsToPush(draft)) {
                await updateSectionAsync({
                    id: newBookingId,
                    section,
                    token: user.token,
                    data: data as Record<string, any>,
                });
            }

            // Declaration sabse aakhir me — signatures ab upload ho chuke hain.
            await updateSectionAsync({
                id: newBookingId,
                section: 'declaration',
                token: user.token,
                data: buildDeclarationPayload({
                    applicantSignature: uploaded.applicantSignature,
                    managerSignature: uploaded.managerSignature,
                    termsAccepted: draft.termsAccepted ?? true,
                }),
            });

            // Draft ab asli booking hai — local draft hata dete hain.
            clearDraft();

            onNext?.({
                bookingId: newBookingId,
                bookingNumber: res?.booking?.bookingNumber,
            });
        } catch (error: any) {
            showMessage({
                message: 'Booking Create Failed',
                description:
                    error?.response?.data?.message ||
                    error?.message ||
                    'Please try again.',
                type: 'danger',
                duration: 3000,
            });
        } finally {
            setLoader(false);
        }
    }, [
        loader,
        saving,
        formValid,
        user?.token,
        applicantSignature,
        managerSignature,
        updateSectionAsync,
        createBookingAsync,
        onNext,
    ]);

    return {
        /* signatures */
        applicantSignature,
        managerSignature,
        applicantSigned,
        managerSigned,

        /* sign pad */
        activePad,
        activePadTitle,
        openApplicantPad,
        openManagerPad,
        closePad,
        saveSignature,
        clearSignature,

        /* submit */
        formValid,
        loader: loader || saving,
        handleNext,
    };
};

export default useDeclarationForm;
