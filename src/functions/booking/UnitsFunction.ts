/**
 * Units screen (Step5UnitsScreen) ke reusable rules.
 *
 * Yahan sab kuch hai jo pehle `UnitsSection` component ke andar tha:
 *  - row model (toggle ON = abhi units daalna hai, warna baad me update screen se)
 *  - per-unit rate + current meter reading + optional meter photo
 *  - sanitizers, validation, draft/payload mapping
 *  - photo upload (compress + Cloudinary)
 *
 * UI (`UnitsSection`), screen (`Step5UnitsScreen`) aur hook (`useUnitsForm`) sab
 * inhi helpers par chalte hain — isliye EditFinance/Finalize jaisi screens bhi
 * yahi logic reuse kar sakti hain.
 */
import uploadImage from '../../services/Cloudinary/uploadImg';
import { compressImage } from '../../services/Compressor/ImgCompressor';

/* -------------------------------- constants -------------------------------- */

export const DEFAULT_UNIT_LABELS = ['Water', 'Light', 'AC', 'Generator'];

/* ----------------------------------- types ----------------------------------- */

export interface UnitRow {
  id: string;
  label: string;
  /**
   * Toggle: true = "abhi meter reading daal raha hoon".
   * false = sirf rate set hua hai, reading baad me update screen se aayegi.
   */
  includeNow: boolean;
  /** Rate charged per unit (e.g. Rs 5 per unit of electricity). */
  perUnit: string;
  /** Meter reading at booking start — amount handover par closing reading se. */
  currentUnit: string;
  /** Meter photo ka local preview / uploaded URL (OPTIONAL). */
  meterPhotoUri: string | null;
  /** Uploaded Cloudinary URL (optional) — yahi backend ko jaata hai. */
  meterPhotoUrl: string | null;
  /** Kept for data compatibility — always false, units paid at handover. */
  paid: boolean;
  /** @deprecated — kept only for backend payload compatibility. */
  quantity: string;
}

export interface UnitDraftItem {
  label: string;
  quantity: number;
  perUnit: number;
  currentUnit: number;
  meterPhoto?: string;
}

/* -------------------------------- row factory -------------------------------- */

let unitIdCounter = 0;

export const newUnitRow = (
  label = '',
  perUnit = '',
  paid = false,
  currentUnit = '',
  options: {
    includeNow?: boolean;
    meterPhotoUrl?: string | null;
  } = {},
): UnitRow => ({
  id: `unit-${Date.now()}-${unitIdCounter++}`,
  label,
  quantity: '0',
  perUnit,
  currentUnit,
  includeNow: options.includeNow ?? true,
  meterPhotoUri: options.meterPhotoUrl || null,
  meterPhotoUrl: options.meterPhotoUrl ?? null,
  paid,
});

export const createDefaultUnitRows = (): UnitRow[] =>
  DEFAULT_UNIT_LABELS.map((label) => newUnitRow(label));

/** Naya (khaali) unit — abhi reading daalne ke liye toggle ON. */
export const createEmptyUnitRow = (): UnitRow => newUnitRow('', '', false, '');

/* -------------------------------- sanitizers -------------------------------- */

export const digitsOnly = (text: string) => (text ?? '').replace(/[^0-9]/g, '');

/** 5 digits tak, leading zeros hata kar (rate / reading dono ke liye). */
export const sanitizeUnitNumber = (text: string): string => {
  const digits = digitsOnly(text).slice(0, 5);

  return digits.replace(/^0+(?=\d)/, '');
};

export const num = (value: string): number => {
  const parsed = Number(sanitizeUnitNumber(value));

  return Number.isFinite(parsed) ? parsed : 0;
};
/* ------------------------------ row operations ------------------------------ */

export type UnitRowField = 'label' | 'perUnit' | 'currentUnit';

/** Ek row ka ek field update (label free text, numbers sanitized). */
export const updateUnitRowField = (
  rows: UnitRow[],
  id: string,
  field: UnitRowField,
  value: string,
): UnitRow[] =>
  rows.map((row) =>
    row.id === id
      ? {
          ...row,
          [field]: field === 'label' ? value : sanitizeUnitNumber(value),
        }
      : row,
  );

/** Toggle: units abhi daalne hain ya baad me (update screen se). */
export const toggleUnitRowIncludeNow = (rows: UnitRow[], id: string): UnitRow[] =>
  rows.map((row) =>
    row.id === id ? { ...row, includeNow: !row.includeNow } : row,
  );

/** Photo set/clear (local preview + uploaded URL dono). */
export const setUnitRowPhoto = (
  rows: UnitRow[],
  id: string,
  uri: string | null,
  url: string | null = null,
): UnitRow[] =>
  rows.map((row) =>
    row.id === id ? { ...row, meterPhotoUri: uri, meterPhotoUrl: url } : row,
  );

export const addUnitRow = (
  rows: UnitRow[],
  row: UnitRow = createEmptyUnitRow(),
): UnitRow[] => [...rows, row];

export const removeUnitRow = (rows: UnitRow[], id: string): UnitRow[] =>
  rows.filter((row) => row.id !== id);

/* -------------------------------- validation -------------------------------- */

export const isUnitRowValid = (row: UnitRow): boolean => {
  if (row.label.trim().length === 0) return false;
  // Rate hamesha chahiye — amount handover par isi rate se banega.
  if (num(row.perUnit) <= 0) return false;
  // Reading sirf tab chahiye jab abhi units daal rahe ho.
  if (row.includeNow && num(row.currentUnit) <= 0) return false;

  return true;
};

/** Reading row me meter photo lagi hai? (photo optional hai) */
export const hasMeterPhoto = (row: UnitRow): boolean =>
  Boolean(row.meterPhotoUrl || row.meterPhotoUri);

/* --------------------------- draft / payload mapping --------------------------- */

/** Units screen me sirf label wali rows jaati hain (rate wali validation UI par). */
export const unitRowsToPayload = (rows: UnitRow[]): UnitDraftItem[] =>
  rows
    .filter((row) => row.label.trim().length > 0)
    .map((row) => ({
      label: row.label.trim(),
      // Quantity/amount handover par decide hoti hai — abhi 0.
      quantity: 0,
      perUnit: num(row.perUnit),
      // Reading sirf tab bhejni hai jab abhi daali gayi ho.
      currentUnit: row.includeNow ? num(row.currentUnit) : 0,
      // Optional meter photo (URL) — evidence.
      meterPhoto: row.meterPhotoUrl ?? undefined,
    }));

/** Draft/backend items ko screen rows me wapas (edit flows ke liye). */
export const draftItemsToUnitRows = (
  items: (Partial<UnitDraftItem> & { paid?: boolean })[],
): UnitRow[] =>
  items.map((item) =>
    newUnitRow(
      item.label ?? '',
      item.perUnit ? String(item.perUnit) : '',
      !!item.paid,
      item.currentUnit ? String(item.currentUnit) : '',
      {
        // Reading/photo pehle se ho to toggle ON rehta hai.
        includeNow: Boolean(item.currentUnit || item.meterPhoto),
        meterPhotoUrl: item.meterPhoto ?? null,
      },
    ),
  );

/** Amount handover par band hoga — abhi hamesha 0. */
export const unitRowAmount = (_row: UnitRow) => 0;

export const computeUnitsTotal = (_rows: UnitRow[]) => 0;

export const computeUnitsPaidTotal = (_rows: UnitRow[]) => 0;

/* ---------------------------- meter photo upload ---------------------------- */

const isRemoteUrl = (uri: string) => /^https?:\/\//i.test(uri);

/** Meter photo compress (react-native-compressor) + Cloudinary upload. */
export const uploadUnitMeterPhoto = async (uri: string): Promise<string> => {
  const compressedUri = await compressImage(uri);
  const uploaded = await uploadImage(compressedUri ?? uri);

  return uploaded.secure_url;
};

/** Pehle se uploaded URL ho to dobara upload nahi hoti. */
export const resolveUnitMeterPhotoUrl = async (
  uri: string | null | undefined,
): Promise<string> => {
  if (!uri) return '';
  if (isRemoteUrl(uri)) return uri;

  return uploadUnitMeterPhoto(uri);
};