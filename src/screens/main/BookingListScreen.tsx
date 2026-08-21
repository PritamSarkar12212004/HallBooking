import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput } from '../../lib/style/withTailwind';
import Wrapper from '../../layouts/wraper/Wraper';
import { Theme } from '../../const/theme/Theme';
import { Search, Menu } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const BookingListScreen = () => {
    const navigation = useNavigation();
    const [search, setSearch] = useState('');

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
                    <Text className="text-white text-xl font-bold">Bookings</Text>
                </View>
            </View>

            {/* Search */}
            <View
                className="flex-row items-center rounded-xl px-4 mb-4"
                style={{ backgroundColor: Theme.background.secondary }}
            >
                <Search size={18} color="#8F8B91" />
                <TextInput
                    className="flex-1 py-3 px-3 text-white"
                    placeholder="Search by name or booking ID..."
                    placeholderTextColor="#8F8B91"
                    value={search}
                    onChangeText={setSearch}
                />
            </View>
        </Wrapper>
    );
};

export default BookingListScreen;