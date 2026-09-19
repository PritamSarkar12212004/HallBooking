/**
 * Payment section ke "amount heads" (Section 1: Actual Amount, Section 2:
 * Customer Paid) ke reusable rules.
 *
 * Yahan sab kuch hai jo pehle `FinanceChargesSection` component ke andar tha:
 *  - row model + factory (label / amount / paid)
 *  - sanitizers (numbers sirf digits)
 *  - row operations (update / add / remove / All Paid)
 *  - totals + "sab paid?" check
 *  - draft / backend mapping
 *
 * UI (`FinanceChargesSection`), hook (`usePaymentForm`) aur screens (Step5
 * Payment, EditFinance) sab inhi helpers par chalte hain — units ke liye same
 * pattern `UnitsFunction.ts` me hai.
 */

export interface ChargeRow {
  id: string;
  label: string;
  amount: string;
  paid: string;
}

export const DEFAULT_CHARGE_LABELS = [
  'Hall Rent',
  'Instrument / Table',
  'Decoration',
  'Kitchen / Catering',
];

let rowIdCounter = 0;

export const newChargeRow = (
  label = '',
  amount = '',
  paid = '',
): ChargeRow => ({
  id: `charge-${Date.now()}-${rowIdCounter++}`,
  label,
  amount,
  paid,
});

export const createDefaultChargeRows = (): ChargeRow[] =>
  DEFAULT_CHARGE_LABELS.map((label) => newChargeRow(label));

/* -------------------------------- sanitizers -------------------------------- */

export const digitsOnly = (text: string) => (text ?? '').replace(/[^0-9]/g, '');

/** Number safe parse — khaali/invalid value par 0 (NaN kabhi nahi). */
export const num = (value: string | number | null | undefined): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

/* ------------------------------ row operations ------------------------------ */

export type ChargeRowField = 'label' | 'amount' | 'paid';

/** Ek row ka ek field update (label free text, numbers sirf digits). */
export const updateChargeRowField = (
  rows: ChargeRow[],
  id: string,
  field: ChargeRowField,
  value: string,
): ChargeRow[] =>
  rows.map((row) =>
    row.id === id
      ? { ...row, [field]: field === 'label' ? value : digitsOnly(value) }
      : row,
  );

export const addChargeRow = (rows: ChargeRow[]): ChargeRow[] => [
  ...rows,
  newChargeRow(),
];

export const removeChargeRow = (rows: ChargeRow[], id: string): ChargeRow[] =>
  rows.filter((row) => row.id !== id);

/** "All Paid" toggle — ON par har head ka paid = amount, OFF par khaali. */
export const applyAllPaid = (rows: ChargeRow[], paid: boolean): ChargeRow[] =>
  rows.map((row) => ({ ...row, paid: paid ? row.amount : '' }));

/* ---------------------------------- totals ---------------------------------- */

export const computeChargeTotals = (rows: ChargeRow[]) => {
  const totalAmount = rows.reduce((sum, row) => sum + num(row.amount), 0);
  const totalPaid = rows.reduce((sum, row) => sum + num(row.paid), 0);
  const balanceAmount = Math.max(0, totalAmount - totalPaid);

  return { totalAmount, totalPaid, balanceAmount };
};

/** Har head bhara hua (amount > 0) aur poora paid? */
export const areAllChargesPaid = (rows: ChargeRow[]): boolean =>
  rows.length > 0 &&
  rows.every((row) => num(row.amount) > 0 && num(row.paid) === num(row.amount));

/* --------------------------- draft / backend mapping --------------------------- */

/** Sirf label wali rows backend/draft me jaati hain. */
export const chargeRowsToPayload = (rows: ChargeRow[]) =>
  rows
    .filter((row) => row.label.trim().length > 0)
    .map((row) => ({
      label: row.label.trim(),
      amount: num(row.amount),
      paid: num(row.paid),
    }));

/** Saved items (draft ya backend) -> editable rows. */
export const itemsToChargeRows = (
  items: { label?: string; amount?: number; paid?: number }[],
): ChargeRow[] =>
  items.map((item) =>
    newChargeRow(
      item.label ?? '',
      item.amount ? String(item.amount) : '',
      item.paid ? String(item.paid) : '',
    ),
  );

/**
 * Draft/backend charges -> rows; kuch saved na ho to `null` (caller apne
 * default heads laga sakta hai).
 */
export const savedChargeRows = (
  items?: { label?: string; amount?: number; paid?: number }[] | null,
): ChargeRow[] | null => (items && items.length > 0 ? itemsToChargeRows(items) : null);
