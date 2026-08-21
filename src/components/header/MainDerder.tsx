import React from 'react'
import { Text, TouchableOpacity, View } from '../../lib/style/withTailwind';
import { Menu } from 'lucide-react-native';
import { Theme } from '../../const/theme/Theme';

const MainDerder = React.memo(
    ({ navigation, title }: {
        title: string;
        navigation: any
    }) => {
        return (
            <View className="flex-row items-center justify-between mb-6">
                <View className="flex-row items-center gap-3">
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => (navigation as any).openDrawer()}
                        className="w-10 h-10 rounded-xl items-center justify-center"
                        style={{ backgroundColor: Theme.background.secondary }}
                    >
                        <Menu size={20} color={Theme.button.primary} />
                    </TouchableOpacity>
                    <Text className="text-white text-xl font-bold">{title}</Text>
                </View>
            </View>
        )
    }
)

export default MainDerder