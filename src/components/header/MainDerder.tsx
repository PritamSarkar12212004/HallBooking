import React from 'react'
import { Text, View } from '../../lib/style/withTailwind';

const MainDerder = React.memo(
    ({ navigation: _navigation, title }: {
        title: string;
        navigation: any
    }) => {
        return (
            <View className="flex-row items-center justify-between mb-6">
                <View className="flex-row items-center gap-3">
                    <Text className="text-white text-xl font-bold">{title}</Text>
                </View>
            </View>
        )
    }
)

export default MainDerder