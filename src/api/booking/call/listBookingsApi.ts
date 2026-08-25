import apiRoute from "../../../const/api/apiRoutes";
import { apiBooking } from "../../../utils/api";

export interface ListBookingsParams {
    token: string;
}

const listBookingsApi = async (data: ListBookingsParams) => {
    const response = await apiBooking.get(apiRoute.booking.root, {
        headers: {
            Authorization: `Bearer ${data.token}`
        }
    })
    return response.data?.data?.bookings
}
export default listBookingsApi