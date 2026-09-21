import React from 'react';
import { View, Text } from '../../lib/style/withTailwind';
import DashboardPalette from '../../const/theme/dashboardPalette';
import { AnalyticsTone } from '../../functions/ceo/AnalyticsFunction';
import { toneStyle } from './analyticsTheme';

export interface AnalyticsPill {
    key: string;
    label: string;
    value: string;
    tone: AnalyticsTone;
}

/** Chhote count pills — events ke counts, live status strip, etc. */
const AnalyticsStatPills = React.memo(({ pills }: { pills: AnalyticsPill[] }) => {
    if (pills.length === 0) return null;

    return (
        <View className="flex-row flex-wrap gap-2">
            {pills.map((pill) => {
                const tone = toneStyle(pill.tone);
                return (
                    <View
                        key={pill.key}
                        className="px-3 py-2 rounded-xl"
                        style={{
                            backgroundColor: DashboardPalette.card,
                            borderWidth: 1,
                            borderColor: DashboardPalette.border,
                        }}
                    >
                        <Text
                            className="text-[10px] font-semibold"
                            style={{ color: DashboardPalette.inkMuted }}
                        >
                            {pill.label}
                        </Text>
                        <Text
                            className="text-[15px] font-extrabold mt-0.5"
                            style={{ color: tone.accent }}
                        >
                            {pill.value}
                        </Text>
                    </View>
                );
            })}
        </View>
    );
});

AnalyticsStatPills.displayName = 'AnalyticsStatPills';

export default AnalyticsStatPills;
