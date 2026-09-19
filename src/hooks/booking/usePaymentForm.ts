import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { showMessage } from 'react-native-flash-message';

import { capturePhoto, pickFromGallery } from '../../module/ImagePickerModule';
import { getDraft, updateDraft } from '../../manager/draftBookingStore';
import { useAppSelector } from '../redux/redux';
import useGetBookingById from '../../api/booking/hooks/useGetBookingById';
import useHallQr from '../qr/useHallQr';
import uploadImage from '../../services/Cloudinary/uploadImg';
import { compressImage } from '../../services/Compressor/ImgCompressor';
import {
    applyAllPaid,
    createDefaultChargeRows,
    savedChargeRows,
} from '../../functions/booking/ChargeFunction';
import type { ChargeRow } from '../../functions/booking/ChargeFunction';
import { unitRowsToPayload } from '../../functions/booking/UnitsFunction';
import type { UnitRow } from '../../functions/booking/UnitsFunction';
import {
    PAYMENT_MODES,
    buildPaymentDraftPayload,
    computePaymentSummary,
    getPaymentProofHint,
    getTransactionFieldTitle,
    getTransactionPlaceholder,
    isPaymentFormValid,
    isPaymentProofRequired,
    requiresTransactionNumber,
    savedUnitRows,
    togglePaymentMode,
} from '../../functions/booking/PaymentFunction';

export interface UsePaymentFormOptions {
    bookingId?: string;
    /** Draft save hone ke baad navigation — screen handle karti hai. */
    onNext?: () => void;
}

/**
 * Payment Details step (Step5RequirementsScreen) ka poora form logic.
 *
 * - Charges + refundable deposit: staff yahan bharta hai (rows `ChargeFunction`)
 * - Units: sirf READ-ONLY dikhte hain, isliye draft/backend se aate hain
 *   (Units screen par set hote hain — `UnitsFunction`)
 * - Mode of payment: UPI par hall ka QR + bank holder name (`useHallQr`)
 * - Payment proof: non-cash modes me zaroori, Cash me optional (compress +
 *   Cloudinary upload "Next" par hota hai)
 * - Validation, paid > total warning aur draft save — routing `onNext` se
 */
const usePaymentForm = ({ bookingId, onNext }: UsePaymentFormOptions = {}) => {
    const user = useAppSelector((state) => state.user.user);

    const { booking: existingBooking, isLoading: loadingBooking } =
        useGetBookingById(
            bookingId && user?.token ? { id: bookingId, token: user.token } : null,
        );
    // Hall payment QR (CEO upload karta hai) — `null` jab tak set na ho.
    const { qrUrl, bankHolderName } = useHallQr();

    /* ------------------------------- form state ------------------------------- */

    const [rows, setRows] = useState<ChargeRow[]>(() => {
        const saved = savedChargeRows(getDraft()?.payment?.charges);

        return saved ?? createDefaultChargeRows();
    });

    // Units Units screen par set hote hain — yahan sirf dikhte hain, isliye
    // koi default row nahi banti (koi unit na ho to section hide).
    const [unitRows, setUnitRows] = useState<UnitRow[]>(
        () => savedUnitRows(getDraft()?.units) ?? [],
    );

    const [securityDeposit, setSecurityDeposit] = useState(() => {
        const saved = getDraft()?.payment?.securityDeposit;

        return saved ? String(saved) : '';
    });

    const [paymentMode, setPaymentMode] = useState<string[]>(() => {
        const saved = getDraft()?.payment?.mode;

        return saved ? [saved] : [];
    });

    const [transactionNumber, setTransactionNumber] = useState('');

    /** Payment proof — selected asset (upload "Next" par hota hai). */
    const [photo, setPhoto] = useState<any | null>(null);

    const [loader, setLoader] = useState(false);

    /* -------------------------------- derived -------------------------------- */

    const mode = paymentMode[0];

    const requiresTransaction = requiresTransactionNumber(mode);
    const requiresProof = isPaymentProofRequired(mode);
    const proofHint = getPaymentProofHint(mode);
    const transactionTitle = getTransactionFieldTitle(mode);
    const transactionPlaceholder = getTransactionPlaceholder(mode);

    const summary = useMemo(
        () => computePaymentSummary({ rows, unitRows, securityDeposit }),
        [rows, unitRows, securityDeposit],
    );

    const formValid = useMemo(
        () =>
            isPaymentFormValid({
                summary,
                mode,
                transactionNumber,
                hasProof: Boolean(photo?.uri),
            }),
        [summary, mode, transactionNumber, photo],
    );

    /* --------------------- warning: paid > total (ek baar) --------------------- */

    const warnedRef = useRef(false);
    useEffect(() => {
        if (summary.amountsExceed && !warnedRef.current) {
            warnedRef.current = true;
            showMessage({
                message: 'Invalid Amounts',
                description: 'Total paid is more than the Total Amount.',
                type: 'warning',
                duration: 3500,
            });
        }
        if (!summary.amountsExceed) {
            warnedRef.current = false;
        }
    }, [summary.amountsExceed]);

    /* --------------------------- backend prefill --------------------------- */

    useEffect(() => {
        const fin = existingBooking?.financial;
        if (!fin) return;

        const savedCharges = savedChargeRows(fin.charges);
        if (savedCharges) setRows(savedCharges);

        // Draft authoritative hai — units screen par set kiye gaye units yahan
        // bhi wahi rehte hain, backend ka purana data unhe overwrite nahi karta.
        if (fin.units?.length) {
            setUnitRows((prev) => (prev.length > 0 ? prev : savedUnitRows(fin.units) ?? []));
        }

        if (fin.securityDeposit) setSecurityDeposit(String(fin.securityDeposit));
        if (fin.mode) setPaymentMode([fin.mode]);

        const savedTransaction = existingBooking?.payments?.[0]?.transactionId;
        if (savedTransaction) setTransactionNumber(savedTransaction);
    }, [existingBooking]);

    /* -------------------------------- handlers -------------------------------- */

    const selectPaymentMode = useCallback((value: string) => {
        setPaymentMode((prev) => togglePaymentMode(prev, value));
    }, []);

    /** "All Paid": saare charge heads ka paid = amount (units handover par settle hote hain). */
    const toggleAllPaid = useCallback(() => {
        setRows((prev) => applyAllPaid(prev, !summary.allChargesPaid));
    }, [summary.allChargesPaid]);

    const captureProof = useCallback(async () => {
        const shot = await capturePhoto({ cameraType: 'back' });

        if (shot?.uri) {
            setPhoto(shot);
        }
    }, []);

    const pickProof = useCallback(async () => {
        const picked = await pickFromGallery();

        if (picked?.uri) {
            setPhoto(picked);
        }
    }, []);

    const removeProof = useCallback(() => setPhoto(null), []);

    /* ---------------------------------- next ---------------------------------- */

    const handleNext = useCallback(async () => {
        if (loader) return;

        if (!formValid) {
            showMessage({
                message: 'Complete Required Fields',
                description:
                    'Please fill payment details, select mode, and add proof (if needed).',
                type: 'warning',
            });
            return;
        }

        setLoader(true);
        try {
            // Payment proof: compress (react-native-compressor) + Cloudinary.
            let paymentProofPhoto = '';
            if (photo?.uri) {
                const compressedUri = await compressImage(photo.uri);
                const uploaded = await uploadImage(compressedUri ?? photo.uri);
                paymentProofPhoto = uploaded.secure_url;
            }

            // DRAFT SYSTEM: payment section local me save hota hai — koi API call nahi.
            updateDraft('units', unitRowsToPayload(unitRows));
            updateDraft(
                'payment',
                buildPaymentDraftPayload({
                    rows,
                    unitRows,
                    securityDeposit,
                    mode,
                    transactionNumber,
                    paymentProofPhoto,
                }),
            );

            onNext?.();
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
            setLoader(false);
        }
    }, [
        loader,
        formValid,
        photo,
        rows,
        unitRows,
        securityDeposit,
        mode,
        transactionNumber,
        onNext,
    ]);

    /* --------------------------------- return --------------------------------- */

    return {
        /* charges (editable) */
        rows,
        setRows,
        summary,
        allPaid: summary.allChargesPaid,
        toggleAllPaid,

        /* units (read-only is step par) */
        unitRows,

        /* refundable deposit */
        securityDeposit,
        setSecurityDeposit,

        /* mode of payment */
        paymentModes: PAYMENT_MODES,
        paymentMode,
        selectPaymentMode,

        /* transaction / cheque number */
        requiresTransaction,
        transactionNumber,
        setTransactionNumber,
        transactionTitle,
        transactionPlaceholder,

        /* payment proof (non-cash me zaroori, Cash me optional) */
        photo,
        proofHint,
        requiresProof,
        captureProof,
        pickProof,
        removeProof,

        /* UPI QR (CEO upload karta hai) */
        qrUrl,
        bankHolderName,

        /* submit */
        formValid,
        loader: loader || loadingBooking,
        handleNext,
    };
};

export default usePaymentForm;
