import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createDraftBookingInterface } from '../../../interface/api/apiRequireInterface';
import createBookingApi from '../call/createBookingApi';
import apiQuery from '../../../const/query/apiQuery';

const useCreateBooking = () => {
    const queryClient = useQueryClient();

    const createBookingMutation = useMutation({
        mutationFn: (data: createDraftBookingInterface) => createBookingApi(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [apiQuery.bookingList] });
            queryClient.invalidateQueries({ queryKey: ['bookingDashboard'] });
        },
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