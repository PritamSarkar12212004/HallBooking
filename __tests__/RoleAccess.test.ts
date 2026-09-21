import {
  isCeoPhone,
  isCeoUser,
  normalizePhone,
} from '../src/const/role/role';
import { isAccessDenied } from '../src/functions/formate/ApiErrorFormate';

const axiosError = (status: number, data: unknown) =>
  ({ response: { status, data }, message: 'Request failed' }) as any;

describe('normalizePhone', () => {
  it('+91 / spaces / dashes hata kar 10 digit deta hai', () => {
    expect(normalizePhone('+91 77964-19792')).toBe('7796419792');
    expect(normalizePhone('7796419792')).toBe('7796419792');
  });

  it('khali / invalid values par empty string', () => {
    expect(normalizePhone(undefined)).toBe('');
    expect(normalizePhone(null)).toBe('');
    expect(normalizePhone('abc')).toBe('');
  });
});

describe('isCeoPhone (fallback)', () => {
  it('purane session wale CEO number ko pakadta hai', () => {
    expect(isCeoPhone('7796419792')).toBe(true);
    expect(isCeoPhone('+91 7796419792')).toBe(true);
    expect(isCeoPhone('9999999999')).toBe(false);
  });
});

describe('isCeoUser (backend access role pehle)', () => {
  it('accessRole CEO hone par CEO hai', () => {
    expect(isCeoUser({ phone: '9999999999', accessRole: 'CEO' })).toBe(true);
  });

  it('accessRole ADMIN/USER hone par CEO nahi — chahe phone whitelist me ho', () => {
    expect(isCeoUser({ phone: '7796419792', accessRole: 'ADMIN' })).toBe(false);
    expect(isCeoUser({ phone: '7796419792', accessRole: 'USER' })).toBe(false);
  });

  it('accessRole na ho to DB role, aur wo bhi na ho to phone fallback', () => {
    expect(isCeoUser({ phone: '9999999999', role: 'ceo' })).toBe(true);
    expect(isCeoUser({ phone: '7796419792' })).toBe(true);
    expect(isCeoUser({ phone: '9999999999' })).toBe(false);
  });

  it('user nahi hone par safe rehta hai', () => {
    expect(isCeoUser(null)).toBe(false);
    expect(isCeoUser(undefined)).toBe(false);
  });
});

describe('isAccessDenied', () => {
  it('sirf 403 + ACCESS_DENIED code par true', () => {
    expect(isAccessDenied(axiosError(403, { code: 'ACCESS_DENIED' }))).toBe(true);
    expect(isAccessDenied(axiosError(403, { message: 'CEO only' }))).toBe(false);
    expect(isAccessDenied(axiosError(401, { code: 'ACCESS_DENIED' }))).toBe(false);
    expect(isAccessDenied({ message: 'Network Error' })).toBe(false);
  });
});
