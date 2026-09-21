/**
 * CEO Business Analytics ke saare pure rules.
 *
 * Screen sirf UI hai: period options, section tabs, KPI cards, share/delta
 * percentages aur chart data — sab yahan se aata hai, isliye ye testable hai.
 */
import { num } from '../booking/BookingDetailFunction';
import type {
    AnalyticsCustomers,
    AnalyticsDocumentRow,
    AnalyticsDocuments,
    AnalyticsFinance,
    AnalyticsOverview,
    AnalyticsPeriod,
    AnalyticsPeriodKey,
    AnalyticsReports,
    AnalyticsStaff,
    AnalyticsVenue,
} from '../../interface/api/ceoAnalyticsInterface';

export type AnalyticsTone = 'gold' | 'green' | 'red' | 'blue' | 'violet';

export interface AnalyticsCard {
    key: string;
    title: string;
    value: string;
    hint?: string;
    tone: AnalyticsTone;
}

export type AnalyticsSectionKey =
    | 'overview'
    | 'finance'
    | 'events'
    | 'venue'
    | 'customers'
    | 'staff'
    | 'documents'
    | 'reports';

export interface AnalyticsSectionTab {
    key: AnalyticsSectionKey;
    label: string;
    sub: string;
}

/** Top ke 7 sections — wahi jo CEO ne maange the. */
export const ANALYTICS_SECTIONS: AnalyticsSectionTab[] = [
    { key: 'overview', label: 'Overview', sub: 'Business at a glance' },
    { key: 'finance', label: 'Finance', sub: 'Collection & payments' },
    { key: 'events', label: 'Events', sub: 'Upcoming & history' },
    { key: 'venue', label: 'Venue', sub: 'Hall performance' },
    { key: 'customers', label: 'Customers', sub: 'Bookings & dues' },
    { key: 'staff', label: 'Staff', sub: 'Who handled what' },
    { key: 'documents', label: 'Documents', sub: 'Uploaded proof & photos' },
    { key: 'reports', label: 'Reports', sub: 'Trends & comparison' },
];

/** Period chips — screen ke top par. */
export const PERIOD_OPTIONS: { key: AnalyticsPeriodKey; label: string; short: string }[] = [
    { key: 'today', label: 'Today', short: 'Today' },
    { key: 'week', label: 'Last 7 days', short: '7 Days' },
    { key: 'month', label: 'This month', short: 'Month' },
    { key: 'quarter', label: 'This quarter', short: 'Quarter' },
    { key: 'year', label: 'This year', short: 'Year' },
    { key: 'all', label: 'All time', short: 'All' },
];

export const DEFAULT_PERIOD: AnalyticsPeriodKey = 'month';

/** ₹1,23,456 (Indian grouping) — chhoti raqam bhi poora dikhao. */
export const money = (value: unknown): string =>
    `₹${Math.round(num(value)).toLocaleString('en-IN')}`;

const count = (value: unknown): string => String(Math.round(num(value)));

/** Share of a total (%), 1 decimal tak — bar/list ke liye. */
export const sharePct = (value: unknown, total: unknown): number => {
    const base = num(total);
    if (base <= 0) return 0;
    return Math.round((num(value) / base) * 1000) / 10;
};

/** Change % (previous 0 ho to +100/-0 handle karta hai). */
export const changePct = (current: unknown, previous: unknown): number => {
    const prev = num(previous);
    const now = num(current);
    if (prev <= 0) return now > 0 ? 100 : 0;
    return Math.round(((now - prev) / prev) * 1000) / 10;
};

/** Collection progress bar (%) — billed ke against kitna aa gaya. */
export const collectionPct = (collected: unknown, billed: unknown): number => {
    const total = num(billed);
    if (total <= 0) return 0;
    return Math.min(100, Math.max(0, Math.round((num(collected) / total) * 1000) / 10));
};

/** "01 Sep 2026 – 21 Sep 2026" (custom/all me kaam aata hai). */
export const formatPeriodRange = (period?: AnalyticsPeriod): string => {
    if (!period?.from || !period?.to) return '';
    const options: Intl.DateTimeFormatOptions = {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    };
    const from = new Date(period.from);
    const to = new Date(period.to);
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return '';
    const fromText = from.toLocaleDateString('en-IN', options);
    const toText = to.toLocaleDateString('en-IN', options);
    return fromText === toText ? fromText : `${fromText} – ${toText}`;
};

/** Chart data — backend [{label,value}] ko gifted-charts ke liye coerce. */
export const toChartData = (
    series?: { label: string; value: number }[],
): { label: string; value: number }[] =>
    (series ?? []).map((point) => ({
        label: String(point?.label ?? ''),
        value: Math.max(0, num(point?.value)),
    }));

/** Chart ka maxValue — sab zero ho to bhi axis khaali na dikhe. */
export const maxSeriesValue = (
    series?: { value: number }[],
    fallback = 1,
): number => {
    const values = (series ?? []).map((point) => num(point?.value));
    return Math.max(fallback, ...(values.length ? values : [0]));
};

/** Event status → badge tone (rows me dikhta hai). */
export const statusTone = (status?: string): AnalyticsTone => {
    switch (String(status ?? '').trim()) {
        case 'Cancelled':
            return 'red';
        case 'Ended':
            return 'violet';
        case 'Confirmed':
        case 'Office-Approved':
            return 'green';
        case 'Pending':
        case 'Draft':
            return 'gold';
        default:
            return 'blue';
    }
};

// ── KPI cards per section ────────────────────────────────────────────────

export const buildOverviewCards = (overview?: AnalyticsOverview): AnalyticsCard[] => {
    if (!overview) return [];
    return [
        {
            key: 'totalEvents',
            title: 'Total Events',
            value: count(overview.totalEvents),
            hint: 'Booked in this period',
            tone: 'blue',
        },
        {
            key: 'upcomingEvents',
            title: 'Upcoming Events',
            value: count(overview.upcomingEvents),
            hint: 'Scheduled ahead',
            tone: 'violet',
        },
        {
            key: 'completedEvents',
            title: 'Completed Events',
            value: count(overview.completedEvents),
            hint: 'Closed in this period',
            tone: 'green',
        },
        {
            key: 'cancelledEvents',
            title: 'Cancelled Events',
            value: count(overview.cancelledEvents),
            hint: 'Cancelled in this period',
            tone: 'red',
        },
        {
            key: 'todayEvents',
            title: "Today's Events",
            value: count(overview.todayEvents),
            hint: `${count(overview.ongoingEvents)} ongoing`,
            tone: 'gold',
        },
        {
            key: 'totalBilled',
            title: 'Total Billed',
            value: money(overview.totalBilled),
            hint: 'Charges + units',
            tone: 'blue',
        },
        {
            key: 'totalCollected',
            title: 'Total Revenue',
            value: money(overview.totalCollected),
            hint: 'Received in this period',
            tone: 'green',
        },
        {
            key: 'pendingPayments',
            title: 'Pending Payments',
            value: money(overview.pendingPayments),
            hint: 'Yet to be collected',
            tone: 'red',
        },
        {
            key: 'refunds',
            title: 'Refunds',
            value: money(overview.refunds),
            hint: 'Deposits returned',
            tone: 'violet',
        },
        {
            key: 'securityDeposits',
            title: 'Security Deposits',
            value: money(overview.securityDeposits),
            hint: `${money(overview.securityDepositsHeld)} still held`,
            tone: 'gold',
        },
        {
            key: 'netRevenue',
            title: 'Net Revenue',
            value: money(overview.netRevenue),
            hint: 'Collected + deductions − refunds',
            tone: 'green',
        },
    ];
};

export const buildFinanceCards = (finance?: AnalyticsFinance): AnalyticsCard[] => {
    if (!finance) return [];
    return [
        {
            key: 'totalCollection',
            title: 'Total Collection',
            value: money(finance.totalCollection),
            hint: `of ${money(finance.billedTotal)} billed`,
            tone: 'green',
        },
        {
            key: 'cashCollection',
            title: 'Cash Collection',
            value: money(finance.cashCollection),
            hint: `${sharePct(finance.cashCollection, finance.totalCollection)}% of collection`,
            tone: 'gold',
        },
        {
            key: 'upiCollection',
            title: 'UPI Collection',
            value: money(finance.upiCollection),
            hint: `${sharePct(finance.upiCollection, finance.totalCollection)}% of collection`,
            tone: 'blue',
        },
        {
            key: 'onlineCollection',
            title: 'Online Collection',
            value: money(finance.onlineCollection),
            hint: 'UPI + NEFT/RTGS',
            tone: 'violet',
        },
        {
            key: 'chequeCollection',
            title: 'Cheque Collection',
            value: money(finance.chequeCollection),
            hint: `${sharePct(finance.chequeCollection, finance.totalCollection)}% of collection`,
            tone: 'blue',
        },
        {
            key: 'neftCollection',
            title: 'NEFT / RTGS',
            value: money(finance.neftCollection),
            hint: `${sharePct(finance.neftCollection, finance.totalCollection)}% of collection`,
            tone: 'violet',
        },
        {
            key: 'pendingPayments',
            title: 'Pending Payments',
            value: money(finance.pendingPayments),
            hint: 'Balance across bookings',
            tone: 'red',
        },
        {
            key: 'securityDepositCollected',
            title: 'Deposit Collected',
            value: money(finance.securityDepositCollected),
            hint: `${money(finance.securityDepositsHeld)} held`,
            tone: 'gold',
        },
        {
            key: 'securityDepositReturned',
            title: 'Deposit Returned',
            value: money(finance.securityDepositReturned),
            hint: 'Refunded to customers',
            tone: 'violet',
        },
        {
            key: 'deductions',
            title: 'Deductions',
            value: money(finance.deductions),
            hint: 'Kept from deposits',
            tone: 'red',
        },
        {
            key: 'additionalCharges',
            title: 'Additional Charges',
            value: money(finance.additionalCharges),
            hint: 'Unit consumption billed',
            tone: 'gold',
        },
    ];
};

export const buildVenueCards = (venue?: AnalyticsVenue): AnalyticsCard[] => {
    if (!venue) return [];
    return [
        {
            key: 'totalHalls',
            title: 'Total Halls',
            value: count(venue.totalHalls),
            hint: `${count(venue.activeHalls)} active`,
            tone: 'blue',
        },
        {
            key: 'occupiedToday',
            title: 'Occupied Today',
            value: count(venue.occupiedToday),
            hint: 'Running right now',
            tone: 'green',
        },
        {
            key: 'availableToday',
            title: 'Available Today',
            value: count(venue.availableToday),
            hint: 'Free to book',
            tone: 'gold',
        },
        {
            key: 'todayBookings',
            title: "Today's Bookings",
            value: count(venue.todayBookings),
            hint: 'Covering today',
            tone: 'violet',
        },
        {
            key: 'upcomingBookings',
            title: 'Upcoming Bookings',
            value: count(venue.upcomingBookings),
            hint: 'Scheduled ahead',
            tone: 'blue',
        },
    ];
};

export const buildCustomerCards = (customers?: AnalyticsCustomers): AnalyticsCard[] => {
    if (!customers) return [];
    return [
        {
            key: 'totalCustomers',
            title: 'Total Customers',
            value: count(customers.totalCustomers),
            hint: 'Booked in this period',
            tone: 'blue',
        },
        {
            key: 'newCustomers',
            title: 'New Customers',
            value: count(customers.newCustomers),
            hint: 'First booking here',
            tone: 'green',
        },
        {
            key: 'repeatCustomers',
            title: 'Repeat Customers',
            value: count(customers.repeatCustomers),
            hint: 'Returning customers',
            tone: 'violet',
        },
        {
            key: 'pendingCustomers',
            title: 'Customers With Dues',
            value: count(customers.pendingCustomers),
            hint: 'Balance pending',
            tone: 'red',
        },
        {
            key: 'pendingAmount',
            title: 'Total Dues',
            value: money(customers.pendingAmount),
            hint: 'To be collected',
            tone: 'gold',
        },
    ];
};

export const buildStaffCards = (staff?: AnalyticsStaff): AnalyticsCard[] => {
    if (!staff) return [];
    const top = [...(staff.staff ?? [])].sort((a, b) => num(b.collected) - num(a.collected))[0];
    const totalCollected = (staff.staff ?? []).reduce((sum, row) => sum + num(row.collected), 0);
    const activeStaff = (staff.staff ?? []).filter(
        (row) => num(row.bookingsHandled) > 0 || num(row.collected) > 0,
    ).length;

    return [
        {
            key: 'totalStaff',
            title: 'Staff Members',
            value: count(staff.totalStaff),
            hint: `${activeStaff} active in this period`,
            tone: 'blue',
        },
        {
            key: 'topCollector',
            title: 'Top Collector',
            value: top?.name ?? '—',
            hint: `${money(top?.collected ?? 0)} received`,
            tone: 'green',
        },
        {
            key: 'collected',
            title: 'Staff Collection',
            value: money(totalCollected),
            hint: 'Received by staff',
            tone: 'gold',
        },
        {
            key: 'assignments',
            title: 'Events Handled',
            value: count(staff.assignments?.length ?? 0),
            hint: 'With a staff owner',
            tone: 'violet',
        },
    ];
};

export const buildDocumentCards = (documents?: AnalyticsDocuments): AnalyticsCard[] => {
    if (!documents) return [];
    const countOf = (key: string): number =>
        documents.byType.find((entry) => entry.key === key)?.value ?? 0;

    return [
        {
            key: 'totalDocuments',
            title: 'Total Documents',
            value: count(documents.total),
            hint: 'Uploaded in this period',
            tone: 'blue',
        },
        {
            key: 'totalCollection',
            title: 'Payment Proofs',
            value: count(countOf('paymentProof')),
            hint: 'Receipts / screenshots',
            tone: 'green',
        },
        {
            key: 'meterStart',
            title: 'Meter Readings',
            value: count(countOf('meterStart')),
            hint: `${count(countOf('meterClosing'))} closing meters`,
            tone: 'gold',
        },
        {
            key: 'totalStaff',
            title: 'Signatures',
            value: count(countOf('applicantSignature') + countOf('managerSignature')),
            hint: 'Applicant + manager',
            tone: 'violet',
        },
        {
            key: 'idProof',
            title: 'ID Proofs',
            value: count(countOf('idProof')),
            hint: 'Customer identity',
            tone: 'red',
        },
    ];
};

/** Type filter chips — sirf wahi types jo is period me mile. */
export const documentTypeOptions = (
    documents?: AnalyticsDocuments,
): { key: string; label: string; value: number }[] =>
    (documents?.byType ?? []).map((entry) => ({
        key: String(entry.key),
        label: String(entry.label),
        value: num(entry.value),
    }));

/** Documents ko type + text search se filter karta hai (client par). */
export const filterDocuments = (
    rows: AnalyticsDocumentRow[] | undefined,
    options: { type?: string; search?: string } = {},
): AnalyticsDocumentRow[] => {
    const type = String(options.type ?? '').trim();
    const query = String(options.search ?? '').trim().toLowerCase();

    return (rows ?? []).filter((row) => {
        if (type && type !== 'all' && row.type !== type) return false;
        if (!query) return true;
        return [row.eventName, row.customerName, row.mobile, row.bookingNumber, row.label, row.hallName]
            .some((value) => String(value ?? '').toLowerCase().includes(query));
    });
};

/** "12 Sep" — document row ke saath date dikhane ke liye. */
export const documentDate = (value?: string): string => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

/** Documents ki list — sabse naya pehle. */
export const sortDocumentsByDate = (
    rows: AnalyticsDocumentRow[] | undefined,
): AnalyticsDocumentRow[] =>
    [...(rows ?? [])].sort(
        (a, b) => new Date(b.addedAt ?? 0).getTime() - new Date(a.addedAt ?? 0).getTime(),
    );

export const buildReportCards = (reports?: AnalyticsReports): AnalyticsCard[] => {
    if (!reports) return [];
    return [
        {
            key: 'cancellationRate',
            title: 'Cancellation Rate',
            value: `${num(reports.cancellationRate)}%`,
            hint: 'Of events in this period',
            tone: 'red',
        },
        {
            key: 'pending',
            title: 'Pending Payment Report',
            value: money(reports.pendingReport?.amount),
            hint: `${count(reports.pendingReport?.count)} bookings with dues`,
            tone: 'gold',
        },
        {
            key: 'depositHeld',
            title: 'Deposits Held',
            value: money(reports.depositReport?.held),
            hint: `${money(reports.depositReport?.deducted)} deducted`,
            tone: 'blue',
        },
        {
            key: 'netPosition',
            title: 'Net Position',
            value: money(reports.profitLoss?.netPosition),
            hint: 'Cash basis (no expenses tracked)',
            tone: 'green',
        },
    ];
};

// ── List helpers ─────────────────────────────────────────────────────────

export interface BarRow {
    key: string;
    label: string;
    value: number;
    valueText: string;
    sharePct: number;
    hint?: string;
    tone: AnalyticsTone;
}

/** Mode split ko bar rows me badalta hai (share % kheech ke). */
export const modeRows = (finance?: AnalyticsFinance): BarRow[] => {
    const total = num(finance?.totalCollection);
    const tones: Record<string, AnalyticsTone> = {
        Cash: 'gold',
        UPI: 'blue',
        Cheque: 'violet',
        'NEFT/RTGS': 'green',
        Other: 'red',
    };
    return (finance?.modeSplit ?? [])
        .map((row) => ({
            key: String(row.mode),
            label: String(row.mode),
            value: num(row.amount),
            valueText: money(row.amount),
            sharePct: sharePct(row.amount, total),
            hint: `${count(row.count)} payments`,
            tone: tones[String(row.mode)] ?? 'blue',
        }))
        .sort((a, b) => b.value - a.value);
};

/** Revenue by hall — bar rows. */
export const venueRows = (reports?: AnalyticsReports): BarRow[] => {
    const total = (reports?.byVenue ?? []).reduce((sum, row) => sum + num(row.value), 0);
    return (reports?.byVenue ?? []).map((row) => ({
        key: String(row.label),
        label: String(row.label),
        value: num(row.value),
        valueText: money(row.value),
        sharePct: sharePct(row.value, total),
        tone: 'gold' as AnalyticsTone,
    }));
};

/** Revenue by event type. */
export const eventTypeRows = (reports?: AnalyticsReports): BarRow[] => {
    const total = (reports?.byEventType ?? []).reduce((sum, row) => sum + num(row.value), 0);
    return (reports?.byEventType ?? []).map((row) => ({
        key: String(row.label),
        label: String(row.label),
        value: num(row.value),
        valueText: money(row.value),
        sharePct: sharePct(row.value, total),
        hint: `${count(row.count)} events`,
        tone: 'violet' as AnalyticsTone,
    }));
};

/** Monthly comparison rows — is mahine vs pichhle mahine. */
export const comparisonRows = (
    reports?: AnalyticsReports,
): (BarRow & { delta: number; previousText: string })[] =>
    (reports?.monthlyComparison ?? []).map((row) => ({
        key: String(row.label),
        label: String(row.label),
        value: num(row.value),
        valueText: money(row.value),
        sharePct: 0,
        hint: `${count(row.bookings)} bookings`,
        tone: changePct(row.value, row.previousValue) >= 0 ? 'green' : 'red',
        delta: changePct(row.value, row.previousValue),
        previousText: money(row.previousValue),
    }));

/**
 * Hall rows — revenue + utilization.
 *
 * Yahan `sharePct` revenue share nahi, **utilization** hai (period ke kitne
 * % din hall booked raha), kyunki hall list me wahi bar dikhti hai.
 */
export interface HallRow extends BarRow {
    capacity: number;
    bookings: number;
    utilizationPct: number;
    occupiedToday: boolean;
}

export const hallUtilizationRows = (venue?: AnalyticsVenue): HallRow[] =>
    (venue?.halls ?? []).map((hall) => ({
        key: String(hall.hallId || hall.hallName),
        label: String(hall.hallName),
        value: num(hall.revenue),
        valueText: money(hall.revenue),
        sharePct: Math.min(100, Math.max(0, num(hall.utilizationPct))),
        hint: `${count(hall.bookings)} bookings · ${count(hall.bookedDays)} days booked`,
        tone: hall.occupiedToday ? 'green' : 'blue',
        capacity: num(hall.capacity),
        bookings: num(hall.bookings),
        utilizationPct: num(hall.utilizationPct),
        occupiedToday: hall.occupiedToday === true,
    }));
