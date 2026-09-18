import {
  BANK_HOLDER_NAME_MAX_LENGTH,
  BANK_HOLDER_NAME_MIN_LENGTH,
  normalizeBankHolderName,
  validateBankHolderName,
} from '../src/functions/qr/paymentQrValidation';

describe('normalizeBankHolderName', () => {
  it('trims and collapses repeated whitespace', () => {
    expect(normalizeBankHolderName('  Ramesh   Kumar  ')).toBe('Ramesh Kumar');
  });

  it('keeps a single-word name untouched', () => {
    expect(normalizeBankHolderName('Trust')).toBe('Trust');
  });
});

describe('validateBankHolderName', () => {
  it('accepts the name formats a hall account can have', () => {
    expect(validateBankHolderName('Ramesh Kumar')).toBeNull();
    expect(validateBankHolderName("D'Souza Hall")).toBeNull();
    expect(validateBankHolderName('S.K. Trust')).toBeNull();
    expect(validateBankHolderName('Ramesh-Kumar')).toBeNull();
  });

  it('requires a value', () => {
    expect(validateBankHolderName('')).toBe('Bank holder name is required.');
    expect(validateBankHolderName('   ')).toBe('Bank holder name is required.');
  });

  it('enforces the minimum length', () => {
    expect(validateBankHolderName('ab')).toBe(
      `Bank holder name must be at least ${BANK_HOLDER_NAME_MIN_LENGTH} characters.`,
    );
    expect(validateBankHolderName('abc')).toBeNull();
  });

  it('enforces the maximum length', () => {
    const tooLong = 'A'.repeat(BANK_HOLDER_NAME_MAX_LENGTH + 1);

    expect(validateBankHolderName(tooLong)).toBe(
      `Bank holder name must be at most ${BANK_HOLDER_NAME_MAX_LENGTH} characters.`,
    );
  });

  it('rejects digits and other symbols', () => {
    expect(validateBankHolderName('Ramesh 123')).not.toBeNull();
    expect(validateBankHolderName('Ramesh@Kumar')).not.toBeNull();
  });

  it('rejects a name that does not start with a letter', () => {
    expect(validateBankHolderName("'Ramesh")).not.toBeNull();
  });

  it('validates the trimmed value, not the raw input', () => {
    // "  ab  " collapses to "ab" -> too short.
    expect(validateBankHolderName('  ab  ')).toBe(
      `Bank holder name must be at least ${BANK_HOLDER_NAME_MIN_LENGTH} characters.`,
    );
  });
});