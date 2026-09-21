/**
 * CEO Business Analytics — backend (`/analytics/ceo`) ke response ka mirror.
 *
 * Backend types: `src/modules/analytics/analytics.type.ts`
 */

export type AnalyticsPeriodKey =
    | 'today'
    | 'week'
    | 'month'
    | 'quarter'
    | 'year'
    | 'all'
    | 'custom';

export interface AnalyticsPeriod {
    key: AnalyticsPeriodKey;
    label: string;
    from: string;
    to: string;
    days: number;
}

export interface AnalyticsOverview {
    totalEvents: number;
    upcomingEvents: number;
    ongoingEvents: number;
    completedEvents: number;
    cancelledEvents: number;
    todayEvents: number;
    totalBilled: number;
    totalCollected: number;
    pendingPayments: number;
    refunds: number;
    securityDeposits: number;
    securityDepositsHeld: number;
    deductions: number;
    netRevenue: number;
}

export interface AnalyticsModeSplit {
    mode: string;
    amount: number;
    count: number;
}

export interface AnalyticsEventRevenueRow {
    id: string;
    bookingNumber: string;
    eventName: string;
    eventType: string;
    hallName: string;
    applicantName: string;
    startDate: string;
    endDate: string;
    status: string;
    paymentStatus: string;
    totalAmount: number;
    collected: number;
    balance: number;
}

export interface AnalyticsPaymentRow {
    id: string;
    bookingId: string;
    bookingNumber: string;
    eventName: string;
    hallName: string;
    amount: number;
    mode: string;
    transactionId: string;
    receivedAt: string;
    receivedBy: string;
    proof: string;
}

export interface AnalyticsFinance {
    totalCollection: number;
    cashCollection: number;
    upiCollection: number;
    chequeCollection: number;
    neftCollection: number;
    onlineCollection: number;
    modeSplit: AnalyticsModeSplit[];
    pendingPayments: number;
    securityDepositCollected: number;
    securityDepositReturned: number;
    securityDepositsHeld: number;
    deductions: number;
    additionalCharges: number;
    billedTotal: number;
    eventWiseRevenue: AnalyticsEventRevenueRow[];
    paymentHistory: AnalyticsPaymentRow[];
}

export interface AnalyticsEventRow {
    id: string;
    bookingNumber: string;
    eventName: string;
    eventType: string;
    hallName: string;
    applicantName: string;
    applicantMobile: string;
    bookedFor: string;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    status: string;
    paymentStatus: string;
    totalAmount: number;
    collected: number;
    balance: number;
    bookedByStaff: string;
}

export interface AnalyticsEvents {
    counts: {
        upcoming: number;
        ongoing: number;
        completed: number;
        cancelled: number;
        total: number;
    };
    upcoming: AnalyticsEventRow[];
    ongoing: AnalyticsEventRow[];
    completed: AnalyticsEventRow[];
    cancelled: AnalyticsEventRow[];
}

export interface AnalyticsHallRow {
    hallId: string;
    hallName: string;
    capacity: number;
    bookings: number;
    billed: number;
    revenue: number;
    bookedDays: number;
    utilizationPct: number;
    occupiedToday: boolean;
    todayBookings: number;
    upcomingBookings: number;
}

export interface AnalyticsVenue {
    totalHalls: number;
    activeHalls: number;
    occupiedToday: number;
    availableToday: number;
    todayBookings: number;
    upcomingBookings: number;
    halls: AnalyticsHallRow[];
}

export interface AnalyticsCustomerRow {
    name: string;
    mobile: string;
    organization: string;
    bookings: number;
    billed: number;
    revenue: number;
    pending: number;
    firstBookingAt: string;
    lastBookingAt: string;
}

export interface AnalyticsPendingRow {
    bookingId: string;
    bookingNumber: string;
    customerName: string;
    mobile: string;
    eventName: string;
    hallName: string;
    startDate: string;
    status: string;
    balance: number;
}

export interface AnalyticsCustomers {
    totalCustomers: number;
    newCustomers: number;
    repeatCustomers: number;
    pendingCustomers: number;
    pendingAmount: number;
    topCustomers: AnalyticsCustomerRow[];
    pendingList: AnalyticsPendingRow[];
}

export interface AnalyticsStaffRow {
    userId: string;
    name: string;
    role: string;
    bookingsHandled: number;
    bookingsCreated: number;
    collected: number;
    pending: number;
    lastActivityAt: string | null;
}

export interface AnalyticsStaffAssignment {
    bookingId: string;
    bookingNumber: string;
    eventName: string;
    hallName: string;
    staffName: string;
    startDate: string;
    status: string;
    totalAmount: number;
    collected: number;
}

export interface AnalyticsStaff {
    totalStaff: number;
    staff: AnalyticsStaffRow[];
    assignments: AnalyticsStaffAssignment[];
}

export interface AnalyticsDepositRow {
    bookingId: string;
    bookingNumber: string;
    eventName: string;
    customerName: string;
    deposit: number;
    deducted: number;
    reason: string;
    returned: boolean;
    startDate: string;
}

export interface AnalyticsReports {
    daily: { label: string; value: number }[];
    weekly: { label: string; value: number }[];
    monthly: { label: string; value: number }[];
    byVenue: { label: string; value: number }[];
    byEventType: { label: string; value: number; count: number }[];
    bookingsByEventType: { label: string; value: number }[];
    cancellationRate: number;
    pendingReport: { count: number; amount: number };
    depositReport: {
        collected: number;
        returned: number;
        deducted: number;
        held: number;
        rows: AnalyticsDepositRow[];
    };
    profitLoss: {
        billed: number;
        collected: number;
        pending: number;
        refunds: number;
        deductions: number;
        netPosition: number;
    };
    monthlyComparison: {
        label: string;
        value: number;
        bookings: number;
        previousValue: number;
        previousBookings: number;
    }[];
}

export interface AnalyticsDocumentRow {
    id: string;
    bookingId: string;
    bookingNumber: string;
    customerName: string;
    mobile: string;
    eventName: string;
    hallName: string;
    type: string;
    label: string;
    url: string;
    addedAt: string;
}

export interface AnalyticsDocuments {
    total: number;
    byType: { label: string; value: number; key: string }[];
    rows: AnalyticsDocumentRow[];
}

export interface CeoAnalytics {
    period: AnalyticsPeriod;
    generatedAt: string;
    overview: AnalyticsOverview;
    finance: AnalyticsFinance;
    events: AnalyticsEvents;
    venue: AnalyticsVenue;
    customers: AnalyticsCustomers;
    staff: AnalyticsStaff;
    documents: AnalyticsDocuments;
    reports: AnalyticsReports;
}
