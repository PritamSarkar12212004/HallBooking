import React, { useCallback } from 'react';
import { Dimensions } from 'react-native';
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity } from '../../lib/style/withTailwind';
import { BarChart, LineChart } from 'react-native-gifted-charts';
import {
    CalendarCheck,
    CalendarDays,
    UserRound,
    TrendingUp,
    BadgeIndianRupee,
    RefreshCw,
    ChevronRight,
    ReceiptIndianRupee,
    Wallet2,
} from 'lucide-react-native';
import { TabRoute, MainRoute } from '../../const/routes/route';
import { useAppSelector } from '../../hooks/redux/redux';
import useGetDashboard from '../../api/booking/hooks/useGetDashboard';
import { DashboardData } from '../../interface/api/dashboardInterface';
import DashboardSkeleton from '../../ui/Skeleton/DashboardSkeleton';
import DashHeader from '../../components/header/DashHeader';
import HeroRevenueCard from '../../components/card/dashboard/HeroRevenueCard';
import EventCard from '../../components/card/dashboard/EventCard';
import SectionTitle from '../../components/card/dashboard/SectionTitle';
import DashboardPalette from '../../const/theme/dashboardPalette';

const Colors = {
    background: '#0F1115',
    surface: '#1A1D24',
    surfaceLight: '#232733',
    border: '#2A2F3A',
    textPrimary: '#FFFFFF',
    textSecondary: '#9CA3AF',
    textMuted: '#6B7280',
    accent: '#F8EFCB',
    accentSoft: 'rgba(248, 239, 203, 0.12)',
    gold: '#D4AF37',
    green: '#34D399',
    greenSoft: 'rgba(52, 211, 153, 0.12)',
    red: '#F87171',
    redSoft: 'rgba(248, 113, 113, 0.12)',
    blue: '#60A5FA',
    blueSoft: 'rgba(96, 165, 250, 0.12)',
    purple: '#A78BFA',
    purpleSoft: 'rgba(167, 139, 250, 0.12)',
};

const CHART_WIDTH = Dimensions.get('window').width - 72;

const formatCompactINR = (value: number): string => {
    if (!value) return '₹0';
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(1)}k`;
    return `₹${value}`;
};

const CEODashboardScreen = ({ navigation }: any) => {
    const user = useAppSelector((state) => state.user.user);
    const { dashboard, isLoading, refetch } = useGetDashboard(user?.token);
    const data: DashboardData | undefined = dashboard;
    const stats = data?.stats;

    const onRefreshPress = useCallback(() => {
        refetch();
    }, [refetch]);

    const navigateBooking = useCallback((id: string) => {
        navigation.navigate(MainRoute.BookingDetail, { id });
    }, [navigation]);

    const navigateBookings = useCallback(() => {
        navigation.navigate(TabRoute.Bookings);
    }, [navigation]);

    const statCards = stats ? [
        {
            title: "Today's Events",
            value: String(stats.todayEvents),
            icon: CalendarCheck,
            accentColor: Colors.green,
            softColor: Colors.greenSoft,
        },
        {
            title: 'Total Revenue',
            value: formatCompactINR(stats.totalRevenue),
            icon: BadgeIndianRupee,
            accentColor: Colors.gold,
            softColor: Colors.accentSoft,
        },
        {
            title: 'Pending Payments',
            value: formatCompactINR(stats.pendingPaymentsAmount),
            icon: Wallet2,
            accentColor: Colors.red,
            softColor: Colors.redSoft,
        },
        {
            title: "Week's Bookings",
            value: String(stats.weekBookings),
            icon: CalendarDays,
            accentColor: Colors.blue,
            softColor: Colors.blueSoft,
        },
        {
            title: 'Collected',
            value: formatCompactINR(stats.collectedAmount),
            icon: ReceiptIndianRupee,
            accentColor: Colors.green,
            softColor: Colors.greenSoft,
        },
        {
            title: 'Total Bookings',
            value: String(stats.totalBookings),
            icon: UserRound,
            accentColor: Colors.purple,
            softColor: Colors.purpleSoft,
        },
    ] : [];

    const maxRevenue = Math.max(...(data?.monthlyRevenue ?? []).map((m) => m.value), 1);
    const revenueChartData = data?.monthlyRevenue.map((m) => ({
        value: m.value,
        label: m.label,
    })) ?? [];

    return (
        <SafeAreaView className="flex-1" style={{ backgroundColor: DashboardPalette.bg }} edges={['top']}>
            <DashHeader navigation={navigation} name={user?.name} photo={user?.photo} />

            <View className="flex-1">
                {isLoading && !data ? (
                    <DashboardSkeleton />
                ) : (
                    <ScrollView
                        className="flex-1 rounded-t-[28px]"
                        style={{ backgroundColor: DashboardPalette.sheet }}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 18, paddingBottom: 28 }}
                    >
                        {/* Revenue hero card (same as Home) */}
                        <View>
                            <HeroRevenueCard stats={stats} onPress={navigateBookings} />
                        </View>

                        {/* Overview strip */}
                        <View className="mt-5">
                            <View className="flex-row items-end justify-between mb-4">
                                <SectionTitle icon={TrendingUp} tint={DashboardPalette.gold} title="Overview" sub="Live hall overview" />
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    onPress={onRefreshPress}
                                    className="w-9 h-9 rounded-xl items-center justify-center"
                                    style={{ backgroundColor: DashboardPalette.goldSoft }}
                                >
                                    <RefreshCw size={15} color={DashboardPalette.goldDeep} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Stat cards */}
                        <View className="mt-2">
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, gap: 12 }}
                            >
                                {statCards.map((stat) => (
                                    <TouchableOpacity
                                        key={stat.title}
                                        activeOpacity={0.7}
                                        onPress={navigateBookings}
                                        className="w-[158px] rounded-2xl p-4"
                                        style={{ backgroundColor: DashboardPalette.card, borderWidth: 1, borderColor: DashboardPalette.border }}
                                    >
                                        <View className="flex-row items-center justify-between mb-3">
                                            <View
                                                className="w-10 h-10 rounded-xl items-center justify-center"
                                                style={{ backgroundColor: stat.softColor }}
                                            >
                                                <stat.icon size={19} color={stat.accentColor} />
                                            </View>
                                            <ChevronRight size={14} color={DashboardPalette.inkMuted} />
                                        </View>
                                        <Text className="text-[11px] font-medium" style={{ color: DashboardPalette.inkSoft }}>{stat.title}</Text>
                                        <Text className="text-xl font-bold mt-1" style={{ color: DashboardPalette.ink }}>{stat.value}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        {/* Revenue trend */}
                        <View className="mt-7">
                            <View className="flex-row items-end justify-between mb-4">
                                <SectionTitle icon={BadgeIndianRupee} tint={DashboardPalette.gold} title="Revenue Trend" sub="Monthly collections" />
                                {stats && (
                                    <View className="px-3 py-1.5 rounded-full" style={{ backgroundColor: DashboardPalette.goldSoft }}>
                                        <Text className="text-xs font-semibold" style={{ color: DashboardPalette.goldDeep }}>
                                            {formatCompactINR(stats.totalRevenue)}
                                        </Text>
                                    </View>
                                )}
                            </View>
                            <View
                                className="rounded-2xl p-5"
                                style={{ backgroundColor: DashboardPalette.card, borderWidth: 1, borderColor: DashboardPalette.border }}
                            >
                                <LineChart
                                    data={revenueChartData}
                                    color={Colors.gold}
                                    thickness={3}
                                    curved
                                    areaChart
                                    startFillColor={Colors.gold}
                                    endFillColor={Colors.gold}
                                    noOfSections={4}
                                    maxValue={maxRevenue}
                                    parentWidth={CHART_WIDTH}
                                    yAxisThickness={0}
                                    xAxisThickness={0}
                                    xAxisColor={DashboardPalette.border}
                                    yAxisTextStyle={{ color: DashboardPalette.inkMuted, fontSize: 10 }}
                                    xAxisLabelTextStyle={{ color: DashboardPalette.inkMuted, fontSize: 10 }}
                                    rulesColor={DashboardPalette.border}
                                    rulesType="solid"
                                    isAnimated
                                    animationDuration={700}
                                />
                            </View>
                        </View>

                        {/* Weekly bookings + growth */}
                        <View className="mt-7">
                            <View className="flex-row items-end justify-between mb-4">
                                <SectionTitle icon={TrendingUp} tint={DashboardPalette.blue} title="Weekly Bookings" sub="Created in the last 7 days" />
                                {stats && (
                                    <View
                                        className="px-3 py-1.5 rounded-full"
                                        style={{ backgroundColor: stats.weeklyGrowth >= 0 ? DashboardPalette.greenSoft : DashboardPalette.redSoft }}
                                    >
                                        <Text
                                            className="text-xs font-semibold"
                                            style={{ color: stats.weeklyGrowth >= 0 ? DashboardPalette.green : DashboardPalette.red }}
                                        >
                                            {stats.weeklyGrowth >= 0 ? '+' : ''}{stats.weeklyGrowth}%
                                        </Text>
                                    </View>
                                )}
                            </View>
                            <View
                                className="rounded-2xl p-5"
                                style={{ backgroundColor: DashboardPalette.card, borderWidth: 1, borderColor: DashboardPalette.border }}
                            >
                                <BarChart
                                    data={data?.weeklyChart ?? []}
                                    barWidth={24}
                                    spacing={14}
                                    initialSpacing={10}
                                    endSpacing={10}
                                    barBorderRadius={6}
                                    frontColor={Colors.gold}
                                    gradientColor={Colors.gold}
                                    noOfSections={4}
                                    maxValue={Math.max(...(data?.weeklyChart ?? []).map((w) => w.value), 4)}
                                    parentWidth={CHART_WIDTH}
                                    yAxisThickness={0}
                                    xAxisThickness={0}
                                    xAxisColor={DashboardPalette.border}
                                    yAxisTextStyle={{ color: DashboardPalette.inkMuted, fontSize: 10 }}
                                    xAxisLabelTextStyle={{ color: DashboardPalette.inkMuted, fontSize: 10 }}
                                    rulesColor={DashboardPalette.border}
                                    rulesType="solid"
                                    isAnimated
                                    animationDuration={600}
                                />
                            </View>
                        </View>

                        {/* Weekly expenses */}
                        <View className="mt-7">
                            <View className="flex-row items-end justify-between mb-4">
                                <SectionTitle icon={Wallet2} tint={DashboardPalette.red} title="Weekly Expenses" sub="Expenses added in the last 7 days" />
                                {stats && (
                                    <View className="px-3 py-1.5 rounded-full" style={{ backgroundColor: DashboardPalette.redSoft }}>
                                        <Text className="text-xs font-semibold" style={{ color: DashboardPalette.red }}>
                                            ₹{(data?.weeklyExpenses ?? []).reduce((s, d) => s + d.value, 0).toLocaleString()}
                                        </Text>
                                    </View>
                                )}
                            </View>
                            <View
                                className="rounded-2xl p-5"
                                style={{ backgroundColor: DashboardPalette.card, borderWidth: 1, borderColor: DashboardPalette.border }}
                            >
                                <BarChart
                                    data={data?.weeklyExpenses ?? []}
                                    barWidth={24}
                                    spacing={14}
                                    initialSpacing={10}
                                    endSpacing={10}
                                    barBorderRadius={6}
                                    frontColor={DashboardPalette.red}
                                    gradientColor={DashboardPalette.red}
                                    noOfSections={4}
                                    maxValue={Math.max(...(data?.weeklyExpenses ?? []).map((w) => w.value), 100)}
                                    parentWidth={CHART_WIDTH}
                                    yAxisThickness={0}
                                    xAxisThickness={0}
                                    xAxisColor={DashboardPalette.border}
                                    yAxisTextStyle={{ color: DashboardPalette.inkMuted, fontSize: 10 }}
                                    xAxisLabelTextStyle={{ color: DashboardPalette.inkMuted, fontSize: 10 }}
                                    rulesColor={DashboardPalette.border}
                                    rulesType="solid"
                                    isAnimated
                                    animationDuration={600}
                                />
                            </View>
                        </View>

                        {/* Monthly expenses */}
                        <View className="mt-7">
                            <View className="flex-row items-end justify-between mb-4">
                                <SectionTitle icon={ReceiptIndianRupee} tint={DashboardPalette.red} title="Monthly Expenses" sub="Expenses added in the last 6 months" />
                                {stats && (
                                    <View className="px-3 py-1.5 rounded-full" style={{ backgroundColor: DashboardPalette.redSoft }}>
                                        <Text className="text-xs font-semibold" style={{ color: DashboardPalette.red }}>
                                            {formatCompactINR((data?.monthlyExpenses ?? []).reduce((s, d) => s + d.value, 0))}
                                        </Text>
                                    </View>
                                )}
                            </View>
                            <View
                                className="rounded-2xl p-5"
                                style={{ backgroundColor: DashboardPalette.card, borderWidth: 1, borderColor: DashboardPalette.border }}
                            >
                                <BarChart
                                    data={data?.monthlyExpenses ?? []}
                                    barWidth={30}
                                    spacing={22}
                                    initialSpacing={14}
                                    endSpacing={14}
                                    barBorderRadius={6}
                                    frontColor={DashboardPalette.red}
                                    gradientColor={DashboardPalette.red}
                                    noOfSections={4}
                                    maxValue={Math.max(...(data?.monthlyExpenses ?? []).map((w) => w.value), 100)}
                                    parentWidth={CHART_WIDTH}
                                    yAxisThickness={0}
                                    xAxisThickness={0}
                                    xAxisColor={DashboardPalette.border}
                                    yAxisTextStyle={{ color: DashboardPalette.inkMuted, fontSize: 10 }}
                                    xAxisLabelTextStyle={{ color: DashboardPalette.inkMuted, fontSize: 10 }}
                                    rulesColor={DashboardPalette.border}
                                    rulesType="solid"
                                    isAnimated
                                    animationDuration={600}
                                />
                            </View>
                        </View>

                        {/* Today's events */}
                        <View className="mt-7">
                            <View className="flex-row items-end justify-between mb-4">
                                <SectionTitle icon={CalendarCheck} tint={DashboardPalette.green} title="Today's Events" sub={`${data?.todayEvents?.length ?? 0} event(s) scheduled`} />
                                <TouchableOpacity onPress={navigateBookings} className="flex-row items-center mb-1" activeOpacity={0.7}>
                                    <Text className="text-xs font-black" style={{ color: DashboardPalette.goldDeep }}>View All</Text>
                                    <ChevronRight size={14} color={DashboardPalette.goldDeep} />
                                </TouchableOpacity>
                            </View>
                            {data?.todayEvents.length ? (
                                data.todayEvents.map((event) => (
                                    <EventCard key={event.id} event={event} onPress={() => navigateBooking(event.id)} />
                                ))
                            ) : (
                                <View className="items-center py-8">
                                    <Text className="text-sm" style={{ color: DashboardPalette.inkSoft }}>
                                        No events scheduled for today.
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Upcoming events */}
                        <View className="mt-7">
                            <View className="flex-row items-end justify-between mb-4">
                                <SectionTitle icon={CalendarDays} tint={DashboardPalette.violet} title="Upcoming" sub="Next 7 days" />
                                <TouchableOpacity onPress={navigateBookings} className="flex-row items-center mb-1" activeOpacity={0.7}>
                                    <Text className="text-xs font-black" style={{ color: DashboardPalette.goldDeep }}>View All</Text>
                                    <ChevronRight size={14} color={DashboardPalette.goldDeep} />
                                </TouchableOpacity>
                            </View>
                            {data?.upcomingEvents.length ? (
                                data.upcomingEvents.map((event) => (
                                    <EventCard
                                        key={event.id}
                                        event={event}
                                        showDate
                                        onPress={() => navigateBooking(event.id)}
                                    />
                                ))
                            ) : (
                                <View className="items-center py-8">
                                    <Text className="text-sm" style={{ color: DashboardPalette.inkSoft }}>
                                        No upcoming events.
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Recent bookings */}
                        <View className="mt-7">
                            <View className="flex-row items-end justify-between mb-4">
                                <SectionTitle icon={ReceiptIndianRupee} tint={DashboardPalette.blue} title="Recent Bookings" sub="Latest activity" />
                                <TouchableOpacity onPress={navigateBookings} className="flex-row items-center mb-1" activeOpacity={0.7}>
                                    <Text className="text-xs font-black" style={{ color: DashboardPalette.goldDeep }}>View All</Text>
                                    <ChevronRight size={14} color={DashboardPalette.goldDeep} />
                                </TouchableOpacity>
                            </View>
                            {data?.recentBookings.length ? (
                                data.recentBookings.map((event) => (
                                    <EventCard
                                        key={event.id}
                                        event={event}
                                        showDate
                                        onPress={() => navigateBooking(event.id)}
                                    />
                                ))
                            ) : (
                                <View className="items-center py-8">
                                    <Text className="text-sm" style={{ color: DashboardPalette.inkSoft }}>
                                        No bookings yet.
                                    </Text>
                                </View>
                            )}
                        </View>
                    </ScrollView>
                )}
            </View>
        </SafeAreaView>
    );
};

export default CEODashboardScreen;