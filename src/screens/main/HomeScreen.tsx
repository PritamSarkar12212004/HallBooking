import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, SafeAreaView } from '../../lib/style/withTailwind';
import { BarChart } from 'react-native-gifted-charts';
import {
    CalendarDays,
    CalendarCheck,
    IndianRupee,
    UserRound,
    ChevronRight,
    Building2,
    Clock3,
    TrendingUp,
    ArrowUpRight,
    CalendarClock,
} from 'lucide-react-native';
import StatusChip from '../../components/ui/StatusChip';
import PaymentStatusChip from '../../components/ui/PaymentStatusChip';
import { TabRoute, MainRoute } from '../../const/routes/route';
import { Theme } from '../../const/theme/Theme';
import { useAppSelector } from '../../hooks/redux/redux';
import useGetDashboard from '../../api/booking/hooks/useGetDashboard';
import { formatDate, formatTime } from '../../functions/formate/DateTimeFormate';
import DashHeader from '../../components/header/DashHeader';

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

const HomeScreen = ({ navigation }: any) => {
    const user = useAppSelector((state) => state.user.user);
    const { dashboard } = useGetDashboard(user?.token);
    const dStats = dashboard?.stats;

    const stats = [
        {
            title: "Today's Events",
            value: String(dStats?.todayEvents ?? 0),
            icon: CalendarCheck,
            accentColor: Colors.green,
            softColor: Colors.greenSoft,
        },
        {
            title: 'Pending Payments',
            value: formatCompactINR(dStats?.pendingPaymentsAmount ?? 0),
            icon: IndianRupee,
            accentColor: Colors.red,
            softColor: Colors.redSoft,
        },
        {
            title: "Week's Bookings",
            value: String(dStats?.weekBookings ?? 0),
            icon: CalendarDays,
            accentColor: Colors.blue,
            softColor: Colors.blueSoft,
        },
        {
            title: 'Active Bookings',
            value: String(dStats?.activeBookings ?? 0),
            icon: UserRound,
            accentColor: Colors.purple,
            softColor: Colors.purpleSoft,
        },
    ];
    const handleStatPress = (_title: string) => {
        navigation.navigate(TabRoute.Bookings);
    };

    const todayEvents = dashboard?.todayEvents ?? [];
    const upcomingEvents = dashboard?.upcomingEvents ?? [];
    const weeklyChart = dashboard?.weeklyChart ?? [];
    const maxChartValue = Math.max(...weeklyChart.map((w) => w.value), 4);

    return (
        <SafeAreaView className="flex-1" style={{ backgroundColor: Theme.background.primary }} edges={['top']}>
            <DashHeader navigation={navigation} name={user?.name} photo={user?.photo} />
            <ScrollView
                showsVerticalScrollIndicator={false}
                className="flex-1"
            >
                <View className="mt-5">
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 20 }}
                    >
                        {stats.map((stat) => (
                            <TouchableOpacity
                                key={stat.title}
                                onPress={() => handleStatPress(stat.title)}
                                activeOpacity={0.7}
                            >
                                <View
                                    className="w-[150px] rounded-2xl p-4 mr-3"
                                    style={{
                                        backgroundColor: Colors.surface,
                                        borderWidth: 1,
                                        borderColor: Colors.border,
                                    }}
                                >
                                    <View className="flex-row items-center justify-between mb-3">
                                        <View
                                            className="w-10 h-10 rounded-xl items-center justify-center"
                                            style={{ backgroundColor: stat.softColor }}
                                        >
                                            <stat.icon size={19} color={stat.accentColor} />
                                        </View>
                                        <ArrowUpRight size={14} color={Colors.textMuted} />
                                    </View>
                                    <Text className="text-[#9CA3AF] text-[11px] font-medium">
                                        {stat.title}
                                    </Text>
                                    <Text className="text-white text-lg font-bold mt-1 tracking-tight">
                                        {stat.value}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* ─── Today's Events List ─── */}
                <View className="mt-7 px-5">
                    <View className="flex-row items-center justify-between mb-4">
                        <View className="flex-row items-center gap-2">
                            <CalendarClock size={18} color={Colors.gold} />
                            <Text className="text-white text-lg font-bold tracking-tight">
                                Today's Events
                            </Text>
                        </View>
                        <TouchableOpacity
                            className="flex-row items-center gap-1 px-3 py-1.5 rounded-full"
                            style={{ backgroundColor: Colors.accentSoft }}
                            onPress={() => navigation.navigate(TabRoute.Bookings)}
                        >
                            <Text className="text-[#F8EFCB] text-xs font-semibold">View All</Text>
                            <ChevronRight size={14} color={Colors.gold} />
                        </TouchableOpacity>
                    </View>

                    {todayEvents.map((event) => (
                        <TouchableOpacity
                            key={event.id}
                            className="rounded-2xl p-4 mb-3"
                            style={{
                                backgroundColor: Colors.surface,
                                borderWidth: 1,
                                borderColor: Colors.border,
                            }}
                            activeOpacity={0.7}
                            onPress={() => navigation.navigate(MainRoute.BookingDetail, { id: event.id })}
                        >
                            <View className="flex-row items-start justify-between">
                                <View className="flex-1">
                                    <View className="flex-row items-center gap-2 mb-1.5">
                                        <View
                                            className="w-8 h-8 rounded-lg items-center justify-center"
                                            style={{ backgroundColor: Colors.accentSoft }}
                                        >
                                            <Building2 size={15} color={Colors.gold} />
                                        </View>
                                        <Text className="text-white text-[15px] font-semibold tracking-tight">
                                            {event.hallName}
                                        </Text>
                                    </View>
                                    <Text className="text-[#9CA3AF] text-[13px] ml-10">
                                        {event.applicantName}
                                    </Text>
                                </View>
                                <View className="items-end gap-1.5">
                                    <StatusChip status={event.status as any} />
                                    <PaymentStatusChip status={event.paymentStatus as any} />
                                </View>
                            </View>

                            <View className="flex-row items-center gap-2 mt-3 ml-10">
                                <Clock3 size={13} color={Colors.textMuted} />
                                <Text className="text-[#6B7280] text-xs font-medium">
                                    {event.startTime} - {event.endTime}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* ─── Weekly Bookings Chart ─── */}
                <View className="mt-7 px-5">
                    <View className="flex-row items-center justify-between mb-4">
                        <View className="flex-row items-center gap-2">
                            <TrendingUp size={18} color={Colors.gold} />
                            <Text className="text-white text-lg font-bold tracking-tight">
                                Weekly Bookings
                            </Text>
                        </View>
                        <View
                            className="px-3 py-1.5 rounded-full"
                            style={{ backgroundColor: (dStats?.weeklyGrowth ?? 0) >= 0 ? Colors.greenSoft : Colors.redSoft }}
                        >
                            <Text className="text-xs font-semibold" style={{ color: (dStats?.weeklyGrowth ?? 0) >= 0 ? Colors.green : Colors.red }}>
                                {(dStats?.weeklyGrowth ?? 0) >= 0 ? '+' : ''}{dStats?.weeklyGrowth ?? 0}% vs last week
                            </Text>
                        </View>
                    </View>

                    <View
                        className="rounded-2xl p-5"
                        style={{
                            backgroundColor: Colors.surface,
                            borderWidth: 1,
                            borderColor: Colors.border,
                        }}
                    >
                        <BarChart
                            data={weeklyChart}
                            barWidth={26}
                            barBorderRadius={8}
                            frontColor={Colors.gold}
                            gradientColor={Colors.gold}
                            noOfSections={4}
                            maxValue={maxChartValue}
                            yAxisThickness={0}
                            xAxisThickness={0}
                            xAxisColor={Colors.border}
                            yAxisTextStyle={{ color: Colors.textMuted, fontSize: 10 }}
                            xAxisLabelTextStyle={{ color: Colors.textMuted, fontSize: 10 }}
                            isAnimated
                            animationDuration={600}
                            showValuesAsTopLabel
                            topLabelTextStyle={{
                                color: Colors.textPrimary,
                                fontSize: 10,
                                fontWeight: '600',
                            }}
                            rulesColor={Colors.border}
                            rulesType="solid"
                        />
                    </View>
                </View>

                {/* ─── Upcoming (Next 7 Days) List ─── */}
                <View className="mt-7 px-5">
                    <View className="flex-row items-center justify-between mb-4">
                        <View className="flex-row items-center gap-2">
                            <CalendarDays size={18} color={Colors.gold} />
                            <Text className="text-white text-lg font-bold tracking-tight">
                                Upcoming (Next 7 Days)
                            </Text>
                        </View>
                        <TouchableOpacity
                            className="flex-row items-center gap-1 px-3 py-1.5 rounded-full"
                            style={{ backgroundColor: Colors.accentSoft }}
                            onPress={() => navigation.navigate(TabRoute.Bookings)}
                        >
                            <Text className="text-[#F8EFCB] text-xs font-semibold">View All</Text>
                            <ChevronRight size={14} color={Colors.gold} />
                        </TouchableOpacity>
                    </View>

                    {upcomingEvents.map((event) => (
                        <TouchableOpacity
                            key={event.id}
                            className="rounded-2xl p-4 mb-3"
                            style={{
                                backgroundColor: Colors.surface,
                                borderWidth: 1,
                                borderColor: Colors.border,
                            }}
                            activeOpacity={0.7}
                            onPress={() => navigation.navigate(MainRoute.BookingDetail, { id: event.id })}
                        >
                            <View className="flex-row items-start justify-between">
                                <View className="flex-1">
                                    <View className="flex-row items-center gap-2 mb-1.5">
                                        <View
                                            className="w-8 h-8 rounded-lg items-center justify-center"
                                            style={{ backgroundColor: Colors.accentSoft }}
                                        >
                                            <Building2 size={15} color={Colors.gold} />
                                        </View>
                                        <Text className="text-white text-[15px] font-semibold tracking-tight">
                                            {event.hallName}
                                        </Text>
                                    </View>
                                    <Text className="text-[#9CA3AF] text-[13px] ml-10">
                                        {event.applicantName}
                                    </Text>
                                </View>
                                <View className="items-end gap-1.5">
                                    <StatusChip status={event.status as any} />
                                    <PaymentStatusChip status={event.paymentStatus as any} />
                                </View>
                            </View>

                            <View className="flex-row items-center gap-2 mt-3 ml-10">
                                <CalendarDays size={13} color={Colors.textMuted} />
                                <Text className="text-[#6B7280] text-xs font-medium">
                                    {formatDate(event.date)} • {event.startTime} - {event.endTime}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default HomeScreen;