import React from 'react';
import { View, Text } from '../../../lib/style/withTailwind';
import { LucideIcon } from 'lucide-react-native';
import DashboardPalette from '../../../const/theme/dashboardPalette';

interface EmptyListCardProps {
    icon: LucideIcon;
    tint: string;
    title: string;
    sub?: string;
}

/**
 * Friendly light empty-state for list sections.
 * Memoized: icon ref + strings are stable.
 */
const EmptyListCard = React.memo(({ icon: Icon, tint, title, sub }: EmptyListCardProps) => (
    <View
        className="rounded-3xl items-center justify-center py-10"
        style={{ backgroundColor: DashboardPalette.card, borderWidth: 1, borderColor: DashboardPalette.border }}
    >
        <View className="w-14 h-14 rounded-2xl items-center justify-center" style={{ backgroundColor: tint }}>
            <Icon size={24} color="#FFFFFF" />
        </View>
        <Text className="text-[15px] font-extrabold mt-3" style={{ color: DashboardPalette.ink }}>{title}</Text>
        {sub ? <Text className="text-xs font-medium mt-1" style={{ color: DashboardPalette.inkMuted }}>{sub}</Text> : null}
    </View>
));

EmptyListCard.displayName = 'EmptyListCard';

export default EmptyListCard;