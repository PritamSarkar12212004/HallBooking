import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from '../../lib/style/withTailwind';
import { Theme } from '../../const/theme/Theme';
import { Camera, Check } from 'lucide-react-native';

interface ChecklistRowProps {
    label: string;
    checked: boolean;
    onToggle: () => void;
    remark?: string;
    onRemarkChange?: (text: string) => void;
    onPhotoPress?: () => void;
}

const ChecklistRow = ({ label, checked, onToggle, remark, onRemarkChange, onPhotoPress }: ChecklistRowProps) => {
    return (
        <View
            className="rounded-xl p-4 mb-3"
            style={{ backgroundColor: Theme.background.secondary }}
        >
            <View className="flex-row items-center">
                <TouchableOpacity
                    onPress={onToggle}
                    className="w-6 h-6 rounded-md border-2 items-center justify-center mr-3"
                    style={{
                        borderColor: checked ? Theme.button.primary : '#4D5564',
                        backgroundColor: checked ? Theme.button.primary : 'transparent',
                    }}
                >
                    {checked && <Check size={14} color={Theme.background.primary} />}
                </TouchableOpacity>
                <Text className="text-white text-base font-medium flex-1">{label}</Text>
                {onPhotoPress && (
                    <TouchableOpacity
                        onPress={onPhotoPress}
                        className="w-9 h-9 rounded-lg items-center justify-center"
                        style={{ backgroundColor: '#29282A' }}
                    >
                        <Camera size={18} color="#8F8B91" />
                    </TouchableOpacity>
                )}
            </View>
            {onRemarkChange && (
                <TextInput
                    className="mt-3 rounded-lg px-3 py-2 text-white text-sm"
                    style={{ backgroundColor: '#29282A' }}
                    placeholder="Add remark..."
                    placeholderTextColor="#8F8B91"
                    value={remark}
                    onChangeText={onRemarkChange}
                />
            )}
        </View>
    );
};

export default ChecklistRow;