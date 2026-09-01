import apiRoute from "../../../const/api/apiRoutes";
import { createDraftBookingInterface } from "../../../interface/api/apiRequireInterface";
import { apiBooking } from "../../../utils/api";

const createBookingApi = async (data: createDraftBookingInterface) => {
    const response = await apiBooking.post(apiRoute.booking.root, {
        bookingType: data.bookingType,
        startDate: data.startDate,
        endDate: data.endDate,
        startTime: data.startTime,
        endTime: data.endTime,
        eventName: data.eventName,
        bookedByStaff: data.bookedByStaff,
        eventImage: data.eventImage,
        allocatedTeam: data.allocatedTeam ?? [],
    }, {
        headers: {
            Authorization: `Bearer ${data.token}`
        }
    })
    return response.data?.data
}
export default createBookingApi