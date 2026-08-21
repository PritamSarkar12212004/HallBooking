import React from 'react'
import { Text, TouchableOpacity, View } from '../../lib/style/withTailwind';
import { ArrowLeft } from 'lucide-react-native';
import { Theme } from '../../const/theme/Theme';

const SubHeader = React.memo(({ navigation, title }: {
    navigation: any;
    title: string
}) => {
    return (
        <View className="flex-row items-center gap-3 mb-4">
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => navigation.goBack()}
                className="w-10 h-10 rounded-xl items-center justify-center"
                style={{ backgroundColor: Theme.background.secondary }}
            >
                <ArrowLeft size={20} color={Theme.button.primary} />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold">{title}</Text>
        </View>
    )
})

export default SubHeader