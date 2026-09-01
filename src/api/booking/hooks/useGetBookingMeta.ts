import { useQuery } from '@tanstack/react-query';
import getBookingMetaApi, {
    BookingMeta,
} from '../call/getBookingMetaApi';

const useGetBookingMeta = (token: string | undefined) => {
    const query = useQuery({
        queryKey: ['bookingMeta'],
        queryFn: () => getBookingMetaApi({ token: token! }),
        enabled: !!token,
    });
    return {
        meta: query.data as BookingMeta | undefined,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    };
};

export default useGetBookingMeta;