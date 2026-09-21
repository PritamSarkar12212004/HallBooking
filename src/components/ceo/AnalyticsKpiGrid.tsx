import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from '../../lib/style/withTailwind';
import { ChevronRight } from 'lucide-react-native';
import DashboardPalette from '../../const/theme/dashboardPalette';
import { AnalyticsCard } from '../../functions/ceo/AnalyticsFunction';
import { iconForCard, toneStyle } from './analyticsTheme';

interface Props {
    cards: AnalyticsCard[];
    onPressCard?: (card: AnalyticsCard) => void;
}

/**
 * Cards ko 2-2 ke rows me baantta hai.
 *
 * Pehle `flex-wrap` + `width: 48%` + `gap` use hota tha — chhoti screen par
 * 48 + 48% aur gap milkar 100% se zyada ho jate the, isliye grid ek column me
 * toot jaata tha. Ab har row me do `flex-1` cards hain, isliye har screen width
 * par grid sahi rehta hai.
 */
const chunkPairs = (cards: AnalyticsCard[]): AnalyticsCard[][] => {
    const rows: AnalyticsCard[][] = [];
    for (let index = 0; index < cards.length; index += 2) {
        rows.push(cards.slice(index, index + 2));
    }
    return rows;
};

/** Do columns me KPI cards. */
const AnalyticsKpiGrid = React.memo(({ cards, onPressCard }: Props) => {
    const rows = useMemo(() => chunkPairs(cards), [cards]);

    if (cards.length === 0) return null;

    return (
        <View>
            {rows.map((pair, rowIndex) => (
                <View key={rowIndex} className="flex-row gap-3">
                    {pair.map((card) => {
                        const tone = toneStyle(card.tone);
                        const Icon = iconForCard(card.key);
                        const pressable = !!onPressCard;

                        return (
                            <TouchableOpacity
                                key={card.key}
                                activeOpacity={pressable ? 0.85 : 1}
                                disabled={!pressable}
                                onPress={() => onPressCard?.(card)}
                                className="flex-1 rounded-2xl p-3.5 mb-3"
                                style={{
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
                                        <ChevronRight
                                            size={14}
                                            color={DashboardPalette.inkMuted}
                                        />
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

                    {/* Odd count par aakhri card poori width na le. */}
                    {pair.length === 1 ? <View className="flex-1 mb-3" /> : null}
                </View>
            ))}
        </View>
    );
});

AnalyticsKpiGrid.displayName = 'AnalyticsKpiGrid';

export default AnalyticsKpiGrid;
