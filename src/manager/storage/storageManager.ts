import { mmkv } from '../../utils/mmkv';

export const readStorage = ({ key }: { key: string }) => {
    return mmkv.getString(key);
};

export const writeStorage = ({
    key,
    data,
}: {
    key: string;
    data: unknown;
}) => {
    if (typeof data === 'string') {
        mmkv.set(key, data);
    } else {
        mmkv.set(key, JSON.stringify(data));
    }
};

export const removeStorage = ({ key }: { key: string }) => {
    mmkv.remove(key);
};

/**
 * Wipes EVERY key stored inside the app's MMKV instance.
 * Used on logout so a fresh sign-in never reads stale data
 * (old auth flags, token, cached user/profile, custom lists, ...).
 */
export const clearAllStorage = (): void => {
    mmkv.clearAll();
};