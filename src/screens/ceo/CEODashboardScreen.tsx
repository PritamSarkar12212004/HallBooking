import React, { useCallback, useEffect, useState } from 'react';
import { Dimensions } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from '../../lib/style/withTailwind';
import {
    BadgeIndianRupee,
    CalendarCheck,
    CalendarDays,
    ChevronRight,
    RefreshCw,
    TriangleAlert,
    UserRound,
    Wallet2,
} from 'lucide-react-native';

import Wrapper from '../../layouts/wraper/Wraper';
import MainDerder from '../../components/header/MainDerder';
import { Theme } from '../../const/theme/Theme';
import { MainRoute, TabRoute } from '../../const/routes/route';
import { useAppSelector } from '../../hooks/redux/redux';
import useGetDashboard from '../../api/booking/hooks/useGetDashboard';
import { DashboardData, DashboardEventItem } from '../../interface/api/dashboardInterface';
import { formatCompactINR } from '../../functions/formate/CurrencyFormate';
import { formatDate, formatTime } from '../../functions/formate/DateTimeFormate';
import { num } from '../../functions/booking/BookingDetailFunction';

const CHART_WIDTH = Dimensions.get('window').width - 72;

const eventTitle = (event: DashboardEventItem): string =>
    event?.eventName?.trim() ? event.eventName : 'Untitled Event';

/** Ek event row — dashboard ki saari lists isi shape me hain. */
const EventRow = React.memo(
    ({ event, onPress }: { event: DashboardEventItem; onPress: () => void }) => {
        const isCancelled = event.status === 'Cancelled';
        const isEnded = event.status === 'Ended';
        const badgeColor = isCancelled
            ? '#FF6B6B'
            : isEnded
              ? Theme.button.secondary
              : Theme.button.primary;

        return (
            <TouchableOpacity
                activeOpacity={0.85}
                onPress={onPress}
                className="rounded-2xl p-3.5 mb-2.5 flex-row items-center"
                style={{
                    backgroundColor: Theme.background.secondary,
                    borderWidth: 1,
                    borderColor: Theme.border.primary,
                }}
            >
                <View className="flex-1 pr-2">
                    <View className="flex-row items-center">
                        <Text
                            className="text-[14px] font-bold text-white flex-shrink"
                            numberOfLines={1}
                        >
                            {eventTitle(event)}
                        </Text>
                        {event.status ? (
                            <View
                                className="px-2 py-0.5 rounded-full ml-2"
                                style={{ backgroundColor: `${badgeColor}22` }}
                            >
                                <Text
                                    className="text-[9px] font-bold"
                                    style={{ color: badgeColor }}
                                >
                                    {event.status}
                                </Text>
                            </View>
                        ) : null}
                    </View>

                    <Text
                        className="text-[11px] mt-0.5"
                        style={{ color: Theme.text.secondary }}
                        numberOfLines={1}
                    >
                        {[
                            event.hallName,
                            event.date ? formatDate(event.date) : '',
                            event.startTime ? formatTime(event.startTime) : '',
                        ]
                            .filter(Boolean)
                            .join(' · ')}
                    </Text>

                    {event.applicantName ? (
                        <Text
                            className="text-[10px] mt-0.5"
                            style={{ color: Theme.text.tertiary }}
                            numberOfLines={1}
                        >
                            {event.applicantName}
                            {event.bookedBy ? ` · by ${event.bookedBy}` : ''}
                        </Text>
                    ) : null}
                </View>

                <View className="items-end">
                    <Text className="text-[13px] font-extrabold text-white">
                        {formatCompactINR(num(event.totalAmount))}
                    </Text>
                    {event.paymentStatus ? (
                        <Text
                            className="text-[10px] mt-0.5"
                            style={{ color: Theme.text.tertiary }}
                        >
                            {event.paymentStatus}
                        </Text>
                    ) : null}
                </View>

                <ChevronRight size={14} color={Theme.text.tertiary} style={{ marginLeft: 4 }} />
            </TouchableOpacity>
        );
    },
);

EventRow.displayName = 'EventRow';

/** KPI card — baki screens ke dark cards jaisa. */
const StatCard = ({
    title,
    value,
    hint,
    Icon,
    tint,
}: {
    title: string;
    value: string;
    hint?: string;
    Icon: any;
    tint: string;
}) => (
    <View
        className="flex-1 rounded-2xl p-3.5 mb-3"
        style={{
            backgroundColor: Theme.background.secondary,
            borderWidth: 1,
            borderColor: Theme.border.primary,
        }}
    >
        <View
            className="w-9 h-9 rounded-xl items-center justify-center"
            style={{ backgroundColor: `${tint}22` }}
        >
            <Icon size={16} color={tint} />
        </View>
        <Text className="text-[11px] mt-2.5" style={{ color: Theme.text.secondary }}>
            {title}
        </Text>
        <Text className="text-[17px] font-extrabold text-white mt-0.5" numberOfLines={1}>
            {value}
        </Text>
        {hint ? (
            <Text className="text-[10px] mt-0.5" style={{ color: Theme.text.tertiary }}>
                {hint}
            </Text>
        ) : null}
    </View>
);

const SectionHeader = ({
    title,
    sub,
    actionLabel,
    onAction,
}: {
    title: string;
    sub?: string;
    actionLabel?: string;
    onAction?: () => void;
}) => (
    <View className="flex-row items-end justify-between mb-3.5">
        <View className="flex-1 pr-2">
            <Text className="text-[16px] font-extrabold text-white">{title}</Text>
            {sub ? (
                <Text className="text-[11px] mt-0.5" style={{ color: Theme.text.secondary }}>
                    {sub}
                </Text>
            ) : null}
        </View>
        {actionLabel && onAction ? (
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={onAction}
                className="flex-row items-center"
            >
                <Text className="text-[12px] font-bold" style={{ color: Theme.button.primary }}>
                    {actionLabel}
                </Text>
                <ChevronRight size={13} color={Theme.button.primary} />
            </TouchableOpacity>
        ) : null}
    </View>
);

const cardStyle = {
    backgroundColor: Theme.background.secondary,
    borderWidth: 1,
    borderColor: Theme.border.primary,
};

interface KpiItem {
    key: string;
    title: string;
    value: string;
    hint: string;
    Icon: any;
    tint: string;
}

/** KPI cards ko 2-2 ke rows me baantta hai — rows me `gap` se clean grid banta
 *  hai (pehle `flex-wrap` + zero-width spacer cards ko shift kar dete the). */
const chunkPairs = (items: KpiItem[]): KpiItem[][] => {
    const rows: KpiItem[][] = [];
    for (let index = 0; index < items.length; index += 2) {
        rows.push(items.slice(index, index + 2));
    }
    return rows;
};

/**
 * CEO Dashboard — sada aur saaf.
 *
 * Sirf wahi cheezein jo CEO ko turant chahiye: 6 KPIs, do charts, aaj ke
 * events aur aage ke events. Poori reporting Business Analytics tab me hai,
 * isliye yahan duplicacy nahi rakhi gayi.
 */
const CEODashboardScreen = ({ navigation }: any) => {
    const user = useAppSelector((state) => state.user.user);
    const { dashboard, isLoading, refetch } = useGetDashboard(user?.token);

    const [refreshing, setRefreshing] = useState(false);
    // Charts heavy hote hain — pehla render ke baad mount karte hain.
    const [chartsReady, setChartsReady] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setChartsReady(true), 300);
        return () => clearTimeout(timer);
    }, []);

    const data: DashboardData | undefined = dashboard;
    const stats = data?.stats;
    const todayEvents = data?.todayEvents ?? [];
    const upcomingEvents = (data?.upcomingEvents ?? []).slice(0, 5);

    const displayName = String(user?.name ?? '').trim().split(' ')[0] || 'CEO';

    const kpis: KpiItem[] = [
        {
            key: 'todayEvents',
            title: "Today's Events",
            value: String(stats?.todayEvents ?? 0),
            hint: `${stats?.activeBookings ?? 0} active bookings`,
            Icon: CalendarCheck,
            tint: '#34D399',
        },
        {
            key: 'totalRevenue',
            title: 'Total Revenue',
            value: formatCompactINR(num(stats?.totalRevenue)),
            hint: 'Collected so far',
            Icon: BadgeIndianRupee,
            tint: '#D4AF37',
        },
        {
            key: 'pendingPayments',
            title: 'Pending Payments',
            value: formatCompactINR(num(stats?.pendingPaymentsAmount)),
            hint: 'Yet to be collected',
            Icon: Wallet2,
            tint: '#F87171',
        },
        {
            key: 'weekBookings',
            title: "Week's Bookings",
            value: String(stats?.weekBookings ?? 0),
            hint: `${num(stats?.weeklyGrowth) >= 0 ? '+' : ''}${num(
                stats?.weeklyGrowth,
            )}% vs last week`,
            Icon: CalendarDays,
            tint: '#60A5FA',
        },
        {
            key: 'totalBookings',
            title: 'Total Bookings',
            value: String(stats?.totalBookings ?? 0),
            hint: 'All time',
            Icon: UserRound,
            tint: '#A78BFA',
        },
        {
            key: 'cancelled',
            title: 'Cancelled',
            value: String(stats?.cancelledCount ?? 0),
            hint: 'All time',
            Icon: TriangleAlert,
            tint: '#F87171',
        },
    ];

    const kpiRows = chunkPairs(kpis);

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

    const openBookings = useCallback(
        () => navigation.navigate(TabRoute.Bookings),
        [navigation],
    );

    const openStaffActivity = useCallback(
        () => navigation.navigate(MainRoute.StaffActivity),
        [navigation],
    );

    const weeklyChart = (data?.weeklyChart ?? []).map((point) => ({
        label: point.label,
        value: Math.max(0, num(point.value)),
    }));
    const weeklyMax = Math.max(4, ...weeklyChart.map((point) => point.value));

    const monthlyChart = (data?.monthlyRevenue ?? []).map((point) => ({
        label: point.label,
        value: Math.max(0, num(point.value)),
    }));

    return (
        <Wrapper>
            <MainDerder
                navigation={navigation}
                title={`Hello, ${displayName}`}
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
                {isLoading && !data ? (
                    <View className="py-24 items-center">
                        <ActivityIndicator size="small" color={Theme.button.primary} />
                    </View>
                ) : (
                    <>
                        {/* KPI grid — 2 cards per row, equal width */}
                        {kpiRows.map((pair, index) => (
                            <View key={index} className="flex-row gap-3">
                                {pair.map((item) => (
                                    <StatCard
                                        key={item.key}
                                        title={item.title}
                                        value={item.value}
                                        hint={item.hint}
                                        Icon={item.Icon}
                                        tint={item.tint}
                                    />
                                ))}
                                {/* Aakhri row me sirf ek card ho to jagah bhar do,
                                    warna wo poori width le leta hai. */}
                                {pair.length === 1 ? <View className="flex-1 mb-3" /> : null}
                            </View>
                        ))}

                        {/* Quick link — Analytics tab me hai, isliye yahan card nahi. */}
                        <TouchableOpacity
                            activeOpacity={0.85}
                            onPress={openStaffActivity}
                            className="mt-4 rounded-2xl p-3.5 flex-row items-center"
                            style={cardStyle}
                        >
                            <CalendarDays size={15} color="#60A5FA" />
                            <Text className="text-[12px] font-bold text-white ml-2">
                                Staff Activity Calendar
                            </Text>
                            <View className="flex-1" />
                            <ChevronRight size={14} color={Theme.text.tertiary} />
                        </TouchableOpacity>

                        {/* Revenue trend */}
                        <View className="mt-6">
                            <SectionHeader
                                title="Revenue Trend"
                                sub="Collections in the last 6 months"
                            />
                            <View className="rounded-2xl p-4" style={cardStyle}>
                                {chartsReady ? (
                                    <BarChart
                                        key="revenue-trend"
                                        data={monthlyChart}
                                        barWidth={22}
                                        spacing={16}
                                        initialSpacing={10}
                                        endSpacing={10}
                                        barBorderRadius={6}
                                        frontColor="#D4AF37"
                                        noOfSections={4}
                                        maxValue={Math.max(
                                            100,
                                            ...monthlyChart.map((point) => point.value),
                                        )}
                                        parentWidth={CHART_WIDTH}
                                        yAxisThickness={0}
                                        xAxisThickness={0}
                                        yAxisTextStyle={{
                                            color: Theme.text.tertiary,
                                            fontSize: 10,
                                        }}
                                        xAxisLabelTextStyle={{
                                            color: Theme.text.tertiary,
                                            fontSize: 10,
                                        }}
                                        rulesColor={Theme.border.primary}
                                        rulesType="solid"
                                        isAnimated
                                        animationDuration={600}
                                    />
                                ) : (
                                    // Chart mount hone tak khaali card ki jagah spinner
                                    // (pehle khali box kart jaisa dikhta tha).
                                    <View
                                        className="items-center justify-center"
                                        style={{ height: 180 }}
                                    >
                                        <ActivityIndicator
                                            size="small"
                                            color={Theme.button.primary}
                                        />
                                    </View>
                                )}
                            </View>
                        </View>

                        {/* Weekly bookings */}
                        <View className="mt-6">
                            <SectionHeader
                                title="Weekly Bookings"
                                sub="Created in the last 7 days"
                            />
                            <View className="rounded-2xl p-4" style={cardStyle}>
                                {chartsReady ? (
                                    <BarChart
                                        key="weekly-bookings"
                                        data={weeklyChart}
                                        barWidth={22}
                                        spacing={14}
                                        initialSpacing={10}
                                        endSpacing={10}
                                        barBorderRadius={6}
                                        frontColor="#60A5FA"
                                        noOfSections={4}
                                        maxValue={weeklyMax}
                                        parentWidth={CHART_WIDTH}
                                        yAxisThickness={0}
                                        xAxisThickness={0}
                                        yAxisTextStyle={{
                                            color: Theme.text.tertiary,
                                            fontSize: 10,
                                        }}
                                        xAxisLabelTextStyle={{
                                            color: Theme.text.tertiary,
                                            fontSize: 10,
                                        }}
                                        rulesColor={Theme.border.primary}
                                        rulesType="solid"
                                        isAnimated
                                        animationDuration={600}
                                    />
                                ) : (
                                    // Chart mount hone tak khaali card ki jagah spinner
                                    // (pehle khali box kart jaisa dikhta tha).
                                    <View
                                        className="items-center justify-center"
                                        style={{ height: 180 }}
                                    >
                                        <ActivityIndicator
                                            size="small"
                                            color={Theme.button.primary}
                                        />
                                    </View>
                                )}
                            </View>
                        </View>

                        {/* Today's events */}
                        <View className="mt-6">
                            <SectionHeader
                                title="Today's Events"
                                sub={
                                    todayEvents.length
                                        ? `${todayEvents.length} event(s) scheduled`
                                        : 'Nothing planned today'
                                }
                                actionLabel="All bookings"
                                onAction={openBookings}
                            />
                            {todayEvents.length ? (
                                todayEvents.map((event) => (
                                    <EventRow
                                        key={event.id}
                                        event={event}
                                        onPress={() => openBooking(event.id)}
                                    />
                                ))
                            ) : (
                                <Text
                                    className="text-[12px]"
                                    style={{ color: Theme.text.secondary }}
                                >
                                    No events scheduled for today.
                                </Text>
                            )}
                        </View>

                        {/* Upcoming */}
                        <View className="mt-6">
                            <SectionHeader
                                title="Upcoming"
                                sub="Next 7 days"
                                actionLabel="All bookings"
                                onAction={openBookings}
                            />
                            {upcomingEvents.length ? (
                                upcomingEvents.map((event) => (
                                    <EventRow
                                        key={event.id}
                                        event={event}
                                        onPress={() => openBooking(event.id)}
                                    />
                                ))
                            ) : (
                                <Text
                                    className="text-[12px]"
                                    style={{ color: Theme.text.secondary }}
                                >
                                    No upcoming events.
                                </Text>
                            )}
                        </View>
                    </>
                )}
            </ScrollView>
        </Wrapper>
    );
};

export default CEODashboardScreen;
