import { useMutation } from '@tanstack/react-query';
import { createDraftBookingInterface } from '../../../interface/api/apiRequireInterface';
import createBookingApi from '../call/createBookingApi';

const useCreateBooking = () => {
    const createBookingMutation = useMutation({
        mutationFn: (data: createDraftBookingInterface) => createBookingApi(data),
    });
    return {
        createBooking: createBookingMutation.mutate,
        createBookingAsync: createBookingMutation.mutateAsync,
        isLoading: createBookingMutation.isPending,
        isError: createBookingMutation.isError,
        error: createBookingMutation.error,
        data: createBookingMutation.data,
        reset: createBookingMutation.reset,
    };
};

export default useCreateBooking;