import {
  MOBILE_LENGTH,
  getMobileError,
  isMobileValidOrEmpty,
  isValidMobileNumber,
  sanitizeMobileNumber,
} from '../src/functions/booking/PhoneFunction';

describe('sanitizeMobileNumber', () => {
  it('keeps digits only and caps at 10', () => {
    expect(sanitizeMobileNumber('98-0000-0001')).toBe('9800000001');
    expect(sanitizeMobileNumber('abcd')).toBe('');
    expect(sanitizeMobileNumber('123456789012345')).toBe('1234567890');
    expect(MOBILE_LENGTH).toBe(10);
  });

  it('handles null/undefined safely', () => {
    expect(sanitizeMobileNumber(undefined as unknown as string)).toBe('');
    expect(sanitizeMobileNumber(null as unknown as string)).toBe('');
  });
});

describe('isValidMobileNumber', () => {
  it('accepts exactly 10 digits', () => {
    expect(isValidMobileNumber('9800000001')).toBe(true);
    expect(isValidMobileNumber(' 9800000001 ')).toBe(true);
  });

  it('rejects short, long and non-numeric values', () => {
    expect(isValidMobileNumber('980000001')).toBe(false);
    expect(isValidMobileNumber('98000000012')).toBe(false);
    expect(isValidMobileNumber('98000000ab')).toBe(false);
    expect(isValidMobileNumber('')).toBe(false);
  });
});

describe('isMobileValidOrEmpty (optional field)', () => {
  it('allows empty but not a partial number', () => {
    expect(isMobileValidOrEmpty('')).toBe(true);
    expect(isMobileValidOrEmpty('9800000001')).toBe(true);
    expect(isMobileValidOrEmpty('98000')).toBe(false);
  });
});

describe('getMobileError', () => {
  it('stays silent until the field is touched', () => {
    expect(getMobileError('', false)).toBe('');
    expect(getMobileError('9800', false)).toBe('');
  });

  it('explains the required case', () => {
    expect(getMobileError('', true)).toBe('Mobile number is required');
    expect(getMobileError('9800', true)).toBe('Enter all 10 digits (4/10)');
    expect(getMobileError('9800000001', true)).toBe('');
  });

  it('is silent on empty for optional fields', () => {
    expect(getMobileError('', true, { required: false })).toBe('');
    expect(getMobileError('9800', true, { required: false })).toBe(
      'Enter all 10 digits (4/10)',
    );
  });

  it('flags 10 characters that are not digits', () => {
    expect(getMobileError('98000000ab', true)).toBe(
      'Enter a valid 10-digit mobile number',
    );
  });
});
