import apiRoute from "../../../const/api/apiRoutes";
import { apiBooking } from "../../../utils/api";
import { DashboardData } from "../../../interface/api/dashboardInterface";

export interface GetDashboardParams {
    token: string;
}

const getDashboardApi = async (data: GetDashboardParams): Promise<DashboardData> => {
    const response = await apiBooking.get(apiRoute.booking.dashboard, {
        headers: {
            Authorization: `Bearer ${data.token}`,
        },
    });
    return response.data?.data as DashboardData;
};

export default getDashboardApi;