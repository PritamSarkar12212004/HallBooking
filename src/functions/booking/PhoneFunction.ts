/**
 * Phone number ke shared rules.
 *
 * Poore app me sirf ek hi jagah se mobile validate hota hai — 10 digits
 * (India), sirf digits. Applicant ka mobile, booking-for ka contact aur
 * decorator/caterer ke contact — sab yahi rules use karte hain, taake
 * behaviour har jagah same rahe.
 */

export const MOBILE_LENGTH = 10;

/** Sirf digits, max 10 — typing ke waqt hi letters/extra digits hata dete hain. */
export const sanitizeMobileNumber = (text: string): string =>
  (text ?? '').replace(/[^0-9]/g, '').slice(0, MOBILE_LENGTH);

/** Exactly 10 digits. */
export const isValidMobileNumber = (mobile: string): boolean =>
  new RegExp(`^\\d{${MOBILE_LENGTH}}$`).test((mobile ?? '').trim());

/** Optional field: khaali chalega, par bhara ho to 10 digits ka hona chahiye. */
export const isMobileValidOrEmpty = (mobile: string): boolean => {
  const value = (mobile ?? '').trim();

  return value.length === 0 || isValidMobileNumber(value);
};

/**
 * Inline error message.
 *
 * `required` true (default) = khaali chhodne par "Mobile number is required";
 * false = khaali theek, par galat number par wahi digits wala error.
 */
export const getMobileError = (
  mobile: string,
  touched: boolean,
  { required = true }: { required?: boolean } = {},
): string => {
  if (!touched) return '';

  const value = (mobile ?? '').trim();

  if (value.length === 0) {
    return required ? 'Mobile number is required' : '';
  }

  if (value.length < MOBILE_LENGTH) {
    return `Enter all ${MOBILE_LENGTH} digits (${value.length}/${MOBILE_LENGTH})`;
  }

  if (!isValidMobileNumber(value)) {
    return `Enter a valid ${MOBILE_LENGTH}-digit mobile number`;
  }

  return '';
};
