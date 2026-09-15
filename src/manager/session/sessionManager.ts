import { clearAllStorage } from '../storage/storageManager';
import { clearDraft } from '../draftBookingStore';
import { queryClient } from '../../lib/tanstack/queryClient';
import { store } from '../../store';
import { clearUser } from '../../store/slices/userSlice';

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

export default clearSession;