import React, { useMemo } from 'react';
import { Dimensions } from 'react-native';
import { View, Text } from '../../../lib/style/withTailwind';
import { BarChart, LineChart } from 'react-native-gifted-charts';
import {
    BadgeIndianRupee,
    FileText,
    ShieldCheck,
    TrendingUp,
} from 'lucide-react-native';
import DashboardPalette from '../../../const/theme/dashboardPalette';
import SectionTitle from '../../card/dashboard/SectionTitle';
import AnalyticsBarList from '../AnalyticsBarList';
import AnalyticsKpiGrid from '../AnalyticsKpiGrid';
import AnalyticsRowList, { AnalyticsRowItem } from '../AnalyticsRowList';
import type { AnalyticsPanelProps } from '../panelTypes';
import {
    buildReportCards,
    comparisonRows,
    eventTypeRows,
    maxSeriesValue,
    money,
    toChartData,
    venueRows,
} from '../../../functions/ceo/AnalyticsFunction';
import { formatDate } from '../../../functions/formate/DateTimeFormate';

// Sheet ke padding (16 + 16) aur chart card ke padding (16 + 16) ke baad width.
const CHART_WIDTH = Dimensions.get('window').width - 64;

const ChartCard = ({
    title,
    sub,
    children,
}: {
    title: string;
    sub: string;
    children: React.ReactNode;
}) => (
    <View
        className="rounded-2xl p-4"
        style={{
            backgroundColor: DashboardPalette.card,
            borderWidth: 1,
            borderColor: DashboardPalette.border,
        }}
    >
        <Text className="text-[13px] font-bold" style={{ color: DashboardPalette.ink }}>
            {title}
        </Text>
        <Text className="text-[10px] mt-0.5 mb-3" style={{ color: DashboardPalette.inkMuted }}>
            {sub}
        </Text>
        {children}
    </View>
);

/** 📈 Reports & Analytics — trends, comparison aur deposit report. */
const ReportsPanel = ({ analytics, openBooking }: AnalyticsPanelProps) => {
    const { reports } = analytics;

    const cards = useMemo(() => buildReportCards(reports), [reports]);
    const daily = useMemo(() => toChartData(reports.daily), [reports.daily]);
    const weekly = useMemo(() => toChartData(reports.weekly), [reports.weekly]);
    const monthly = useMemo(() => toChartData(reports.monthly), [reports.monthly]);
    const venues = useMemo(() => venueRows(reports), [reports]);
    const types = useMemo(() => eventTypeRows(reports), [reports]);

    const comparison: AnalyticsRowItem[] = useMemo(
        () =>
            comparisonRows(reports)
                .reverse()
                .map((row) => ({
                    key: row.key,
                    title: row.label,
                    subtitle: `Previous ${row.previousText}`,
                    meta: row.hint,
                    value: row.valueText,
                    valueHint: `${row.delta > 0 ? '+' : ''}${row.delta}%`,
                    badge:
                        row.delta >= 0
                            ? { label: 'Up', tone: 'green' as const }
                            : { label: 'Down', tone: 'red' as const },
                })),
        [reports],
    );

    const deposits: AnalyticsRowItem[] = useMemo(
        () =>
            reports.depositReport.rows.map((row, index) => ({
                key: `${row.bookingId}-${index}`,
                title: row.eventName,
                subtitle: [row.customerName, row.bookingNumber, row.startDate ? formatDate(row.startDate) : '']
                    .filter(Boolean)
                    .join(' · '),
                meta: row.deducted > 0 ? `Deduction: ${row.reason || 'No reason noted'}` : 'No deduction',
                value: money(row.deposit),
                valueHint: `${money(row.deducted)} kept`,
                badge: row.returned
                    ? { label: 'Returned', tone: 'green' as const }
                    : { label: 'Held', tone: 'gold' as const },
                onPress: row.bookingId ? () => openBooking(row.bookingId) : undefined,
            })),
        [reports.depositReport.rows, openBooking],
    );

    return (
        <View className="gap-7">
            <View>
                <SectionTitle
                    icon={TrendingUp}
                    tint={DashboardPalette.gold}
                    title="Reports & Analytics"
                    sub="Trends, comparison and deposit report"
                />
                <View className="mt-3.5">
                    <AnalyticsKpiGrid cards={cards} />
                </View>
            </View>

            <View className="gap-3.5">
                <ChartCard title="Daily Revenue" sub="Money received, day by day">
                    <LineChart
                        data={daily}
                        color={DashboardPalette.goldDeep}
                        thickness={3}
                        curved
                        areaChart
                        startFillColor={DashboardPalette.goldDeep}
                        endFillColor={DashboardPalette.goldDeep}
                        noOfSections={4}
                        maxValue={maxSeriesValue(daily)}
                        parentWidth={CHART_WIDTH}
                        yAxisThickness={0}
                        xAxisThickness={0}
                        yAxisTextStyle={{ color: DashboardPalette.inkMuted, fontSize: 10 }}
                        xAxisLabelTextStyle={{ color: DashboardPalette.inkMuted, fontSize: 9 }}
                        rulesColor={DashboardPalette.border}
                        rulesType="solid"
                        isAnimated
                        animationDuration={600}
                    />
                </ChartCard>

                <ChartCard title="Weekly Revenue" sub="Week (Monday start) wise collection">
                    <BarChart
                        data={weekly}
                        barWidth={22}
                        spacing={14}
                        initialSpacing={10}
                        barBorderRadius={6}
                        frontColor={DashboardPalette.blue}
                        noOfSections={4}
                        maxValue={maxSeriesValue(weekly, 100)}
                        parentWidth={CHART_WIDTH}
                        yAxisThickness={0}
                        xAxisThickness={0}
                        yAxisTextStyle={{ color: DashboardPalette.inkMuted, fontSize: 10 }}
                        xAxisLabelTextStyle={{ color: DashboardPalette.inkMuted, fontSize: 9 }}
                        rulesColor={DashboardPalette.border}
                        rulesType="solid"
                        isAnimated
                        animationDuration={600}
                    />
                </ChartCard>

                <ChartCard title="Monthly Revenue" sub="Month wise collection">
                    <BarChart
                        data={monthly}
                        barWidth={20}
                        spacing={16}
                        initialSpacing={10}
                        barBorderRadius={6}
                        frontColor={DashboardPalette.goldDeep}
                        noOfSections={4}
                        maxValue={maxSeriesValue(monthly, 100)}
                        parentWidth={CHART_WIDTH}
                        yAxisThickness={0}
                        xAxisThickness={0}
                        yAxisTextStyle={{ color: DashboardPalette.inkMuted, fontSize: 10 }}
                        xAxisLabelTextStyle={{ color: DashboardPalette.inkMuted, fontSize: 9 }}
                        rulesColor={DashboardPalette.border}
                        rulesType="solid"
                        isAnimated
                        animationDuration={600}
                    />
                </ChartCard>
            </View>

            <View>
                <SectionTitle
                    icon={BadgeIndianRupee}
                    tint={DashboardPalette.green}
                    title="Revenue by Venue"
                    sub="Collected per hall in this period"
                />
                <View className="mt-3.5">
                    <AnalyticsBarList rows={venues} emptyText="No hall revenue in this period." />
                </View>
            </View>

            <View>
                <SectionTitle
                    icon={FileText}
                    tint={DashboardPalette.violet}
                    title="Revenue by Event Type"
                    sub="Collected per event type"
                />
                <View className="mt-3.5">
                    <AnalyticsBarList rows={types} emptyText="No events in this period." />
                </View>
            </View>

            <View>
                <SectionTitle
                    icon={TrendingUp}
                    tint={DashboardPalette.blue}
                    title="Month vs Previous Month"
                    sub="Collection comparison"
                />
                <View className="mt-3.5">
                    <AnalyticsRowList
                        items={comparison}
                        emptyText="Not enough history for comparison."
                    />
                </View>
            </View>

            <View>
                <SectionTitle
                    icon={ShieldCheck}
                    tint={DashboardPalette.gold}
                    title="Deposit Report"
                    sub="Collected, returned, deducted and reason"
                />
                <View className="mt-3.5">
                    <AnalyticsRowList
                        items={deposits}
                        emptyText="No security deposit in this period."
                    />
                </View>
            </View>
        </View>
    );
};

export default ReportsPanel;
