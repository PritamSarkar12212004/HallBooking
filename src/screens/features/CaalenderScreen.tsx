import React, { useCallback, useMemo, useState } from 'react';
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

import { Theme } from '../../const/theme/Theme';
import Wrapper from '../../layouts/wraper/Wraper';
import SubHeader from '../../components/header/SubHeader';
import { useAppSelector } from '../../hooks/redux/redux';
import useListBookings from '../../api/booking/hooks/useListBookings';
import { bookingListInterface } from '../../interface/api/bookintInterface';
import { formatTime } from '../../functions/formate/DateTimeFormate';

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

// Enumerate every day key a booking occupies (inclusive range)
const rangeKeysOf = (start: string, end: string): string[] => {
    const startKey = toDateKey(start);
    if (!startKey) return [];
    const endKey = toDateKey(end || start);
    if (!endKey) return [startKey];

    const keys: string[] = [];
    const cur = new Date(`${startKey}T00:00:00`);
    const last = new Date(`${endKey}T00:00:00`);
    if (isNaN(cur.getTime()) || isNaN(last.getTime())) return [startKey];

    while (cur.getTime() <= last.getTime()) {
        keys.push(toDateKey(cur));
        cur.setDate(cur.getDate() + 1);
    }
    return keys.length ? keys : [startKey];
};

const todayKey = toDateKey(new Date());

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

const CaalenderScreen = ({ navigation }: any) => {
    const user = useAppSelector((state) => state.user.user);
    const { bookings, isLoading, isError, refetch } = useListBookings(user?.token);

    const [selectedDate, setSelectedDate] = useState(todayKey);
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await refetch();
        } finally {
            setRefreshing(false);
        }
    }, [refetch]);

    // 1) Group bookings by day — only depends on `bookings`
    const { eventsByDate, rangeInfo } = useMemo(() => {
        const map: Record<string, bookingListInterface[]> = {};
        const rangeMap: Record<string, { starts: boolean; ends: boolean }> = {};

        (bookings ?? []).forEach((b) => {
            const keys = rangeKeysOf(b.startDate, b.endDate ?? '');
            keys.forEach((key) => {
                (map[key] = map[key] ?? []).push(b);
            });

            // Multi-day bookings paint a continuous band
            if (keys.length > 1) {
                keys.forEach((key, i) => {
                    const info = rangeMap[key] ?? { starts: false, ends: false };
                    if (i === 0) info.starts = true;
                    if (i === keys.length - 1) info.ends = true;
                    rangeMap[key] = info;
                });
            }
        });

        return { eventsByDate: map, rangeInfo: rangeMap };
    }, [bookings]);

    // 2) Agenda list — derived from eventsByDate
    const agenda = useMemo(() => {
        return Object.keys(eventsByDate)
            .sort((a, b) => a.localeCompare(b))
            .map((key) => {
                const d = new Date(`${key}T00:00:00`);
                return {
                    dateKey: key,
                    dayLabel: DAY_LABELS[d.getDay()],
                    events: eventsByDate[key],
                };
            });
    }, [eventsByDate]);

    // 3) markedDates — only depends on bookings (NOT selectedDate)
    const markedDates = useMemo(() => {
        const marks: Record<string, any> = {};
        Object.keys(eventsByDate).forEach((key) => {
            marks[key] = { marked: true, dotColor: Theme.button.primary };
        });
        return marks;
    }, [eventsByDate]);

    // 4) Custom day cell
    const renderCustomDay = useCallback(
        ({ date }: any) => {
            const key = date?.dateString ?? '';
            const isSelected = key === selectedDate;
            const hasEvents = (eventsByDate[key]?.length ?? 0) > 0;
            const rInfo = rangeInfo[key];
            const inRange = !!rInfo;
            const isStart = rInfo?.starts ?? false;
            const isEnd = rInfo?.ends ?? false;

            // Pick band style
            let bandStyle = BAND_MIDDLE;
            if (isStart && isEnd) bandStyle = BAND_SINGLE;
            else if (isStart) bandStyle = BAND_START;
            else if (isEnd) bandStyle = BAND_END;

            // Dynamic text color via style array (twrnc-safe)
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
            <SubHeader title="Calendar" navigation={navigation} />

            <View
                style={[
                    tw`pt-2 pb-2 shadow-sm`,
                    { backgroundColor: Theme.background.secondary },
                ]}
            >
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
                                    tw`flex-row px-6 py-5`,
                                    {
                                        borderBottomWidth: 1,
                                        borderBottomColor: Theme.border.primary,
                                    },
                                    isSel && {
                                        borderLeftWidth: 2,
                                        borderLeftColor: Theme.button.primary,
                                    },
                                ]}
                            >
                                <View style={tw`w-14 mr-4`}>
                                    <Text
                                        style={[
                                            tw`text-3xl font-light`,
                                            { color: Theme.button.primary },
                                        ]}
                                    >
                                        {new Date(`${item.dateKey}T00:00:00`).getDate()}
                                    </Text>
                                    <Text
                                        style={[
                                            tw`text-xs mt-1`,
                                            { color: Theme.button.secondary },
                                        ]}
                                    >
                                        {item.dayLabel}
                                    </Text>
                                </View>

                                <View style={tw`flex-1 justify-center`}>
                                    {item.events.map((ev, i) => (
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
                                            <Text
                                                style={[
                                                    tw`font-bold`,
                                                    { color: Theme.text.primary },
                                                ]}
                                            >
                                                {ev.eventName}
                                            </Text>
                                            <Text
                                                style={[
                                                    tw`text-xs mt-0.5`,
                                                    { color: Theme.text.secondary },
                                                ]}
                                            >
                                                {ev.hallName}
                                            </Text>
                                            <Text
                                                style={[
                                                    tw`text-xs mt-0.5`,
                                                    { color: Theme.text.tertiary },
                                                ]}
                                            >
                                                {formatTime(ev.startTime)}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </TouchableOpacity>
                        );
                    })
                )}
            </ScrollView>
        </Wrapper>
    );
};

export default CaalenderScreen;