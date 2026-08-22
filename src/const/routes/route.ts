export const route = {
    onboard: 'onboardScreen',
    login: 'loginScreen',
    otp: "otpscreen",
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

export const DrawerRoute = {
    MainTabs: "MainTabs",
    NewBooking: "NewBooking",
    BookingDetail: "BookingDetail",
    AddPayment: "AddPayment",
    HandoverChecklist: "HandoverChecklist",
    OfficeApproval: "OfficeApproval",
    StaffActivity: "StaffActivity",
    Reports: "Reports",
    Profile: "Profile",
    Logout: "Logout",
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
    [BookingStepRoute.Step1Applicant]: undefined;
    [BookingStepRoute.Step2Event]: { applicantData?: any };
    [BookingStepRoute.Step3Schedule]: undefined;
    [BookingStepRoute.Step4Attendance]: undefined;
    [BookingStepRoute.Step5Requirements]: undefined;
    [BookingStepRoute.Step6Decoration]: undefined;
    [BookingStepRoute.Step7Payment]: undefined;
};