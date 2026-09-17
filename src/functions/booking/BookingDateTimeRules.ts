/**
 * Date/time rules shared by the booking range flow (Halls screen).
 *
 * The booking draft keeps dates as display strings ("17 Sep 2026"), so these
 * helpers parse that format back into real dates in order to compare ranges
 * safely, and they keep every "what may the user pick" rule in one place.
 */

export const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

const monthShortNames = monthNames.map((name) => name.slice(0, 3));

const pad2 = (n: number) => n.toString().padStart(2, '0');

/** "17 Sep 2026" -> Date (local midnight). Returns null when not parseable. */
export const parseDisplayDate = (value: string): Date | null => {
    const parts = (value ?? '').trim().split(' ');

    if (parts.length !== 3) return null;

    const day = Number(parts[0]);
    const monthIndex = monthShortNames.indexOf(parts[1]);
    const year = Number(parts[2]);

    if (
        !Number.isInteger(day) ||
        day < 1 ||
        monthIndex < 0 ||
        !Number.isInteger(year)
    ) {
        return null;
    }

    return new Date(year, monthIndex, day);
};

/** Date -> "17 Sep 2026" (the display format used across the booking flow). */
export const formatDisplayDate = (date: Date) =>
    `${date.getDate()} ${monthShortNames[date.getMonth()]} ${date.getFullYear()}`;

/** True when `value` falls on a calendar day later than `reference`. */
export const isLaterDay = (value: string, reference: string): boolean => {
    const a = parseDisplayDate(value);
    const b = parseDisplayDate(reference);

    if (!a || !b) return false;

    return a.getTime() > b.getTime();
};

/** "14:30" -> 870 minutes. Returns -1 for an empty or invalid value. */
export const toMinutes = (time: string): number => {
    if (!time || !/^\d{1,2}:\d{2}$/.test(time)) return -1;

    const [h, m] = time.split(':').map(Number);

    if (Number.isNaN(h) || Number.isNaN(m)) return -1;

    return h * 60 + m;
};

/** A Date's wall-clock time as "HH:MM" (24h). */
export const toTimeString = (date: Date) =>
    `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;

/** A Date's wall-clock time as minutes since midnight. */
export const minutesOfDate = (date: Date) =>
    date.getHours() * 60 + date.getMinutes();

export interface EndTimeMinArgs {
    startDate: string;
    startTime: string;
    endDate: string;
    /** Injected so the rule stays pure/testable; defaults to now. */
    now?: Date;
}

/**
 * Minimum allowed END time for a booking range.
 *
 * - End date is a LATER day than the start date ("More Day") -> the booking
 *   runs past midnight, so the end time may be ANY clock time of that day;
 *   the only limit left is "not in the past" when that day is today.
 * - Same day ("1 Day", or start/end picked on the same date) -> the end time
 *   must stay after the start time, and not in the past when that day is today.
 *
 * Returns undefined when the end time is unrestricted.
 */
export const getEndTimeMin = ({
    startDate,
    startTime,
    endDate,
    now = new Date(),
}: EndTimeMinArgs): string | undefined => {
    const startMinutes = toMinutes(startTime);

    // No (valid) start time yet -> nothing to enforce.
    if (startMinutes < 0) return undefined;

    const today = formatDisplayDate(now);

    // Multi-day range: the end time sits on another day, so an earlier clock
    // time is perfectly valid (e.g. 08:00 after a 10:00 start the day before).
    if (isLaterDay(endDate, startDate)) {
        return endDate === today ? toTimeString(now) : undefined;
    }

    // Same day: never in the past (today) and always after the start time.
    if (endDate === today && startMinutes < minutesOfDate(now)) {
        return toTimeString(now);
    }

    return startTime;
};

export interface EndTimeValidArgs {
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
}

/**
 * False only when start and end sit on the same day and the picked end time is
 * not after the picked start time. A range that spans midnight is always
 * valid, and a missing start/end time is not treated as an error here.
 */
export const isEndTimeValid = ({
    startDate,
    startTime,
    endDate,
    endTime,
}: EndTimeValidArgs): boolean => {
    if (!startTime || !endTime) return true;

    if (isLaterDay(endDate, startDate)) return true;

    const startMinutes = toMinutes(startTime);
    const endMinutes = toMinutes(endTime);

    if (startMinutes < 0 || endMinutes < 0) return true;

    return endMinutes > startMinutes;
};
