import React from 'react';
import { View } from '../../lib/style/withTailwind';
import { BarChart } from 'react-native-gifted-charts';
import DashboardPalette from '../../const/theme/dashboardPalette';

export interface ChartDatum {
    value: number;
    label: string;
}

interface WeeklyBookingsChartProps {
    data: ChartDatum[];
    maxValue?: number;
}

const WeeklyBookingsChart = React.memo(({ data, maxValue }: WeeklyBookingsChartProps) => {
    // Normalise the data so the chart always receives sane numeric values —
    // previously malformed/empty points rendered an empty chart.
    const chartData = (data ?? []).map((d) => ({
        value: Number.isFinite(Number(d?.value)) ? Number(d.value) : 0,
        label: String(d?.label ?? ''),
    }));

    const computedMax = Math.max(...chartData.map((d) => d.value), 0);
    const safeMax = maxValue && maxValue > 0 ? maxValue : Math.max(computedMax, 4);

    return (
        <View
            className="rounded-3xl p-5"
            style={{ backgroundColor: DashboardPalette.card, borderWidth: 1, borderColor: DashboardPalette.border }}
        >
            <BarChart
                data={chartData}
                barWidth={26}
                spacing={14}
                initialSpacing={12}
                endSpacing={12}
                barBorderRadius={8}
                frontColor={DashboardPalette.gold}
                noOfSections={4}
                maxValue={safeMax}
                yAxisThickness={0}
                xAxisThickness={0}
                xAxisColor={DashboardPalette.border}
                rulesColor={DashboardPalette.border}
                rulesType="solid"
                yAxisTextStyle={{ color: DashboardPalette.inkMuted, fontSize: 10 }}
                xAxisLabelTextStyle={{ color: DashboardPalette.inkSoft, fontSize: 10 }}
                showValuesAsTopLabel
                topLabelTextStyle={{ color: DashboardPalette.ink, fontSize: 10, fontWeight: '800' }}
                isAnimated
                animationDuration={600}
            />
        </View>
    );
});

WeeklyBookingsChart.displayName = 'WeeklyBookingsChart';

export default WeeklyBookingsChart;
