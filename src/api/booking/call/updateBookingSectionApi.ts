import apiRoute from "../../../const/api/apiRoutes";
import { updateBookingSectionInterface } from "../../../interface/api/apiRequireInterface";
import { apiBooking } from "../../../utils/api";

const updateBookingSectionApi = async (data: updateBookingSectionInterface) => {
    const routeMap: Record<string, string> = {
        applicant: apiRoute.booking.applicant(data.id),
        event: apiRoute.booking.event(data.id),
        arrangements: apiRoute.booking.arrangements(data.id),
        payment: apiRoute.booking.payment(data.id),
        declaration: apiRoute.booking.declaration(data.id),
    };

    const response = await apiBooking.patch(routeMap[data.section], data.data, {
        headers: {
            Authorization: `Bearer ${data.token}`
        }
    })
    return response.data?.data
}
export default updateBookingSectionApi