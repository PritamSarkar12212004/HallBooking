export const route = {
    onboard: 'onboardScreen',
    login: 'loginScreen',
    otp: "otpscreen",
    setUp: "setup",
    home: 'homeScreen',
    modal: 'modal',
    splash: 'splashScreen',
} as const;

export const TabRoute = {
    Home: "Home",
    Bookings: "Bookings",
    Halls: "Halls",
    Profile: "Profile",
    Staff: "Staff",
    Dashboard: "Dashboard",
    Reports: "Reports",
} as const;

export const MainRoute = {
    MainTabs: "MainTabs",
    NewBooking: "NewBooking",
    BookingDetail: "BookingDetail",
    AddPayment: "AddPayment",
    HandoverChecklist: "HandoverChecklist",
    OfficeApproval: "OfficeApproval",
    StaffActivity: "StaffActivity",
    Reports: "Reports",
    Profile: "Profile",
    HallCalendar: "HallCalendar",
} as const;

export const BookingStepRoute = {
    Step1Applicant: "Step1Applicant",
    Step2Event: "Step2Event",
    Step3Schedule: "Step3Schedule",
    Step4Attendance: "Step4Attendance",
    Step5Requirements: "Step5Requirements",
    Step6Decoration: "Step6Decoration",
    Step7Payment: "Step7Payment",
} as const;

export type BookingStepParamList = {
    [BookingStepRoute.Step1Applicant]: { bookingId?: string; bookingNumber?: string } | undefined;
    [BookingStepRoute.Step2Event]: { applicantData?: any; bookingId?: string };
    [BookingStepRoute.Step3Schedule]: { bookingId?: string };
    [BookingStepRoute.Step4Attendance]: { bookingId?: string };
    [BookingStepRoute.Step5Requirements]: { bookingId?: string };
    [BookingStepRoute.Step6Decoration]: { bookingId?: string };
    [BookingStepRoute.Step7Payment]: { bookingId?: string };
};