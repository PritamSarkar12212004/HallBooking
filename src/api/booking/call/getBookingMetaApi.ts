import apiRoute from "../../../const/api/apiRoutes";
import { apiBooking } from "../../../utils/api";

export interface BookingMeta {
    eventTypes: string[];
    hallRequirements: string[];
    governmentIdTypes: string[];
    terms: string[];
    upi?: {
        id: string;
        name: string;
        qrUrl: string;
    };
}

interface ListBookingsParams {
    token: string;
}

const getBookingMetaApi = async (data: ListBookingsParams) => {
    const response = await apiBooking.get(apiRoute.booking.options, {
        headers: {
            Authorization: `Bearer ${data.token}`,
        },
    });
    return response.data?.data as BookingMeta | undefined;
};
export default getBookingMetaApi;