import React from 'react'
import { Text, TouchableOpacity, View } from '../../lib/style/withTailwind';
import { Theme } from '../../const/theme/Theme';
import { CalendarDays } from 'lucide-react-native';

type DateButtonProps = {
    actionFunc: any;
    title: string;
    subTitle: string;
};

const DateButton = ({
    actionFunc,
    title,
    subTitle,
}: DateButtonProps) => {
    return (
        <View className="mb-4">
            <Text className="text-[#8F8B91] text-sm font-medium mb-2">
                {title}
            </Text>

            <TouchableOpacity
                activeOpacity={0.9}
                className="flex-row items-center rounded-xl px-4 py-3"
                style={{ backgroundColor: Theme.background.secondary }}
                onPress={() => actionFunc()}
            >
                <CalendarDays
                    size={18}
                    color={Theme.button.primary}
                />

                <Text className="flex-1 text-white font-medium ml-3">
                    {subTitle}
                </Text>
            </TouchableOpacity>
        </View>
    );
};
export default DateButton