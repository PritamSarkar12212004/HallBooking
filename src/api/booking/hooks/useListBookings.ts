import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { BookingsPage, Pagination } from '../call/listBookingsApi';
import listBookingsApi from '../call/listBookingsApi';
import apiQuery from '../../../const/query/apiQuery';

export const BOOKINGS_PAGE_SIZE = 10;

const useListBookings = (token: string | undefined) => {
    const queryClient = useQueryClient();

    const query = useInfiniteQuery({
        queryKey: [apiQuery.bookingList],
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

    // Pull-to-refresh: drop every cached page and start again from page 1.
    const refresh = async () => {
        queryClient.removeQueries({ queryKey: [apiQuery.bookingList] });
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