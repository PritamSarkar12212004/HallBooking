import type { User } from '../../interface/store/userType';

/**
 * App access role — **backend ki access list** (`backend/src/access/`) se aata
 * hai aur login/OTP ke response me `user.accessRole` ke roop me milta hai.
 *
 * `USER` ka matlab hai number access list me nahi tha (ya gate band tha) —
 * aise user ko normal staff experience milta hai.
 */
export type AccessRole = 'CEO' | 'ADMIN' | 'USER';

/**
 * Fallback CEO numbers — sirf un tokens ke liye jinke paas `accessRole` nahi
 * hai (pehle se logged-in purana session). Naye flow me role backend decide
 * karta hai, isliye yahan kuch add karne ki zaroorat nahi hoti.
 */
export const CEO_PHONES = ['7796419792'];

export const normalizePhone = (phone?: string | null): string =>
    String(phone ?? '').replace(/[^0-9]/g, '').slice(-10);

/** Purana fallback check — sirf phone number par (accessRole na ho tab). */
export const isCeoPhone = (phone?: string | null): boolean => {
    const value = normalizePhone(phone);
    return value.length === 10 && CEO_PHONES.includes(value);
};

/**
 * Logged-in user CEO hai?
 *
 * Pehle **backend ka access role** dekha jaata hai (single source of truth),
 * uske baad DB role, aur sabse aakhir me puh-ka phone fallback — taake purane
 * sessions bhi sahi UI paayen.
 */
export const isCeoUser = (
    user?: Pick<User, 'phone' | 'role' | 'accessRole'> | null,
): boolean => {
    if (!user) {
        return false;
    }

    const accessRole = String(user.accessRole ?? '').trim().toUpperCase();
    if (accessRole) {
        return accessRole === 'CEO';
    }

    const dbRole = String(user.role ?? '').trim().toLowerCase();
    if (dbRole) {
        return dbRole === 'ceo';
    }

    return isCeoPhone(user.phone);
};
