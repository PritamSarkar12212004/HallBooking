import React from 'react';
import { View, Text, TouchableOpacity } from '../../lib/style/withTailwind';
import Wrapper from '../../layouts/wraper/Wraper';
import { Theme } from '../../const/theme/Theme';
import { Menu } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const HallCalendarScreen = () => {
    const navigation = useNavigation();

    return (
        <Wrapper safeBottom>
            {/* Header */}
            <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center gap-3">
                    <TouchableOpacity
                        onPress={() => (navigation as any).openDrawer()}
                        className="w-10 h-10 rounded-xl items-center justify-center"
                        style={{ backgroundColor: Theme.background.secondary }}
                    >
                        <Menu size={20} color={Theme.button.primary} />
                    </TouchableOpacity>
                    <Text className="text-white text-xl font-bold">Halls</Text>
                </View>
            </View>
        </Wrapper>
    );
};

export default HallCalendarScreen;