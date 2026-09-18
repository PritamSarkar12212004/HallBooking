import { useMutation, useQueryClient } from '@tanstack/react-query';
import savePaymentQrApi from '../call/savePaymentQrApi';
import { savePaymentQrInterface } from '../../../interface/api/apiRequireInterface';

const useSavePaymentQr = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (data: savePaymentQrInterface) => savePaymentQrApi(data),
        // Save hote hi cache invalidate — booking/finalize/UPI screens
        // turant naya QR dikhane lagte hain.
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['paymentQr'] });
        },
    });

    return {
        savePaymentQr: mutation.mutate,
        savePaymentQrAsync: mutation.mutateAsync,
        isLoading: mutation.isPending,
        isError: mutation.isError,
        error: mutation.error,
        data: mutation.data,
        reset: mutation.reset,
    };
};

export default useSavePaymentQr;