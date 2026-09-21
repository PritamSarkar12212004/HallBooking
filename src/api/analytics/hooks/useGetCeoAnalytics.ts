import { keepPreviousData, useQuery } from '@tanstack/react-query';
import getCeoAnalyticsApi from '../call/getCeoAnalyticsApi';
import {
    AnalyticsPeriodKey,
    CeoAnalytics,
} from '../../../interface/api/ceoAnalyticsInterface';

/**
 * CEO analytics — period badalne par naya fetch hota hai.
 *
 * `placeholderData: keepPreviousData` se period switch karte waqt purana data
 * screen par rehta hai (skeleton flash nahi hota) aur naya data aate hi update.
 */
const useGetCeoAnalytics = (
    token: string | undefined,
    period: AnalyticsPeriodKey,
    range?: { from?: string; to?: string },
) => {
    const query = useQuery({
        queryKey: ['ceoAnalytics', period, range?.from ?? '', range?.to ?? ''],
        queryFn: () =>
            getCeoAnalyticsApi({
                token: token!,
                period,
                from: range?.from,
                to: range?.to,
            }),
        enabled: !!token,
        placeholderData: keepPreviousData,
    });

    return {
        analytics: query.data as CeoAnalytics | undefined,
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    };
};

export default useGetCeoAnalytics;
