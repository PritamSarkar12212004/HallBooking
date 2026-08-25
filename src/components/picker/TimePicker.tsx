import React, { useState } from 'react';
import { TimerPickerModal } from 'react-native-timer-picker';
import { Text, TouchableOpacity, View } from '../../lib/style/withTailwind';
import { LinearGradient } from 'react-native-linear-gradient';
import { ChevronDown, Clock } from 'lucide-react-native';
import { Theme } from '../../const/theme/Theme';

interface TimePickerProps {
    title?: string;
    value: string;
    onChange: (time: string) => void;
    /** When true, the field can't be opened and renders dimmed. */
    disabled?: boolean;
    /** Earliest selectable time in "HH:MM". The picker enforces a value strictly after this. */
    minTime?: string;
}

const pad = (n: number) => n.toString().padStart(2, '0');

const parseToMinutes = (time: string): number => {
    const [h, m] = time.split(':').map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return -1;
    return h * 60 + m;
};

const toTime = (h: number, m: number) => `${pad(h)}:${pad(m)}`;

const TimePicker = ({
    title = 'Time',
    value,
    onChange,
    disabled = false,
    minTime,
}: TimePickerProps) => {
    const [showPicker, setShowPicker] = useState(false);

    const minMinutes =
        minTime && /^\d{2}:\d{2}$/.test(minTime)
            ? parseToMinutes(minTime)
            : -1;

    const startHour = minMinutes >= 0 ? Math.floor(minMinutes / 60) : undefined;

    const formatChosen = ({
        hours,
        minutes,
    }: {
        hours?: number;
        minutes?: number;
    }) => {
        const h = hours ?? 0;
        const m = minutes ?? 0;

        const selectedMinutes = h * 60 + m;

        // Enforce strictly-after rule: never return a time <= start time
        if (minMinutes >= 0 && selectedMinutes <= minMinutes) {
            const next = minMinutes + 1;
            return toTime(Math.floor(next / 60), next % 60);
        }

        return toTime(h, m);
    };

    const handlePress = () => {
        if (!disabled) {
            setShowPicker(true);
        }
    };

    return (
        <>
            <TouchableOpacity
                activeOpacity={disabled ? 1 : 0.85}
                onPress={handlePress}
                disabled={disabled}
            >
                <View
                    className="px-4 py-3.5 rounded-xl"
                    style={{
                        backgroundColor: Theme.background.secondary,
                        borderWidth: 1,
                        borderColor: disabled
                            ? 'transparent'
                            : value
                                ? Theme.button.primary
                                : '#4D5564',
                        opacity: disabled ? 0.45 : 1,
                    }}
                >
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center gap-2">
                            <Clock
                                size={16}
                                color={
                                    disabled
                                        ? '#666'
                                        : value
                                            ? Theme.button.primary
                                            : '#8F8B91'
                                }
                            />
                            <Text
                                style={{
                                    fontSize: 13,
                                    color: disabled ? '#666' : '#8F8B91',
                                    fontWeight: '500',
                                }}
                            >
                                {title}
                            </Text>
                        </View>
                        <ChevronDown
                            size={18}
                            color={disabled ? '#555' : '#8F8B91'}
                        />
                    </View>

                    <Text
                        style={{
                            fontSize: 18,
                            color: disabled ? '#8F8B91' : 'white',
                            marginTop: 8,
                            fontWeight: '600',
                        }}
                    >
                        {value || (disabled ? 'Select Start Time first' : 'Select time')}
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
                    onChange(formatChosen(pickedDuration));
                    setShowPicker(false);
                }}
                setIsVisible={setShowPicker}
                hideSeconds
                padHoursWithZero
                padMinutesWithZero
                hourInterval={1}
                minuteInterval={5}
                {...(minMinutes >= 0
                    ? { hourLimit: { min: startHour } }
                    : {})}
                styles={{
                    theme: 'dark',
                }}
                use12HourPicker={false}
                visible={showPicker}
            />
        </>
    );
};

export default TimePicker;