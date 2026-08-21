import React from 'react';
import { Text, TouchableOpacity } from '../../lib/style/withTailwind';
import { ChevronRight } from 'lucide-react-native';
import { Theme } from '../../const/theme/Theme';

type MainButtonProps = {
    navigation?: any;
    route?: string;
    title: string;
    actionFunc?: () => void;
    disabled?: boolean;
};

const MainButton = ({
    navigation,
    route,
    title,
    actionFunc,
    disabled = false,
}: MainButtonProps) => {
    const handlePress = () => {
        if (actionFunc) {
            actionFunc();
            return;
        }

        if (navigation && route) {
            navigation.navigate(route);
        }
    };

    return (
        <TouchableOpacity
            disabled={disabled}
            activeOpacity={0.9}
            className="flex-row items-center justify-center gap-2 rounded-xl py-4 mb-4"
            style={{
                backgroundColor: Theme.button.primary,
                opacity: disabled ? 0.5 : 1,
            }}
            onPress={handlePress}
        >
            <Text
                className="font-bold"
                style={{ color: Theme.background.primary }}
            >
                {title}
            </Text>

            <ChevronRight
                size={20}
                color={Theme.background.primary}
            />
        </TouchableOpacity>
    );
};

export default MainButton;