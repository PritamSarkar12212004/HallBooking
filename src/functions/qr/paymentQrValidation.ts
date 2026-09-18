export const BANK_HOLDER_NAME_MIN_LENGTH = 3;
export const BANK_HOLDER_NAME_MAX_LENGTH = 80;

// Starts with a letter, then letters / spaces / dot / apostrophe / hyphen.
const BANK_HOLDER_NAME_REGEX = /^[A-Za-z][A-Za-z .'-]*$/;

/** Collapses repeated whitespace: "Ramesh   Kumar" -> "Ramesh Kumar". */
export const normalizeBankHolderName = (value: string): string =>
    String(value ?? '').replace(/\s+/g, ' ').trim();

/**
 * Client side mirror of the backend rule (`payment-qr/qr.validation.ts`) so the
 * CEO gets instant feedback. Returns an error message, or null when valid.
 */
export const validateBankHolderName = (value: string): string | null => {
    const name = normalizeBankHolderName(value);

    if (!name) {
        return 'Bank holder name is required.';
    }
    if (name.length < BANK_HOLDER_NAME_MIN_LENGTH) {
        return `Bank holder name must be at least ${BANK_HOLDER_NAME_MIN_LENGTH} characters.`;
    }
    if (name.length > BANK_HOLDER_NAME_MAX_LENGTH) {
        return `Bank holder name must be at most ${BANK_HOLDER_NAME_MAX_LENGTH} characters.`;
    }
    if (!BANK_HOLDER_NAME_REGEX.test(name)) {
        return "Bank holder name can only contain letters, spaces and . ' - characters.";
    }

    return null;
};