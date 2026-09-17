import {
  formatDisplayDate,
  getEndTimeMin,
  isEndTimeValid,
  isLaterDay,
  parseDisplayDate,
  toMinutes,
} from '../src/functions/booking/BookingDateTimeRules';

describe('parseDisplayDate / formatDisplayDate', () => {
  it('round-trips the display format', () => {
    const date = new Date(2026, 8, 17); // 17 Sep 2026

    expect(formatDisplayDate(date)).toBe('17 Sep 2026');
    expect(parseDisplayDate('17 Sep 2026')).toEqual(date);
  });

  it('returns null for values it cannot parse', () => {
    expect(parseDisplayDate('')).toBeNull();
    expect(parseDisplayDate('17/09/2026')).toBeNull();
    expect(parseDisplayDate('17 Foo 2026')).toBeNull();
  });
});

describe('isLaterDay', () => {
  it('detects a later day inside the same month', () => {
    expect(isLaterDay('25 Sep 2026', '17 Sep 2026')).toBe(true);
    expect(isLaterDay('17 Sep 2026', '25 Sep 2026')).toBe(false);
  });

  it('detects a later day across months and years', () => {
    expect(isLaterDay('2 Oct 2026', '30 Sep 2026')).toBe(true);
    expect(isLaterDay('2 Jan 2027', '31 Dec 2026')).toBe(true);
    expect(isLaterDay('10 Sep 2026', '1 Oct 2026')).toBe(false);
  });

  it('is false for the same day or unparseable values', () => {
    expect(isLaterDay('17 Sep 2026', '17 Sep 2026')).toBe(false);
    expect(isLaterDay('', '17 Sep 2026')).toBe(false);
  });
});

describe('toMinutes', () => {
  it('converts valid times and rejects invalid ones', () => {
    expect(toMinutes('00:00')).toBe(0);
    expect(toMinutes('10:30')).toBe(630);
    expect(toMinutes('')).toBe(-1);
    expect(toMinutes('abc')).toBe(-1);
  });
});

describe('getEndTimeMin (More Day regression)', () => {
  // 17 Sep 2026, 14:30 local time.
  const now = new Date(2026, 8, 17, 14, 30);

  it('leaves the end time free when the end date is a later day', () => {
    // The reported bug: start 20 Sep 10:00, end 25 Sep -> an 08:00 end time
    // must be selectable because it belongs to a different day.
    expect(
      getEndTimeMin({
        startDate: '20 Sep 2026',
        startTime: '10:00',
        endDate: '25 Sep 2026',
        now,
      }),
    ).toBeUndefined();
  });

  it('only blocks past times when the multi-day range ends today', () => {
    expect(
      getEndTimeMin({
        startDate: '15 Sep 2026',
        startTime: '10:00',
        endDate: '17 Sep 2026',
        now,
      }),
    ).toBe('14:30');
  });

  it('still enforces "after start time" when both dates are the same day', () => {
    expect(
      getEndTimeMin({
        startDate: '20 Sep 2026',
        startTime: '10:00',
        endDate: '20 Sep 2026',
        now,
      }),
    ).toBe('10:00');
  });

  it('uses the current time for a same-day booking whose start has passed', () => {
    expect(
      getEndTimeMin({
        startDate: '17 Sep 2026',
        startTime: '09:00',
        endDate: '17 Sep 2026',
        now,
      }),
    ).toBe('14:30');
  });

  it('does not restrict anything without a valid start time', () => {
    expect(
      getEndTimeMin({
        startDate: '20 Sep 2026',
        startTime: '',
        endDate: '20 Sep 2026',
        now,
      }),
    ).toBeUndefined();
  });
});

describe('isEndTimeValid', () => {
  it('accepts an earlier clock time on a later end day (More Day)', () => {
    expect(
      isEndTimeValid({
        startDate: '20 Sep 2026',
        startTime: '10:00',
        endDate: '25 Sep 2026',
        endTime: '08:00',
      }),
    ).toBe(true);
  });

  it('rejects an end time that is not after the start time on the same day', () => {
    expect(
      isEndTimeValid({
        startDate: '20 Sep 2026',
        startTime: '10:00',
        endDate: '20 Sep 2026',
        endTime: '08:00',
      }),
    ).toBe(false);

    expect(
      isEndTimeValid({
        startDate: '20 Sep 2026',
        startTime: '10:00',
        endDate: '20 Sep 2026',
        endTime: '11:00',
      }),
    ).toBe(true);
  });

  it('ignores missing times', () => {
    expect(
      isEndTimeValid({
        startDate: '20 Sep 2026',
        startTime: '',
        endDate: '20 Sep 2026',
        endTime: '08:00',
      }),
    ).toBe(true);
  });
});
