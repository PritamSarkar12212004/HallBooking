import React from 'react';
import tw from 'twrnc';

import {
    View as RNView,
    Text as RNText,
    Image as RNImage,
    TouchableOpacity as RNTouchableOpacity,
    ScrollView as RNScrollView,
    Pressable as RNPressable,
    TextInput as RNTextInput,
    FlatList as RNFlatList,
    SectionList as RNSectionList,
    KeyboardAvoidingView as RNKeyboardAvoidingView,
    ImageBackground as RNImageBackground,
    ActivityIndicator as RNActivityIndicator,
    Switch as RNSwitch,
    Modal as RNModal,
    RefreshControl as RNRefreshControl,
} from 'react-native';

import {
    SafeAreaView as RNSafeAreaView,
} from 'react-native-safe-area-context';


type StyledProps = {
    className?: string;
};


const createStyledComponent = <
    T extends React.ComponentType<any>
>(
    Component: T
) => {

    type Props = React.ComponentProps<T> & StyledProps;

    return React.forwardRef<
        React.ComponentRef<T>,
        Props
    >((props, ref) => {

        const {
            className,
            style,
            ...rest
        } = props;

        const twStyle = className
            ? tw.style(className)
            : undefined;

        return (
            <Component
                ref={ref}
                {...rest}
                style={[twStyle, style]}
            />
        );
    });
};


// Styled Components

export const View =
    createStyledComponent(RNView);

export const Text =
    createStyledComponent(RNText);

export const Image =
    createStyledComponent(RNImage);

export const TouchableOpacity =
    createStyledComponent(RNTouchableOpacity);

export const Pressable =
    createStyledComponent(RNPressable);

export const ScrollView =
    createStyledComponent(RNScrollView);

export const TextInput =
    createStyledComponent(RNTextInput);

export const FlatList =
    createStyledComponent(RNFlatList);

export const SectionList =
    createStyledComponent(RNSectionList);

export const SafeAreaView =
    createStyledComponent(RNSafeAreaView);

export const KeyboardAvoidingView =
    createStyledComponent(RNKeyboardAvoidingView);

export const ImageBackground =
    createStyledComponent(RNImageBackground);

export const ActivityIndicator =
    createStyledComponent(RNActivityIndicator);

export const Switch =
    createStyledComponent(RNSwitch);

export const Modal =
    createStyledComponent(RNModal);

export const RefreshControl =
    createStyledComponent(RNRefreshControl);