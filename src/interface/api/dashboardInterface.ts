export interface DashboardEventItem {
    id: string;
    eventName: string;
    eventType: string;
    hallName: string;
    applicantName: string;
    date: string;
    startTime: string;
    endTime: string;
    totalAmount: number;
    status: string;
    paymentStatus: string;
    bookedBy: string;
    expenses: number;
}

export interface DashboardStats {
    todayEvents: number;
    pendingPaymentsAmount: number;
    weekBookings: number;
    activeBookings: number;
    totalRevenue: number;
    collectedAmount: number;
    totalBookings: number;
    cancelledCount: number;
    weeklyGrowth: number;
    totalExpenses: number;
}

export interface DashboardData {
    stats: DashboardStats;
    weeklyChart: { value: number; label: string }[];
    monthlyRevenue: { value: number; label: string }[];
    weeklyExpenses: { value: number; label: string }[];
    monthlyExpenses: { value: number; label: string }[];
    paymentDistribution: { status: string; count: number }[];
    hallStats: { hallName: string; bookings: number; revenue: number }[];
    todayEvents: DashboardEventItem[];
    upcomingEvents: DashboardEventItem[];
    recentBookings: DashboardEventItem[];
}