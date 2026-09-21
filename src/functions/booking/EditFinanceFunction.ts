/**
 * Update Finance (EditFinanceScreen) ke pure rules.
 *
 * Do sawaal yahan se decide hote hain:
 *
 * 1. **Save enable ho ya nahi** — `hasFinanceChanges()`: charges (Actual Amount),
 *    Customer Paid, Security Deposit ya Units — inme se kuch bhi badla ho to
 *    hi Save chalega, warna button disabled rehta hai.
 * 2. **Mode of payment dikhe ya nahi** — `needsPaymentDetails()`: sirf tab jab
 *    **paisa record** ho raha ho (Customer Paid me kuch add/change, ya Security
 *    Deposit me kuch add/change). Amount ke charge heads (add / kam / badal),
 *    head ka naam badalna aur unit reading/rate update — ye sirf bill ki
 *    detail hai, payment record nahi, isliye in par payment section aata hi
 *    nahi.
 */
import { num } from './ChargeFunction';

/* ------------------------------- charge heads ------------------------------- */

export interface ChargeAmountLine {
    label: string;
    amount: number;
    paid: number;
}

/** Charges array -> normalized lines (khaali labels hata kar). */
export const normalizeChargeLines = (
    items?: { label?: string; amount?: number; paid?: number }[] | null,
): ChargeAmountLine[] =>
    (Array.isArray(items) ? items : [])
        .map((item) => ({
            label: String(item?.label ?? '').trim(),
            amount: num(item?.amount),
            paid: num(item?.paid),
        }))
        .filter((line) => line.label.length > 0);

/** Charges ka comparison key — row order matter nahi karta. */
export const buildChargesKey = (
    items?: { label?: string; amount?: number; paid?: number }[] | null,
): string =>
    normalizeChargeLines(items)
        .map((line) => `${line.label}|${line.amount}|${line.paid}`)
        .sort()
        .join('||');

/* ----------------------------------- units ---------------------------------- */

export interface UnitLike {
    label?: string;
    perUnit?: number;
    currentUnit?: number;
    meterPhoto?: string;
    closingPhoto?: string;
}

/** Units ka comparison key — order independent, khaali labels ignore. */
export const buildUnitsKey = (items?: UnitLike[] | null): string =>
    (Array.isArray(items) ? items : [])
        .map((item) => ({
            label: String(item?.label ?? '').trim(),
            perUnit: num(item?.perUnit),
            currentUnit: num(item?.currentUnit),
            meterPhoto: String(item?.meterPhoto ?? ''),
            closingPhoto: String(item?.closingPhoto ?? ''),
        }))
        .filter((item) => item.label.length > 0)
        .map(
            (item) =>
                `${item.label}|${item.perUnit}|${item.currentUnit}|${item.meterPhoto}|${item.closingPhoto}`,
        )
        .sort()
        .join('||');

/**
 * Ek URL units ke meter photo ka hai? Unit ka meter photo **kabhi** payment
 * proof nahi hota, isliye:
 *  - prefill par ise payment proof ki tarah nahi dikhate
 *  - save par ise dobara proof ki tarah nahi bhejte (aur backend se clear kar
 *    dete hain), warna wo Payment Record ke "Payments Received" me dikhta rehta.
 *
 * `savedUnits` = booking ke units (purana data), `rowUrls` = screen ki unit
 * rows ke meter photo URLs (naya capture bhi yahin aata hai).
 */
export const isMeterPhotoUrl = (
    uri?: string | null,
    savedUnits?: UnitLike[] | null,
    rowUrls?: (string | null | undefined)[] | null,
): boolean => {
    if (!uri) return false;

    const saved = (Array.isArray(savedUnits) ? savedUnits : [])
        .map((unit) => String(unit?.meterPhoto ?? '').trim())
        .filter((url) => url.length > 0);
    const rows = (Array.isArray(rowUrls) ? rowUrls : [])
        .map((url) => String(url ?? '').trim())
        .filter((url) => url.length > 0);

    return saved.includes(uri) || rows.includes(uri);
};

/* ---------------------------- payment (paisa) gate --------------------------- */

export interface PaymentSnapshot {
    /**
     * Customer Paid ke **non-zero** amounts (sorted). Zero paid wali rows
     * ignore hoti hain, isliye naya charge head add karne ya amount kam karne
     * se trigger nahi hota.
     */
    paidValues: number[];
    securityDeposit: number;
}

/** Charges array se paid amounts — 0 hata kar, sorted (row order matter nahi). */
export const collectPaidValues = (
    items?: { paid?: number }[] | null,
): number[] =>
    (Array.isArray(items) ? items : [])
        .map((item) => num(item?.paid))
        .filter((paid) => paid !== 0)
        .sort((a, b) => a - b);

export const buildPaymentSnapshot = (
    charges?: { paid?: number }[] | null,
    securityDeposit?: number | string | null,
): PaymentSnapshot => ({
    paidValues: collectPaidValues(charges),
    securityDeposit: num(securityDeposit),
});

export const paymentSnapshotKey = (snapshot: PaymentSnapshot): string =>
    `${snapshot.paidValues.join(',')}|deposit:${snapshot.securityDeposit}`;

/**
 * Mode of payment / UPI QR / proof dikhane ka gate.
 *
 * `original` booking se aata hai (saved values) aur `current` form se. Original
 * load na hua ho to `false` — section chhupa rehta hai.
 */
export const needsPaymentDetails = (
    original: PaymentSnapshot | null | undefined,
    current: PaymentSnapshot,
): boolean => {
    if (!original) return false;
    return paymentSnapshotKey(original) !== paymentSnapshotKey(current);
};

/* ------------------------------ full dirty check ----------------------------- */

export interface FinanceSnapshot extends PaymentSnapshot {
    chargesKey: string;
    unitsKey: string;
}

export const buildFinanceSnapshot = (
    charges?: { label?: string; amount?: number; paid?: number }[] | null,
    units?: UnitLike[] | null,
    securityDeposit?: number | string | null,
): FinanceSnapshot => ({
    ...buildPaymentSnapshot(charges, securityDeposit),
    chargesKey: buildChargesKey(charges),
    unitsKey: buildUnitsKey(units),
});

export const financeSnapshotKey = (snapshot: FinanceSnapshot): string =>
    `${snapshot.chargesKey}#${snapshot.unitsKey}#${paymentSnapshotKey(snapshot)}`;

/**
 * Save button ka gate: charges, paid, deposit ya units — kuch bhi badla ho to
 * `true`. `original` na ho (booking load nahi hui) to `false` = Save disabled.
 */
export const hasFinanceChanges = (
    original: FinanceSnapshot | null | undefined,
    current: FinanceSnapshot,
): boolean => {
    if (!original) return false;
    return financeSnapshotKey(original) !== financeSnapshotKey(current);
};
