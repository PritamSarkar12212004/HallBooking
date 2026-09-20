/**
 * Booking Details (paged view) ke saare pure rules.
 *
 * Screen sirf UI hai: overview / applicant / requirements / finance / finalize
 * pages ka data yahan se banta hai, aur **Finalize Event** ka gate bhi yahin
 * decide hota hai — agar unit add hai par uski current reading nahi hai, to
 * swipe locked rehta hai aur reason `getUnitIssues()` se aata hai.
 */
import { formatDate, formatTime } from '../formate/DateTimeFormate';

export const num = (value: unknown): number => {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
};

/** ₹1,23,456 (Indian grouping). */
export const money = (value: unknown): string =>
    `₹${Math.round(num(value)).toLocaleString('en-IN')}`;

// --- Status ---------------------------------------------------------------

export type StatusTone = 'success' | 'warning' | 'info' | 'danger' | 'neutral';

export interface StatusMeta {
    /** Screen par dikhne wala label. */
    label: string;
    tone: StatusTone;
    /** Kya ye booking ab edit/lock ho chuki hai. */
    locked: boolean;
}

export const getStatusMeta = (status?: string): StatusMeta => {
    switch (status) {
        case 'Cancelled':
            return { label: 'Cancelled', tone: 'danger', locked: false };
        case 'Ended':
            return { label: 'Event Ended', tone: 'info', locked: true };
        case 'Confirmed':
        case 'Office-Approved':
            return { label: 'Confirmed', tone: 'success', locked: false };
        case 'Pending':
            return { label: 'Pending', tone: 'warning', locked: false };
        case 'Draft':
            return { label: 'Draft', tone: 'warning', locked: false };
        default:
            return { label: status || 'Draft', tone: 'neutral', locked: false };
    }
};

/** Payment status (Paid / Partial / Pending) ka chhota badge. */
export const getPaymentStatusMeta = (paymentStatus?: string): StatusMeta => {
    switch (paymentStatus) {
        case 'Paid':
            return { label: 'Paid', tone: 'success', locked: false };
        case 'Partial':
            return { label: 'Partial', tone: 'warning', locked: false };
        default:
            return { label: 'Pending', tone: 'danger', locked: false };
    }
};

// --- Overview -------------------------------------------------------------

export interface ScheduleSummary {
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    /** Kitne calendar din (same day = 1). */
    dayCount: number;
    isMultiDay: boolean;
    /** "12 Sep 2026" ya "12 Sep 2026 → 14 Sep 2026" */
    dateLine: string;
    /** "6:00 PM → 11:00 PM" */
    timeLine: string;
    /** "1 day · 5h window" / "3 days · 5h window" */
    durationLine: string;
}

const DIFF_HOURS = (startTime: string, endTime: string): number | null => {
    const parse = (t: string) => {
        if (!t) return null;
        const match = t.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)?/i);
        if (!match) return null;

        let hour = Number(match[1]);
        const minute = Number(match[2] ?? 0);
        const meridian = (match[3] || '').toUpperCase();

        if (meridian === 'PM' && hour < 12) hour += 12;
        if (meridian === 'AM' && hour === 12) hour = 0;

        return hour * 60 + minute;
    };

    const from = parse(startTime);
    const to = parse(endTime);
    if (from === null || to === null) return null;

    // Overnight event (end next morning) → 24h add kar dete hain.
    const diff = to >= from ? to - from : to + 24 * 60 - from;
    return diff > 0 ? Math.round((diff / 60) * 10) / 10 : null;
};

export const getScheduleSummary = (schedule?: {
    startDate?: string;
    endDate?: string;
    startTime?: string;
    endTime?: string;
} | null): ScheduleSummary => {
    const startDate = String(schedule?.startDate ?? '');
    const endDate = String(schedule?.endDate ?? '');
    const startTime = String(schedule?.startTime ?? '');
    const endTime = String(schedule?.endTime ?? '');

    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : start;

    let dayCount = 1;
    if (start && end) {
        const ms = new Date(end).setHours(0, 0, 0, 0) - new Date(start).setHours(0, 0, 0, 0);
        const days = Math.round(ms / (24 * 60 * 60 * 1000));
        dayCount = days >= 0 ? days + 1 : 1;
    }

    const formattedStart = formatDate(startDate);
    const formattedEnd = formatDate(endDate);
    const isMultiDay = dayCount > 1;

    const hours = DIFF_HOURS(startTime, endTime);
    const windowLabel = hours ? `${hours}h window` : 'time set nahi';
    const dayLabel = dayCount === 1 ? '1 day' : `${dayCount} days`;

    return {
        startDate,
        endDate,
        startTime,
        endTime,
        dayCount,
        isMultiDay,
        dateLine:
            !isMultiDay || formattedStart === formattedEnd
                ? formattedStart || '—'
                : `${formattedStart} → ${formattedEnd}`,
        timeLine: `${formatTime(startTime) || '—'} → ${formatTime(endTime) || '—'}`,
        durationLine: `${dayLabel} · ${windowLabel}`,
    };
};

export interface BookingOverview {
    eventName: string;
    eventType: string;
    eventImage: string;
    bookingNumber: string;
    status: StatusMeta;
    paymentStatus: StatusMeta;
    hallName: string;
    hallCapacity: number;
    expectedAttendance: number;
    bookedBy: string;
    createdAt: string;
    schedule: ScheduleSummary;
    isEnded: boolean;
}

export const getBookingOverview = (booking: any): BookingOverview => {
    const event = booking?.event ?? {};
    const hall = booking?.hall ?? {};

    return {
        eventName: event?.name || 'Event',
        eventType: event?.customType || event?.type || '—',
        eventImage: booking?.eventImage || '',
        bookingNumber: booking?.bookingNumber || '—',
        status: getStatusMeta(booking?.status),
        paymentStatus: getPaymentStatusMeta(booking?.paymentStatus),
        hallName: hall?.name || 'Hall assigned nahi',
        hallCapacity: num(hall?.capacity),
        expectedAttendance: num(event?.expectedAttendance),
        bookedBy: booking?.bookedByStaff || booking?.createdByName || '—',
        createdAt: booking?.createdAt ? formatDate(String(booking.createdAt)) : '',
        schedule: getScheduleSummary(booking?.schedule),
        isEnded: booking?.status === 'Ended',
    };
};

// --- Applicant ------------------------------------------------------------

export const getInitials = (name?: string): string => {
    const parts = String(name ?? '')
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

export const getGovernmentIdLabel = (governmentId?: {
    type?: string;
    name?: string;
} | null): string => {
    const custom = String(governmentId?.name ?? '').trim();
    const type = String(governmentId?.type ?? '').trim();

    if (custom && (!type || type.toLowerCase() === 'other')) return custom;
    return type || custom || '';
};

export interface ApplicantInfo {
    name: string;
    organization: string;
    mobile: string;
    email: string;
    address: string;
    initials: string;
    governmentIdLabel: string;
    governmentIdNumber: string;
    governmentIdPhoto: string;
    hasGovernmentId: boolean;
}

export const getApplicantInfo = (applicant: any): ApplicantInfo => {
    const governmentId = applicant?.governmentId ?? {};
    const label = getGovernmentIdLabel(governmentId);

    return {
        name: applicant?.name || '—',
        organization: applicant?.organization || '',
        mobile: applicant?.mobile || '',
        email: applicant?.email || '',
        address: applicant?.address || '',
        initials: getInitials(applicant?.name),
        governmentIdLabel: label,
        governmentIdNumber: String(governmentId?.number ?? ''),
        governmentIdPhoto: governmentId?.photo || '',
        hasGovernmentId: Boolean(label || governmentId?.number || governmentId?.photo),
    };
};

// --- Event / requirements -------------------------------------------------

export interface RequirementItem {
    label: string;
    quantity: number;
}

export interface ArrangementInfo {
    decorator: { name: string; contact: string; timing: string } | null;
    caterer: { name: string; contact: string } | null;
    kitchenRequired: boolean;
}

export interface EventInfo {
    requirements: RequirementItem[];
    timeSlots: string[];
    evidencePhoto: string;
    arrangements: ArrangementInfo;
    hasAnything: boolean;
}

const asText = (value: unknown): string => String(value ?? '').trim();

export const getEventInfo = (booking: any): EventInfo => {
    const event = booking?.event ?? {};
    const arrangements = booking?.arrangements ?? {};

    const fromQuantities: RequirementItem[] = Array.isArray(event?.requirementQuantities)
        ? event.requirementQuantities
              .map((item: any) => ({
                  label: asText(item?.label),
                  quantity: num(item?.quantity),
              }))
              .filter((item: RequirementItem) => item.label.length > 0)
        : [];

    const quantityLabels = new Set(fromQuantities.map((item) => item.label.toLowerCase()));
    const plainRequirements: RequirementItem[] = Array.isArray(event?.hallRequirements)
        ? event.hallRequirements
              .map((label: any) => asText(label))
              .filter((label: string) => label.length > 0)
              .filter((label: string) => !quantityLabels.has(label.toLowerCase()))
              .map((label: string) => ({ label, quantity: 0 }))
        : [];

    const requirements = [...fromQuantities, ...plainRequirements];

    const decoratorName = asText(arrangements?.decorator?.name);
    const decoratorContact = asText(arrangements?.decorator?.contact);
    const decoratorTiming = asText(arrangements?.decorator?.timing);
    const catererName = asText(arrangements?.caterer?.name);
    const catererContact = asText(arrangements?.caterer?.contact);
    const kitchenRequired = arrangements?.kitchenRequired === true;
    const timeSlots = Array.isArray(event?.timeSlots)
        ? event.timeSlots.map((slot: any) => asText(slot)).filter(Boolean)
        : [];
    const evidencePhoto = event?.evidencePhoto || '';

    return {
        requirements,
        timeSlots,
        evidencePhoto,
        arrangements: {
            decorator:
                decoratorName || decoratorContact || decoratorTiming
                    ? {
                          name: decoratorName,
                          contact: decoratorContact,
                          timing: decoratorTiming,
                      }
                    : null,
            caterer:
                catererName || catererContact
                    ? { name: catererName, contact: catererContact }
                    : null,
            kitchenRequired,
        },
        hasAnything:
            requirements.length > 0 ||
            timeSlots.length > 0 ||
            Boolean(evidencePhoto) ||
            decoratorName.length > 0 ||
            catererName.length > 0 ||
            kitchenRequired,
    };
};

// --- Finance --------------------------------------------------------------

export interface UnitLine {
    label: string;
    perUnit: number;
    currentUnit: number;
    quantity: number;
    amount: number;
    paid: boolean;
    meterPhoto: string;
    /** Current reading missing — finalize isse block hota hai. */
    readingMissing: boolean;
}

export interface ChargeLine {
    label: string;
    amount: number;
    paid: number;
    /** 0–100 */
    paidPct: number;
}

export interface FinanceSummary {
    charges: ChargeLine[];
    units: UnitLine[];
    chargesTotal: number;
    unitsTotal: number;
    totalAmount: number;
    paidAmount: number;
    balanceAmount: number;
    securityDeposit: number;
    depositReturned: boolean;
    depositDeducted: number;
    depositReason: string;
    lastEditedAt: string;
    lastEditedBy: string;
    hasUnits: boolean;
}

export const getFinanceSummary = (financial: any, financeHistory?: any[]): FinanceSummary => {
    const fin = financial ?? {};

    const charges: ChargeLine[] = Array.isArray(fin.charges)
        ? fin.charges.map((c: any) => {
              const amount = num(c?.amount);
              const paid = Math.min(num(c?.paid), amount > 0 ? amount : num(c?.paid));
              return {
                  label: asText(c?.label) || 'Charge',
                  amount,
                  paid,
                  paidPct: amount > 0 ? Math.round((paid / amount) * 100) : 0,
              };
          })
        : [];

    const units: UnitLine[] = Array.isArray(fin.units)
        ? fin.units.map((u: any, index: number) => {
              const perUnit = num(u?.perUnit);
              const currentUnit = num(u?.currentUnit);
              const quantity = num(u?.quantity);
              const amount = num(u?.amount) || quantity * perUnit;

              return {
                  label: asText(u?.label) || `Unit ${index + 1}`,
                  perUnit,
                  currentUnit,
                  quantity,
                  amount,
                  paid: u?.paid === true,
                  meterPhoto: u?.meterPhoto || '',
                  // Reading 0 hai = "add nahi ki" — finalize gate isi par hai.
                  readingMissing: currentUnit <= 0,
              };
          })
        : [];

    const chargesTotal = charges.reduce((sum, c) => sum + c.amount, 0);
    const unitsTotal = units.reduce((sum, u) => sum + u.amount, 0);
    const totalAmount = num(fin.totalAmount) || chargesTotal + unitsTotal;
    const paidAmount = num(fin.advancePaid) || charges.reduce((sum, c) => sum + c.paid, 0);
    const balanceAmount = num(fin.balanceAmount) || Math.max(0, totalAmount - paidAmount);

    const history = Array.isArray(financeHistory) ? financeHistory : [];
    const last = history.length > 0 ? history[history.length - 1] : null;

    return {
        charges,
        units,
        chargesTotal,
        unitsTotal,
        totalAmount,
        paidAmount,
        balanceAmount,
        securityDeposit: num(fin.securityDeposit),
        depositReturned: fin.securityDepositReturned === true,
        depositDeducted: num(fin.securityDepositDeducted),
        depositReason: asText(fin.securityDepositReason),
        lastEditedAt: last?.editedAt ? formatDate(String(last.editedAt)) : '',
        lastEditedBy: asText(last?.editedByName),
        hasUnits: units.length > 0,
    };
};

// --- Finalize gate --------------------------------------------------------

export interface UnitIssue {
    label: string;
    kind: 'reading' | 'rate';
    message: string;
}

/**
 * Unit add hai par adhoora hai — jaise rate set hai lekin current reading nahi.
 *
 * Ye list khaali na ho to **Finalize Event swipe block** rehta hai, kyunki
 * bina starting reading ke used units calculate hi nahi ho sakte.
 */
export const getUnitIssues = (units?: UnitLine[] | null): UnitIssue[] =>
    (units ?? [])
        .filter((unit) => unit.readingMissing || unit.perUnit <= 0)
        .map((unit) =>
            unit.perUnit <= 0
                ? {
                      label: unit.label,
                      kind: 'rate' as const,
                      message: `"${unit.label}" ka per-unit rate add karein.`,
                  }
                : {
                      label: unit.label,
                      kind: 'reading' as const,
                      message: `"${unit.label}" ki current unit (reading) add karein.`,
                  },
        );

export interface ChecklistItem {
    key: string;
    label: string;
    hint: string;
    ok: boolean;
    /** true = ye finalize ko block karta hai. */
    blocking: boolean;
}

/**
 * Finalize page ka checklist — user ko ek nazar me pata chale kya bacha hai.
 * Sirf unit issues blocking hain (baaki sirf informative hain, kyunki final
 * payment/deposit wahin finalize page par bharе jaate hain).
 */
export const getFinalizeChecklist = (booking: any): ChecklistItem[] => {
    const finance = getFinanceSummary(booking?.financial, booking?.financeHistory);
    const issues = getUnitIssues(finance.units);
    const signatures = booking?.signatures ?? {};

    const depositOk =
        finance.securityDeposit <= 0 || finance.depositReturned === true;
    const signatureOk =
        Boolean(signatures?.applicantPhoto) && Boolean(signatures?.managerPhoto);

    return [
        {
            key: 'units',
            label: 'Units ki reading',
            hint:
                issues.length === 0
                    ? finance.units.length === 0
                        ? 'Is booking me koi unit add nahi hai.'
                        : 'Sab units ki current reading maujood hai.'
                    : issues.map((issue) => issue.message).join(' '),
            ok: issues.length === 0,
            blocking: true,
        },
        {
            key: 'payment',
            label: 'Final payment',
            hint:
                finance.balanceAmount > 0
                    ? `${money(finance.balanceAmount)} balance collect karna hai.`
                    : 'Poora payment settle ho chuka hai.',
            ok: finance.balanceAmount <= 0,
            blocking: false,
        },
        {
            key: 'deposit',
            label: 'Security deposit',
            hint:
                finance.securityDeposit <= 0
                    ? 'Koi security deposit nahi liya gaya.'
                    : depositOk
                    ? 'Deposit return mark ho chuka hai.'
                    : `${money(finance.securityDeposit)} deposit ka return mark karein.`,
            ok: depositOk,
            blocking: false,
        },
        {
            key: 'signatures',
            label: 'Signatures',
            hint: signatureOk
                ? 'Applicant + Manager signature maujood hain.'
                : 'Applicant/Manager signature ke bina booking adhoori hai.',
            ok: signatureOk,
            blocking: false,
        },
    ];
};

/** Swipe block hone ka exact reason (UI par ek line me). */
export const getFinalizeBlocker = (booking: any): string | null => {
    if (booking?.status === 'Ended') {
        return 'Event already ended hai — is booking me koi change nahi ho sakta.';
    }

    const issues = getUnitIssues(getFinanceSummary(booking?.financial).units);
    if (issues.length > 0) {
        return issues.length === 1
            ? issues[0].message
            : `${issues.length} units adhoori hain — pehle unki reading add karein.`;
    }

    return null;
};
