import { useQuery } from '@tanstack/react-query';
import listBookingsApi from '../call/listBookingsApi';
import apiQuery from '../../../const/query/apiQuery';

const useListBookings = (token: string | undefined) => {
    const query = useQuery({
        queryKey: [apiQuery.bookingList],
        queryFn: () => listBookingsApi({ token: token! }),
        enabled: !!token,
    });
    return {
        bookings: query.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
        isPending: query.isPending
    };
};

export default useListBookings;