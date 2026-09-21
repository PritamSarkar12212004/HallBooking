/**
 * Busy lock — jab tak koi async kaam (save/upload/booking create) chal raha ho
 * tab tak app ka navigation lock rakhne ke liye.
 *
 * Kaam keyed ("owner") hota hai, isliye ek hi waqt me kai loaders (jaise
 * MainButton + screen ka apna upload) lock laga sakte hain aur har owner apna
 * lock tabhi chhodta hai jab uska kaam khatam ho. Isse ek loader ke khatam
 * hone par doosre ka lock galti se hat jaane wali problem nahi hoti.
 *
 * Store pure hai (koi React/native import nahi) — UI `BusyLockModal` isko
 * subscribe karke full-screen blocking modal dikhata hai.
 */

export const DEFAULT_BUSY_MESSAGE = 'Please wait…';

/**
 * Safety: agar koi request hang ho jaaye to lock hamesha ke liye na atke —
 * itni der baad modal apne aap hat jaata hai (user phir se navigate kar sakta
 * hai; us waqt tak ka save backend par already fail ho chuka hota hai).
 */
export const BUSY_LOCK_MAX_MS = 60_000;

/** owner key -> us owner ka message. */
let owners = new Map<string, string>();

let safetyTimer: ReturnType<typeof setTimeout> | null = null;

const listeners = new Set<() => void>();

const clearSafetyTimer = (): void => {
  if (safetyTimer) {
    clearTimeout(safetyTimer);
    safetyTimer = null;
  }
};

const armSafetyTimer = (): void => {
  if (safetyTimer) return;

  safetyTimer = setTimeout(() => {
    safetyTimer = null;
    resetBusyLock();
  }, BUSY_LOCK_MAX_MS);
};

const emit = (): void => {
  listeners.forEach((listener) => listener());
};

export const subscribeBusy = (listener: () => void): (() => void) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};

/** Lock lo (ya message update karo) — wahi key dobara dene par safe hai. */
export const lockBusy = (key: string, message?: string): void => {
  const next = (message ?? '').trim() || DEFAULT_BUSY_MESSAGE;

  if (owners.get(key) === next) return;

  owners.set(key, next);
  armSafetyTimer();
  emit();
};

/** Lock chhodo. Jo key nahi thi us par kuch nahi hota (idempotent). */
export const unlockBusy = (key: string): void => {
  if (!owners.delete(key)) return;

  if (owners.size === 0) {
    clearSafetyTimer();
  }

  emit();
};

export const isBusyLocked = (): boolean => owners.size > 0;

/** Sabse pehle lage lock ka message (jab tak kuch locked hai). */
export const getBusyMessage = (): string =>
  owners.values().next().value ?? DEFAULT_BUSY_MESSAGE;

/** Tests / safety: saare lock hata do. */
export const resetBusyLock = (): void => {
  clearSafetyTimer();

  if (owners.size === 0) return;

  owners = new Map();
  emit();
};

export const getBusyOwners = (): string[] => Array.from(owners.keys());
