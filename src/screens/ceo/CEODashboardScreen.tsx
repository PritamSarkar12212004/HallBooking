import React, { useCallback } from 'react';
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity } from '../../lib/style/withTailwind';
import { BarChart, LineChart, PieChart } from 'react-native-gifted-charts';
import {
    CalendarCheck,
    CalendarDays,
    UserRound,
    TrendingUp,
    CalendarClock,
    Building2,
    BadgeIndianRupee,
    RefreshCw,
    ChevronRight,
    ReceiptIndianRupee,
    Wallet2,
} from 'lucide-react-native';
import { Theme } from '../../const/theme/Theme';
import { TabRoute, MainRoute } from '../../const/routes/route';
import { useAppSelector } from '../../hooks/redux/redux';
import useGetDashboard from '../../api/booking/hooks/useGetDashboard';
import { DashboardData, DashboardEventItem } from '../../interface/api/dashboardInterface';
import DashboardSkeleton from '../../ui/Skeleton/DashboardSkeleton';
import DashHeader from '../../components/header/DashHeader';
import StatusChip from '../../components/ui/StatusChip';
import PaymentStatusChip from '../../components/ui/PaymentStatusChip';
import { formatDate, formatTime } from '../../functions/formate/DateTimeFormate';

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

const formatCompactINR = (value: number): string => {
    if (!value) return '₹0';
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(1)}k`;
    return `₹${value}`;
};

const EventRow = ({
    item,
    onPress,
    showDate = false,
}: {
    item: DashboardEventItem;
    onPress: () => void;
    showDate?: boolean;
}) => (
    <TouchableOpacity
        className="rounded-2xl p-4 mb-3"
        style={{ backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border }}
        activeOpacity={0.7}
        onPress={onPress}
    >
        <View className="flex-row items-start justify-between">
            <View className="flex-1">
                <View className="flex-row items-center gap-2 mb-1">
                    <View
                        className="w-8 h-8 rounded-lg items-center justify-center"
                        style={{ backgroundColor: Colors.accentSoft }}
                    >
                        <Building2 size={15} color={Colors.gold} />
                    </View>
                    <View className="flex-1">
                        <Text className="text-white text-[15px] font-semibold tracking-tight" numberOfLines={1}>
                            {item.eventName}
                        </Text>
                        <Text className="text-[#9CA3AF] text-xs font-medium">
                            {item.hallName}
                        </Text>
                    </View>
                    <ChevronRight size={16} color={Colors.textMuted} />
                </View>
                <Text className="text-[#9CA3AF] text-[13px] mt-1">
                    {item.applicantName} • {item.eventType}
                </Text>
            </View>
            <View className="items-end gap-1.5 mr-2">
                <StatusChip status={item.status as any} />
                <PaymentStatusChip status={item.paymentStatus as any} />
            </View>
        </View>

        <View className="flex-row items-center gap-2 mt-3 ml-10">
            <CalendarClock size={13} color={Colors.textMuted} />
            <Text className="text-[#6B7280] text-xs font-medium">
                {showDate && item.date ? `${formatDate(item.date)} • ` : ''}
                {formatTime(item.startTime)} - {formatTime(item.endTime)}
            </Text>
            {item.totalAmount > 0 && (
                <Text className="text-[#34D399] text-xs font-bold ml-2">
                    {formatCompactINR(item.totalAmount)}
                </Text>
            )}
        </View>
    </TouchableOpacity>
);

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

    const paymentColors: Record<string, string> = {
        Paid: Colors.green,
        Partial: Colors.gold,
        Pending: Colors.red,
    };
    const hasAnyPayment = (data?.paymentDistribution ?? []).some((p) => p.count > 0);
    const paymentPieData = (data?.paymentDistribution ?? []).map((p) => ({
        value: p.count,
        color: paymentColors[p.status] ?? Colors.blue,
        text: p.status,
    }));

    const maxRevenue = Math.max(...(data?.monthlyRevenue ?? []).map((m) => m.value), 1);
    const revenueChartData = data?.monthlyRevenue.map((m) => ({
        value: m.value,
        label: m.label,
    })) ?? [];

    const maxHall = Math.max(...(data?.hallStats ?? []).map((h) => h.bookings), 1);
    const hallBarData = data?.hallStats.map((h) => ({
        value: h.bookings,
        label: h.hallName.length > 8 ? `${h.hallName.slice(0, 7)}…` : h.hallName,
    })) ?? [];

    return (
        <SafeAreaView className="flex-1" style={{ backgroundColor: Theme.background.primary }} edges={['top']}>
            <DashHeader navigation={navigation} name={user?.name} photo={user?.photo} />

            {isLoading && !data ? (
                <DashboardSkeleton />
            ) : (
                <ScrollView showsVerticalScrollIndicator={false} className="flex-1" contentContainerStyle={{ paddingBottom: 24 }}>
                    {/* Overview strip */}
                    <View className="px-5 mt-1">
                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center gap-2">
                                <TrendingUp size={16} color={Colors.gold} />
                                <Text className="text-white text-base font-bold tracking-tight">
                                    Overview
                                </Text>
                            </View>
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={onRefreshPress}
                                className="w-9 h-9 rounded-xl items-center justify-center"
                                style={{ backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border }}
                            >
                                <RefreshCw size={15} color={Colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Stat cards */}
                    <View className="mt-1">
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, gap: 12 }}
                        >
                            {statCards.map((stat) => (
                                <TouchableOpacity
                                    key={stat.title}
                                    activeOpacity={0.7}
                                    onPress={navigateBookings}
                                    className="w-[158px] rounded-2xl p-4"
                                    style={{ backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border }}
                                >
                                    <View className="flex-row items-center justify-between mb-3">
                                        <View
                                            className="w-10 h-10 rounded-xl items-center justify-center"
                                            style={{ backgroundColor: stat.softColor }}
                                        >
                                            <stat.icon size={19} color={stat.accentColor} />
                                        </View>
                                        <ChevronRight size={14} color={Colors.textMuted} />
                                    </View>
                                    <Text className="text-[#9CA3AF] text-[11px] font-medium">{stat.title}</Text>
                                    <Text className="text-white text-xl font-bold mt-1">{stat.value}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Revenue trend */}
                    <View className="mt-7 px-5">
                        <View className="flex-row items-center justify-between mb-4">
                            <View className="flex-row items-center gap-2">
                                <BadgeIndianRupee size={18} color={Colors.gold} />
                                <Text className="text-white text-lg font-bold tracking-tight">
                                    Revenue Trend
                                </Text>
                            </View>
                            {stats && (
                                <View className="px-3 py-1.5 rounded-full" style={{ backgroundColor: Colors.greenSoft }}>
                                    <Text className="text-[#34D399] text-xs font-semibold">
                                        {formatCompactINR(stats.totalRevenue)}
                                    </Text>
                                </View>
                            )}
                        </View>
                        <View
                            className="rounded-2xl p-5"
                            style={{ backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border }}
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
                                yAxisThickness={0}
                                xAxisThickness={0}
                                xAxisColor={Colors.border}
                                yAxisTextStyle={{ color: Colors.textMuted, fontSize: 10 }}
                                xAxisLabelTextStyle={{ color: Colors.textMuted, fontSize: 10 }}
                                rulesColor={Colors.border}
                                rulesType="solid"
                                isAnimated
                                animationDuration={700}
                            />
                        </View>
                    </View>

                    {/* Weekly bookings + growth */}
                    <View className="mt-7 px-5">
                        <View className="flex-row items-center justify-between mb-4">
                            <View className="flex-row items-center gap-2">
                                <TrendingUp size={18} color={Colors.gold} />
                                <Text className="text-white text-lg font-bold tracking-tight">
                                    Weekly Bookings
                                </Text>
                            </View>
                            {stats && (
                                <View
                                    className="px-3 py-1.5 rounded-full"
                                    style={{ backgroundColor: stats.weeklyGrowth >= 0 ? Colors.greenSoft : Colors.redSoft }}
                                >
                                    <Text
                                        className="text-xs font-semibold"
                                        style={{ color: stats.weeklyGrowth >= 0 ? Colors.green : Colors.red }}
                                    >
                                        {stats.weeklyGrowth >= 0 ? '+' : ''}{stats.weeklyGrowth}% vs last week
                                    </Text>
                                </View>
                            )}
                        </View>
                        <View
                            className="rounded-2xl p-5"
                            style={{ backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border }}
                        >
                            <BarChart
                                data={data?.weeklyChart ?? []}
                                barWidth={24}
                                barBorderRadius={6}
                                frontColor={Colors.gold}
                                gradientColor={Colors.gold}
                                noOfSections={4}
                                maxValue={Math.max(...(data?.weeklyChart ?? []).map((w) => w.value), 4)}
                                yAxisThickness={0}
                                xAxisThickness={0}
                                xAxisColor={Colors.border}
                                yAxisTextStyle={{ color: Colors.textMuted, fontSize: 10 }}
                                xAxisLabelTextStyle={{ color: Colors.textMuted, fontSize: 10 }}
                                rulesColor={Colors.border}
                                rulesType="solid"
                                isAnimated
                                animationDuration={600}
                            />
                        </View>
                    </View>

                    {/* Payment status donut */}
                    <View className="mt-7 px-5">
                        <View className="flex-row items-center justify-between mb-4">
                            <View className="flex-row items-center gap-2">
                                <Wallet2 size={18} color={Colors.gold} />
                                <Text className="text-white text-lg font-bold tracking-tight">
                                    Payment Status
                                </Text>
                            </View>
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={navigateBookings}
                                className="flex-row items-center gap-1 px-3 py-1.5 rounded-full"
                                style={{ backgroundColor: Colors.accentSoft }}
                            >
                                <Text className="text-[#F8EFCB] text-xs font-semibold">View All</Text>
                                <ChevronRight size={14} color={Colors.gold} />
                            </TouchableOpacity>
                        </View>
                        <View
                            className="rounded-2xl p-5"
                            style={{ backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border }}
                        >
                            {hasAnyPayment && paymentPieData.length > 0 ? (
                                <PieChart
                                    data={paymentPieData}
                                    donut
                                    innerRadius={46}
                                    radius={70}
                                    showText
                                    textSize={10}
                                    textColor={Colors.textMuted}
                                    strokeColor={Colors.border}
                                    strokeWidth={2}
                                    isAnimated
                                />
                            ) : (
                                <View className="items-center py-8">
                                    <Text className="text-sm" style={{ color: Colors.textSecondary }}>
                                        No payment records yet.
                                    </Text>
                                </View>
                            )}
                            <View className="flex-row items-center flex-wrap mt-4" style={{ gap: 8 }}>
                                {(data?.paymentDistribution ?? []).map((p) => (
                                    <View
                                        key={p.status}
                                        className="flex-row items-center rounded-full px-2.5 py-1"
                                        style={{ backgroundColor: `${paymentColors[p.status]}22` }}
                                    >
                                        <View
                                            className="w-2 h-2 rounded-full mr-1.5"
                                            style={{ backgroundColor: paymentColors[p.status] ?? Colors.blue }}
                                        />
                                        <Text className="text-[10px] font-semibold" style={{ color: Colors.textSecondary }}>
                                            {p.status} ({p.count})
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </View>

                    {/* Hall demand */}
                    <View className="mt-7 px-5">
                        <View className="flex-row items-center gap-2 mb-4">
                            <Building2 size={18} color={Colors.gold} />
                            <Text className="text-white text-lg font-bold tracking-tight">
                                Hall Demand
                            </Text>
                        </View>
                        <View
                            className="rounded-2xl p-5"
                            style={{ backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border }}
                        >
                            <BarChart
                                data={hallBarData}
                                horizontal
                                barWidth={16}
                                barBorderRadius={6}
                                frontColor={Colors.purple}
                                gradientColor={Colors.blue}
                                noOfSections={4}
                                maxValue={maxHall}
                                yAxisThickness={0}
                                xAxisThickness={0}
                                xAxisColor={Colors.border}
                                yAxisTextStyle={{ color: Colors.textMuted, fontSize: 10 }}
                                xAxisLabelTextStyle={{ color: Colors.textMuted, fontSize: 10 }}
                                rulesColor={Colors.border}
                                rulesType="solid"
                                isAnimated
                                animationDuration={600}
                            />
                        </View>
                    </View>

                    {/* Today's events */}
                    <View className="mt-7 px-5">
                        <View className="flex-row items-center justify-between mb-4">
                            <View className="flex-row items-center gap-2">
                                <CalendarCheck size={18} color={Colors.gold} />
                                <Text className="text-white text-lg font-bold tracking-tight">
                                    Today's Events
                                </Text>
                            </View>
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={navigateBookings}
                                className="flex-row items-center gap-1 px-3 py-1.5 rounded-full"
                                style={{ backgroundColor: Colors.accentSoft }}
                            >
                                <Text className="text-[#F8EFCB] text-xs font-semibold">View All</Text>
                                <ChevronRight size={14} color={Colors.gold} />
                            </TouchableOpacity>
                        </View>
                        {data?.todayEvents.length ? (
                            data.todayEvents.map((event) => (
                                <EventRow key={event.id} item={event} onPress={() => navigateBooking(event.id)} />
                            ))
                        ) : (
                            <View className="items-center py-8">
                                <Text className="text-sm" style={{ color: Colors.textSecondary }}>
                                    No events scheduled for today.
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Upcoming events */}
                    <View className="mt-7 px-5">
                        <View className="flex-row items-center gap-2 mb-4">
                            <CalendarDays size={18} color={Colors.gold} />
                            <Text className="text-white text-lg font-bold tracking-tight">
                                Upcoming (Next 7 Days)
                            </Text>
                        </View>
                        {data?.upcomingEvents.length ? (
                            data.upcomingEvents.map((event) => (
                                <EventRow
                                    key={event.id}
                                    item={event}
                                    showDate
                                    onPress={() => navigateBooking(event.id)}
                                />
                            ))
                        ) : (
                            <View className="items-center py-8">
                                <Text className="text-sm" style={{ color: Colors.textSecondary }}>
                                    No upcoming events.
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Recent bookings */}
                    <View className="mt-7 px-5">
                        <View className="flex-row items-center gap-2 mb-4">
                            <ReceiptIndianRupee size={18} color={Colors.gold} />
                            <Text className="text-white text-lg font-bold tracking-tight">
                                Recent Bookings
                            </Text>
                        </View>
                        {data?.recentBookings.length ? (
                            data.recentBookings.map((event) => (
                                <EventRow
                                    key={event.id}
                                    item={event}
                                    showDate
                                    onPress={() => navigateBooking(event.id)}
                                />
                            ))
                        ) : (
                            <View className="items-center py-8">
                                <Text className="text-sm" style={{ color: Colors.textSecondary }}>
                                    No bookings yet.
                                </Text>
                            </View>
                        )}
                    </View>
                </ScrollView>
            )}
        </SafeAreaView>
    );
};

export default CEODashboardScreen;