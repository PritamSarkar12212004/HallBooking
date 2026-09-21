jest.mock('../src/manager/session/sessionManager', () => ({
    handleUnauthorized: jest.fn(),
    handleAccessRevoked: jest.fn(),
    clearSession: jest.fn(),
}));

jest.mock('../src/const/api/envApi', () => ({
    __esModule: true,
    default: {
        baseUri: 'http://localhost:3000/api/v1',
        Auth: { root: '/auth' },
        Booking: { root: '/bookings' },
        Applicant: { root: '/applicants' },
        PaymentQr: { root: '/payment-qr' },
        Analytics: { root: '/analytics' },
    },
}));

import { apiBooking, handleApiResponseError } from '../src/utils/api';
import {
    handleAccessRevoked,
    handleUnauthorized,
} from '../src/manager/session/sessionManager';

const mockedHandleUnauthorized = handleUnauthorized as jest.Mock;
const mockedHandleAccessRevoked = handleAccessRevoked as jest.Mock;

const axiosError = (status: number, data: unknown, url = '/') =>
    ({ response: { status, data }, config: { url }, message: 'Request failed' }) as any;

beforeEach(() => {
    mockedHandleUnauthorized.mockClear();
    mockedHandleAccessRevoked.mockClear();
});

describe('handleApiResponseError', () => {
    it('401 par session clear + logout karta hai aur error reject karta hai', async () => {
        const error = axiosError(401, { message: 'Access token is required' });

        mockedHandleUnauthorized.mockClear();
        await expect(handleApiResponseError(error)).rejects.toBe(error);
        expect(mockedHandleUnauthorized).toHaveBeenCalledTimes(1);
    });

    it('purane deployed backend ka 500 "invalid token" bhi logout karata hai', async () => {
        const error = axiosError(500, { message: 'invalid token' });

        mockedHandleUnauthorized.mockClear();
        await expect(handleApiResponseError(error)).rejects.toBe(error);
        expect(mockedHandleUnauthorized).toHaveBeenCalledTimes(1);
    });

    it('OTP endpoint par 401 logout nahi karta', async () => {
        const error = axiosError(401, { message: 'Invalid OTP' }, '/verify-otp');

        mockedHandleUnauthorized.mockClear();
        await expect(handleApiResponseError(error)).rejects.toBe(error);
        expect(mockedHandleUnauthorized).not.toHaveBeenCalled();
    });

    it('normal 500 ya 400 par logout nahi karta', async () => {
        mockedHandleUnauthorized.mockClear();
        await expect(handleApiResponseError(axiosError(500, { message: 'CastError' }))).rejects.toBeDefined();
        await expect(handleApiResponseError(axiosError(400, { message: 'Bad input' }))).rejects.toBeDefined();
        expect(mockedHandleUnauthorized).not.toHaveBeenCalled();
    });

    it('403 ACCESS_DENIED par session clear karke access message dikhata hai', async () => {
        const error = axiosError(403, {
            message: 'This number is not authorised to use this app.',
            code: 'ACCESS_DENIED',
        });

        await expect(handleApiResponseError(error)).rejects.toBe(error);
        expect(mockedHandleAccessRevoked).toHaveBeenCalledTimes(1);
        // Ye session expiry nahi — "session expired" wala flow nahi chalna chahiye.
        expect(mockedHandleUnauthorized).not.toHaveBeenCalled();
    });

    it('baaki 403 (jaise CEO-only) par koi session clear nahi hota', async () => {
        const error = axiosError(403, { message: 'Only the CEO can update the hall payment QR' });

        await expect(handleApiResponseError(error)).rejects.toBe(error);
        expect(mockedHandleAccessRevoked).not.toHaveBeenCalled();
        expect(mockedHandleUnauthorized).not.toHaveBeenCalled();
    });
});

describe('api instances', () => {
    it('booking instance par interceptor laga hua hai', () => {
        expect(apiBooking.interceptors.response).toBeDefined();
        expect(apiBooking.defaults.baseURL).toBe('http://localhost:3000/api/v1/bookings');
    });
});
