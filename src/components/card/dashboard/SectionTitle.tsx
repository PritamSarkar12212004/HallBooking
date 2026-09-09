import React from 'react';
import { View, Text } from '../../../lib/style/withTailwind';
import { LucideIcon } from 'lucide-react-native';
import DashboardPalette from '../../../const/theme/dashboardPalette';

interface SectionTitleProps {
    icon: LucideIcon;
    tint: string;
    title: string;
    sub?: string;
}

/**
 * Section header (icon tile + title + optional subtitle).
 * Memoized: icon ref, tint strings and title are stable across renders.
 */
const SectionTitle = React.memo(({ icon: Icon, tint, title, sub }: SectionTitleProps) => (
    <View className="flex-row items-start gap-2.5">
        <View className="w-9 h-9 rounded-xl items-center justify-center" style={{ backgroundColor: tint }}>
            <Icon size={17} color="#FFFFFF" />
        </View>
        <View className="flex-1">
            <Text className="text-[17px] font-extrabold tracking-tight" style={{ color: DashboardPalette.ink }}>{title}</Text>
            {sub ? <Text className="text-xs font-medium mt-0.5" style={{ color: DashboardPalette.inkMuted }}>{sub}</Text> : null}
        </View>
    </View>
));

SectionTitle.displayName = 'SectionTitle';

export default SectionTitle;