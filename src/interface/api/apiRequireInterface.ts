export interface sendOtpApiInterface {
    phone: string
}
export interface verifyOtpInterface extends sendOtpApiInterface {
    otp: string
}
export interface createProfileInterface {
    name: string;
    email: string;
    city: string;
    photo: string;
    gender: "male" | "female" | "other";
    token: string;
}

export interface profileUpdateInterface {
    name: string;
    email: string;
    city: string;
    photo?: string;
    token: string;
}

export interface createDraftBookingInterface {
    bookingType: string;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    eventName: string;
    bookedByStaff: string;
    allocatedTeam?: string[];
    token: string;
}

export interface updateBookingSectionInterface {
    id: string;
    section: 'applicant' | 'event' | 'arrangements' | 'payment' | 'declaration';
    data: Record<string, any>;
    token: string;
}
