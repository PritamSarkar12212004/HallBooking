import apiRoute from "../../../const/api/apiRoutes";
import { apiBooking } from "../../../utils/api";
import { bookingListInterface } from "../../../interface/api/bookintInterface";

export interface Pagination {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
}

export interface BookingsPage {
    bookings: bookingListInterface[];
    pagination: Pagination;
}

export interface ListBookingsParams {
    token: string;
    page?: number;
    pageSize?: number;
}

const listBookingsApi = async (data: ListBookingsParams): Promise<BookingsPage> => {
    const response = await apiBooking.get(apiRoute.booking.root, {
        headers: {
            Authorization: `Bearer ${data.token}`
        },
        params: {
            page: data.page ?? 1,
            pageSize: data.pageSize ?? 10,
        }
    })
    const payload = response.data?.data;
    return {
        bookings: payload?.bookings ?? [],
        pagination: payload?.pagination ?? {
            page: data.page ?? 1,
            pageSize: data.pageSize ?? 10,
            total: 0,
            totalPages: 0,
            hasMore: false,
        },
    }
}
export default listBookingsApi