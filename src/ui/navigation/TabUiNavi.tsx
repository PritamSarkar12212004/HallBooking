import React from 'react'
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { SafeAreaView, View, TouchableOpacity } from '../../lib/style/withTailwind';
import { ClipboardList, House, UserRound, BarChart3, Users, Bell } from 'lucide-react-native';
import { Theme } from '../../const/theme/Theme';
import { TabRoute } from '../../const/routes/route';

// Icons route NAME se map hote hain (tab order/index se nahi) — isse kisi
// role me tab add/remove karne par baaki icons shift nahi hote.
// Staff Activity calendar ka koi tab nahi hai — wo CEO Dashboard ke card se khulta hai.
const tabIconByRoute: Record<string, any> = {
    [TabRoute.Home]: House,
    [TabRoute.Dashboard]: BarChart3,
    [TabRoute.Bookings]: ClipboardList,
    [TabRoute.Notification]: Bell,
    [TabRoute.Applicants]: Users,
    [TabRoute.Profile]: UserRound,
};

const TabUiNavi = React.memo(
    ({ state, descriptors, navigation }: BottomTabBarProps) => {

        return (
            <SafeAreaView className="w-full " edges={['bottom']} style={{
                backgroundColor: Theme.background.secondary
            }}>
                <View className="flex-row items-center border-t border-[#29282A] px-2 pb-2 pt-4">
                    {state.routes.map((route, index) => {
                        const { options } = descriptors[route.key];
                        const isFocused = state.index === index;
                        const Icon = tabIconByRoute[route.name] ?? House;

                        const handlePress = () => {
                            const event = navigation.emit({
                                type: 'tabPress',
                                target: route.key,
                                canPreventDefault: true,
                            });

                            if (!isFocused && !event.defaultPrevented) {
                                navigation.navigate(route.name, route.params);
                            }
                        };

                        return (
                            <TouchableOpacity
                                activeOpacity={0.9}
                                key={route.key}
                                accessibilityRole="tab"
                                accessibilityState={isFocused ? { selected: true } : {}}
                                accessibilityLabel={options.tabBarAccessibilityLabel}
                                testID={options.tabBarButtonTestID}
                                onPress={handlePress}
                                className="flex-1 items-center justify-center"
                            >
                                <Icon size={25} color={isFocused ? Theme.button.primary : '#8F8B91'} strokeWidth={isFocused ? 2.4 : 2} />
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </SafeAreaView>
        )
    }
)
export default TabUiNavi