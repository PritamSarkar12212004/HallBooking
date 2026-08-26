import React, { PropsWithChildren } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View } from 'react-native';
import { Theme } from '../../const/theme/Theme';

interface WrapperProps extends PropsWithChildren {
    style?: StyleProp<ViewStyle>;
    backgroundColor?: string;
    safeTop?: boolean;
    safeBottom?: boolean;
    safeHorizontal?: boolean;
    paddingHorizontal?: number;
    paddingTop?: number;
    paddingBottom?: number;
}

const Wrapper = ({
    children,
    style,
    backgroundColor = Theme.background.primary,
    safeTop = true,
    safeBottom = false,
    safeHorizontal = false,
    paddingHorizontal = 16,
    paddingTop = 0,
    paddingBottom = 0,
}: WrapperProps) => {
    const insets = useSafeAreaInsets();
    return (
        <View
            style={[
                {
                    flex: 1,
                    backgroundColor,

                    paddingTop: safeTop ? insets.top + paddingTop : paddingTop,

                    paddingBottom: safeBottom
                        ? insets.bottom + paddingBottom
                        : paddingBottom,

                    paddingHorizontal: safeHorizontal
                        ? Math.max(insets.left, insets.right) + paddingHorizontal
                        : paddingHorizontal,
                },
                style,
            ]}
        >
            {children}
        </View>
    );
};

export default Wrapper;