import apiRoute from "../../../const/api/apiRoutes";
import { getBookingByIdInterface } from "../../../interface/api/apiRequireInterface";
import { apiBooking } from "../../../utils/api";

const getBookingByIdApi = async (data: getBookingByIdInterface) => {
    const response = await apiBooking.get(apiRoute.booking.byId(data.id), {
        headers: {
            Authorization: `Bearer ${data.token}`
        }
    })
    return response.data?.data?.booking
}
export default getBookingByIdApi