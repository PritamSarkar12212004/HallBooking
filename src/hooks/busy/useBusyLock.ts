import { useEffect, useMemo, useState } from 'react';

import {
  DEFAULT_BUSY_MESSAGE,
  getBusyMessage,
  isBusyLocked,
  lockBusy,
  subscribeBusy,
  unlockBusy,
} from '../../manager/busyLockStore';

let autoKey = 0;

/**
 * Jab tak `active` true rahe, app ka navigation lock rahega (full-screen
 * blocking modal). `active` false hote hi — ya screen unmount hone par —
 * lock khud chhoot jaata hai.
 *
 * ```ts
 * useBusyLock(loader, 'Saving… please wait');
 * ```
 */
const useBusyLock = (
  active: boolean,
  message?: string,
  key?: string,
): void => {
  // Ek stable owner key per hook instance (ya caller ki di hui key).
  const ownerKey = useMemo(
    () => key ?? `busy-${(autoKey += 1)}`,
    [key],
  );

  useEffect(() => {
    if (!active) return;

    lockBusy(ownerKey, message);

    return () => unlockBusy(ownerKey);
  }, [active, message, ownerKey]);
};

/** Kya is waqt app locked hai (modal dikhana hai)? */
export const useIsBusyLocked = (): boolean => {
  const [busy, setBusy] = useState(isBusyLocked);

  useEffect(() => subscribeBusy(() => setBusy(isBusyLocked())), []);

  return busy;
};

/** Locked hone par dikhne wala message. */
export const useBusyMessage = (): string => {
  const [message, setMessage] = useState(getBusyMessage);

  useEffect(
    () => subscribeBusy(() => setMessage(getBusyMessage())),
    [],
  );

  return message || DEFAULT_BUSY_MESSAGE;
};

export default useBusyLock;
