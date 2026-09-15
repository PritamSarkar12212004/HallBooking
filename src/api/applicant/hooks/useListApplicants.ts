import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import {
    ApplicantPagination,
    ApplicantSort,
    ApplicantsPage,
} from '../call/listApplicantsApi';
import listApplicantsApi from '../call/listApplicantsApi';
import apiQuery from '../../../const/query/apiQuery';

export const APPLICANTS_PAGE_SIZE = 10;

/**
 * Infinite (paginated) applicant list.
 *
 * Search and sort are applied server-side, so both take part in the query key:
 * changing either starts a fresh cache entry which always begins at page 1.
 */
const useListApplicants = (
    token: string | undefined,
    search = '',
    sort: ApplicantSort = 'recent'
) => {
    const queryClient = useQueryClient();
    const trimmedSearch = search.trim();

    const query = useInfiniteQuery({
        queryKey: [apiQuery.applicantList, trimmedSearch, sort],
        queryFn: ({ pageParam }) =>
            listApplicantsApi({
                token: token!,
                page: pageParam,
                pageSize: APPLICANTS_PAGE_SIZE,
                search: trimmedSearch,
                sort,
            }),
        enabled: !!token,
        initialPageParam: 1 as number,
        getNextPageParam: (lastPage: ApplicantsPage) => {
            return lastPage.pagination.hasMore
                ? lastPage.pagination.page + 1
                : undefined;
        },
    });

    // Merge all loaded pages into a single flat list (page 1 first).
    const applicants = (query.data?.pages ?? []).flatMap((p) => p.applicants);

    // Pull-to-refresh: drop every cached page (all searches/sorts) and restart.
    const refresh = async () => {
        queryClient.removeQueries({ queryKey: [apiQuery.applicantList] });
        await query.refetch();
    };

    return {
        applicants,
        pagination: query.data?.pages?.[0]?.pagination as ApplicantPagination | undefined,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: refresh,
        loadMore: query.fetchNextPage,
        hasMore: query.hasNextPage,
        isLoadingMore: query.isFetchingNextPage,
        isPending: query.isPending,
    };
};

export default useListApplicants;