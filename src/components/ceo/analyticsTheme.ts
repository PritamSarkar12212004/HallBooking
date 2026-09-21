/**
 * CEO analytics ka chhota theme layer.
 *
 * DashboardPalette ke tone (gold/green/red/blue/violet) ko accent + soft
 * background me badalta hai, aur KPI card key se icon chunta hai — isse panels
 * me sirf data rehta hai, colors/icons ek jagah.
 */
import {
    BadgeIndianRupee,
    Banknote,
    Building2,
    CalendarCheck,
    CalendarClock,
    CalendarDays,
    ClipboardList,
    Clock3,
    CreditCard,
    FileText,
    Gauge,
    IdCard,
    IndianRupee,
    Landmark,
    Lock,
    Percent,
    ReceiptIndianRupee,
    ShieldCheck,
    Tag,
    TrendingUp,
    TriangleAlert,
    UserRound,
    Users,
    Wallet2,
    type LucideIcon,
} from 'lucide-react-native';

import DashboardPalette from '../../const/theme/dashboardPalette';
import type { AnalyticsTone } from '../../functions/ceo/AnalyticsFunction';

export interface ToneStyle {
    accent: string;
    soft: string;
}

export const toneStyle = (tone: AnalyticsTone): ToneStyle => {
    switch (tone) {
        case 'green':
            return { accent: DashboardPalette.green, soft: DashboardPalette.greenSoft };
        case 'red':
            return { accent: DashboardPalette.red, soft: DashboardPalette.redSoft };
        case 'blue':
            return { accent: DashboardPalette.blue, soft: DashboardPalette.blueSoft };
        case 'violet':
            return { accent: DashboardPalette.violet, soft: DashboardPalette.violetSoft };
        case 'gold':
        default:
            return { accent: DashboardPalette.goldDeep, soft: DashboardPalette.goldSoft };
    }
};

const ICONS: Record<string, LucideIcon> = {
    // Overview
    totalEvents: CalendarDays,
    upcomingEvents: CalendarClock,
    completedEvents: CalendarCheck,
    cancelledEvents: TriangleAlert,
    todayEvents: Clock3,
    totalBilled: FileText,
    totalCollected: BadgeIndianRupee,
    pendingPayments: Wallet2,
    refunds: ReceiptIndianRupee,
    securityDeposits: ShieldCheck,
    netRevenue: TrendingUp,
    // Finance
    totalCollection: IndianRupee,
    cashCollection: Banknote,
    upiCollection: CreditCard,
    onlineCollection: Percent,
    chequeCollection: FileText,
    neftCollection: Landmark,
    securityDepositCollected: ShieldCheck,
    securityDepositReturned: ReceiptIndianRupee,
    deductions: TriangleAlert,
    additionalCharges: Tag,
    // Venue
    totalHalls: Building2,
    occupiedToday: Lock,
    availableToday: CalendarCheck,
    todayBookings: ClipboardList,
    upcomingBookings: CalendarClock,
    // Customers
    totalCustomers: Users,
    newCustomers: UserRound,
    repeatCustomers: Gauge,
    pendingCustomers: Wallet2,
    pendingAmount: IndianRupee,
    // Staff
    totalStaff: Users,
    topCollector: TrendingUp,
    collected: Banknote,
    assignments: ClipboardList,
    // Reports
    cancellationRate: TriangleAlert,
    pending: Wallet2,
    depositHeld: ShieldCheck,
    netPosition: TrendingUp,
    // Documents
    totalDocuments: FileText,
    meterStart: Gauge,
    idProof: IdCard,
};

export const iconForCard = (key: string): LucideIcon => ICONS[key] ?? Gauge;
