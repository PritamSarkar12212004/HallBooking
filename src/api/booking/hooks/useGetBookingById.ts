import { useQuery } from '@tanstack/react-query';
import { getBookingByIdInterface } from '../../../interface/api/apiRequireInterface';
import getBookingByIdApi from '../call/getBookingByIdApi';

const useGetBookingById = (data: getBookingByIdInterface | null) => {
    const query = useQuery({
        queryKey: ['booking', data?.id],
        queryFn: () => getBookingByIdApi(data!),
        enabled: !!data?.id && !!data?.token,
    });
    return {
        booking: query.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
    };
};

export default useGetBookingById;