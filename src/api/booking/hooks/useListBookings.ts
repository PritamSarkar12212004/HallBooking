import { useInfiniteQuery } from '@tanstack/react-query';
import { BookingsPage, Pagination } from '../call/listBookingsApi';
import listBookingsApi from '../call/listBookingsApi';
import apiQuery from '../../../const/query/apiQuery';

export const BOOKINGS_PAGE_SIZE = 10;

const useListBookings = (token: string | undefined) => {
    const query = useInfiniteQuery({
        queryKey: [apiQuery.bookingList, token],
        queryFn: ({ pageParam }) =>
            listBookingsApi({
                token: token!,
                page: pageParam,
                pageSize: BOOKINGS_PAGE_SIZE,
            }),
        enabled: !!token,
        initialPageParam: 1 as number,
        getNextPageParam: (lastPage: BookingsPage) => {
            return lastPage.pagination.hasMore
                ? lastPage.pagination.page + 1
                : undefined;
        },
    });

    // Merge all loaded pages into a single flat list (page 1 first).
    const bookings = (query.data?.pages ?? []).flatMap((p) => p.bookings);

    // Pull-to-refresh: page 1 se dobara fetch (saare pages refresh ho jaate hain).
    // Pehle `removeQueries` + `refetch` chalta tha — active query ko cache se
    // hata dene par observer purane query object par atak jaata tha aur refresh
    // kabhi data nahi laata tha, isliye sirf refetch karte hain.
    const refresh = async () => {
        await query.refetch();
    };

    return {
        bookings,
        pagination: query.data?.pages?.[0]?.pagination as Pagination | undefined,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: refresh,
        loadMore: query.fetchNextPage,
        hasMore: query.hasNextPage,
        isLoadingMore: query.isFetchingNextPage,
        isPending: query.isPending
    };
};

export default useListBookings;