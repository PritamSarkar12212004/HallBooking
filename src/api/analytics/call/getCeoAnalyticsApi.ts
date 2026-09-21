import apiRoute from '../../../const/api/apiRoutes';
import { apiAnalytics } from '../../../utils/api';
import {
    AnalyticsPeriodKey,
    CeoAnalytics,
} from '../../../interface/api/ceoAnalyticsInterface';

export interface GetCeoAnalyticsParams {
    token: string;
    period: AnalyticsPeriodKey;
    /** Sirf `period: 'custom'` ke liye (YYYY-MM-DD). */
    from?: string;
    to?: string;
}

const getCeoAnalyticsApi = async (
    params: GetCeoAnalyticsParams,
): Promise<CeoAnalytics> => {
    const response = await apiAnalytics.get(apiRoute.analytics.ceo, {
        params: {
            period: params.period,
            from: params.from,
            to: params.to,
        },
        headers: {
            Authorization: `Bearer ${params.token}`,
        },
    });

    return response.data?.data as CeoAnalytics;
};

export default getCeoAnalyticsApi;
