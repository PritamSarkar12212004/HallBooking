jest.mock('react-native-compressor', () => ({
  Image: {
    // Native side base64 (Android par line breaks ke saath) lauta deta hai.
    compress: jest.fn(async () => `${'B'.repeat(400)}\n`),
  },
}));

jest.mock('../src/services/Cloudinary/uploadImg', () => ({
  __esModule: true,
  default: jest.fn(async () => ({
    secure_url: 'https://cdn.test/signature.png',
    public_id: 'signature',
  })),
}));

import { Image as CompressorImage } from 'react-native-compressor';

import uploadImage from '../src/services/Cloudinary/uploadImg';
import {
  DECLARATION_TERM,
  MIN_SIGNATURE_CANVAS_HEIGHT,
  SIGNATURE_MIN_BASE64_LENGTH,
  SIGNATURE_PAD_FOOTER_HEIGHT,
  SIGNATURE_PAD_HEADER_HEIGHT,
  buildDeclarationPayload,
  computeSignatureCanvasHeight,
  compressSignature,
  draftSectionsToPush,
  isSignatureDataUrl,
  isSignatureReady,
  toSignatureDataUrl,
  uploadSignature,
  uploadSignatures,
} from '../src/functions/booking/DeclarationFunction';

const RAW_BASE64 = 'A'.repeat(SIGNATURE_MIN_BASE64_LENGTH + 100);
const DATA_URL = `data:image/png;base64,${RAW_BASE64}`;

const compressMock = CompressorImage.compress as jest.Mock;
const uploadMock = uploadImage as unknown as jest.Mock;

beforeEach(() => {
  compressMock.mockClear();
  uploadMock.mockClear();
});

describe('data url helpers', () => {
  it('detects signature data urls', () => {
    expect(isSignatureDataUrl(DATA_URL)).toBe(true);
    expect(isSignatureDataUrl('file:///tmp/a.png')).toBe(false);
    expect(isSignatureDataUrl(null)).toBe(false);
    expect(isSignatureDataUrl('')).toBe(false);
  });

  it('needs a real payload before the signature is ready', () => {
    expect(isSignatureReady(DATA_URL)).toBe(true);
    // Blank canvas ka PNG bahut chhota hota hai.
    expect(isSignatureReady('data:image/png;base64,iVBORw0K')).toBe(false);
    expect(isSignatureReady(null)).toBe(false);
  });

  it('adds the png prefix to raw base64 and cleans whitespace', () => {
    expect(toSignatureDataUrl(`${RAW_BASE64}\n`)).toBe(DATA_URL);
    expect(toSignatureDataUrl(`data:image/png;base64,${RAW_BASE64}\n`)).toBe(DATA_URL);
    expect(toSignatureDataUrl('   ')).toBeNull();
    expect(toSignatureDataUrl(null)).toBeNull();
  });

  it('keeps the declaration term as the legal text', () => {
    expect(DECLARATION_TERM).toContain('true and correct');
  });
});

describe('compression', () => {
  it('compresses base64 in and converts the output to png base64', async () => {
    const result = await compressSignature(DATA_URL);

    expect(compressMock).toHaveBeenCalledWith(
      DATA_URL,
      expect.objectContaining({
        input: 'base64',
        output: 'png',
        returnableOutputType: 'base64',
        compressionMethod: 'manual',
      }),
    );
    expect(result).toBe(`data:image/png;base64,${'B'.repeat(400)}`);
  });

  it('falls back to the original signature when compression fails', async () => {
    compressMock.mockRejectedValueOnce(new Error('native boom'));

    await expect(compressSignature(DATA_URL)).resolves.toBe(DATA_URL);
  });

  it('returns null for an empty value', async () => {
    await expect(compressSignature('')).resolves.toBeNull();
  });
});

describe('upload', () => {
  it('uploads the compressed png data url to cloudinary', async () => {
    const url = await uploadSignature(DATA_URL);

    expect(url).toBe('https://cdn.test/signature.png');
    expect(uploadMock).toHaveBeenCalledWith(
      `data:image/png;base64,${'B'.repeat(400)}`,
    );
  });

  it('uploads both signatures and skips the missing ones', async () => {
    const result = await uploadSignatures({
      applicantSignature: DATA_URL,
      managerSignature: null,
    });

    expect(result).toEqual({
      applicantSignature: 'https://cdn.test/signature.png',
      managerSignature: '',
    });
    expect(uploadMock).toHaveBeenCalledTimes(1);
  });
});

describe('payloads', () => {
  it('builds the declaration payload with terms accepted', () => {
    expect(
      buildDeclarationPayload({
        applicantSignature: 'https://cdn.test/a.png',
        managerSignature: 'https://cdn.test/m.png',
      }),
    ).toEqual({
      applicantSignature: 'https://cdn.test/a.png',
      managerSignature: 'https://cdn.test/m.png',
      termsAccepted: true,
    });
  });

  it('pushes only the draft sections that were filled', () => {
    expect(draftSectionsToPush(null)).toEqual([]);
    expect(draftSectionsToPush({})).toEqual([]);
    expect(
      draftSectionsToPush({
        applicant: { name: 'Rina' },
        event: { type: 'Wedding' },
        payment: { mode: 'Cash' },
      }).map((item) => item.section),
    ).toEqual(['applicant', 'event', 'payment']);
  });
});

describe('computeSignatureCanvasHeight (full-screen sign pad)', () => {
  it('window height me se safe area + header/footer nikaal deta hai', () => {
    expect(computeSignatureCanvasHeight({ windowHeight: 800, topInset: 24, bottomInset: 48 })).toBe(
      800 -
        24 -
        48 -
        SIGNATURE_PAD_HEADER_HEIGHT -
        SIGNATURE_PAD_FOOTER_HEIGHT,
    );
  });

  it('insets na hone par bhi theek chalta hai', () => {
    expect(computeSignatureCanvasHeight({ windowHeight: 640 })).toBe(
      640 - SIGNATURE_PAD_HEADER_HEIGHT - SIGNATURE_PAD_FOOTER_HEIGHT,
    );
  });

  it('chhote phone (ya landscape) par minimum floor lagta hai', () => {
    expect(computeSignatureCanvasHeight({ windowHeight: 300 })).toBe(
      MIN_SIGNATURE_CANVAS_HEIGHT,
    );
  });
});
