import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshControl, StyleSheet, type ViewStyle } from 'react-native';
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from '../../lib/style/withTailwind';
import { Calendar } from 'react-native-calendars';
import tw from 'twrnc';
import FastImage, { ImageStyle } from 'react-native-fast-image';
import {
    Building2,
    Calendar as CalendarIcon,
    CalendarCheck,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Clock3,
    PartyPopper,
    RefreshCw,
    TriangleAlert,
    UserRound,
} from 'lucide-react-native';

import Wrapper from '../../layouts/wraper/Wraper';
import MainDerder from '../../components/header/MainDerder';
import { Theme } from '../../const/theme/Theme';
import { MainRoute } from '../../const/routes/route';
import { useAppSelector } from '../../hooks/redux/redux';
import useListBookings from '../../api/booking/hooks/useListBookings';
import { bookingListInterface } from '../../interface/api/bookintInterface';
import { formatCompactINR } from '../../functions/formate/CurrencyFormate';
import { formatDate, formatTime } from '../../functions/formate/DateTimeFormate';
import { num } from '../../functions/booking/BookingDetailFunction';

const STATUS_COLORS = {
    today: { color: '#60A5FA', bg: 'rgba(96,165,250,0.14)' },
    upcoming: { color: '#34D399', bg: 'rgba(52,211,153,0.14)' },
    ended: { color: '#A0A0A8', bg: 'rgba(160,160,168,0.14)' },
    cancelled: { color: '#F87171', bg: 'rgba(248,113,113,0.14)' },
} as const;

/** Normalize any backend date string into YYYY-MM-DD */
const toDateKey = (value: any): string => {
    if (!value) return '';
    const d = new Date(value);
    if (isNaN(d.getTime())) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

const pad = (value: number): string => String(value).padStart(2, '0');

// Range metadata for one booking — how many days it spans, start/end.
interface BookingRangeMeta {
    startKey: string;
    endKey: string;
    days: number;
    isMultiDay: boolean;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
}

const bookingMeta = (b: bookingListInterface): BookingRangeMeta => {
    const startKey = toDateKey(b.startDate);
    const endKeyRaw = toDateKey(b.endDate || b.startDate);
    const endKey = endKeyRaw >= startKey ? endKeyRaw : startKey;

    let days = 1;
    const a = new Date(`${startKey}T00:00:00`);
    const z = new Date(`${endKey}T00:00:00`);
    if (!isNaN(a.getTime()) && !isNaN(z.getTime())) {
        days = Math.max(1, Math.round((z.getTime() - a.getTime()) / 86400000) + 1);
    }

    return {
        startKey,
        endKey,
        days,
        isMultiDay: days > 1,
        startDate: b.startDate,
        endDate: b.endDate || b.startDate,
        startTime: b.startTime || '',
        endTime: b.endTime || '',
    };
};

const todayKey = toDateKey(new Date());

/** Date-based bucket — cancelled sabse pehle (wo date se decide nahi hota). */
type Bucket = 'today' | 'upcoming' | 'ended' | 'cancelled';

const bucketOf = (booking: bookingListInterface, meta: BookingRangeMeta): Bucket => {
    if (booking.status === 'Cancelled') return 'cancelled';
    if (meta.startKey <= todayKey && meta.endKey >= todayKey) return 'today';
    if (meta.startKey > todayKey) return 'upcoming';
    return 'ended';
};

const bucketLabel = (bucket: Bucket): string => {
    switch (bucket) {
        case 'today':
            return 'TODAY';
        case 'upcoming':
            return 'UPCOMING';
        case 'cancelled':
            return 'CANCELLED';
        case 'ended':
        default:
            return 'ENDED';
    }
};

// Range band styles (start / middle / end / single day)
const BAND_BASE: ViewStyle = {
    position: 'absolute',
    top: 8,
    bottom: 8,
    backgroundColor: Theme.button.primary,
};
const BAND_START: ViewStyle = {
    ...BAND_BASE,
    left: 6,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
};
const BAND_MIDDLE: ViewStyle = { ...BAND_BASE, left: 1, right: 1 };
const BAND_END: ViewStyle = {
    ...BAND_BASE,
    right: 6,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
};
const BAND_SINGLE: ViewStyle = { ...BAND_BASE, left: 6, right: 6, borderRadius: 10 };

type FilterKey = 'all' | Bucket;

const FILTERS: { key: FilterKey; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'today', label: 'Today' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'ended', label: 'Ended' },
    { key: 'cancelled', label: 'Cancelled' },
];

const cardStyle = {
    backgroundColor: Theme.background.secondary,
    borderWidth: 1,
    borderColor: Theme.border.primary,
};

const dayHeaderLabel = (key: string): string => {
    const date = new Date(`${key}T00:00:00`);
    if (isNaN(date.getTime())) return key;
    return date.toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
    });
};

const monthLabelOf = (key: string): string => {
    const date = new Date(`${key}T00:00:00`);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
};

/** Calendar ke upar ka chhota stat card. */
const StatTile = ({
    label,
    value,
    Icon,
    tint,
}: {
    label: string;
    value: string;
    Icon: any;
    tint: string;
}) => (
    <View
        className="flex-1 rounded-2xl p-3 mb-3"
        style={{
            backgroundColor: Theme.background.secondary,
            borderWidth: 1,
            borderColor: Theme.border.primary,
        }}
    >
        <View
            className="w-8 h-8 rounded-lg items-center justify-center"
            style={{ backgroundColor: `${tint}22` }}
        >
            <Icon size={14} color={tint} />
        </View>
        <Text className="text-[10px] mt-2" style={{ color: Theme.text.secondary }}>
            {label}
        </Text>
        <Text className="text-[15px] font-extrabold text-white mt-0.5">{value}</Text>
    </View>
);

/** Ek event card — image + hall + time + customer + amount. */
const EventCard = React.memo(
    ({
        booking,
        meta,
        bucket,
        onPress,
    }: {
        booking: bookingListInterface;
        meta: BookingRangeMeta;
        bucket: Bucket;
        onPress: () => void;
    }) => {
        const status = STATUS_COLORS[bucket];
        const time =
            meta.startTime && meta.endTime && meta.endTime !== meta.startTime
                ? `${formatTime(meta.startTime)} – ${formatTime(meta.endTime)}`
                : formatTime(meta.startTime);

        return (
            <TouchableOpacity
                activeOpacity={0.85}
                onPress={onPress}
                className="rounded-2xl p-3 mb-2.5 flex-row"
                style={cardStyle}
            >
                {/* Event image */}
                <View
                    className="rounded-xl overflow-hidden"
                    style={{
                        width: 66,
                        height: 66,
                        backgroundColor: Theme.background.third,
                    }}
                >
                    {booking.eventImage ? (
                        <FastImage
                            source={{
                                uri: booking.eventImage,
                                priority: FastImage.priority.normal,
                            }}
                            resizeMode={FastImage.resizeMode.cover}
                            // FastImage ke typings RN 0.87 par layout props
                            // expose nahi karte — absoluteFill wrapper bharta hai.
                            style={StyleSheet.absoluteFill as ImageStyle}
                        />
                    ) : (
                        <View className="flex-1 items-center justify-center">
                            <CalendarDays size={20} color={Theme.text.tertiary} />
                        </View>
                    )}
                </View>

                <View className="flex-1 pl-3">
                    <View className="flex-row items-center">
                        <Text
                            className="text-[13.5px] font-bold text-white flex-shrink"
                            numberOfLines={1}
                        >
                            {booking.eventName || 'Untitled Event'}
                        </Text>
                        <View
                            className="px-2 py-0.5 rounded-full ml-2"
                            style={{ backgroundColor: status.bg }}
                        >
                            <Text
                                className="text-[8.5px] font-bold"
                                style={{ color: status.color }}
                            >
                                {bucketLabel(bucket)}
                            </Text>
                        </View>
                    </View>

                    <View className="flex-row items-center mt-1">
                        <Building2 size={11} color={Theme.text.tertiary} />
                        <Text
                            className="text-[11px] ml-1 flex-1"
                            style={{ color: Theme.text.secondary }}
                            numberOfLines={1}
                        >
                            {booking.hallName || 'Hall not set'}
                            {booking.eventType ? ` · ${booking.eventType}` : ''}
                        </Text>
                    </View>

                    {time ? (
                        <View className="flex-row items-center mt-0.5">
                            <Clock3 size={11} color={Theme.text.tertiary} />
                            <Text
                                className="text-[11px] ml-1"
                                style={{ color: Theme.text.secondary }}
                                numberOfLines={1}
                            >
                                {time}
                            </Text>
                        </View>
                    ) : null}

                    {booking.applicantName ? (
                        <View className="flex-row items-center mt-0.5">
                            <UserRound size={11} color={Theme.text.tertiary} />
                            <Text
                                className="text-[10.5px] ml-1 flex-1"
                                style={{ color: Theme.text.tertiary }}
                                numberOfLines={1}
                            >
                                {booking.applicantName}
                                {booking.takenBy ? ` · by ${booking.takenBy}` : ''}
                            </Text>
                        </View>
                    ) : null}

                    {meta.isMultiDay ? (
                        <View
                            className="self-start flex-row items-center mt-1.5 px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: Theme.background.third }}
                        >
                            <CalendarIcon size={10} color={Theme.button.primary} />
                            <Text
                                className="text-[9.5px] ml-1 font-semibold"
                                style={{ color: Theme.button.primary }}
                            >
                                {formatDate(meta.startDate)} → {formatDate(meta.endDate)} ·{' '}
                                {meta.days} days
                            </Text>
                        </View>
                    ) : null}
                </View>

                <View className="items-end justify-center pl-2">
                    <Text className="text-[12.5px] font-extrabold text-white">
                        {formatCompactINR(num(booking.totalAmount))}
                    </Text>
                    <Text
                        className="text-[9.5px] mt-0.5"
                        style={{
                            color:
                                (booking.balanceAmount || 0) > 0
                                    ? '#F87171'
                                    : '#34D399',
                        }}
                    >
                        {(booking.balanceAmount || 0) > 0
                            ? `${formatCompactINR(num(booking.balanceAmount))} due`
                            : 'Fully paid'}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    },
);

EventCard.displayName = 'EventCard';

/**
 * Staff Activity calendar.
 *
 * Ek hi jagah: mahine ka overview (kitne events, kitne din booked), range band
 * calendar (multi-day bookings continuous band me), status filters, aur chune
 * gaye din ke events — image, hall, time, customer aur payment status ke saath.
 * Kisi bhi event par tap karne se Booking Details khulti hai.
 */
const EventsCalendar = ({ navigation, title }: { navigation: any; title?: string }) => {
    const user = useAppSelector((state) => state.user.user);
    const { bookings, isLoading, isError, refetch } = useListBookings(user?.token);

    const [selectedDate, setSelectedDate] = useState(todayKey);
    const [currentMonth, setCurrentMonth] = useState(`${todayKey.slice(0, 7)}-01`);
    const [filter, setFilter] = useState<FilterKey>('all');
    const [refreshing, setRefreshing] = useState(false);

    // Heavy Calendar mount is deferred until the screen transition ends.
    const [calendarReady, setCalendarReady] = useState(false);
    useEffect(() => {
        const timer = setTimeout(() => setCalendarReady(true), 250);
        return () => clearTimeout(timer);
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await refetch();
        } finally {
            setRefreshing(false);
        }
    }, [refetch]);

    const openBooking = useCallback(
        (id: string) => navigation.navigate(MainRoute.BookingDetail, { id }),
        [navigation],
    );

    // 1) Har booking ka range meta + bucket (status filter isi par lagta hai).
    const entries = useMemo(
        () =>
            (bookings ?? []).map((booking) => {
                const meta = bookingMeta(booking);
                return { booking, meta, bucket: bucketOf(booking, meta) };
            }),
        [bookings],
    );

    const filtered = useMemo(
        () => (filter === 'all' ? entries : entries.filter((e) => e.bucket === filter)),
        [entries, filter],
    );

    // 2) Day-wise grouping — multi-day bookings ke continuous band ke saath.
    const { eventsByDate, rangeInfo } = useMemo(() => {
        const map: Record<
            string,
            { booking: bookingListInterface; meta: BookingRangeMeta; bucket: Bucket }[]
        > = {};
        const rangeMap: Record<string, { starts: boolean; ends: boolean }> = {};

        filtered.forEach((entry) => {
            const keys: string[] = [];
            const cur = new Date(`${entry.meta.startKey}T00:00:00`);
            const last = new Date(`${entry.meta.endKey}T00:00:00`);
            while (cur.getTime() <= last.getTime()) {
                keys.push(toDateKey(cur));
                cur.setDate(cur.getDate() + 1);
            }
            const safeKeys = keys.length ? keys : [entry.meta.startKey];

            safeKeys.forEach((key) => {
                (map[key] = map[key] ?? []).push(entry);
            });

            if (safeKeys.length > 1) {
                safeKeys.forEach((key, index) => {
                    const info = rangeMap[key] ?? { starts: false, ends: false };
                    if (index === 0) info.starts = true;
                    if (index === safeKeys.length - 1) info.ends = true;
                    rangeMap[key] = info;
                });
            }
        });

        return { eventsByDate: map, rangeInfo: rangeMap };
    }, [filtered]);

    const markedDates = useMemo(() => {
        const marks: Record<string, any> = {};
        Object.keys(eventsByDate).forEach((key) => {
            marks[key] = { marked: true, dotColor: Theme.button.primary };
        });
        return marks;
    }, [eventsByDate]);

    // 3) Stats — month ke events, booked days, today aur upcoming.
    const stats = useMemo(() => {
        const monthPrefix = currentMonth.slice(0, 7);
        const monthEntries = entries.filter((entry) =>
            entry.meta.startKey.startsWith(monthPrefix),
        );
        const bookedDays = new Set(
            Object.keys(eventsByDate).filter((key) => key.startsWith(monthPrefix)),
        );
        const daysInMonth = new Date(
            Number(currentMonth.slice(0, 4)),
            Number(currentMonth.slice(5, 7)),
            0,
        ).getDate();

        return {
            todayCount: entries.filter((entry) => entry.bucket === 'today').length,
            monthCount: monthEntries.length,
            bookedDays: bookedDays.size,
            utilization: Math.round((bookedDays.size / Math.max(1, daysInMonth)) * 100),
            upcomingCount: entries.filter((entry) => entry.bucket === 'upcoming').length,
        };
    }, [entries, eventsByDate, currentMonth]);

    const dayEvents = eventsByDate[selectedDate] ?? [];

    const nextUpcoming = useMemo(() => {
        const upcoming = entries
            .filter((entry) => entry.bucket === 'upcoming')
            .sort((a, b) => a.meta.startKey.localeCompare(b.meta.startKey))[0];
        return upcoming ?? null;
    }, [entries]);

    const shiftMonth = useCallback(
        (delta: number) => {
            const date = new Date(`${currentMonth}T00:00:00`);
            if (isNaN(date.getTime())) return;
            date.setMonth(date.getMonth() + delta);
            setCurrentMonth(`${date.getFullYear()}-${pad(date.getMonth() + 1)}-01`);
        },
        [currentMonth],
    );

    const renderCustomDay = useCallback(
        ({ date }: any) => {
            const key = date?.dateString ?? '';
            const isSelected = key === selectedDate;
            const isToday = key === todayKey;
            const hasEvents = (eventsByDate[key]?.length ?? 0) > 0;
            const rInfo = rangeInfo[key];
            const inRange = !!rInfo;
            const isStart = rInfo?.starts ?? false;
            const isEnd = rInfo?.ends ?? false;

            let bandStyle = BAND_MIDDLE;
            if (isStart && isEnd) bandStyle = BAND_SINGLE;
            else if (isStart) bandStyle = BAND_START;
            else if (isEnd) bandStyle = BAND_END;

            const textColor = inRange
                ? Theme.background.primary
                : isSelected
                  ? Theme.button.primary
                  : Theme.text.secondary;
            const fontWeight = inRange || isSelected ? '600' : '400';

            return (
                <TouchableOpacity
                    onPress={() => setSelectedDate(key)}
                    style={tw`self-stretch items-center justify-center h-12`}
                    activeOpacity={0.7}
                >
                    {inRange && <View style={bandStyle} />}

                    <View
                        style={[
                            tw`w-8 h-8 rounded-full items-center justify-center`,
                            isToday && !inRange
                                ? { borderWidth: 1, borderColor: Theme.button.primary }
                                : null,
                        ]}
                    >
                        <Text style={[tw`text-lg`, { color: textColor, fontWeight }]}>
                            {date.day}
                        </Text>
                    </View>

                    {isSelected && !inRange ? (
                        <View
                            style={[
                                tw`w-6 h-1 rounded-full mt-0.5`,
                                { backgroundColor: Theme.button.primary },
                            ]}
                        />
                    ) : null}
                    {!isSelected && hasEvents && !inRange ? (
                        <View
                            style={[
                                tw`w-1.5 h-1.5 rounded-full mt-0.5`,
                                { backgroundColor: Theme.button.primary },
                            ]}
                        />
                    ) : null}
                </TouchableOpacity>
            );
        },
        [selectedDate, eventsByDate, rangeInfo],
    );

    return (
        <Wrapper>
            <MainDerder
                navigation={navigation}
                title={title ?? 'Events'}
                right={
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={onRefresh}
                        className="w-9 h-9 rounded-xl items-center justify-center"
                        style={cardStyle}
                    >
                        <RefreshCw size={15} color={Theme.button.primary} />
                    </TouchableOpacity>
                }
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 28 }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={Theme.button.primary}
                        colors={[Theme.button.primary]}
                    />
                }
            >
                {/* Stats */}
                <View className="flex-row gap-3">
                    <StatTile
                        label="Today"
                        value={String(stats.todayCount)}
                        Icon={CalendarCheck}
                        tint="#60A5FA"
                    />
                    <StatTile
                        label="This month"
                        value={String(stats.monthCount)}
                        Icon={CalendarDays}
                        tint="#D4AF37"
                    />
                </View>
                <View className="flex-row gap-3">
                    <StatTile
                        label="Booked days"
                        value={`${stats.bookedDays} · ${stats.utilization}%`}
                        Icon={CalendarIcon}
                        tint="#34D399"
                    />
                    <StatTile
                        label="Upcoming"
                        value={String(stats.upcomingCount)}
                        Icon={Clock3}
                        tint="#A78BFA"
                    />
                </View>

                {/* Calendar */}
                <View className="rounded-2xl mt-1 mb-4 overflow-hidden" style={cardStyle}>
                    <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
                        <Text className="text-[15px] font-extrabold text-white">
                            {monthLabelOf(currentMonth)}
                        </Text>
                        <View className="flex-row items-center gap-2">
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={() => setCurrentMonth(`${todayKey.slice(0, 7)}-01`)}
                                className="px-2.5 py-1.5 rounded-lg"
                                style={{ backgroundColor: Theme.background.primary }}
                            >
                                <Text
                                    className="text-[11px] font-bold"
                                    style={{ color: Theme.button.primary }}
                                >
                                    Today
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={() => shiftMonth(-1)}
                                className="w-8 h-8 rounded-lg items-center justify-center"
                                style={{ backgroundColor: Theme.background.primary }}
                            >
                                <ChevronLeft size={15} color={Theme.text.secondary} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={() => shiftMonth(1)}
                                className="w-8 h-8 rounded-lg items-center justify-center"
                                style={{ backgroundColor: Theme.background.primary }}
                            >
                                <ChevronRight size={15} color={Theme.text.secondary} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {calendarReady ? (
                        <Calendar
                            current={currentMonth}
                            onMonthChange={(month: any) =>
                                setCurrentMonth(
                                    `${month.year}-${pad(month.month)}-01`,
                                )
                            }
                            enableSwipeMonths
                            hideExtraDays
                            firstDay={0}
                            hideArrows
                            hideDayNames={false}
                            showWeekNumbers={false}
                            dayComponent={renderCustomDay}
                            markedDates={markedDates}
                            theme={{
                                calendarBackground: Theme.background.secondary,
                                textSectionTitleColor: Theme.text.tertiary,
                                dayTextColor: Theme.text.secondary,
                                textDisabledColor: Theme.text.tertiary,
                                selectedDayBackgroundColor: Theme.button.primary,
                                selectedDayTextColor: Theme.background.primary,
                                todayTextColor: Theme.button.primary,
                                arrowColor: Theme.button.primary,
                                textDayFontSize: 12,
                                textDayHeaderFontSize: 12,
                            }}
                            style={{ backgroundColor: Theme.background.secondary }}
                        />
                    ) : (
                        <View style={{ height: 320 }} />
                    )}

                    {/* Legend */}
                    <View className="flex-row items-center px-4 pt-2 pb-4">
                        <View
                            style={[
                                tw`w-5 h-2 rounded-full`,
                                { backgroundColor: Theme.button.primary },
                            ]}
                        />
                        <Text
                            className="text-[10px] ml-2"
                            style={{ color: Theme.text.tertiary }}
                        >
                            Multi-day booking (continuous band)
                        </Text>
                    </View>
                </View>

                {/* Status filters */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 8, paddingBottom: 14 }}
                >
                    {FILTERS.map((item) => {
                        const active = item.key === filter;
                        const count =
                            item.key === 'all'
                                ? entries.length
                                : entries.filter((entry) => entry.bucket === item.key).length;
                        return (
                            <TouchableOpacity
                                key={item.key}
                                activeOpacity={0.85}
                                onPress={() => setFilter(item.key)}
                                className="px-3.5 py-2 rounded-full flex-row items-center"
                                style={{
                                    backgroundColor: active
                                        ? Theme.button.primary
                                        : Theme.background.secondary,
                                    borderWidth: 1,
                                    borderColor: active
                                        ? Theme.button.primary
                                        : Theme.border.primary,
                                }}
                            >
                                <Text
                                    className="text-[11.5px] font-bold"
                                    style={{
                                        color: active
                                            ? Theme.background.primary
                                            : Theme.text.secondary,
                                    }}
                                >
                                    {item.label}
                                </Text>
                                <Text
                                    className="text-[10px] ml-1.5 font-bold"
                                    style={{
                                        color: active
                                            ? Theme.background.primary
                                            : Theme.text.tertiary,
                                    }}
                                >
                                    {count}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                {/* Selected day */}
                <View className="flex-row items-end justify-between mb-3">
                    <View>
                        <Text className="text-[15px] font-extrabold text-white">
                            {dayHeaderLabel(selectedDate)}
                        </Text>
                        <Text
                            className="text-[11px] mt-0.5"
                            style={{ color: Theme.text.secondary }}
                        >
                            {dayEvents.length
                                ? `${dayEvents.length} event(s)`
                                : 'No events on this day'}
                        </Text>
                    </View>
                    {selectedDate !== todayKey ? (
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => {
                                setSelectedDate(todayKey);
                                setCurrentMonth(`${todayKey.slice(0, 7)}-01`);
                            }}
                        >
                            <Text
                                className="text-[11.5px] font-bold"
                                style={{ color: Theme.button.primary }}
                            >
                                Back to today
                            </Text>
                        </TouchableOpacity>
                    ) : null}
                </View>

                {isLoading ? (
                    <View className="py-14 items-center">
                        <ActivityIndicator size="small" color={Theme.button.primary} />
                        <Text
                            className="text-[12px] mt-2"
                            style={{ color: Theme.text.secondary }}
                        >
                            Loading events…
                        </Text>
                    </View>
                ) : isError ? (
                    <View className="py-14 items-center px-6">
                        <TriangleAlert size={24} color="#F87171" />
                        <Text
                            className="text-[12px] mt-2 text-center"
                            style={{ color: Theme.text.secondary }}
                        >
                            Could not load events. Pull down to try again.
                        </Text>
                    </View>
                ) : dayEvents.length ? (
                    dayEvents.map((entry) => (
                        <EventCard
                            key={entry.booking.id}
                            booking={entry.booking}
                            meta={entry.meta}
                            bucket={entry.bucket}
                            onPress={() => openBooking(entry.booking.id)}
                        />
                    ))
                ) : (
                    <View
                        className="rounded-2xl p-5 items-center"
                        style={cardStyle}
                    >
                        <View
                            className="w-12 h-12 rounded-2xl items-center justify-center mb-3"
                            style={{ backgroundColor: 'rgba(52,211,153,0.14)' }}
                        >
                            <PartyPopper size={22} color="#34D399" />
                        </View>
                        <Text className="text-[13px] font-bold text-white">
                            No events on this day
                        </Text>
                        {nextUpcoming ? (
                            <TouchableOpacity
                                activeOpacity={0.85}
                                onPress={() => {
                                    setSelectedDate(nextUpcoming.meta.startKey);
                                    setCurrentMonth(
                                        `${nextUpcoming.meta.startKey.slice(0, 7)}-01`,
                                    );
                                }}
                                className="mt-2"
                            >
                                <Text
                                    className="text-[11.5px] text-center"
                                    style={{ color: Theme.button.primary }}
                                >
                                    Next: {nextUpcoming.booking.eventName || 'Event'} on{' '}
                                    {formatDate(nextUpcoming.meta.startDate)}
                                </Text>
                            </TouchableOpacity>
                        ) : (
                            <Text
                                className="text-[11.5px] mt-1 text-center"
                                style={{ color: Theme.text.tertiary }}
                            >
                                New bookings will show up here.
                            </Text>
                        )}
                    </View>
                )}
            </ScrollView>
        </Wrapper>
    );
};

export default EventsCalendar;
