import React from 'react';
import { DrawerContentScrollView, DrawerItemList, DrawerContentComponentProps } from '@react-navigation/drawer';
import { View, Text, TouchableOpacity, SafeAreaView } from '../../lib/style/withTailwind';
import { Theme } from '../../const/theme/Theme';
import { Building2, CalendarPlus, LogOut, Settings } from 'lucide-react-native';

interface DrawerUiNaviProps extends DrawerContentComponentProps {
    userRole?: 'staff' | 'manager' | 'ceo';
    userName?: string;
}

const DrawerUiNavi = ({ userRole = 'staff', userName = 'Guest User', ...props }: DrawerUiNaviProps) => {
    return (
        <SafeAreaView className="flex-1" style={{ backgroundColor: '#000000' }} edges={['top', 'bottom']}>
            {/* Header */}
            <View className="px-5 py-6 border-b border-[#29282A]">
                <View className="flex-row items-center gap-3">
                    <View className="w-12 h-12 rounded-full items-center justify-center" style={{ backgroundColor: Theme.button.primary }}>
                        <Building2 size={24} color={Theme.background.primary} />
                    </View>
                    <View className="flex-1">
                        <Text className="text-white font-bold text-lg">{userName}</Text>
                        <View className="flex-row items-center gap-2 mt-1">
                            <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: '#1E3A8A' }}>
                                <Text className="text-[#93C5FD] text-xs font-semibold uppercase">
                                    {userRole}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>

            {/* Drawer Items */}
            <DrawerContentScrollView
                {...props}
                contentContainerStyle={{ paddingTop: 8 }}
            >
                <View className="px-3">
                    <Text className="text-[#8F8B91] text-xs font-semibold uppercase tracking-wider px-3 mb-2">
                        Main Menu
                    </Text>
                </View>

                <DrawerItemList {...props} />

                <View className="px-3 mt-4">
                    <Text className="text-[#8F8B91] text-xs font-semibold uppercase tracking-wider px-3 mb-2">
                        Actions
                    </Text>
                </View>

                <TouchableOpacity
                    className="flex-row items-center gap-3 px-5 py-3 mx-3 rounded-xl"
                    onPress={() => props.navigation.navigate('NewBooking')}
                >
                    <CalendarPlus size={20} color={Theme.button.primary} />
                    <Text className="text-white text-base font-medium">New Booking</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className="flex-row items-center gap-3 px-5 py-3 mx-3 rounded-xl"
                    onPress={() => props.navigation.navigate('Profile')}
                >
                    <Settings size={20} color="#8F8B91" />
                    <Text className="text-white text-base font-medium">Settings</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className="flex-row items-center gap-3 px-5 py-3 mx-3 rounded-xl mt-2"
                    onPress={() => props.navigation.navigate('Logout')}
                >
                    <LogOut size={20} color="#EF4444" />
                    <Text className="text-[#EF4444] text-base font-medium">Logout</Text>
                </TouchableOpacity>
            </DrawerContentScrollView>

            {/* Footer */}
            <View className="px-5 py-4 border-t border-[#29282A]">
                <Text className="text-[#8F8B91] text-xs text-center">
                    Hall Booking App v1.0.0
                </Text>
            </View>
        </SafeAreaView>
    );
};

export default DrawerUiNavi;