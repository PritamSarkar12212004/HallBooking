import React from 'react';
import { Text, TouchableOpacity, View } from '../../lib/style/withTailwind';
import { ArrowLeft } from 'lucide-react-native';
import { Theme } from '../../const/theme/Theme';

interface Props {
    navigation: any;
    title: string;
    comp?: React.ReactNode;
}

const SubHeader = React.memo(({ navigation, title, comp }: Props) => {
    return (
        <View className="flex-row items-center justify-between mb-4 ">
            <View className="flex-row items-center flex-1 gap-3">
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => navigation.goBack()}
                    className="w-10 h-10 rounded-xl items-center justify-center"
                    style={{ backgroundColor: Theme.background.secondary }}
                >
                    <ArrowLeft size={20} color={Theme.button.primary} />
                </TouchableOpacity>

                <Text
                    className="text-xl font-bold flex-1"
                    style={{ color: '#FFFFFF' }}
                    numberOfLines={1}
                >
                    {title}
                </Text>
            </View>
            {comp && (
                <View className="ml-3">
                    {comp}
                </View>
            )}
        </View>
    );
});

export default SubHeader;