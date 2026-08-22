import React, { useState } from 'react';
import { TimerPickerModal } from 'react-native-timer-picker';
import { Text, TouchableOpacity, View } from '../../lib/style/withTailwind';
import { LinearGradient } from 'react-native-linear-gradient';

interface TimePickerProps {
    title?: string;
    value: string;
    onChange: (time: string) => void;
}

const TimePicker = ({
    title = 'Time',
    value,
    onChange,
}: TimePickerProps) => {
    const [showPicker, setShowPicker] = useState(false);

    const formatTime = ({
        hours,
        minutes,
    }: {
        hours?: number;
        minutes?: number;
    }) => {
        const h = hours ?? 0;
        const m = minutes ?? 0;

        return `${h.toString().padStart(2, '0')}:${m
            .toString()
            .padStart(2, '0')}`;
    };

    return (
        <>
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => setShowPicker(true)}
            >
                <View className="px-4 py-3">
                    <Text
                        style={{
                            fontSize: 13,
                            color: '#777',
                        }}
                    >
                        {title}
                    </Text>

                    <Text
                        style={{
                            fontSize: 18,
                            color: 'white',
                            marginTop: 4,
                            fontWeight: '600',
                        }}
                    >
                        {value || 'Select time'}
                    </Text>
                </View>
            </TouchableOpacity>

            <TimerPickerModal
                closeOnOverlayPress
                LinearGradient={LinearGradient}
                modalProps={{
                    overlayOpacity: 0.2,
                }}
                modalTitle={title}
                onCancel={() => setShowPicker(false)}
                onConfirm={(pickedDuration) => {
                    onChange(formatTime(pickedDuration));
                    setShowPicker(false);
                }}
                setIsVisible={setShowPicker}
                styles={{
                    theme: 'dark',
                }}
                visible={showPicker}
            />
        </>
    );
};

export default TimePicker;