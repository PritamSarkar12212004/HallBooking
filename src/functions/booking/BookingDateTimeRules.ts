export const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const monthShortNames = monthNames.map(name => name.slice(0, 3));

const pad2 = (n: number) => n.toString().padStart(2, '0');

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

export const formatDisplayDate = (date: Date) =>
  `${date.getDate()} ${monthShortNames[date.getMonth()]} ${date.getFullYear()}`;

export const isLaterDay = (value: string, reference: string): boolean => {
  const a = parseDisplayDate(value);
  const b = parseDisplayDate(reference);

  if (!a || !b) return false;

  return a.getTime() > b.getTime();
};

export const toMinutes = (time: string): number => {
  if (!time || !/^\d{1,2}:\d{2}$/.test(time)) return -1;

  const [h, m] = time.split(':').map(Number);

  if (Number.isNaN(h) || Number.isNaN(m)) return -1;

  return h * 60 + m;
};

export const toTimeString = (date: Date) =>
  `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;

export const minutesOfDate = (date: Date) =>
  date.getHours() * 60 + date.getMinutes();

export interface EndTimeMinArgs {
  startDate: string;
  startTime: string;
  endDate: string;
  now?: Date;
}

export const getEndTimeMin = ({
  startDate,
  startTime,
  endDate,
  now = new Date(),
}: EndTimeMinArgs): string | undefined => {
  const startMinutes = toMinutes(startTime);

  if (startMinutes < 0) return undefined;

  const today = formatDisplayDate(now);

  if (isLaterDay(endDate, startDate)) {
    return endDate === today ? toTimeString(now) : undefined;
  }

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
