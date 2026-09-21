/**
 * Payment section (Step5RequirementsScreen) ke rules.
 *
 * Sab kuch pure functions me:
 *  - Mode of payment list + mode ke hisaab se transaction number / proof ki zaroorat
 *  - Totals ka summary (charges + units) aur "sab paid?" / "paid > total" checks
 *  - Form validation
 *  - Draft / backend items -> rows, aur draft payload builder
 *
 * Screen (`Step5RequirementsScreen`) `usePaymentForm` hook se values leti hai;
 * hook data rakhta hai, ye file rules batati hai, UI components sirf render
 * karte hain. Charges ka logic `ChargeFunction.ts` me, units ka `UnitsFunction.ts`.
 */
import {
    areAllChargesPaid,
    chargeRowsToPayload,
    computeChargeTotals,
    num,
} from './ChargeFunction';
import type { ChargeRow } from './ChargeFunction';
import {
    computeUnitsPaidTotal,
    computeUnitsTotal,
    draftItemsToUnitRows,
    unitRowsToPayload,
} from './UnitsFunction';
import type { UnitDraftItem, UnitRow } from './UnitsFunction';

/* ----------------------------------- modes ----------------------------------- */

export const PAYMENT_MODES: string[] = ['Cash', 'UPI', 'Cheque', 'NEFT/RTGS'];

/** Cheque ke liye cheque number, UPI / NEFT ke liye reference number chahiye. */
export const requiresTransactionNumber = (mode?: string): boolean =>
    mode === 'UPI' || mode === 'Cheque' || mode === 'NEFT/RTGS';

/**
 * Payment proof har mode me **zaroori** hai — Cash me bhi cash receipt lagana
 * mandatory hai, taake har payment ka evidence record ho.
 */
export const isPaymentProofRequired = (mode?: string): boolean =>
    Boolean(mode);

export const getPaymentProofHint = (mode?: string): string => {
    if (mode === 'Cash') {
        return 'Capture or select the cash receipt (required).';
    }

    return 'Capture or select payment receipt';
};

export const getTransactionFieldTitle = (mode?: string): string =>
    mode === 'Cheque'
        ? 'Cheque Number *'
        : 'Transaction / Reference Number *';

export const getTransactionPlaceholder = (mode?: string): string =>
    mode === 'Cheque'
        ? 'Enter cheque number'
        : 'Enter transaction/reference number';

/** Single-select chip: dobara dabane par selection hat jaata hai. */
export const togglePaymentMode = (current: string[], mode: string): string[] =>
    current[0] === mode ? [] : [mode];

/* ---------------------------------- summary ---------------------------------- */

export interface PaymentSummary {
    chargesTotal: number;
    chargesPaid: number;
    unitsTotal: number;
    unitsPaid: number;
    /** charges + units — jitna customer ko dena hai. */
    effectiveTotal: number;
    paidTotal: number;
    balanceAmount: number;
    /** Refundable deposit — total/balance me count nahi hota. */
    securityDeposit: number;
    allChargesPaid: boolean;
    /** Paid total, total se zyada — invalid amounts. */
    amountsExceed: boolean;
}

export const computePaymentSummary = ({
    rows,
    unitRows,
    securityDeposit,
}: {
    rows: ChargeRow[];
    unitRows: UnitRow[];
    securityDeposit: string;
}): PaymentSummary => {
    const { totalAmount: chargesTotal, totalPaid: chargesPaid } =
        computeChargeTotals(rows);
    // Units ka amount handover par band hota hai — abhi 0 rehta hai.
    const unitsTotal = computeUnitsTotal(unitRows);
    const unitsPaid = computeUnitsPaidTotal(unitRows);
    const effectiveTotal = chargesTotal + unitsTotal;
    const paidTotal = chargesPaid + unitsPaid;

    return {
        chargesTotal,
        chargesPaid,
        unitsTotal,
        unitsPaid,
        effectiveTotal,
        paidTotal,
        balanceAmount: Math.max(0, effectiveTotal - paidTotal),
        securityDeposit: num(securityDeposit),
        allChargesPaid: areAllChargesPaid(rows),
        amountsExceed: effectiveTotal > 0 && paidTotal > effectiveTotal,
    };
};

/* --------------------------------- validation --------------------------------- */

export interface PaymentFormValues {
    summary: PaymentSummary;
    mode?: string;
    transactionNumber: string;
    hasProof: boolean;
}

/**
 * Valid jab: total > 0, kuch payment mila (aur total se zyada nahi), mode chuna
 * ho, aur (agar zaroori ho) transaction number + proof diya ho.
 */
export const isPaymentFormValid = ({
    summary,
    mode,
    transactionNumber,
    hasProof,
}: PaymentFormValues): boolean => {
    if (summary.effectiveTotal <= 0) return false;
    if (summary.paidTotal <= 0 || summary.paidTotal > summary.effectiveTotal) {
        return false;
    }
    if (!mode) return false;
    if (summary.amountsExceed) return false;
    if (
        requiresTransactionNumber(mode) &&
        transactionNumber.trim().length === 0
    ) {
        return false;
    }
    if (isPaymentProofRequired(mode) && !hasProof) return false;

    return true;
};

/* --------------------------- draft / backend mapping --------------------------- */

/**
 * Draft/backend units -> rows (reading + optional meter photo carry hote hain).
 * Kuch saved na ho to `null` — units optional hain.
 */
export const savedUnitRows = (
    items?: (Partial<UnitDraftItem> & { paid?: boolean })[] | null,
): UnitRow[] | null =>
    items && items.length > 0 ? draftItemsToUnitRows(items) : null;

export interface PaymentDraftInput {
    rows: ChargeRow[];
    unitRows: UnitRow[];
    securityDeposit: string;
    mode?: string;
    transactionNumber: string;
    /** Cloudinary URL (khaali string = koi proof nahi). */
    paymentProofPhoto: string;
}

/**
 * DRAFT SYSTEM: payment section local me save hota hai; Step6 "Done" par ye
 * payload backend ke `PATCH /bookings/:id/payment` par jaata hai.
 */
export const buildPaymentDraftPayload = ({
    rows,
    unitRows,
    securityDeposit,
    mode,
    transactionNumber,
    paymentProofPhoto,
}: PaymentDraftInput) => ({
    charges: chargeRowsToPayload(rows),
    units: unitRowsToPayload(unitRows),
    securityDeposit: num(securityDeposit) || undefined,
    mode: mode ?? undefined,
    transactionNumber: requiresTransactionNumber(mode)
        ? transactionNumber
        : undefined,
    paymentProofPhoto,
});
