import { useQuery } from '@tanstack/react-query';
import listBookingsApi from '../call/listBookingsApi';

const useListBookings = (token: string | undefined) => {
    const query = useQuery({
        queryKey: ['bookings'],
        queryFn: () => listBookingsApi({ token: token! }),
        enabled: !!token,
    });
    return {
        bookings: query.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    };
};

export default useListBookings;