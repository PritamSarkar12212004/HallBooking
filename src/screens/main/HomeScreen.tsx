import React, { useCallback, useMemo } from 'react';
import { ScrollView, View, SafeAreaView, Text, TouchableOpacity } from '../../lib/style/withTailwind';
import {
    Plus,
    CalendarPlus,
    CalendarCheck2,
    Wallet,
    CalendarDays,
    Users,
    TrendingUp,
    PartyPopper,
    ChevronRight,
} from 'lucide-react-native';
import { TabRoute, MainRoute } from '../../const/routes/route';
import { useAppSelector } from '../../hooks/redux/redux';
import useGetDashboard from '../../api/booking/hooks/useGetDashboard';
import { DashboardEventItem } from '../../interface/api/dashboardInterface';
import DashHeader from '../../components/header/DashHeader';
import DashboardPalette from '../../const/theme/dashboardPalette';
import { formatCompactINR } from '../../functions/formate/CurrencyFormate';
import HeroRevenueCard from '../../components/card/dashboard/HeroRevenueCard';
import KpiCard from '../../components/card/dashboard/KpiCard';
import EventCard from '../../components/card/dashboard/EventCard';
import SectionTitle from '../../components/card/dashboard/SectionTitle';
import EmptyListCard from '../../components/card/dashboard/EmptyListCard';
import WeeklyBookingsChart from '../../components/charts/WeeklyBookingsChart';
import HomeScreenSkeleton from '../../ui/Skeleton/HomeScreenSkeleton';

const HomeScreen = ({ navigation }: any) => {
    const user = useAppSelector((state) => state.user.user);
    const { dashboard, isLoading } = useGetDashboard(user?.token);

    // ── Derived data: keep stable references so memoized children skip re-render ──
    const stats = dashboard?.stats;
    const today = useMemo(
        () => (dashboard?.todayEvents ?? []) as DashboardEventItem[],
        [dashboard?.todayEvents]
    );
    const upcoming = useMemo(
        () => (dashboard?.upcomingEvents ?? []) as DashboardEventItem[],
        [dashboard?.upcomingEvents]
    );
    const weeklyChart = useMemo(
        () => dashboard?.weeklyChart ?? [],
        [dashboard?.weeklyChart]
    );
    const growth = stats?.weeklyGrowth ?? 0;
    const maxChartValue = useMemo(
        () => Math.max(...weeklyChart.map((w) => w.value), 4),
        [weeklyChart]
    );

    // ── Stable navigation handlers (never recreated between renders) ──
    const openBookings = useCallback(() => navigation.navigate(TabRoute.Bookings), [navigation]);
    const openEvent = useCallback(
        (id: string) => navigation.navigate(MainRoute.BookingDetail, { id }),
        [navigation]
    );
    const openNewBooking = useCallback(() => navigation.navigate(MainRoute.NewBooking), [navigation]);
    const openHallCalendar = useCallback(() => navigation.navigate(MainRoute.HallCalendar), [navigation]);

    // ── KPI cards data (memoized on stats) ──
    const kpis = useMemo(
        () => [
            {
                title: "Today's Events",
                value: String(stats?.todayEvents ?? 0),
                icon: CalendarCheck2,
                color: DashboardPalette.goldDeep,
                soft: DashboardPalette.goldSoft,
            },
            {
                title: 'Pending Due',
                value: formatCompactINR(stats?.pendingPaymentsAmount ?? 0),
                icon: Wallet,
                color: DashboardPalette.red,
                soft: DashboardPalette.redSoft,
            },
            {
                title: "Week's Bookings",
                value: String(stats?.weekBookings ?? 0),
                icon: CalendarDays,
                color: DashboardPalette.blue,
                soft: DashboardPalette.blueSoft,
            },
            {
                title: 'Active Bookings',
                value: String(stats?.activeBookings ?? 0),
                icon: Users,
                color: DashboardPalette.violet,
                soft: DashboardPalette.violetSoft,
            },
        ],
        [stats]
    );

    // ── Memoized lists: closures created once per data change, not per render ──
    const todayCards = useMemo(
        () => today.map((e) => <EventCard key={e.id} event={e} onPress={() => openEvent(e.id)} />),
        [today, openEvent]
    );
    const upcomingCards = useMemo(
        () => upcoming.map((e) => <EventCard key={e.id} event={e} showDate onPress={() => openEvent(e.id)} />),
        [upcoming, openEvent]
    );

    return (
        <SafeAreaView className="flex-1" style={{ backgroundColor: DashboardPalette.bg }} edges={['top']}>
            <DashHeader navigation={navigation} name={user?.name} photo={user?.photo} />
            <View className="flex-1">
                {isLoading && !dashboard ? (
                    <HomeScreenSkeleton />
                ) : (
                <ScrollView
                    className="flex-1 rounded-t-[28px]"
                    style={{ backgroundColor: DashboardPalette.sheet }}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 18, paddingBottom: 28 }}
                >
                    <HeroRevenueCard stats={stats} onPress={openBookings} />
                    <View className="flex-row gap-3 mt-5">
                        <TouchableOpacity
                            activeOpacity={0.85}
                            onPress={openNewBooking}
                            className="flex-1 rounded-2xl p-4"
                            style={{ backgroundColor: DashboardPalette.goldSoft }}
                        >
                            <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: DashboardPalette.gold }}>
                                <Plus size={20} color="#FFFFFF" />
                            </View>
                            <Text className="text-[13px] font-extrabold mt-3" style={{ color: DashboardPalette.goldDeep }}>New Booking</Text>
                            <Text className="text-[11px] font-medium mt-0.5" style={{ color: DashboardPalette.inkSoft }}>Create an event</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            activeOpacity={0.85}
                            onPress={openHallCalendar}
                            className="flex-1 rounded-2xl p-4"
                            style={{ backgroundColor: DashboardPalette.blueSoft }}
                        >
                            <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: DashboardPalette.blue }}>
                                <CalendarPlus size={20} color="#FFFFFF" />
                            </View>
                            <Text className="text-[13px] font-extrabold mt-3" style={{ color: DashboardPalette.blue }}>Hall Calendar</Text>
                            <Text className="text-[11px] font-medium mt-0.5" style={{ color: DashboardPalette.inkSoft }}>Check availability</Text>
                        </TouchableOpacity>
                    </View>

                    {/* KPI grid */}
                    <View className="flex-row flex-wrap justify-between mt-3">
                        {kpis.map((k) => (
                            <KpiCard
                                key={k.title}
                                title={k.title}
                                value={k.value}
                                icon={k.icon}
                                color={k.color}
                                soft={k.soft}
                                onPress={openBookings}
                            />
                        ))}
                    </View>

                    {/* Weekly chart */}
                    <View className="mt-2">
                        <View className="flex-row items-end justify-between mb-4">
                            <SectionTitle icon={TrendingUp} tint={DashboardPalette.gold} title="Weekly Bookings" sub="Created in the last 7 days" />
                            <View className="px-2.5 py-1.5 rounded-full mt-1" style={{ backgroundColor: growth >= 0 ? DashboardPalette.greenSoft : DashboardPalette.redSoft }}>
                                <Text className="text-xs font-black" style={{ color: growth >= 0 ? DashboardPalette.green : DashboardPalette.red }}>
                                    {growth >= 0 ? '▲' : '▼'} {Math.abs(growth)}%
                                </Text>
                            </View>
                        </View>
                        <WeeklyBookingsChart data={weeklyChart} maxValue={maxChartValue} />
                    </View>

                    {/* Today's events */}
                    <View className="mt-7">
                        <View className="flex-row items-end justify-between mb-4">
                            <SectionTitle
                                icon={CalendarCheck2}
                                tint={DashboardPalette.green}
                                title="Today's Events"
                                sub={today.length ? `${today.length} event(s) scheduled` : 'Nothing planned today'}
                            />
                            <TouchableOpacity onPress={openBookings} className="flex-row items-center mb-1" activeOpacity={0.7}>
                                <Text className="text-xs font-black" style={{ color: DashboardPalette.goldDeep }}>View all</Text>
                                <ChevronRight size={14} color={DashboardPalette.goldDeep} />
                            </TouchableOpacity>
                        </View>
                        {todayCards.length ? (
                            todayCards
                        ) : (
                            <EmptyListCard icon={PartyPopper} tint={DashboardPalette.green} title="No events today" sub="Start a new booking to get going" />
                        )}
                    </View>

                    {/* Upcoming events */}
                    <View className="mt-7">
                        <View className="flex-row items-end justify-between mb-4">
                            <SectionTitle icon={CalendarDays} tint={DashboardPalette.violet} title="Upcoming" sub="Next 7 days" />
                            <TouchableOpacity onPress={openBookings} className="flex-row items-center mb-1" activeOpacity={0.7}>
                                <Text className="text-xs font-black" style={{ color: DashboardPalette.goldDeep }}>View all</Text>
                                <ChevronRight size={14} color={DashboardPalette.goldDeep} />
                            </TouchableOpacity>
                        </View>
                        {upcomingCards.length ? (
                            upcomingCards
                        ) : (
                            <EmptyListCard icon={PartyPopper} tint={DashboardPalette.violet} title="Nothing booked ahead" sub="Upcoming events will show here" />
                        )}
                    </View>
                </ScrollView>
                )}
            </View>
        </SafeAreaView>
    );
};

export default HomeScreen;
