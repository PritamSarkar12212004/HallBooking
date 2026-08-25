import { useMutation } from '@tanstack/react-query';
import { createProfileInterface } from '../../../../interface/api/apiRequireInterface';
import createProfileApi from '../../call/createProfileApi';

const useCreateProfile = () => {
    const createProfilepMutation = useMutation({
        mutationFn: (data: createProfileInterface) => createProfileApi(data),
    });
    return {
        createProfile: createProfilepMutation.mutate,
        createProfileAsync: createProfilepMutation.mutateAsync,
        isLoading: createProfilepMutation.isPending,
        isError: createProfilepMutation.isError,
        error: createProfilepMutation.error,
        data: createProfilepMutation.data,
        reset: createProfilepMutation.reset,
    };
};

export default useCreateProfile;