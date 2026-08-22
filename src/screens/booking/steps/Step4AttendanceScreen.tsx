import React from 'react';
import { View, Text, TouchableOpacity } from '../../../lib/style/withTailwind';
import Wrapper from '../../../layouts/wraper/Wraper';
import { Theme } from '../../../const/theme/Theme';
import { ArrowLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const Step4AttendanceScreen = () => {
    const navigation = useNavigation();

    return (
        <Wrapper safeBottom>
            <View className="flex-row items-center gap-3 mb-4">
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="w-10 h-10 rounded-xl items-center justify-center"
                    style={{ backgroundColor: Theme.background.secondary }}
                >
                    <ArrowLeft size={20} color={Theme.button.primary} />
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold">New Booking</Text>
            </View>
        </Wrapper>
    );
};

export default Step4AttendanceScreen;