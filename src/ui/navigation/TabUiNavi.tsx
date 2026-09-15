import React from 'react'
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { SafeAreaView, View, TouchableOpacity } from '../../lib/style/withTailwind';
import { CalendarDays, ClipboardList, House, UserRound, BarChart3, Users, Bell } from 'lucide-react-native';
import { Theme } from '../../const/theme/Theme';
import { TabRoute } from '../../const/routes/route';

// Icon order mirrors the tab order in MainStack (staff: 5 tabs, CEO: 5 tabs).
// Staff Activity calendar ka koi tab nahi hai — wo CEO Dashboard ke card se khulta hai.
const staffTabIcons = [House, CalendarDays, Bell, Users, UserRound];
const ceoTabIcons = [BarChart3, ClipboardList, Bell, Users, UserRound];

const TabUiNavi = React.memo(
    ({ state, descriptors, navigation }: BottomTabBarProps) => {
        // Detected by route name (not by tab count) so adding tabs stays safe.
        const isCEO = state.routes.some(
            (route) => route.name === TabRoute.Dashboard,
        );
        const tabIcons = isCEO ? ceoTabIcons : staffTabIcons;

        return (
            <SafeAreaView className="w-full " edges={['bottom']} style={{
                backgroundColor: Theme.background.secondary
            }}>
                <View className="flex-row items-center border-t border-[#29282A] px-2 pb-2 pt-4">
                    {state.routes.map((route, index) => {
                        const { options } = descriptors[route.key];
                        const isFocused = state.index === index;
                        const Icon = tabIcons[index] ?? House;

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