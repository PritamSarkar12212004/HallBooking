/**
 * Declaration / signature (Step6DecorationScreen) ke reusable rules.
 *
 * Signature `react-native-signature-canvas` se aata hai — wo `data:image/png;base64,…`
 * deta hai (finger draw). Upload se pehle usko compress karte hain
 * (`react-native-compressor`, base64 in → PNG out) aur phir Cloudinary par
 * bhejte hain; `secure_url` backend ke `declaration` section me jaata hai.
 *
 * Sab kuch yahan pure/awaited helpers me hai — screen aur hook sirf inhe call
 * karte hain (units ke liye same pattern `UnitsFunction.ts` me hai).
 */
import { Image } from 'react-native-compressor';

import uploadImage from '../../services/Cloudinary/uploadImg';

export const DECLARATION_TERM =
  'I hereby declare that the information provided above is true and correct. I have read and agree to abide by the terms and conditions of the hall booking.';

/** Signature hamesha PNG me jaata hai (transparent/white background safe rehta hai). */
export const SIGNATURE_IMAGE_TYPE = 'image/png' as const;

const DATA_URL_REGEX = /^data:image\/[a-z+]+;base64,/i;

/**
 * Khaali canvas ka PNG bhi valid data URL hota hai (bahut chhota hota hai),
 * isliye ek minimum length guard — "sign kiya hi nahi" case pakadne ke liye.
 */
export const SIGNATURE_MIN_BASE64_LENGTH = 300;

// --- Sign pad ka layout (full screen) -------------------------------------

/** Header (title + close) ki approximate height. */
export const SIGNATURE_PAD_HEADER_HEIGHT = 92;
/** Neeche ke Clear/Save buttons ki approximate height. */
export const SIGNATURE_PAD_FOOTER_HEIGHT = 104;
/** Itne se chhote canvas par sign karna mushkil hota hai. */
export const MIN_SIGNATURE_CANVAS_HEIGHT = 240;

/**
 * Full-screen sign pad me canvas ki height.
 *
 * Window ki poori height me se safe-area insets aur header/footer nikaal kar
 * baaki saari jagah canvas ko de dete hain (chhote phone / notch / rotate par
 * bhi theek rahe), aur ek minimum floor lagate hain.
 */
export const computeSignatureCanvasHeight = (params: {
  windowHeight: number;
  topInset?: number;
  bottomInset?: number;
}): number => {
  const { windowHeight, topInset = 0, bottomInset = 0 } = params;

  const available =
    windowHeight -
    topInset -
    bottomInset -
    SIGNATURE_PAD_HEADER_HEIGHT -
    SIGNATURE_PAD_FOOTER_HEIGHT;

  return Math.max(MIN_SIGNATURE_CANVAS_HEIGHT, Math.round(available));
};

/** Signature canvas ka output data URL hai ya nahi. */
export const isSignatureDataUrl = (value?: string | null): boolean =>
  Boolean(value && DATA_URL_REGEX.test(value));

/** Signature itna bhar chuka hai ki upload karne layak hai? */
export const isSignatureReady = (value?: string | null): boolean =>
  isSignatureDataUrl(value) &&
  (value?.length ?? 0) >= SIGNATURE_MIN_BASE64_LENGTH;

/**
 * Base64 ko dobara `data:image/png;base64,…` bana deta hai.
 *
 * Android ka Base64 encoder line breaks daal deta hai aur native side kabhi
 * sirf base64 (prefix ke bina) lauta deta hai — dono yahan sambhal lete hain.
 */
export const toSignatureDataUrl = (
  value?: string | null,
): string | null => {
  if (!value) return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  if (isSignatureDataUrl(trimmed)) {
    const [header, payload = ''] = trimmed.split(',', 2);
    const clean = (payload ?? '').replace(/\s+/g, '');

    return clean ? `${header},${clean}` : null;
  }

  const clean = trimmed.replace(/\s+/g, '');

  return clean ? `data:image/png;base64,${clean}` : null;
};

/**
 * Signature compress karke PNG data URL deta hai.
 *
 * - `input: 'base64'` — canvas ka data URL seedha jaata hai (temp file nahi)
 * - `output: 'png'` + `disablePngTransparency: false` — signature ka
 *   background transparent rehta hai
 * - `returnableOutputType: 'base64'` — upload bina file likhe ho jaata hai
 *
 * Compress fail ho jaaye to original data URL hi return hota hai, taake
 * signature sirf is wajah se block na ho.
 */
export const compressSignature = async (
  dataUrl: string,
): Promise<string | null> => {
  const source = toSignatureDataUrl(dataUrl);
  if (!source) return null;

  try {
    const compressed = await Image.compress(source, {
      compressionMethod: 'manual',
      // Signature patla aur chaura hota hai — width/height dono cap karte hain.
      maxWidth: 900,
      maxHeight: 500,
      input: 'base64',
      output: 'png',
      returnableOutputType: 'base64',
      disablePngTransparency: false,
    });

    return toSignatureDataUrl(compressed) ?? source;
  } catch (error: any) {
    console.log('Signature Compression Error:', error?.message || error);
    return source;
  }
};

/** Ek signature ko compress + Cloudinary upload karke `secure_url` deta hai. */
export const uploadSignature = async (dataUrl: string): Promise<string> => {
  const compressed = await compressSignature(dataUrl);
  if (!compressed) return '';

  const uploaded = await uploadImage(compressed);

  return uploaded.secure_url;
};

/**
 * Dono signatures ek saath upload karta hai (parallel — ek hi wait).
 * Koi signature na ho to khaali string jaati hai.
 */
export const uploadSignatures = async ({
  applicantSignature,
  managerSignature,
}: {
  applicantSignature?: string | null;
  managerSignature?: string | null;
}): Promise<{ applicantSignature: string; managerSignature: string }> => {
  const [applicant, manager] = await Promise.all([
    applicantSignature ? uploadSignature(applicantSignature) : Promise.resolve(''),
    managerSignature ? uploadSignature(managerSignature) : Promise.resolve(''),
  ]);

  return { applicantSignature: applicant, managerSignature: manager };
};

/** Backend ke `declaration` section ka payload. */
export const buildDeclarationPayload = ({
  applicantSignature,
  managerSignature,
  termsAccepted = true,
}: {
  applicantSignature: string;
  managerSignature: string;
  termsAccepted?: boolean;
}) => ({
  applicantSignature,
  managerSignature,
  termsAccepted,
});

/* ------------------------- draft -> backend sections ------------------------- */

export type BookingSectionName =
  | 'applicant'
  | 'event'
  | 'arrangements'
  | 'payment'
  | 'declaration';

export interface DraftSectionPayload {
  section: BookingSectionName;
  data: unknown;
}

/**
 * Draft me jo sections bhare gaye hain wahi (aur usi order me) nayi booking par
 * push hote hain — khaali sections skip ho jaate hain. Declaration sabse aakhir
 * me jaata hai (`useDeclarationForm`), kyunki wo doosre steps complete hone ke
 * baad hi ban sakta hai.
 */
export const draftSectionsToPush = (
  draft: {
    applicant?: unknown;
    event?: unknown;
    arrangements?: unknown;
    payment?: unknown;
  } | null,
): DraftSectionPayload[] => {
  if (!draft) return [];

  const sections: DraftSectionPayload[] = [];

  if (draft.applicant) sections.push({ section: 'applicant', data: draft.applicant });
  if (draft.event) sections.push({ section: 'event', data: draft.event });
  if (draft.arrangements)
    sections.push({ section: 'arrangements', data: draft.arrangements });
  if (draft.payment) sections.push({ section: 'payment', data: draft.payment });

  return sections;
};
