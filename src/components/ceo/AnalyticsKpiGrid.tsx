import React from 'react';
import { View, Text, TouchableOpacity } from '../../lib/style/withTailwind';
import { ChevronRight } from 'lucide-react-native';
import DashboardPalette from '../../const/theme/dashboardPalette';
import { AnalyticsCard } from '../../functions/ceo/AnalyticsFunction';
import { iconForCard, toneStyle } from './analyticsTheme';

interface Props {
    cards: AnalyticsCard[];
    onPressCard?: (card: AnalyticsCard) => void;
}

/** Do columns me KPI cards — Dashboard ke cards jaisa hi look. */
const AnalyticsKpiGrid = React.memo(({ cards, onPressCard }: Props) => {
    if (cards.length === 0) return null;

    return (
        <View className="flex-row flex-wrap gap-3">
            {cards.map((card) => {
                const tone = toneStyle(card.tone);
                const Icon = iconForCard(card.key);
                const pressable = !!onPressCard;

                return (
                    <TouchableOpacity
                        key={card.key}
                        activeOpacity={pressable ? 0.85 : 1}
                        disabled={!pressable}
                        onPress={() => onPressCard?.(card)}
                        className="rounded-2xl p-3.5"
                        style={{
                            width: '48%',
                            backgroundColor: DashboardPalette.card,
                            borderWidth: 1,
                            borderColor: DashboardPalette.border,
                        }}
                    >
                        <View className="flex-row items-center justify-between">
                            <View
                                className="w-9 h-9 rounded-xl items-center justify-center"
                                style={{ backgroundColor: tone.soft }}
                            >
                                <Icon size={16} color={tone.accent} />
                            </View>
                            {pressable ? (
                                <ChevronRight size={14} color={DashboardPalette.inkMuted} />
                            ) : null}
                        </View>

                        <Text
                            className="text-[11px] font-medium mt-2.5"
                            style={{ color: DashboardPalette.inkSoft }}
                            numberOfLines={2}
                        >
                            {card.title}
                        </Text>
                        <Text
                            className="text-[17px] font-extrabold mt-0.5"
                            style={{ color: DashboardPalette.ink }}
                            numberOfLines={1}
                        >
                            {card.value}
                        </Text>
                        {card.hint ? (
                            <Text
                                className="text-[10px] mt-0.5"
                                style={{ color: DashboardPalette.inkMuted }}
                                numberOfLines={2}
                            >
                                {card.hint}
                            </Text>
                        ) : null}
                    </TouchableOpacity>
                );
            })}
        </View>
    );
});

AnalyticsKpiGrid.displayName = 'AnalyticsKpiGrid';

export default AnalyticsKpiGrid;
