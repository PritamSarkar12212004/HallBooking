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
    maxValue: number;
}


const WeeklyBookingsChart = React.memo(({ data, maxValue }: WeeklyBookingsChartProps) => (
    <View
        className="rounded-3xl p-5"
        style={{ backgroundColor: DashboardPalette.card, borderWidth: 1, borderColor: DashboardPalette.border }}
    >
        <BarChart
            data={data}
            barWidth={24}
            barBorderRadius={8}
            frontColor={DashboardPalette.gold}
            gradientColor={DashboardPalette.gold}
            noOfSections={4}
            maxValue={maxValue}
            yAxisThickness={0}
            xAxisThickness={0}
            xAxisColor={DashboardPalette.border}
            yAxisTextStyle={{ color: DashboardPalette.inkMuted, fontSize: 10 }}
            xAxisLabelTextStyle={{ color: DashboardPalette.inkSoft, fontSize: 10 }}
            showValuesAsTopLabel
            topLabelTextStyle={{ color: DashboardPalette.ink, fontSize: 10, fontWeight: '800' }}
            isAnimated
            animationDuration={600}
        />
    </View>
));

WeeklyBookingsChart.displayName = 'WeeklyBookingsChart';

export default WeeklyBookingsChart;