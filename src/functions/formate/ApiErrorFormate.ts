import { AxiosError } from 'axios';

/**
 * Backend ka saaf message nikaalo — chahe wo `message`, `error`, plain string
 * body ho ya network error; warna fallback.
 */
export const getApiErrorMessage = (
    error: unknown,
    fallback = 'Kuch galat ho gaya. Please try again.',
): string => {
    const err = error as AxiosError<any> | undefined;
    const data = err?.response?.data;

    if (typeof data === 'string' && data.trim().length > 0) {
        return data;
    }

    const message = data?.message || data?.error;
    if (typeof message === 'string' && message.trim().length > 0) {
        return message;
    }

    return err?.message || fallback;
};

/**
 * JWT error messages.
 *
 * Naya backend expired/invalid token par 401 deta hai, par jo build pehle se
 * deployed hai wo generic 500 + `jwt expired` bhejta hai. Dono ko auth failure
 * maana jaata hai taake user chup-chaap khali list dekhne ke bajaye dobara
 * login kar sake.
 */
const AUTH_ERROR_PATTERN =
    /jwt expired|jwt malformed|invalid token|invalid access token|access token is required|token (has )?expired/i;

/**
 * Access list se number hat jaane par backend `403 ACCESS_DENIED` deta hai.
 * Ye session expire nahi hai (re-login se theek nahi hoga), isliye isko alag
 * pehchana jaata hai — user ko saaf message milta hai, aur session clear kar
 * diya jaata hai taake app adhoora data dikhata na rahe.
 */
export const ACCESS_DENIED_CODE = 'ACCESS_DENIED';

export const isAccessDenied = (error: unknown): boolean => {
    const response = (error as AxiosError<any> | undefined)?.response;

    return (
        response?.status === 403 &&
        response?.data?.code === ACCESS_DENIED_CODE
    );
};

/** 401 (ya 5xx + token error) = session invalid. */
export const isAuthFailure = (error: unknown): boolean => {
    const status = (error as AxiosError | undefined)?.response?.status;

    if (status === 401) {
        return true;
    }

    if (status && status >= 500) {
        return AUTH_ERROR_PATTERN.test(getApiErrorMessage(error, ''));
    }

    return false;
};

/** OTP endpoints par 401 ka matlab session expire nahi — galat OTP hai. */
export const isAuthEndpoint = (url?: string): boolean =>
    /send-otp|verify-otp/i.test(url ?? '');

export default getApiErrorMessage;
