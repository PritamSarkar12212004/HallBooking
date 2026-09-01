import React, { useCallback, useState } from 'react';
import { FlatList } from 'react-native';
import {
    Text,
    TouchableOpacity,
    View,
} from '../../lib/style/withTailwind';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, BellRing, CalendarCheck, CheckCheck, ClipboardCheck, Receipt } from 'lucide-react-native';

import Wrapper from '../../layouts/wraper/Wraper';
import MainDerder from '../../components/header/MainDerder';
import { Theme } from '../../const/theme/Theme';

export interface NotificationItem {
    id: string;
    type: 'booking' | 'payment' | 'approval' | 'system';
    title: string;
    description: string;
    timestamp: string;
    read: boolean;
}

// NOTE: Replace with your API data when the notifications endpoint is ready.
const mockNotifications: NotificationItem[] = [];

const typeMeta: Record<
    NotificationItem['type'],
    { icon: any; color: string; bg: string }
> = {
    booking: { icon: CalendarCheck, color: '#60A5FA', bg: 'rgba(96,165,250,0.14)' },
    payment: { icon: Receipt, color: '#34D399', bg: 'rgba(52,211,153,0.14)' },
    approval: { icon: ClipboardCheck, color: '#F8EFCB', bg: 'rgba(248,239,203,0.14)' },
    system: { icon: BellRing, color: '#A78BFA', bg: 'rgba(167,139,250,0.14)' },
};

const NotificationScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const [notifications, setNotifications] = useState<NotificationItem[]>(mockNotifications);

    const unreadCount = notifications.filter((n) => !n.read).length;

    const markAllRead = useCallback(() => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }, []);

    const renderItem = useCallback(
        ({ item }: { item: NotificationItem }) => {
            const meta = typeMeta[item.type];
            const Icon = meta.icon;
            return (
                <View
                    className="flex-row items-start p-4 rounded-2xl mb-3"
                    style={{
                        backgroundColor: Theme.background.secondary,
                        opacity: item.read ? 0.65 : 1,
                    }}
                >
                    <View
                        className="w-11 h-11 rounded-xl items-center justify-center mr-3"
                        style={{ backgroundColor: meta.bg }}
                    >
                        <Icon size={20} color={meta.color} />
                    </View>
                    <View className="flex-1">
                        <Text className="text-base font-semibold" style={{ color: Theme.text.primary }}>
                            {item.title}
                        </Text>
                        <Text className="text-sm mt-0.5" style={{ color: Theme.text.secondary }}>
                            {item.description}
                        </Text>
                        <Text className="text-xs mt-1.5" style={{ color: Theme.text.tertiary }}>
                            {item.timestamp}
                        </Text>
                    </View>
                    {!item.read && (
                        <View className="ml-2 mt-1.5" style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#F87171' }} />
                    )}
                </View>
            );
        },
        [],
    );

    const renderEmpty = () => (
        <View className="flex-1 items-center justify-center px-8 pb-16">
            <View
                className="w-20 h-20 rounded-3xl items-center justify-center mb-5"
                style={{ backgroundColor: Theme.background.secondary }}
            >
                <Bell size={34} color={Theme.button.primary} />
            </View>
            <Text className="text-lg font-bold text-center" style={{ color: Theme.text.primary }}>
                No notifications yet
            </Text>
            <Text className="text-sm text-center mt-2" style={{ color: Theme.text.secondary }}>
                When you receive updates about bookings and payments, they will show up here.
            </Text>
        </View>
    );

    return (
        <Wrapper safeBottom>
            <MainDerder
                navigation={navigation}
                title="Notifications"
                right={
                    unreadCount > 0 ? (
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={markAllRead}
                            className="flex-row items-center gap-1.5 px-3 h-9 rounded-full"
                            style={{ backgroundColor: Theme.background.secondary }}
                        >
                            <CheckCheck size={16} color={Theme.button.primary} />
                            <Text className="text-xs font-semibold" style={{ color: Theme.button.primary }}>
                                Mark all read
                            </Text>
                        </TouchableOpacity>
                    ) : null
                }
            />

            <FlatList<NotificationItem>
                data={notifications}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    flexGrow: 1,
                    paddingBottom: insets.bottom + 16,
                }}
                ListEmptyComponent={renderEmpty}
            />
        </Wrapper>
    );
};

export default NotificationScreen;