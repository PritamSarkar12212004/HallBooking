import React, { useMemo } from 'react';
import { View, Text } from '../../../lib/style/withTailwind';
import { CalendarCheck, IndianRupee, TrendingUp } from 'lucide-react-native';
import DashboardPalette from '../../../const/theme/dashboardPalette';
import SectionTitle from '../../card/dashboard/SectionTitle';
import AnalyticsKpiGrid from '../AnalyticsKpiGrid';
import AnalyticsRowList from '../AnalyticsRowList';
import AnalyticsStatPills from '../AnalyticsStatPills';
import { eventRevenueItems } from '../panelItems';
import type { AnalyticsPanelProps } from '../panelTypes';
import {
    buildOverviewCards,
    collectionPct,
    money,
} from '../../../functions/ceo/AnalyticsFunction';

/** 📊 Overview — poore business ka ek nazar me picture. */
const OverviewPanel = ({ analytics, openBooking }: AnalyticsPanelProps) => {
    const { overview, finance } = analytics;

    const cards = useMemo(() => buildOverviewCards(overview), [overview]);
    const topEvents = useMemo(
        () => eventRevenueItems(finance.eventWiseRevenue.slice(0, 6), openBooking),
        [finance.eventWiseRevenue, openBooking],
    );

    const collectedPct = collectionPct(overview.totalCollected, overview.totalBilled);

    return (
        <View className="gap-7">
            <View>
                <SectionTitle
                    icon={TrendingUp}
                    tint={DashboardPalette.gold}
                    title="Overview"
                    sub="Every number, for the selected period"
                />
                <View className="mt-3.5">
                    <AnalyticsKpiGrid cards={cards} />
                </View>
            </View>

            {/* Collection progress */}
            <View
                className="rounded-2xl p-4"
                style={{
                    backgroundColor: DashboardPalette.card,
                    borderWidth: 1,
                    borderColor: DashboardPalette.border,
                }}
            >
                <View className="flex-row items-center justify-between">
                    <Text
                        className="text-[13px] font-bold"
                        style={{ color: DashboardPalette.ink }}
                    >
                        Collection Progress
                    </Text>
                    <Text
                        className="text-[13px] font-extrabold"
                        style={{ color: DashboardPalette.green }}
                    >
                        {collectedPct}%
                    </Text>
                </View>

                <View
                    className="h-2 rounded-full mt-3 overflow-hidden"
                    style={{ backgroundColor: DashboardPalette.border }}
                >
                    <View
                        className="h-2 rounded-full"
                        style={{
                            width: `${Math.max(2, collectedPct)}%`,
                            backgroundColor: DashboardPalette.green,
                        }}
                    />
                </View>

                <View className="flex-row items-center justify-between mt-2.5">
                    <Text className="text-[11px]" style={{ color: DashboardPalette.inkSoft }}>
                        Collected {money(overview.totalCollected)}
                    </Text>
                    <Text className="text-[11px]" style={{ color: DashboardPalette.inkSoft }}>
                        Billed {money(overview.totalBilled)}
                    </Text>
                </View>

                <View className="flex-row items-center mt-3">
                    <IndianRupee size={13} color={DashboardPalette.red} />
                    <Text className="text-[11px] ml-1.5" style={{ color: DashboardPalette.red }}>
                        {money(overview.pendingPayments)} still pending
                    </Text>
                </View>
            </View>

            {/* Live strip */}
            <View>
                <SectionTitle
                    icon={CalendarCheck}
                    tint={DashboardPalette.blue}
                    title="Live Now"
                    sub="Independent of the selected period"
                />
                <View className="mt-3.5">
                    <AnalyticsStatPills
                        pills={[
                            {
                                key: 'today',
                                label: "Today's events",
                                value: String(overview.todayEvents),
                                tone: 'green',
                            },
                            {
                                key: 'ongoing',
                                label: 'Ongoing',
                                value: String(overview.ongoingEvents),
                                tone: 'gold',
                            },
                            {
                                key: 'upcoming',
                                label: 'Upcoming',
                                value: String(overview.upcomingEvents),
                                tone: 'blue',
                            },
                            {
                                key: 'held',
                                label: 'Deposits held',
                                value: money(overview.securityDepositsHeld),
                                tone: 'violet',
                            },
                        ]}
                    />
                </View>
            </View>

            {/* Top earning events */}
            <View>
                <SectionTitle
                    icon={IndianRupee}
                    tint={DashboardPalette.green}
                    title="Top Earning Events"
                    sub="Highest collected bookings in this period"
                />
                <View className="mt-3.5">
                    <AnalyticsRowList
                        items={topEvents}
                        emptyText="No bookings in this period yet."
                    />
                </View>
            </View>
        </View>
    );
};

export default OverviewPanel;
