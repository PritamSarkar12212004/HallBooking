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
    disabled?: boolean;
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

    // "HH:MM" (24h) -> 12-hour display, e.g. "02:30 PM"
    const to12HourDisplay = (time: string): string => {
        const mins = parseToMinutes(time);
        if (mins < 0) return time;
        const h24 = Math.floor(mins / 60);
        const m = mins % 60;
        const period = h24 >= 12 ? 'PM' : 'AM';
        const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
        return `${pad(h12)}:${pad(m)} ${period}`;
    };

    // Where the picker wheel should start: the selected value, else now.
    // Clamped to the hourLimit min so the wheel never conflicts with it.
    const computeInitialValue = () => {
        const now = new Date();
        let h = value && /^\d{2}:\d{2}$/.test(value)
            ? Math.floor(parseToMinutes(value) / 60)
            : now.getHours();
        let m = value && /^\d{2}:\d{2}$/.test(value)
            ? parseToMinutes(value) % 60
            : now.getMinutes();

        // Respect the enforced minimum hour (today's passed-time rule).
        if (startHour !== undefined && h < startHour) {
            h = startHour;
        }
        return { hours: h, minutes: m, seconds: 0 };
    };

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
                        {value
                            ? to12HourDisplay(value)
                            : (disabled ? 'Select Start Time first' : 'Select time')}
                    </Text>
                </View>
            </TouchableOpacity>

            {/* Conditional mount: fresh wheel state on every open so the
                initialValue (current time) is honoured each time. */}
            {showPicker && (
                <TimerPickerModal
                    closeOnOverlayPress
                    LinearGradient={LinearGradient}
                    modalProps={{
                        overlayOpacity: 0.2,
                    }}
                    modalTitle={title}
                    initialValue={computeInitialValue()}
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
                    use12HourPicker
                    visible={showPicker}
                />
            )}
        </>
    );
};

export default TimePicker;