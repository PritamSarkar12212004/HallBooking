import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from '../../lib/style/withTailwind';
import { Theme } from '../../const/theme/Theme';
import { Building2 } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { route } from '../../const/routes/route';

const SplashScreen = () => {
    const navigation = useNavigation();

    useEffect(() => {
        const timer = setTimeout(() => {
            // Check if token exists in MMKV
            // For now, navigate to home
            (navigation as any).replace(route.home);
        }, 2000);

        return () => clearTimeout(timer);
    }, [navigation]);

    return (
        <View className="flex-1 items-center justify-center" style={{ backgroundColor: Theme.background.primary }}>
            <View className="w-24 h-24 rounded-3xl items-center justify-center mb-6" style={{ backgroundColor: Theme.button.primary }}>
                <Building2 size={48} color={Theme.background.primary} />
            </View>
            <Text className="text-white text-2xl font-bold">Hall Booking</Text>
            <Text className="text-[#8F8B91] text-sm mt-2">Manage your events seamlessly</Text>
            <ActivityIndicator size="large" color={Theme.button.primary} className="mt-8" />
        </View>
    );
};

export default SplashScreen;