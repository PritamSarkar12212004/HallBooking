import React from 'react';
import { View, Text, TouchableOpacity } from '../../../lib/style/withTailwind';
import { LucideIcon } from 'lucide-react-native';
import DashboardPalette from '../../../const/theme/dashboardPalette';

interface KpiCardProps {
    title: string;
    value: string;
    icon: LucideIcon;
    color: string;
    soft: string;
    onPress: () => void;
}

/**
 * Single KPI tile in the Home 2×2 grid.
 * Memoized: re-renders only when primitive props / icon ref change.
 */
const KpiCard = React.memo(({ title, value, icon: Icon, color, soft, onPress }: KpiCardProps) => (
    <TouchableOpacity
        className="w-[48%] rounded-2xl p-4 mb-3"
        onPress={onPress}
        activeOpacity={0.85}
        style={{ backgroundColor: DashboardPalette.card, borderWidth: 1, borderColor: DashboardPalette.border }}
    >
        <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: soft }}>
            <Icon size={20} color={color} />
        </View>
        <Text className="text-[22px] font-extrabold mt-3.5" style={{ color: DashboardPalette.ink }}>{value}</Text>
        <Text className="text-[11px] font-bold uppercase tracking-wide mt-1" style={{ color: DashboardPalette.inkSoft }}>{title}</Text>
    </TouchableOpacity>
));

KpiCard.displayName = 'KpiCard';

export default KpiCard;