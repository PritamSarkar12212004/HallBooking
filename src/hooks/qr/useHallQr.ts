import { useCallback } from 'react';

import useGetPaymentQr from '../../api/paymentQr/hooks/useGetPaymentQr';
import useSavePaymentQr from '../../api/paymentQr/hooks/useSavePaymentQr';
import { useAppSelector } from '../redux/redux';

export interface SaveHallQrInput {
    bankHolderName: string;
    qrUrl: string;
}

/**
 * Hall payment QR ka single source of truth.
 *
 * QR ab backend par store hota hai (CEO → Profile → QR Code se upload), isliye
 * koi local/device-only override nahi hai: save hote hi React Query cache
 * invalidate hoti hai aur *har* payment screen (Step5Requirements,
 * EditFinance, FainalizeEventPage, UpiQr) naya QR dikhane lagti hai —
 * kisi bhi device par.
 *
 * Jab tak CEO QR upload nahi karta, `qrUrl` aur `bankHolderName` dono `null`
 * rehte hain (`isConfigured === false`).
 */
const useHallQr = () => {
    const user = useAppSelector((state) => state.user.user);

    const { paymentQr, isLoading, isError, error, refetch } = useGetPaymentQr(user?.token);
    const { savePaymentQrAsync, isLoading: isSaving } = useSavePaymentQr();

    const bankHolderName = paymentQr?.bankHolderName ?? null;
    const qrUrl = paymentQr?.qrUrl ?? null;
    const isConfigured = Boolean(paymentQr?.isConfigured && qrUrl && bankHolderName);

    const saveQr = useCallback(
        async ({ bankHolderName: name, qrUrl: url }: SaveHallQrInput) => {
            if (!user?.token) {
                throw new Error('User token is missing.');
            }

            return savePaymentQrAsync({
                bankHolderName: name,
                qrUrl: url,
                token: user.token,
            });
        },
        [savePaymentQrAsync, user?.token]
    );

    return {
        /** Bank account holder name (null jab tak set na ho). */
        bankHolderName,
        /** QR image URL (null jab tak upload na ho). */
        qrUrl,
        /** true = QR + name dono saved hain. */
        isConfigured,
        isLoading,
        isSaving,
        isError,
        error,
        refetch,
        saveQr,
    };
};

export default useHallQr;