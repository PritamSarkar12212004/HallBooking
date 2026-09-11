import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    type ViewStyle,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import tw from 'twrnc';
import { Building2, Calendar as CalendarIcon, Clock3 } from 'lucide-react-native';

import { Theme } from '../../const/theme/Theme';
import Wrapper from '../../layouts/wraper/Wraper';
import SubHeader from '../../components/header/SubHeader';
import { useAppSelector } from '../../hooks/redux/redux';
import useListBookings from '../../api/booking/hooks/useListBookings';
import { bookingListInterface } from '../../interface/api/bookintInterface';
import { formatDate, formatTime } from '../../functions/formate/DateTimeFormate';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Normalize any backend date string into YYYY-MM-DD
const toDateKey = (value: any): string => {
    if (!value) return '';
    const d = new Date(value);
    if (isNaN(d.getTime())) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

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

// Date-based event status shown on each agenda card:
//   past (event end date behind today)  → ENDED
//   today (event day(s) include today)  → TODAY
//   upcoming (event starts later)       → CONFIRMED
const eventStatusOf = (meta: BookingRangeMeta): {
    label: 'ENDED' | 'TODAY' | 'CONFIRMED';
    color: string;
    bg: string;
} => {
    const today = new Date(`${todayKey}T00:00:00`);
    const start = new Date(`${meta.startKey}T00:00:00`);
    const end = new Date(`${meta.endKey}T00:00:00`);

    if (end.getTime() < today.getTime()) {
        return {
            label: 'ENDED',
            color: '#F87171',
            bg: 'rgba(248,113,113,0.14)',
        };
    }
    if (start.getTime() <= today.getTime() && today.getTime() <= end.getTime()) {
        return {
            label: 'TODAY',
            color: '#60A5FA',
            bg: 'rgba(96,165,250,0.14)',
        };
    }
    return {
        label: 'CONFIRMED',
        color: '#34D399',
        bg: 'rgba(52,211,153,0.14)',
    };
};

// Range band styles (start / middle / end / single day)
const BAND_BASE: ViewStyle = {
    position: 'absolute',
    top: 8,
    bottom: 8,
    backgroundColor: Theme.button.primary,
};
const BAND_START: ViewStyle = { ...BAND_BASE, left: 6, borderTopLeftRadius: 10, borderBottomLeftRadius: 10 };
const BAND_MIDDLE: ViewStyle = { ...BAND_BASE, left: 1, right: 1 };
const BAND_END: ViewStyle = { ...BAND_BASE, right: 6, borderTopRightRadius: 10, borderBottomRightRadius: 10 };
const BAND_SINGLE: ViewStyle = { ...BAND_BASE, left: 6, right: 6, borderRadius: 10 };

interface EventsCalendarProps {
    navigation: any;
    title?: string;
}

/**
 * Full-screen calendar shared by the Calendar feature and the CEO Staff
 * Activity tab. Shows every booking on its date(s): multi-day bookings paint
 * a continuous range band on the grid; the agenda below lists event name,
 * hall, time range and — for multi-day events — the full date range.
 */
const EventsCalendar = ({ navigation, title = 'Calendar' }: EventsCalendarProps) => {
    const user = useAppSelector((state) => state.user.user);
    const { bookings, isLoading, isError, refetch } = useListBookings(user?.token);

    const [selectedDate, setSelectedDate] = useState(todayKey);
    const [refreshing, setRefreshing] = useState(false);

    // Heavy Calendar mount deferred until the transition ends (~350ms).
    const [calendarReady, setCalendarReady] = useState(false);
    useEffect(() => {
        const timer = setTimeout(() => setCalendarReady(true), 350);
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
    // 1) Group bookings by day — each entry keeps its range metadata.
    const { eventsByDate, rangeInfo } = useMemo(() => {
        const map: Record<string, { booking: bookingListInterface; meta: BookingRangeMeta }[]> = {};
        const rangeMap: Record<string, { starts: boolean; ends: boolean }> = {};

        (bookings ?? []).forEach((b) => {
            const meta = bookingMeta(b);
            const keys: string[] = [];
            const cur = new Date(`${meta.startKey}T00:00:00`);
            const last = new Date(`${meta.endKey}T00:00:00`);
            while (cur.getTime() <= last.getTime()) {
                keys.push(toDateKey(cur));
                cur.setDate(cur.getDate() + 1);
            }
            const safeKeys = keys.length ? keys : [meta.startKey];

            safeKeys.forEach((key) => {
                (map[key] = map[key] ?? []).push({ booking: b, meta });
            });

            // Multi-day bookings paint a continuous band on the grid.
            if (safeKeys.length > 1) {
                safeKeys.forEach((key, i) => {
                    const info = rangeMap[key] ?? { starts: false, ends: false };
                    if (i === 0) info.starts = true;
                    if (i === safeKeys.length - 1) info.ends = true;
                    rangeMap[key] = info;
                });
            }
        });

        return { eventsByDate: map, rangeInfo: rangeMap };
    }, [bookings]);

    // 2) Agenda list — derived from eventsByDate.
    const agenda = useMemo(() => {
        return Object.keys(eventsByDate)
            .sort((a, b) => a.localeCompare(b))
            .map((key) => {
                const d = new Date(`${key}T00:00:00`);
                return {
                    dateKey: key,
                    dayLabel: DAY_LABELS[d.getDay()],
                    dayNumber: d.getDate(),
                    events: eventsByDate[key],
                };
            });
    }, [eventsByDate]);

    // 3) markedDates — only depends on bookings.
    const markedDates = useMemo(() => {
        const marks: Record<string, any> = {};
        Object.keys(eventsByDate).forEach((key) => {
            marks[key] = { marked: true, dotColor: Theme.button.primary };
        });
        return marks;
    }, [eventsByDate]);

    // 4) Custom day cell with range bands.
    const renderCustomDay = useCallback(
        ({ date }: any) => {
            const key = date?.dateString ?? '';
            const isSelected = key === selectedDate;
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

                    <Text style={[tw`text-lg`, { color: textColor, fontWeight }]}>
                        {date.day}
                    </Text>

                    {isSelected && !inRange && (
                        <View
                            style={[
                                tw`w-6 h-1 rounded-full mt-1`,
                                { backgroundColor: Theme.button.primary },
                            ]}
                        />
                    )}
                    {!isSelected && hasEvents && !inRange && (
                        <View
                            style={[
                                tw`w-1.5 h-1.5 rounded-full mt-1`,
                                { backgroundColor: Theme.button.primary },
                            ]}
                        />
                    )}
                </TouchableOpacity>
            );
        },
        [selectedDate, eventsByDate, rangeInfo],
    );

    return (
        <Wrapper>
            <SubHeader title={""} navigation={navigation} />

            <View
                style={[
                    tw`pt-2 pb-2 shadow-sm`,
                    { backgroundColor: Theme.background.secondary },
                ]}
            >
                {calendarReady ? (
                    <Calendar
                        current={todayKey}
                        hideExtraDays={true}
                        firstDay={0}
                        hideArrows={true}
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
                    <View style={{ height: 340 }} />
                )}
            </View>

            <ScrollView
                style={tw`flex-1 mt-4`}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={tw`pb-8`}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={Theme.button.primary}
                        colors={[Theme.button.primary]}
                    />
                }
            >
                {isLoading ? (
                    <View style={tw`py-12 items-center`}>
                        <ActivityIndicator size="small" color={Theme.button.primary} />
                        <Text style={[tw`text-sm mt-2`, { color: Theme.text.secondary }]}>
                            Loading events…
                        </Text>
                    </View>
                ) : isError ? (
                    <View style={tw`py-12 items-center px-6`}>
                        <Text style={[tw`text-sm`, { color: Theme.text.secondary }]}>
                            Couldn't load events. Pull to refresh.
                        </Text>
                    </View>
                ) : agenda.length === 0 ? (
                    <View style={tw`py-12 items-center px-6`}>
                        <Text style={[tw`text-sm`, { color: Theme.text.secondary }]}>
                            No events scheduled yet.
                        </Text>
                    </View>
                ) : (
                    agenda.map((item) => {
                        const isSel = item.dateKey === selectedDate;
                        return (
                            <TouchableOpacity
                                key={item.dateKey}
                                onPress={() => setSelectedDate(item.dateKey)}
                                style={[
                                    tw`flex-row px-6 py-5 border-b`,
                                    {
                                        borderBottomColor: Theme.border.primary,
                                        borderLeftWidth: isSel ? 2 : 0,
                                        borderLeftColor: Theme.button.primary,
                                    },
                                ]}
                            >
                                <View style={tw`w-14 mr-4`}>
                                    <Text style={[tw`text-3xl font-light`, { color: Theme.button.primary }]}>
                                        {item.dayNumber}
                                    </Text>
                                    <Text style={[tw`text-xs mt-1`, { color: Theme.button.secondary }]}>
                                        {item.dayLabel}
                                    </Text>
                                </View>

                                <View style={tw`flex-1 justify-center`}>
                                    {item.events.map((entry, i) => {
                                        const ev = entry.booking;
                                        const meta = entry.meta;
                                        return (
                                            <View
                                                key={i}
                                                style={[
                                                    tw`p-3 rounded-lg mb-2 shadow-sm`,
                                                    {
                                                        backgroundColor: Theme.background.secondary,
                                                        borderWidth: 1,
                                                        borderColor: Theme.border.primary,
                                                    },
                                                ]}
                                            >
                                                <View style={tw`flex-row items-center justify-between`}>
                                                    <Text style={[tw`flex-1 font-bold`, { color: Theme.text.primary, fontSize: 14 }]} numberOfLines={1}>
                                                        {ev.eventName}
                                                    </Text>
                                                    {(() => {
                                                        const status = eventStatusOf(meta);
                                                        return (
                                                            <View
                                                                style={[
                                                                    tw`px-2 py-0.5 rounded-full`,
                                                                    { backgroundColor: status.bg },
                                                                ]}
                                                            >
                                                                <Text style={[tw`text-[10px] font-bold`, { color: status.color }]}>
                                                                    {status.label}
                                                                </Text>
                                                            </View>
                                                        );
                                                    })()}
                                                </View>

                                                <View style={tw`flex-row items-center mt-0.5`}>
                                                    <Building2 size={12} color={Theme.text.tertiary} />
                                                    <Text style={[tw`text-xs ml-1`, { color: Theme.text.secondary }]}>
                                                        {ev.hallName}
                                                    </Text>
                                                </View>

                                                {/* Time range */}
                                                <View style={tw`flex-row items-center mt-0.5`}>
                                                    <Clock3 size={12} color={Theme.text.tertiary} />
                                                    <Text style={[tw`text-xs ml-1`, { color: Theme.text.secondary }]}>
                                                        {formatTime(meta.startTime)}
                                                        {meta.startTime && meta.endTime && meta.endTime !== meta.startTime
                                                            ? ` – ${formatTime(meta.endTime)}`
                                                            : ''}
                                                    </Text>
                                                </View>

                                                {/* Multi-day: full date range */}
                                                {meta.isMultiDay && (
                                                    <View
                                                        style={[
                                                            tw`self-start flex-row items-center mt-1 px-2 py-0.5 rounded-full`,
                                                            { backgroundColor: Theme.background.third },
                                                        ]}
                                                    >
                                                        <CalendarIcon size={11} color={Theme.button.primary} />
                                                        <Text
                                                            style={[
                                                                tw`text-[10px] ml-1 font-semibold`,
                                                                { color: Theme.button.secondary },
                                                            ]}
                                                        >
                                                            {formatDate(meta.startDate)} → {formatDate(meta.endDate)} · {meta.days} days
                                                        </Text>
                                                    </View>
                                                )}
                                            </View>
                                        );
                                    })}
                                </View>
                            </TouchableOpacity>
                        );
                    })
                )}
            </ScrollView>
        </Wrapper>
    );
};

export default EventsCalendar;
