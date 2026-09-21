import { showMessage } from 'react-native-flash-message';

import { clearAllStorage } from '../storage/storageManager';
import { clearDraft } from '../draftBookingStore';
import { queryClient } from '../../lib/tanstack/queryClient';
import { store } from '../../store';
import { clearUser } from '../../store/slices/userSlice';
import { resetToLogin } from '../../navigations/navigationRef';

/**
 * Full session wipe — called on logout.
 *
 * Everything that can keep data alive between two sign-ins is dropped here, so
 * the next login always starts clean and each screen fetches fresh from the
 * backend instead of being served from cache:
 *
 *  1. persisted storage (MMKV) — auth flag, token, cached user profile,
 *     custom event types/requirements, dev tool switches, ...
 *  2. in-memory booking draft  — a half filled booking wizard
 *  3. React Query cache        — queryClient.clear() drops all cached queries
 *     and mutations (and cancels in-flight ones) so no stale response can be
 *     re-written after the wipe
 *  4. Redux store              — user goes back to null (initial state)
 */
export const clearSession = (): void => {
    try {
        clearAllStorage();
    } catch (error) {
        console.log('clearSession: storage wipe failed', error);
    }

    try {
        clearDraft();
    } catch (error) {
        console.log('clearSession: draft wipe failed', error);
    }

    try {
        queryClient.clear();
    } catch (error) {
        console.log('clearSession: query cache wipe failed', error);
    }

    store.dispatch(clearUser());
};

let isHandlingUnauthorized = false;

/**
 * Session expire/invalid hone par user ko safely dobara login par bhejta hai.
 *
 * Axios interceptor ise har 401 par call karta hai. Ek saath chalne wali kai
 * requests (jaise list + dashboard) ke liye guard lagaya gaya hai, taake sirf
 * ek hi baar session wipe ho aur ek hi message dikhe.
 */
export const handleUnauthorized = (options?: {
    message?: string;
    description?: string;
    duration?: number;
}): void => {
    if (isHandlingUnauthorized) {
        return;
    }

    isHandlingUnauthorized = true;
    clearSession();

    showMessage({
        message: options?.message ?? 'Session expired',
        description: options?.description ?? 'Please login again to continue.',
        type: 'danger',
        duration: options?.duration ?? 3000,
    });

    // Navigation container mount hone se pehle bhi interceptor chal sakta hai —
    // us case me thodi der baad dobara try karo.
    if (!resetToLogin()) {
        setTimeout(() => resetToLogin(), 700);
    }

    setTimeout(() => {
        isHandlingUnauthorized = false;
    }, 4000);
};

/**
 * Access list se number hat gaya (ya gate ON hone ke baad number list me nahi
 * hai) — session wipe karke login par bhejo, saaf message ke saath.
 */
export const handleAccessRevoked = (): void =>
    handleUnauthorized({
        message: 'Access restricted',
        description:
            'This number is no longer authorised to use the app. Please contact the admin.',
        duration: 5000,
    });

export default clearSession;