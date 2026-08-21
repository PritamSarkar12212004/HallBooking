import React from 'react';
import { View, Text, TextInput } from '../../lib/style/withTailwind';
import { Theme } from '../../const/theme/Theme';

interface CurrencyInputProps {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    editable?: boolean;
}

const CurrencyInput = ({ label, value, onChangeText, placeholder = '0', editable = true }: CurrencyInputProps) => {
    return (
        <View className="mb-4">
            <Text className="text-[#8F8B91] text-sm font-medium mb-2">{label}</Text>
            <View
                className="flex-row items-center rounded-xl px-4"
                style={{
                    backgroundColor: Theme.background.secondary,
                    borderWidth: 1,
                    borderColor: '#29282A',
                    opacity: editable ? 1 : 0.6,
                }}
            >
                <Text className="text-white text-lg font-bold mr-2">₹</Text>
                <TextInput
                    className="flex-1 py-3 text-white text-base"
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor="#8F8B91"
                    keyboardType="numeric"
                    editable={editable}
                />
            </View>
        </View>
    );
};

export default CurrencyInput;