import { useQuery } from '@tanstack/react-query';
import getDashboardApi from '../call/getDashboardApi';
import { DashboardData } from '../../../interface/api/dashboardInterface';

const useGetDashboard = (token: string | undefined) => {
    const query = useQuery({
        queryKey: ['bookingDashboard'],
        queryFn: () => getDashboardApi({ token: token! }),
        enabled: !!token,
    });
    return {
        dashboard: query.data as DashboardData | undefined,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
        isPending: query.isPending,
    };
};

export default useGetDashboard;