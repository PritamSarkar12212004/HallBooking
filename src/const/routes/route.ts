export const route = {
  login: 'loginScreen',
  otp: 'otpscreen',
  setUp: 'setup',
  home: 'homeScreen',
  modal: 'modal',
  splash: 'splashScreen',
} as const;

export const TabRoute = {
  Home: 'Home',
  Bookings: 'Bookings',
  Applicants: 'Applicants',
  Notification: 'Notification',
  Profile: 'Profile',
  Dashboard: 'Dashboard',
  Reports: 'Reports',
  /** CEO Business Analytics (7 sections) — CEO tabs me ek apna tab. */
  Analytics: 'Analytics',
} as const;

export const MainRoute = {
  MainTabs: 'MainTabs',
  NewBooking: 'NewBooking',
  BookingDetail: 'BookingDetail',
  EditFinance: 'EditFinance',
  /** Event details (booking-for etc.) edit karne ki screen. */
  EditEvent: 'EditEvent',
  PaymentTrackRecord: 'PaymentTrackRecord',
  Reports: 'Reports',
  Profile: 'Profile',
  ProfileQr: 'ProfileQr',
  HallCalendar: 'HallCalendar',
  FeatureCalendar: 'FeatureCalendar',
  StaffActivity: 'StaffActivity',
} as const;

export const BookingStepRoute = {
  Step1Applicant: 'Step1Applicant',
  Step2Event: 'Step2Event',
  Step3Schedule: 'Step3Schedule',
  Step4Attendance: 'Step4Attendance',
  Units: 'Units',
  Step5Requirements: 'Step5Requirements',
  Step6Decoration: 'Step6Decoration',
  Step7Payment: 'Step7Payment',
  UpiQr: 'UpiQr',
  BookingSuccess: 'BookingSuccess',
  FainalizeEventPage: 'FainalizeEventPage',
} as const;
export const FeatureRoute = {
  CalendarRange: 'CalendarRange',
} as const;
export type BookingStepParamList = {
  [BookingStepRoute.Step1Applicant]:
    | { bookingId?: string; bookingNumber?: string }
    | undefined;
  [BookingStepRoute.Step2Event]: { applicantData?: any; bookingId?: string };
  [BookingStepRoute.Step3Schedule]: { bookingId?: string };
  [BookingStepRoute.Step4Attendance]: { bookingId?: string };
  [BookingStepRoute.Units]: { bookingId?: string };
  [BookingStepRoute.Step5Requirements]: { bookingId?: string };
  [BookingStepRoute.Step6Decoration]: { bookingId?: string };
  [BookingStepRoute.Step7Payment]: { bookingId?: string };
  [BookingStepRoute.UpiQr]: { bookingId?: string; amount?: number };
  [BookingStepRoute.BookingSuccess]: {
    bookingId?: string;
    bookingNumber?: string;
  };
  [BookingStepRoute.FainalizeEventPage]: {
    bookingId?: string;
    amount?: number;
  };
};
