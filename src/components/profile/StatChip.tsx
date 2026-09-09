import React from 'react';
import { View, Text } from '../../lib/style/withTailwind';
import { LucideIcon } from 'lucide-react-native';
import { Palette } from './const/profilePalette';

interface StatChipProps {
    icon: LucideIcon;
    label: string;
    value: string;
    color: string;
    soft: string;
}

const StatChip = React.memo(({ icon: Icon, label, value, color, soft }: StatChipProps) => (
    <View
        className="flex-1 flex-row items-center rounded-2xl px-3 py-2.5 mr-3"
        style={{ backgroundColor: Palette.surface, borderWidth: 1, borderColor: Palette.border }}
    >
        <View className="w-9 h-9 rounded-xl items-center justify-center" style={{ backgroundColor: soft }}>
            <Icon size={17} color={color} />
        </View>
        <View className="ml-2 flex-1">
            <Text className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: Palette.textMuted }}>{label}</Text>
            <Text className="text-sm font-bold" style={{ color: Palette.textPrimary }} numberOfLines={1}>{value}</Text>
        </View>
    </View>
));

StatChip.displayName = 'StatChip';
export default StatChip;