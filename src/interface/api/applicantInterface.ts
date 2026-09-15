export interface applicantListInterface {
    id: string;
    name: string;
    mobile: string;
    image: string;
    organization: string;
    email: string;
    address: string;
    totalBookings: number;
    activeBookings: number;
    cancelledBookings: number;
    endedBookings: number;
    totalAmount: number;
    firstBookingAt: string;
    lastBookingAt: string;
    latestBookingNumber: string;
    latestEventName: string;
    latestEventDate: string;
    latestStatus: string;
}