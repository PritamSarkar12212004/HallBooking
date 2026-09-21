import React from 'react';
import { View, Text, TouchableOpacity } from '../../lib/style/withTailwind';
import DashboardPalette from '../../const/theme/dashboardPalette';
import { BarRow } from '../../functions/ceo/AnalyticsFunction';
import { toneStyle } from './analyticsTheme';

interface Props {
    rows: BarRow[];
    emptyText?: string;
    onPressRow?: (row: BarRow) => void;
}

/**
 * Label + amount + share bar wali rows (collection by mode, revenue by venue,
 * revenue by event type) — percentage bar se hissa turant samajh aata hai.
 */
const AnalyticsBarList = React.memo(({ rows, emptyText, onPressRow }: Props) => {
    if (rows.length === 0) {
        return (
            <Text className="text-xs" style={{ color: DashboardPalette.inkMuted }}>
                {emptyText ?? 'No data for this period.'}
            </Text>
        );
    }

    return (
        <View className="gap-3">
            {rows.map((row) => {
                const tone = toneStyle(row.tone);
                const pressable = !!onPressRow;

                return (
                    <TouchableOpacity
                        key={row.key}
                        activeOpacity={pressable ? 0.85 : 1}
                        disabled={!pressable}
                        onPress={() => onPressRow?.(row)}
                    >
                        <View className="flex-row items-center justify-between">
                            <Text
                                className="text-[13px] font-bold flex-1 pr-2"
                                style={{ color: DashboardPalette.ink }}
                                numberOfLines={1}
                            >
                                {row.label}
                            </Text>
                            <Text
                                className="text-[13px] font-extrabold"
                                style={{ color: DashboardPalette.ink }}
                            >
                                {row.valueText}
                            </Text>
                        </View>

                        <View
                            className="h-1.5 rounded-full mt-2 overflow-hidden"
                            style={{ backgroundColor: DashboardPalette.border }}
                        >
                            <View
                                className="h-1.5 rounded-full"
                                style={{
                                    width: `${Math.max(2, Math.min(100, row.sharePct))}%`,
                                    backgroundColor: tone.accent,
                                }}
                            />
                        </View>

                        <View className="flex-row items-center justify-between mt-1">
                            <Text
                                className="text-[10px]"
                                style={{ color: DashboardPalette.inkMuted }}
                                numberOfLines={1}
                            >
                                {row.hint ?? ''}
                            </Text>
                            <Text
                                className="text-[10px] font-semibold"
                                style={{ color: tone.accent }}
                            >
                                {row.sharePct}%
                            </Text>
                        </View>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
});

AnalyticsBarList.displayName = 'AnalyticsBarList';

export default AnalyticsBarList;
