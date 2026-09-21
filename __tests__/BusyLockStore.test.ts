import {
  BUSY_LOCK_MAX_MS,
  DEFAULT_BUSY_MESSAGE,
  getBusyMessage,
  getBusyOwners,
  isBusyLocked,
  lockBusy,
  resetBusyLock,
  subscribeBusy,
  unlockBusy,
} from '../src/manager/busyLockStore';

describe('busyLockStore', () => {
  beforeEach(() => {
    resetBusyLock();
  });

  it('starts unlocked', () => {
    expect(isBusyLocked()).toBe(false);
    expect(getBusyMessage()).toBe(DEFAULT_BUSY_MESSAGE);
  });

  it('locks and unlocks with a key', () => {
    lockBusy('main-button', 'Saving…');
    expect(isBusyLocked()).toBe(true);
    expect(getBusyMessage()).toBe('Saving…');

    unlockBusy('main-button');
    expect(isBusyLocked()).toBe(false);
  });

  it('keeps the lock until every owner releases it', () => {
    lockBusy('a', 'A');
    lockBusy('b', 'B');
    expect(getBusyOwners()).toEqual(['a', 'b']);

    unlockBusy('a');
    expect(isBusyLocked()).toBe(true);
    expect(getBusyMessage()).toBe('B');

    unlockBusy('b');
    expect(isBusyLocked()).toBe(false);
  });

  it('is idempotent for unknown and repeated keys', () => {
    unlockBusy('nope');
    expect(isBusyLocked()).toBe(false);

    lockBusy('a');
    lockBusy('a');
    unlockBusy('a');
    unlockBusy('a');
    expect(isBusyLocked()).toBe(false);
  });

  it('falls back to the default message', () => {
    lockBusy('a');
    expect(getBusyMessage()).toBe(DEFAULT_BUSY_MESSAGE);
  });

  it('notifies subscribers on every change', () => {
    const listener = jest.fn();
    const unsubscribe = subscribeBusy(listener);

    lockBusy('a');
    expect(listener).toHaveBeenCalledTimes(1);

    // Same key + same message = koi change nahi, koi notification nahi.
    lockBusy('a');
    expect(listener).toHaveBeenCalledTimes(1);

    // Message badla → notify.
    lockBusy('a', 'Uploading…');
    expect(listener).toHaveBeenCalledTimes(2);

    unlockBusy('a');
    expect(listener).toHaveBeenCalledTimes(3);

    unsubscribe();
    lockBusy('b');
    expect(listener).toHaveBeenCalledTimes(3);
  });

  it('resets every owner', () => {
    lockBusy('a');
    lockBusy('b');
    resetBusyLock();

    expect(isBusyLocked()).toBe(false);
    expect(getBusyOwners()).toEqual([]);
  });

  it('releases a stuck lock after the safety timeout', () => {
    jest.useFakeTimers();

    try {
      lockBusy('hung-request');
      expect(isBusyLocked()).toBe(true);

      jest.advanceTimersByTime(BUSY_LOCK_MAX_MS - 1);
      expect(isBusyLocked()).toBe(true);

      jest.advanceTimersByTime(1);
      expect(isBusyLocked()).toBe(false);
    } finally {
      jest.useRealTimers();
    }
  });

  it('does not fire the safety timeout after a normal unlock', () => {
    jest.useFakeTimers();

    try {
      lockBusy('a');
      unlockBusy('a');

      expect(jest.getTimerCount()).toBe(0);
      jest.advanceTimersByTime(BUSY_LOCK_MAX_MS);
      expect(isBusyLocked()).toBe(false);
    } finally {
      jest.useRealTimers();
    }
  });
});
