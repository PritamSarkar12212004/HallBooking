import React from 'react';
import { View, Text, TouchableOpacity } from '../../lib/style/withTailwind';
import { Theme } from '../../const/theme/Theme';

interface ChipSelectProps {
    options: string[];
    selected: string | string[];
    onSelect: (value: string) => void;
    multiSelect?: boolean;
}

const ChipSelect = ({ options, selected, onSelect, multiSelect = false }: ChipSelectProps) => {
    const isSelected = (option: string) => {
        if (multiSelect && Array.isArray(selected)) {
            return selected.includes(option);
        }
        return selected === option;
    };

    return (
        <View className="flex-row flex-wrap gap-2">
            {options.map((option) => {
                const active = isSelected(option);
                return (
                    <TouchableOpacity
                        key={option}
                        onPress={() => onSelect(option)}
                        className="px-4 py-2 rounded-full border"
                        style={{
                            backgroundColor: active ? Theme.button.primary : 'transparent',
                            borderColor: active ? Theme.button.primary : '#4D5564',
                        }}
                    >
                        <Text
                            className="text-sm font-medium"
                            style={{ color: active ? Theme.background.primary : '#8F8B91' }}
                        >
                            {option}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

export default ChipSelect;