import axios, { AxiosInstance } from 'axios'
import envApi from '../const/api/envApi';
import { handleAccessRevoked, handleUnauthorized } from '../manager/session/sessionManager';
import {
    isAccessDenied,
    isAuthEndpoint,
    isAuthFailure,
} from '../functions/formate/ApiErrorFormate';

/**
 * Har authenticated call par: token expire / invalid ho (401) to session clear
 * karke login screen par bhej do.
 *
 * Pehle koi 401 handling nahi thi — isliye expired token par har screen
 * chup-chaap khali ("No bookings found yet") dikha deti thi jabki data backend
 * me maujood hota tha. OTP endpoints chhod kar, warna galat OTP par bhi logout
 * ho jaata.
 */
export const handleApiResponseError = (error: any): Promise<never> => {
    if (isAccessDenied(error)) {
        // Number access list me nahi (revoke/gate) — re-login se theek nahi
        // hoga, isliye alag message ke saath session clear kar dete hain.
        handleAccessRevoked();
    } else if (isAuthFailure(error) && !isAuthEndpoint(error?.config?.url)) {
        handleUnauthorized();
    }

    return Promise.reject(error);
};

const createApi = (baseURL: string): AxiosInstance => {
    const instance = axios.create({ baseURL });

    instance.interceptors.response.use(
        (response) => response,
        handleApiResponseError,
    );

    return instance;
};

export const apiAuth = createApi(`${envApi.baseUri}${envApi.Auth.root}`)

export const apiBooking = createApi(`${envApi.baseUri}${envApi.Booking.root}`)

export const apiApplicant = createApi(`${envApi.baseUri}${envApi.Applicant.root}`)

export const apiPaymentQr = createApi(`${envApi.baseUri}${envApi.PaymentQr.root}`)

export const apiAnalytics = createApi(`${envApi.baseUri}${envApi.Analytics.root}`)

