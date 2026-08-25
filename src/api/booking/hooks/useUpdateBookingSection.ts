import { useMutation } from '@tanstack/react-query';
import { updateBookingSectionInterface } from '../../../interface/api/apiRequireInterface';
import updateBookingSectionApi from '../call/updateBookingSectionApi';

const useUpdateBookingSection = () => {
    const updateMutation = useMutation({
        mutationFn: (data: updateBookingSectionInterface) => updateBookingSectionApi(data),
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