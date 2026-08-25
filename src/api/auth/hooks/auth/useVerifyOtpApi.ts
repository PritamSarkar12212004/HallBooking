import { useMutation } from '@tanstack/react-query';
import { verifyOtpInterface } from '../../../../interface/api/apiRequireInterface';
import verifyOtpApi from '../../call/veridyOtpApi';

const useVerifyOtpApi = () => {
    const sendOtpMutation = useMutation({
        mutationFn: ({ phone, otp }: verifyOtpInterface) => verifyOtpApi({ phone, otp }),
    });

    return {
        verifyOtp: sendOtpMutation.mutate,
        verifyOtpAsync: sendOtpMutation.mutateAsync,
        isLoading: sendOtpMutation.isPending,
        isError: sendOtpMutation.isError,
        error: sendOtpMutation.error,
        data: sendOtpMutation.data,
        reset: sendOtpMutation.reset,
    };
};

export default useVerifyOtpApi;