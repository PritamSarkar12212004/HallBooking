import { useMutation } from '@tanstack/react-query';
import { profileUpdateInterface } from '../../../../interface/api/apiRequireInterface';
import updateProfileApi from '../../call/updateProfileApi';

const useUpdateProfile = () => {
    const updateProfilepMutation = useMutation({
        mutationFn: (data: profileUpdateInterface) => updateProfileApi(data),
    });
    return {
        updateProfile: updateProfilepMutation.mutate,
        updateProfileAsync: updateProfilepMutation.mutateAsync,
        isLoading: updateProfilepMutation.isPending,
        isError: updateProfilepMutation.isError,
        error: updateProfilepMutation.error,
        data: updateProfilepMutation.data,
        reset: updateProfilepMutation.reset,
    };
};

export default useUpdateProfile;