import React from 'react';
import { View, Text, TouchableOpacity } from '../../lib/style/withTailwind';
import { LucideIcon } from 'lucide-react-native';
import { Palette } from './const/profilePalette';

interface ProfileMenuItemProps {
    icon: LucideIcon;
    label: string;
    right?: string;
    onPress?: () => void;
    destructive?: boolean;
}

const ProfileMenuItem = React.memo(({ icon: Icon, label, right, onPress, destructive }: ProfileMenuItemProps) => (
    <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        className="flex-row items-center px-4 py-4"
        style={{ borderBottomWidth: 1, borderBottomColor: Palette.border }}
    >
        <View
            className="w-10 h-10 rounded-xl items-center justify-center"
            style={{ backgroundColor: destructive ? Palette.redSoft : Palette.surfaceLight }}
        >
            <Icon size={19} color={destructive ? Palette.red : Palette.primary} />
        </View>
        <Text className="flex-1 ml-3 text-[15px] font-semibold" style={{ color: destructive ? Palette.red : Palette.textPrimary }}>
            {label}
        </Text>
        {right ? (
            <Text className="text-xs" style={{ color: Palette.textMuted }}>{right}</Text>
        ) : null}
    </TouchableOpacity>
));

ProfileMenuItem.displayName = 'ProfileMenuItem';
export default ProfileMenuItem;