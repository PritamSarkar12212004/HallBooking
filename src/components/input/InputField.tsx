import React from 'react';
import {
    Text,
    TextInput,
    View,
} from '../../lib/style/withTailwind';

import { Theme } from '../../const/theme/Theme';

import { KeyboardTypeOptions } from 'react-native';

type InputFieldProps = {
    value: string;
    setvalue: (value: string) => void;
    placeholder: string;
    keyType: KeyboardTypeOptions;
    title: string;
    Icon?: React.ElementType;
    edit?: boolean;
    /** Draws a subtle border around the field so it reads as an input. */
    bordered?: boolean;
};

const InputField = React.memo(({
    value,
    setvalue,
    placeholder,
    keyType,
    title,
    Icon: Icon,
    edit = true,
    bordered = false,
}: InputFieldProps) => {

    return (
        <View className="mb-4">
            <Text className="text-[#8F8B91] text-sm font-medium mb-2">
                {title}
            </Text>
            <View
                className="flex-row items-center rounded-xl px-4"
                style={{
                    backgroundColor: Theme.background.secondary,
                    borderWidth: bordered ? 1 : 0,
                    borderColor: bordered ? '#3A3A40' : 'transparent',
                }}
            >
                {Icon && (
                    <Icon
                        size={18}
                        color="#8F8B91"
                    />
                )}
                <TextInput
                    className="flex-1 py-3 px-3 text-white"
                    placeholder={placeholder}
                    placeholderTextColor="#8F8B91"
                    value={value}
                    onChangeText={setvalue}
                    keyboardType={keyType}
                    autoCapitalize={
                        keyType === 'email-address'
                            ? 'none'
                            : 'sentences'
                    }
                    editable={edit}
                />
            </View>
        </View>
    );
});

export default InputField;