import {
    getApiErrorMessage,
    isAuthEndpoint,
    isAuthFailure,
} from '../src/functions/formate/ApiErrorFormate';

const axiosError = (status?: number, data?: unknown) =>
    ({ response: { status, data }, message: `Request failed with status ${status}` }) as any;

describe('getApiErrorMessage', () => {
    it('backend ka message nikaalta hai', () => {
        expect(
            getApiErrorMessage(axiosError(500, { message: 'jwt expired' })),
        ).toBe('jwt expired');
    });

    it('plain string body ko handle karta hai', () => {
        expect(getApiErrorMessage(axiosError(400, 'Bad request'))).toBe('Bad request');
    });

    it('network error par axios message deta hai', () => {
        expect(getApiErrorMessage({ message: 'Network Error' })).toBe('Network Error');
    });

    it('kuch bhi na mile to fallback deta hai', () => {
        expect(getApiErrorMessage(undefined, 'fallback')).toBe('fallback');
    });
});

describe('isAuthFailure', () => {
    it('401 ko auth failure maanta hai', () => {
        expect(isAuthFailure(axiosError(401, { message: 'Access token is required' }))).toBe(
            true,
        );
    });

    it('purane backend ka 500 + jwt expired bhi auth failure hai', () => {
        expect(isAuthFailure(axiosError(500, { message: 'jwt expired' }))).toBe(true);
        expect(isAuthFailure(axiosError(500, { message: 'invalid token' }))).toBe(true);
    });

    it('baaki 500 auth failure nahi hai', () => {
        expect(isAuthFailure(axiosError(500, { message: 'Cast to ObjectId failed' }))).toBe(
            false,
        );
    });

    it('403 (permission denied) auth failure nahi hai', () => {
        expect(isAuthFailure(axiosError(403, { message: 'CEO only' }))).toBe(false);
    });
});

describe('isAuthEndpoint', () => {
    it('OTP endpoints skip hote hain', () => {
        expect(isAuthEndpoint('/send-otp')).toBe(true);
        expect(isAuthEndpoint('/verify-otp')).toBe(true);
    });

    it('baaki endpoints par token handling chalti hai', () => {
        expect(isAuthEndpoint('/')).toBe(false);
        expect(isAuthEndpoint('/:id/payment')).toBe(false);
    });
});
