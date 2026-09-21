/**
 * Payment Record screen ke saare pure analytics.
 *
 * Booking ke `financial` + `payments` + `financeHistory` se ek hi jagah sab
 * nikalta hai:
 *  - headline totals (total / paid / balance / deposit) aur collection %
 *  - har payment entry (mode, reference, date, proof) + running total
 *  - har finance revision — Actual Amount (requirement vs paid) aur Units
 *    (billed vs paid) section ke saath
 *
 * Sirf wahi data banate hain jo screen dikhati hai — screen sirf UI hai,
 * numbers yahan se aate hain, isliye ye testable hai.
 */
import { formatDate } from '../formate/DateTimeFormate';
import { num } from './BookingDetailFunction';

export const money = (value: unknown): string =>
    `₹${Math.round(num(value)).toLocaleString('en-IN')}`;

/** ISO timestamp -> time (formatTime sirf "HH:mm" ke liye hai, isliye alag). */
const timeFromStamp = (value?: string): string => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleTimeString('en-IN', {
        hour: 'numeric',
        minute: '2-digit',
    });
};

const dateFromStamp = (value?: string): string => (value ? formatDate(String(value)) : '');

/** Chart ke bars ke liye chhota label — "12 Sep". */
const shortDate = (value?: string): string => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

const daysBetween = (from?: string, to: Date = new Date()): number | null => {
    if (!from) return null;
    const start = new Date(from);
    if (Number.isNaN(start.getTime())) return null;
    const diff = Math.floor(
        (to.getTime() - start.getTime()) / (24 * 60 * 60 * 1000),
    );
    return diff < 0 ? 0 : diff;
};

/** "today" / "yesterday" / "5 days ago" — screen isse seedha dikha sakti hai. */
export const relativeDaysLabel = (days: number | null): string => {
    if (days === null) return '';
    if (days === 0) return 'today';
    if (days === 1) return 'yesterday';
    return `${days} days ago`;
};

export type RecordStatusTone = 'success' | 'warning' | 'danger' | 'info';

/* --------------------------------- models --------------------------------- */

export interface PaymentEntry {
    /** 1-based — timeline me dikhne wala number. */
    index: number;
    amount: number;
    mode: string;
    transactionId: string;
    receivedAt: string;
    dateLabel: string;
    timeLabel: string;
    shortDate: string;
    proof: string;
    /** Is payment ke baad tak jama hua total. */
    runningTotal: number;
}

export interface RevisionChange {
    field: string;
    label: string;
    from: number;
    to: number;
    diff: number;
}

/* ---------------------- revision ka section-wise picture ---------------------- */

export interface RevisionLine {
    /** Is revision me ye line badli? */
    changed: boolean;
    from: number;
    to: number;
    diff: number;
}

/** Section 1 — Actual Amount: requirement (total) vs paid. */
export interface RevisionAmountSection {
    required: RevisionLine;
    paid: RevisionLine;
    balanceAfter: number;
    deposit: RevisionLine;
    hasDeposit: boolean;
    /** Actual amount heads ka snapshot (sirf tab jab heads badle hon). */
    charges: RevisionChargeLine[];
}

export interface RevisionChargeLine {
    label: string;
    amount: number;
    paid: number;
    due: number;
}

/** Section 2 — Units: kitna bill bana aur kitna paid hua. */
export interface RevisionUnitsSection {
    /** Snapshot maujood hai? (purane revisions me nahi hota.) */
    available: boolean;
    /** Is revision me units ka hisaab badla? */
    changed: boolean;
    totalBilled: number;
    totalPaid: number;
    units: RevisionUnitLine[];
}

export interface RevisionUnitLine {
    label: string;
    perUnit: number;
    quantity: number;
    currentUnit: number;
    amount: number;
    paid: boolean;
    hasRate: boolean;
    hasReading: boolean;
    /** Booking-time meter photo — tap karke full screen dekh sakte hain. */
    meterPhoto: string;
    /** Closing (event end) meter photo — tap karke full screen. */
    closingPhoto: string;
}

/** Revision ke waqt ka poora finance snapshot (backend se). */
export interface RevisionSnapshot {
    totalAmount: number;
    advancePaid: number;
    balanceAmount: number;
    securityDeposit: number;
    mode: string;
    charges: RevisionChargeLine[];
    units: RevisionUnitLine[];
    unitsTotal: number;
    unitsPaid: number;
}

export interface FinancialRevision {
    editedByName: string;
    editedByMobile: string;
    editedAt: string;
    dateLabel: string;
    timeLabel: string;
    shortDate: string;
    /** Us update ke waqt ka mode of payment (snapshot se). */
    mode: string;
    changes: RevisionChange[];
    /** Section 1 — Actual Amount (requirement vs paid). */
    amount: RevisionAmountSection;
    /** Section 2 — Units (billed vs paid). */
    unitsSection: RevisionUnitsSection;
    flags: {
        unitsChanged: boolean;
        chargesChanged: boolean;
        depositChanged: boolean;
        paymentDetailsUpdated: boolean;
    };
    /** Trackable fields ka net change (total + paid). */
    netChange: number;
    /** Sirf total amount me kitna farak aaya. */
    totalDiff: number;
    /** Sirf paid amount me kitna farak aaya. */
    paidDiff: number;
    balanceAfter: number;
    direction: 'up' | 'down' | 'flat';
}

/** Purana naam (screen/components isi se import karte hain). */
export type FinanceRevision = FinancialRevision;

export interface ChargeLine {
    label: string;
    amount: number;
    paid: number;
    due: number;
    /** 0–100 */
    paidPct: number;
}

export interface UnitLine {
    label: string;
    quantity: number;
    perUnit: number;
    amount: number;
    hasRate: boolean;
    hasReading: boolean;
    paid: boolean;
    /** Meter reading — reference ke liye. */
    currentUnit: number;
    /** Booking-time meter photo (Cloudinary URL). */
    meterPhoto: string;
    /** Closing (event end) meter photo (Cloudinary URL). */
    closingPhoto: string;
}

export interface PaymentRecordAnalytics {
    // Headline (Actual Amount)
    totalAmount: number;
    paidAmount: number;
    balanceAmount: number;
    securityDeposit: number;
    depositReturned: boolean;
    depositDeducted: number;
    depositReason: string;
    progress: number;
    paymentStatus: string;
    statusTone: RecordStatusTone;

    // Payments received
    entries: PaymentEntry[];
    receivedTotal: number;
    lastPaymentLabel: string;
    daysSinceLastPayment: number | null;

    // Finance change history
    revisions: FinanceRevision[];

    // Amount heads + units
    charges: ChargeLine[];
    units: UnitLine[];
    /** Units ka total billed aur paid. */
    unitsBilled: number;
    unitsPaidTotal: number;
}

/** Backend snapshot -> typed shape (purane revisions me snapshot nahi hota). */
export const parseRevisionSnapshot = (raw: any): RevisionSnapshot | null => {
    if (!raw || typeof raw !== 'object') return null;

    const charges: RevisionChargeLine[] = (Array.isArray(raw.charges)
        ? raw.charges
        : []
    )
        .map((c: any) => {
            const amount = num(c?.amount);
            const paid = num(c?.paid);
            return {
                label: String(c?.label ?? '').trim() || 'Charge',
                amount,
                paid,
                due: Math.max(0, amount - paid),
            };
        })
        .filter((c: RevisionChargeLine) => c.label.length > 0);

    const units: RevisionUnitLine[] = (Array.isArray(raw.units) ? raw.units : [])
        .map((u: any) => {
            const perUnit = num(u?.perUnit);
            const currentUnit = num(u?.currentUnit);
            const quantity = num(u?.quantity);
            return {
                label: String(u?.label ?? '').trim() || 'Unit',
                perUnit,
                quantity,
                currentUnit,
                amount: num(u?.amount) || quantity * perUnit,
                paid: u?.paid === true,
                hasRate: perUnit > 0,
                hasReading: currentUnit > 0,
                meterPhoto: String(u?.meterPhoto ?? ''),
                closingPhoto: String(u?.closingPhoto ?? ''),
            };
        })
        .filter((u: RevisionUnitLine) => u.label.length > 0);

    const unitsTotal =
        num(raw.unitsTotal) || units.reduce((sum, u) => sum + u.amount, 0);
    const unitsPaid =
        num(raw.unitsPaid) ||
        units.filter((u) => u.paid).reduce((sum, u) => sum + u.amount, 0);

    return {
        totalAmount: num(raw.totalAmount),
        advancePaid: num(raw.advancePaid),
        balanceAmount: num(raw.balanceAmount),
        securityDeposit: num(raw.securityDeposit),
        mode: String(raw.mode ?? ''),
        charges,
        units,
        unitsTotal,
        unitsPaid,
    };
};

const FIELD_LABELS: Record<string, string> = {
    totalAmount: 'Total Amount',
    advancePaid: 'Paid Amount',
    securityDeposit: 'Security Deposit',
    balanceAmount: 'Balance',
};

/** Balance derived hai aur deposit refundable hold — dono diff me track nahi. */
export const isTrackableField = (field: string): boolean =>
    field !== 'balanceAmount' && field !== 'securityDeposit';

/* -------------------------------- analytics -------------------------------- */

export const getPaymentRecordAnalytics = (
    booking: any,
): PaymentRecordAnalytics => {
    const fin = booking?.financial ?? {};

    // --- Totals (charges se derive, taake breakdown se match kare) -----------
    const rawCharges = Array.isArray(fin.charges) ? fin.charges : [];
    const charges: ChargeLine[] = rawCharges.map((c: any) => {
        const amount = num(c?.amount);
        const paid = num(c?.paid);
        return {
            label: String(c?.label ?? '').trim() || 'Charge',
            amount,
            paid,
            due: Math.max(0, amount - paid),
            paidPct: amount > 0 ? Math.round((paid / amount) * 100) : 0,
        };
    });

    const rawUnits = Array.isArray(fin.units) ? fin.units : [];
    const units: UnitLine[] = rawUnits.map((u: any) => {
        const quantity = num(u?.quantity);
        const perUnit = num(u?.perUnit);
        const currentUnit = num(u?.currentUnit);
        return {
            label: String(u?.label ?? '').trim() || 'Unit',
            quantity,
            perUnit,
            amount: num(u?.amount) || quantity * perUnit,
            hasRate: perUnit > 0,
            hasReading: currentUnit > 0,
            paid: u?.paid === true,
            currentUnit,
            meterPhoto: String(u?.meterPhoto ?? ''),
            closingPhoto: String(u?.closingPhoto ?? ''),
        };
    });
    /** Units ka apna total: kitna bill bana aur kitna paid hua. */
    const unitsBilled = units.reduce((sum, u) => sum + u.amount, 0);
    const unitsPaidTotal = units
        .filter((u) => u.paid)
        .reduce((sum, u) => sum + u.amount, 0);

    const chargesTotal = charges.reduce((sum, c) => sum + c.amount, 0);
    const chargesPaid = charges.reduce((sum, c) => sum + c.paid, 0);

    const totalAmount = num(fin.totalAmount) || chargesTotal;
    const paidAmount = num(fin.advancePaid) || chargesPaid;
    const balanceAmount =
        num(fin.balanceAmount) || Math.max(0, totalAmount - paidAmount);
    const securityDeposit = num(fin.securityDeposit);
    const progress =
        totalAmount > 0
            ? Math.max(0, Math.min(100, Math.round((paidAmount / totalAmount) * 100)))
            : 0;

    const paymentStatus = String(booking?.paymentStatus ?? 'Pending');
    const statusTone: RecordStatusTone =
        paymentStatus === 'Paid'
            ? 'success'
            : paymentStatus === 'Partial'
            ? 'warning'
            : 'danger';

    // --- Payments received ---------------------------------------------------
    const rawPayments = Array.isArray(booking?.payments) ? booking?.payments : [];
    let running = 0;
    const entries: PaymentEntry[] = [...rawPayments]
        .sort(
            (a: any, b: any) =>
                new Date(a?.receivedAt ?? 0).getTime() -
                new Date(b?.receivedAt ?? 0).getTime(),
        )
        .map((p: any, index: number) => {
            const amount = num(p?.amount);
            running += amount;
            return {
                index: index + 1,
                amount,
                mode: String(p?.mode ?? '').trim() || 'Cash',
                transactionId: String(p?.transactionId ?? '').trim(),
                receivedAt: String(p?.receivedAt ?? ''),
                dateLabel: dateFromStamp(p?.receivedAt),
                timeLabel: timeFromStamp(p?.receivedAt),
                shortDate: shortDate(p?.receivedAt),
                proof: String(p?.proof ?? ''),
                runningTotal: running,
            };
        });

    const receivedTotal = entries.reduce((sum, e) => sum + e.amount, 0);
    const lastEntry = entries.length > 0 ? entries[entries.length - 1] : null;
    const daysSinceLastPayment = daysBetween(lastEntry?.receivedAt);
    const lastPaymentLabel = lastEntry
        ? `${lastEntry.dateLabel}${
              lastEntry.timeLabel ? `, ${lastEntry.timeLabel}` : ''
          }`
        : '';

    // --- Finance revisions ---------------------------------------------------
    const rawHistory = Array.isArray(booking?.financeHistory)
        ? booking.financeHistory
        : [];

    const revisions: FinanceRevision[] = [...rawHistory]
        .sort(
            (a: any, b: any) =>
                new Date(b?.editedAt ?? 0).getTime() -
                new Date(a?.editedAt ?? 0).getTime(),
        )
        .map((entry: any) => {
            const rawChanges: any[] = Array.isArray(entry?.changes)
                ? entry.changes
                : [];

            const changes: RevisionChange[] = rawChanges
                .filter((c: any) => isTrackableField(String(c?.field ?? '')))
                .map((c: any) => {
                    const from = num(c?.from);
                    const to = num(c?.to);
                    return {
                        field: String(c?.field ?? ''),
                        label: FIELD_LABELS[String(c?.field)] ?? String(c?.field ?? ''),
                        from,
                        to,
                        diff: to - from,
                    };
                });

            const hasFlag = (field: string) =>
                rawChanges.some((c: any) => String(c?.field ?? '') === field);

            const flags = {
                unitsChanged: hasFlag('unitsChanged'),
                chargesChanged: hasFlag('chargesChanged'),
                depositChanged: hasFlag('securityDeposit'),
                paymentDetailsUpdated: hasFlag('paymentDetailsUpdated'),
            };

            const snapshot = parseRevisionSnapshot(entry?.snapshot);

            const totalChange = changes.find((c) => c.field === 'totalAmount');
            const paidChange = changes.find((c) => c.field === 'advancePaid');

            // Deposit `changes` se filter ho jaata hai (wo balance ka part nahi),
            // isliye ise raw changes se nikalte hain — paisa hai to dikhna chahiye.
            const depositRaw = rawChanges.find(
                (c: any) => String(c?.field ?? '') === 'securityDeposit',
            );
            const depositChange = depositRaw
                ? {
                      from: num(depositRaw.from),
                      to: num(depositRaw.to),
                      diff: num(depositRaw.to) - num(depositRaw.from),
                  }
                : undefined;

            // Snapshot ho to revision ke baad ka actual value; warna change ka
            // "to" value (purane entries ke liye fallback).
            const requiredTo = snapshot?.totalAmount ?? totalChange?.to ?? 0;
            const paidTo = snapshot?.advancePaid ?? paidChange?.to ?? 0;

            const totalDiff = totalChange?.diff ?? 0;
            const paidDiff = paidChange?.diff ?? 0;
            const netChange = totalDiff + paidDiff;

            const amount: RevisionAmountSection = {
                required: {
                    changed: Boolean(totalChange),
                    from: totalChange ? totalChange.from : requiredTo,
                    to: requiredTo,
                    diff: totalDiff,
                },
                paid: {
                    changed: Boolean(paidChange),
                    from: paidChange ? paidChange.from : paidTo,
                    to: paidTo,
                    diff: paidDiff,
                },
                balanceAfter: snapshot?.balanceAmount ?? num(entry?.balanceAfter),
                deposit: {
                    changed: Boolean(depositChange),
                    from:
                        depositChange?.from ?? snapshot?.securityDeposit ?? 0,
                    to: depositChange?.to ?? snapshot?.securityDeposit ?? 0,
                    diff: depositChange?.diff ?? 0,
                },
                hasDeposit:
                    Boolean(depositChange) ||
                    (snapshot?.securityDeposit ?? 0) > 0,
                charges: snapshot?.charges ?? [],
            };

            const unitsSection: RevisionUnitsSection = {
                available: Boolean(snapshot),
                changed: flags.unitsChanged,
                totalBilled: snapshot?.unitsTotal ?? 0,
                totalPaid: snapshot?.unitsPaid ?? 0,
                units: snapshot?.units ?? [],
            };

            return {
                editedByName: String(entry?.editedByName ?? '').trim() || 'Unknown',
                editedByMobile: String(entry?.editedByMobile ?? '').trim(),
                editedAt: String(entry?.editedAt ?? ''),
                dateLabel: dateFromStamp(entry?.editedAt),
                timeLabel: timeFromStamp(entry?.editedAt),
                shortDate: shortDate(entry?.editedAt),
                mode: snapshot?.mode ?? '',
                changes,
                amount,
                unitsSection,
                flags,
                netChange,
                totalDiff,
                paidDiff,
                balanceAfter: snapshot?.balanceAmount ?? num(entry?.balanceAfter),
                direction:
                    netChange > 0 ? 'up' : netChange < 0 ? 'down' : 'flat',
            };
        });

    return {
        totalAmount,
        paidAmount,
        balanceAmount,
        securityDeposit,
        depositReturned: booking?.financial?.securityDepositReturned === true,
        depositDeducted: num(booking?.financial?.securityDepositDeducted),
        depositReason: String(booking?.financial?.securityDepositReason ?? '').trim(),
        progress,
        paymentStatus,
        statusTone,

        entries,
        receivedTotal,
        lastPaymentLabel,
        daysSinceLastPayment,

        revisions,

        charges,
        units,
        unitsBilled,
        unitsPaidTotal,
    };
};
