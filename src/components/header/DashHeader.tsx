import React, { useMemo } from 'react'
import { Image, Text, TouchableOpacity, View } from '../../lib/style/withTailwind';
import { Bell, Sparkles } from 'lucide-react-native';
import { TabRoute } from '../../const/routes/route';

const Colors = {
    background: '#0F1115',
    surface: '#1A1D24',
    surfaceLight: '#232733',
    border: '#2A2F3A',
    textPrimary: '#FFFFFF',
    textSecondary: '#9CA3AF',
    textMuted: '#6B7280',
    accent: '#F8EFCB',
    accentSoft: 'rgba(248, 239, 203, 0.12)',
    gold: '#D4AF37',
    green: '#34D399',
    greenSoft: 'rgba(52, 211, 153, 0.12)',
    red: '#F87171',
    redSoft: 'rgba(248, 113, 113, 0.12)',
    blue: '#60A5FA',
    blueSoft: 'rgba(96, 165, 250, 0.12)',
    purple: '#A78BFA',
    purpleSoft: 'rgba(167, 139, 250, 0.12)',
};
const DashHeader = ({ navigation, name, photo }: {
    navigation: any;
    name: string | any;
    photo: string | any
}) => {

    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    }, []);

    const currentDate = useMemo(() => {
        return new Date().toLocaleDateString('en-IN', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
        });
    }, []);

    const handleNotificationPress = () => {
    };

    const handleProfilePress = () => {
        navigation.navigate(TabRoute.Profile);
    };

    return (
        <View className="px-5  pb-4">
            <View className="flex-row items-center justify-between">
                <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                        <Sparkles size={16} color={Colors.gold} />
                        <Text className="text-[#9CA3AF] text-sm font-medium tracking-wide">
                            {currentDate}
                        </Text>
                    </View>
                    <Text className="text-white text-[26px] font-bold mt-1.5 tracking-tight">
                        {greeting}, {name}
                    </Text>
                </View>

                <View className="flex-row items-center gap-3">
                    <TouchableOpacity
                        activeOpacity={0.9}
                        className="w-11 h-11 rounded-2xl items-center justify-center"
                        style={{
                            backgroundColor: Colors.surface,
                            borderWidth: 1,
                            borderColor: Colors.border,
                        }}
                        onPress={handleNotificationPress}
                    >
                        <Bell size={19} color={Colors.textPrimary} />
                        <View
                            className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full border-2"
                            style={{
                                backgroundColor: Colors.red,
                                borderColor: Colors.background,
                            }}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={0.9}
                        className="w-11 h-11 rounded-2xl overflow-hidden"
                        style={{
                            borderWidth: 2,
                            borderColor: Colors.gold,
                        }}
                        onPress={handleProfilePress}
                    >
                        <Image
                            source={{ uri: photo }}
                            className="w-full h-full"
                            resizeMode="cover"
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

export default DashHeader