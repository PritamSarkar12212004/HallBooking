import { useMutation } from '@tanstack/react-query';
import sendOtpApi from '../call/sendOtpApi';
import { sendOtpApiInterface } from '../../../interface/api/apiRequireInterface';

const useAuthApi = () => {
    const sendOtpMutation = useMutation({
        mutationFn: (phone: sendOtpApiInterface) => sendOtpApi(phone),
    });

    return {
        sendOtp: sendOtpMutation.mutate,
        sendOtpAsync: sendOtpMutation.mutateAsync,
        isLoading: sendOtpMutation.isPending,
        isError: sendOtpMutation.isError,
        error: sendOtpMutation.error,
        data: sendOtpMutation.data,
        reset: sendOtpMutation.reset,
    };
};

export default useAuthApi;