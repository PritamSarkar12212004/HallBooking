jest.mock('../src/services/Cloudinary/uploadImg', () => ({
  __esModule: true,
  default: jest.fn(async () => ({
    secure_url: 'https://cdn.test/proof.jpg',
    public_id: 'proof',
  })),
}));

jest.mock('react-native-compressor', () => ({
  Image: {
    compress: jest.fn(async (uri: string) => `compressed-${uri}`),
  },
}));

import { newChargeRow } from '../src/functions/booking/ChargeFunction';
import { newUnitRow } from '../src/functions/booking/UnitsFunction';
import {
  PAYMENT_MODES,
  buildPaymentDraftPayload,
  computePaymentSummary,
  getPaymentProofHint,
  getTransactionFieldTitle,
  getTransactionPlaceholder,
  isPaymentFormValid,
  isPaymentProofRequired,
  requiresTransactionNumber,
  savedUnitRows,
  togglePaymentMode,
} from '../src/functions/booking/PaymentFunction';

const summaryOf = ({
  charges = [newChargeRow('Rent', '5000', '2000')],
  units = [],
  securityDeposit = '',
}: {
  charges?: ReturnType<typeof newChargeRow>[];
  units?: ReturnType<typeof newUnitRow>[];
  securityDeposit?: string;
} = {}) => computePaymentSummary({ rows: charges, unitRows: units, securityDeposit });

describe('mode rules', () => {
  it('exposes the four supported modes', () => {
    expect(PAYMENT_MODES).toEqual(['Cash', 'UPI', 'Cheque', 'NEFT/RTGS']);
  });

  it('needs a transaction number for UPI, Cheque and NEFT only', () => {
    expect(requiresTransactionNumber('UPI')).toBe(true);
    expect(requiresTransactionNumber('Cheque')).toBe(true);
    expect(requiresTransactionNumber('NEFT/RTGS')).toBe(true);
    expect(requiresTransactionNumber('Cash')).toBe(false);
    expect(requiresTransactionNumber(undefined)).toBe(false);
  });

  it('needs a payment proof for every non-cash mode', () => {
    expect(isPaymentProofRequired('UPI')).toBe(true);
    expect(isPaymentProofRequired('Cheque')).toBe(true);
    expect(isPaymentProofRequired('NEFT/RTGS')).toBe(true);
    // Cash me proof optional evidence hai, aur mode chunne se pehle bhi optional.
    expect(isPaymentProofRequired('Cash')).toBe(false);
    expect(isPaymentProofRequired(undefined)).toBe(false);
  });

  it('explains what the proof is for', () => {
    expect(getPaymentProofHint('UPI')).toBe('Capture or select payment receipt');
    expect(getPaymentProofHint('Cash')).toContain('optional');
    expect(getPaymentProofHint(undefined)).toContain('optional');
  });

  it('labels the reference field per mode', () => {
    expect(getTransactionFieldTitle('Cheque')).toBe('Cheque Number *');
    expect(getTransactionFieldTitle('UPI')).toBe('Transaction / Reference Number *');
    expect(getTransactionPlaceholder('Cheque')).toBe('Enter cheque number');
    expect(getTransactionPlaceholder('UPI')).toBe('Enter transaction/reference number');
  });

  it('toggles a single mode chip off when tapped again', () => {
    expect(togglePaymentMode([], 'Cash')).toEqual(['Cash']);
    expect(togglePaymentMode(['Cash'], 'UPI')).toEqual(['UPI']);
    expect(togglePaymentMode(['Cash'], 'Cash')).toEqual([]);
  });
});

describe('summary', () => {
  it('adds charge totals and the deposit without counting units yet', () => {
    const summary = summaryOf({ securityDeposit: '5000' });

    expect(summary.chargesTotal).toBe(5000);
    expect(summary.chargesPaid).toBe(2000);
    expect(summary.unitsTotal).toBe(0);
    expect(summary.unitsPaid).toBe(0);
    expect(summary.effectiveTotal).toBe(5000);
    expect(summary.paidTotal).toBe(2000);
    expect(summary.balanceAmount).toBe(3000);
    expect(summary.securityDeposit).toBe(5000);
    expect(summary.amountsExceed).toBe(false);
    expect(summary.allChargesPaid).toBe(false);
  });

  it('flags paid amounts above the total', () => {
    const summary = summaryOf({
      charges: [newChargeRow('Rent', '5000', '6000')],
    });

    expect(summary.amountsExceed).toBe(true);
    expect(summary.balanceAmount).toBe(0);
  });

  it('reports "all paid" only when every head is settled', () => {
    expect(
      summaryOf({ charges: [newChargeRow('Rent', '5000', '5000')] }).allChargesPaid,
    ).toBe(true);
  });
});

describe('form validation', () => {
  const valid = {
    summary: summaryOf(),
    mode: 'Cash' as string | undefined,
    transactionNumber: '',
    hasProof: false,
  };

  it('accepts a cash payment without proof', () => {
    expect(isPaymentFormValid(valid)).toBe(true);
  });

  it('blocks when no mode is chosen', () => {
    expect(isPaymentFormValid({ ...valid, mode: undefined })).toBe(false);
  });

  it('blocks when nothing is paid or the total is empty', () => {
    expect(
      isPaymentFormValid({
        ...valid,
        summary: summaryOf({ charges: [newChargeRow('Rent', '5000', '')] }),
      }),
    ).toBe(false);
    expect(
      isPaymentFormValid({ ...valid, summary: summaryOf({ charges: [] }) }),
    ).toBe(false);
  });

  it('blocks paid amounts above the total', () => {
    expect(
      isPaymentFormValid({
        ...valid,
        summary: summaryOf({ charges: [newChargeRow('Rent', '5000', '6000')] }),
      }),
    ).toBe(false);
  });

  it('needs the reference number for UPI and the proof photo', () => {
    expect(
      isPaymentFormValid({ ...valid, mode: 'UPI', hasProof: true }),
    ).toBe(false);
    expect(
      isPaymentFormValid({
        ...valid,
        mode: 'UPI',
        transactionNumber: '  ',
        hasProof: true,
      }),
    ).toBe(false);
    expect(
      isPaymentFormValid({
        ...valid,
        mode: 'UPI',
        transactionNumber: 'TXN123',
        hasProof: false,
      }),
    ).toBe(false);
    expect(
      isPaymentFormValid({
        ...valid,
        mode: 'UPI',
        transactionNumber: 'TXN123',
        hasProof: true,
      }),
    ).toBe(true);
  });

  it('does not ask for a reference number in cash mode', () => {
    expect(isPaymentFormValid({ ...valid, transactionNumber: '' })).toBe(true);
  });
});

describe('draft payload', () => {
  const rows = [newChargeRow('Rent', '5000', '2000')];

  it('keeps the reference number for non-cash modes only', () => {
    expect(
      buildPaymentDraftPayload({
        rows,
        unitRows: [],
        securityDeposit: '5000',
        mode: 'UPI',
        transactionNumber: 'TXN123',
        paymentProofPhoto: 'https://cdn.test/proof.jpg',
      }),
    ).toEqual({
      charges: [{ label: 'Rent', amount: 5000, paid: 2000 }],
      units: [],
      securityDeposit: 5000,
      mode: 'UPI',
      transactionNumber: 'TXN123',
      paymentProofPhoto: 'https://cdn.test/proof.jpg',
    });

    const cash = buildPaymentDraftPayload({
      rows,
      unitRows: [],
      securityDeposit: '',
      mode: 'Cash',
      transactionNumber: 'ignored',
      paymentProofPhoto: '',
    });

    expect(cash.transactionNumber).toBeUndefined();
    // Khaali deposit undefined hi rehta hai (0 nahi bhejte).
    expect(cash.securityDeposit).toBeUndefined();
  });
});

describe('saved units', () => {
  it('returns null when the units screen saved nothing', () => {
    expect(savedUnitRows([])).toBeNull();
    expect(savedUnitRows(undefined)).toBeNull();
    expect(savedUnitRows(null)).toBeNull();
  });

  it('rebuilds rows with rate, reading and meter photo', () => {
    const rows = savedUnitRows([
      { label: 'Light', perUnit: 5, currentUnit: 120, meterPhoto: 'https://cdn.test/m.jpg' },
    ]);

    expect(rows).toHaveLength(1);
    expect(rows![0]).toMatchObject({
      label: 'Light',
      perUnit: '5',
      currentUnit: '120',
      includeNow: true,
      meterPhotoUrl: 'https://cdn.test/m.jpg',
    });
  });

  it('keeps a rate-only unit without a reading', () => {
    const rows = savedUnitRows([{ label: 'Water', perUnit: 8 }]);

    expect(rows![0]).toMatchObject({ includeNow: false, currentUnit: '' });
  });
});
