import React from 'react';
import { View, Text } from '../../lib/style/withTailwind';
import { Theme } from '../../const/theme/Theme';
import { LucideIcon } from 'lucide-react-native';

interface SummaryCardProps {
    title: string;
    value: string;
    icon: LucideIcon;
    accentColor?: string;
}

const SummaryCard = ({ title, value, icon: Icon, accentColor = Theme.button.primary }: SummaryCardProps) => {
    return (
        <View
            className="w-40 rounded-2xl p-4 mr-3"
            style={{ backgroundColor: Theme.background.secondary }}
        >
            <View
                className="w-10 h-10 rounded-xl items-center justify-center mb-3"
                style={{ backgroundColor: `${accentColor}20` }}
            >
                <Icon size={20} color={accentColor} />
            </View>
            <Text className="text-[#8F8B91] text-xs font-medium">{title}</Text>
            <Text className="text-white text-xl font-bold mt-1">{value}</Text>
        </View>
    );
};

export default SummaryCard;