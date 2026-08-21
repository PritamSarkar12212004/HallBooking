import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch } from '../../lib/style/withTailwind';
import Wrapper from '../../layouts/wraper/Wraper';
import { Theme } from '../../const/theme/Theme';
import { Menu, UserRound, Phone, Mail, Bell, LogOut, ChevronRight, Building2 } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const ProfileScreen = () => {
    const navigation = useNavigation();
    const [notifications, setNotifications] = useState(true);
    const [emailAlerts, setEmailAlerts] = useState(false);

    return (
        <Wrapper safeBottom>
            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                {/* Header */}
                <View className="flex-row items-center justify-between mb-6">
                    <View className="flex-row items-center gap-3">
                        <TouchableOpacity
                            onPress={() => (navigation as any).openDrawer()}
                            className="w-10 h-10 rounded-xl items-center justify-center"
                            style={{ backgroundColor: Theme.background.secondary }}
                        >
                            <Menu size={20} color={Theme.button.primary} />
                        </TouchableOpacity>
                        <Text className="text-white text-xl font-bold">Profile</Text>
                    </View>
                </View>

                {/* User card */}
                <View className="rounded-2xl p-6 mb-6 items-center" style={{ backgroundColor: Theme.background.secondary }}>
                    <View className="w-20 h-20 rounded-full items-center justify-center mb-4" style={{ backgroundColor: Theme.button.primary }}>
                        <UserRound size={36} color={Theme.background.primary} />
                    </View>
                    <Text className="text-white text-xl font-bold">Rahul Kumar</Text>
                    <View className="px-3 py-1 rounded-full mt-2" style={{ backgroundColor: '#1E3A8A' }}>
                        <Text className="text-[#93C5FD] text-xs font-semibold uppercase">Staff</Text>
                    </View>
                    <View className="flex-row gap-6 mt-4">
                        <View className="flex-row items-center gap-2">
                            <Phone size={14} color="#8F8B91" />
                            <Text className="text-[#8F8B91] text-sm">+91 98765 43210</Text>
                        </View>
                    </View>
                    <View className="flex-row items-center gap-2 mt-2">
                        <Mail size={14} color="#8F8B91" />
                        <Text className="text-[#8F8B91] text-sm">rahul@hallbooking.com</Text>
                    </View>
                </View>

                {/* Settings */}
                <Text className="text-[#8F8B91] text-xs font-semibold uppercase tracking-wider mb-3">
                    Notifications
                </Text>
                <View className="rounded-2xl mb-6" style={{ backgroundColor: Theme.background.secondary }}>
                    <View className="flex-row items-center justify-between p-4 border-b border-[#29282A]">
                        <View className="flex-row items-center gap-3">
                            <Bell size={18} color={Theme.button.primary} />
                            <Text className="text-white font-medium">Push Notifications</Text>
                        </View>
                        <Switch
                            value={notifications}
                            onValueChange={setNotifications}
                            trackColor={{ false: '#29282A', true: Theme.button.primary }}
                            thumbColor={notifications ? Theme.background.primary : '#8F8B91'}
                        />
                    </View>
                    <View className="flex-row items-center justify-between p-4">
                        <View className="flex-row items-center gap-3">
                            <Mail size={18} color={Theme.button.primary} />
                            <Text className="text-white font-medium">Email Alerts</Text>
                        </View>
                        <Switch
                            value={emailAlerts}
                            onValueChange={setEmailAlerts}
                            trackColor={{ false: '#29282A', true: Theme.button.primary }}
                            thumbColor={emailAlerts ? Theme.background.primary : '#8F8B91'}
                        />
                    </View>
                </View>

                <Text className="text-[#8F8B91] text-xs font-semibold uppercase tracking-wider mb-3">
                    Account
                </Text>
                <View className="rounded-2xl mb-6" style={{ backgroundColor: Theme.background.secondary }}>
                    <TouchableOpacity className="flex-row items-center justify-between p-4 border-b border-[#29282A]">
                        <View className="flex-row items-center gap-3">
                            <Building2 size={18} color={Theme.button.primary} />
                            <Text className="text-white font-medium">Organization</Text>
                        </View>
                        <ChevronRight size={18} color="#8F8B91" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="flex-row items-center justify-between p-4"
                        onPress={() => (navigation as any).navigate('Logout')}
                    >
                        <View className="flex-row items-center gap-3">
                            <LogOut size={18} color="#EF4444" />
                            <Text className="text-[#EF4444] font-medium">Logout</Text>
                        </View>
                        <ChevronRight size={18} color="#8F8B91" />
                    </TouchableOpacity>
                </View>

                <Text className="text-[#8F8B91] text-xs text-center mb-4">
                    Hall Booking App v1.0.0
                </Text>
            </ScrollView>
        </Wrapper>
    );
};

export default ProfileScreen;