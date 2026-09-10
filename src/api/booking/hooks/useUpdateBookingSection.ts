import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateBookingSectionInterface } from '../../../interface/api/apiRequireInterface';
import updateBookingSectionApi from '../call/updateBookingSectionApi';
import apiQuery from '../../../const/query/apiQuery';

const useUpdateBookingSection = () => {
    const queryClient = useQueryClient();

    const updateMutation = useMutation({
        mutationFn: (data: updateBookingSectionInterface) => updateBookingSectionApi(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [apiQuery.bookingList] });
            queryClient.invalidateQueries({ queryKey: ['bookingDashboard'] });
        },
    });
    return {
        updateSection: updateMutation.mutate,
        updateSectionAsync: updateMutation.mutateAsync,
        isLoading: updateMutation.isPending,
        isError: updateMutation.isError,
        error: updateMutation.error,
        data: updateMutation.data,
        reset: updateMutation.reset,
    };
};

export default useUpdateBookingSection;