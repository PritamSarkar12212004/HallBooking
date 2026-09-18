import { useQuery } from '@tanstack/react-query';
import getPaymentQrApi from '../call/getPaymentQrApi';
import { PaymentQrSettings } from '../../../interface/api/paymentQrInterface';

/**
 * Hall payment QR — backend hi single source of truth hai, isliye ek hi
 * queryKey (`paymentQr`) se saare payment screens same QR dikhate hain.
 */
const useGetPaymentQr = (token: string | undefined) => {
    const query = useQuery({
        queryKey: ['paymentQr'],
        queryFn: () => getPaymentQrApi({ token: token! }),
        enabled: !!token,
    });

    return {
        paymentQr: query.data as PaymentQrSettings | undefined,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    };
};

export default useGetPaymentQr;