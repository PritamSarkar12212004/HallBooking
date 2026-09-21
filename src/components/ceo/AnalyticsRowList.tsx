import React from 'react';
import { View, Text, TouchableOpacity } from '../../lib/style/withTailwind';
import { ChevronRight } from 'lucide-react-native';
import DashboardPalette from '../../const/theme/dashboardPalette';
import { AnalyticsTone } from '../../functions/ceo/AnalyticsFunction';
import { toneStyle } from './analyticsTheme';

export interface AnalyticsRowItem {
    key: string;
    title: string;
    subtitle?: string;
    meta?: string;
    value?: string;
    valueHint?: string;
    badge?: { label: string; tone: AnalyticsTone };
    onPress?: () => void;
}

interface Props {
    items: AnalyticsRowItem[];
    emptyText?: string;
    /** Kitni rows dikhani hain (0 = sab). */
    limit?: number;
}

/** Events / payments / customers / staff ki common row list. */
const AnalyticsRowList = React.memo(({ items, emptyText, limit = 0 }: Props) => {
    const visible = limit > 0 ? items.slice(0, limit) : items;

    if (visible.length === 0) {
        return (
            <Text className="text-xs" style={{ color: DashboardPalette.inkMuted }}>
                {emptyText ?? 'Nothing to show for this period.'}
            </Text>
        );
    }

    return (
        <View className="gap-2.5">
            {visible.map((item) => {
                const pressable = !!item.onPress;
                const badgeTone = item.badge ? toneStyle(item.badge.tone) : null;

                return (
                    <TouchableOpacity
                        key={item.key}
                        activeOpacity={pressable ? 0.85 : 1}
                        disabled={!pressable}
                        onPress={item.onPress}
                        className="rounded-2xl p-3.5 flex-row items-center"
                        style={{
                            backgroundColor: DashboardPalette.card,
                            borderWidth: 1,
                            borderColor: DashboardPalette.border,
                        }}
                    >
                        <View className="flex-1 pr-2">
                            <View className="flex-row items-center">
                                <Text
                                    className="text-[13.5px] font-bold flex-shrink"
                                    style={{ color: DashboardPalette.ink }}
                                    numberOfLines={1}
                                >
                                    {item.title}
                                </Text>
                                {item.badge && badgeTone ? (
                                    <View
                                        className="px-2 py-0.5 rounded-full ml-2"
                                        style={{ backgroundColor: badgeTone.soft }}
                                    >
                                        <Text
                                            className="text-[9px] font-bold"
                                            style={{ color: badgeTone.accent }}
                                        >
                                            {item.badge.label}
                                        </Text>
                                    </View>
                                ) : null}
                            </View>

                            {item.subtitle ? (
                                <Text
                                    className="text-[11px] mt-0.5"
                                    style={{ color: DashboardPalette.inkSoft }}
                                    numberOfLines={2}
                                >
                                    {item.subtitle}
                                </Text>
                            ) : null}

                            {item.meta ? (
                                <Text
                                    className="text-[10px] mt-0.5"
                                    style={{ color: DashboardPalette.inkMuted }}
                                    numberOfLines={2}
                                >
                                    {item.meta}
                                </Text>
                            ) : null}
                        </View>

                        {item.value ? (
                            <View className="items-end">
                                <Text
                                    className="text-[13px] font-extrabold"
                                    style={{ color: DashboardPalette.ink }}
                                >
                                    {item.value}
                                </Text>
                                {item.valueHint ? (
                                    <Text
                                        className="text-[10px] mt-0.5"
                                        style={{ color: DashboardPalette.inkMuted }}
                                    >
                                        {item.valueHint}
                                    </Text>
                                ) : null}
                            </View>
                        ) : null}

                        {pressable ? (
                            <ChevronRight
                                size={14}
                                color={DashboardPalette.inkMuted}
                                style={{ marginLeft: 6 }}
                            />
                        ) : null}
                    </TouchableOpacity>
                );
            })}
        </View>
    );
});

AnalyticsRowList.displayName = 'AnalyticsRowList';

export default AnalyticsRowList;
