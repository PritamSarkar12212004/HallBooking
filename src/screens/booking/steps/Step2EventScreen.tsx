import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Wrapper from '../../../layouts/wraper/Wraper';
import { useNavigation, useRoute } from '@react-navigation/native';
import SubHeader from '../../../components/header/SubHeader';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from '../../../lib/style/withTailwind';
import MultiSelector from '../../../components/Selector/MultiSelector';
import { Divider } from 'react-native-paper';
import {
    CalendarCheck,
    CalendarDays,
    Plus,
    UsersRound,
    X,
} from 'lucide-react-native';
import MainButton from '../../../components/buttons/MainButton';
import { BookingStepRoute } from '../../../const/routes/route';
import InputField from '../../../components/input/InputField';
import useGetBookingById from '../../../api/booking/hooks/useGetBookingById';
import useGetBookingMeta from '../../../api/booking/hooks/useGetBookingMeta';
import {
    getDraft,
    updateDraft,
} from '../../../manager/draftBookingStore';
import { useAppSelector } from '../../../hooks/redux/redux';
import { showMessage } from 'react-native-flash-message';
import EventDetailsSkeleton from '../../../ui/Skeleton/EventDetailsSkeleton';
import { Theme } from '../../../const/theme/Theme';
import {
    readStorage,
    writeStorage,
} from '../../../manager/storage/storageManager';

// Persisted custom additions (survive navigation + app restarts).
const CUSTOM_EVENT_TYPES_KEY = 'CUSTOM_EVENT_TYPES';
const CUSTOM_REQUIREMENTS_KEY = 'CUSTOM_REQUIREMENTS';

const loadCustom = (key: string): string[] => {
    try {
        const raw = readStorage({ key });
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
        return [];
    }
};

const saveCustom = (key: string, list: string[]) => {
    try {
        writeStorage({ key, data: list });
    } catch (e) {
        console.log('save custom error', e);
    }
};

const Step2EventScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const bookingId = route?.params?.bookingId as string | undefined;
    const user = useAppSelector((state) => state.user.user);
    const { booking: existingBooking, isLoading: loadingBooking } =
        useGetBookingById(bookingId && user?.token ? { id: bookingId, token: user.token } : null);
    const {
        meta,
        isLoading: loadingMeta,
        isError: metaError,
    } = useGetBookingMeta(user?.token);

    const eventTypes = useMemo(() => meta?.eventTypes ?? [], [meta]);
    const hallRequirements = useMemo(() => meta?.hallRequirements ?? [], [meta]);

    // Custom additions (merged into the option lists on the client).
    const [extraEventTypes, setExtraEventTypes] = useState<string[]>(
        () => loadCustom(CUSTOM_EVENT_TYPES_KEY),
    );
    const [extraRequirements, setExtraRequirements] = useState<string[]>(
        () => loadCustom(CUSTOM_REQUIREMENTS_KEY),
    );
    const [customEventType, setCustomEventType] = useState('');
    const [customRequirement, setCustomRequirement] = useState('');

    const [expectedAttendance, setExpectedAttendance] = useState(
        () => {
            const d = getDraft()?.event;
            return d?.expectedAttendance ? String(d.expectedAttendance) : '';
        },
    );
    const [selectedEventType, setSelectedEventType] =
        useState<string[]>(() => {
            const d = getDraft()?.event;
            return d?.type ? [d.type] : [];
        });

    const [selectedRequirements, setSelectedRequirements] =
        useState<string[]>(() => getDraft()?.event?.requirements ?? []);

    const selectEventType = (name: string) => {
        setSelectedEventType(prev =>
            prev[0] === name
                ? []
                : [name]
        );
    };

    const toggleRequirement = (name: string) => {
        setSelectedRequirements(prev =>
            prev.includes(name)
                ? prev.filter(item => item !== name)
                : [...prev, name]
        );
    };

    const mergedEventTypes = useMemo(() => {
        const seen = new Set<string>();
        return [...eventTypes, ...extraEventTypes].filter((t) => {
            const key = t.toLowerCase();
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }, [eventTypes, extraEventTypes]);
    const mergedRequirements = useMemo(() => {
        const seen = new Set<string>();
        return [...hallRequirements, ...extraRequirements].filter((r) => {
            const key = r.toLowerCase();
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }, [hallRequirements, extraRequirements]);

    const addCustomEventType = useCallback(() => {
        const name = customEventType.trim();
        if (!name) return;
        if (mergedEventTypes.some((t) => t.toLowerCase() === name.toLowerCase())) {
            return;
        }
        setExtraEventTypes((prev) => {
            const next = [...prev, name];
            saveCustom(CUSTOM_EVENT_TYPES_KEY, next);
            return next;
        });
        setSelectedEventType([name]);
        setCustomEventType('');
    }, [customEventType, mergedEventTypes]);

    const addCustomRequirement = useCallback(() => {
        const name = customRequirement.trim();
        if (!name) return;
        if (mergedRequirements.some((t) => t.toLowerCase() === name.toLowerCase())) {
            return;
        }
        setExtraRequirements((prev) => {
            const next = [...prev, name];
            saveCustom(CUSTOM_REQUIREMENTS_KEY, next);
            return next;
        });
        setSelectedRequirements((prev) => [...prev, name]);
        setCustomRequirement('');
    }, [customRequirement, mergedRequirements]);

    const removeCustomEventType = useCallback((name: string) => {
        setExtraEventTypes((prev) => {
            const next = prev.filter((t) => t !== name);
            saveCustom(CUSTOM_EVENT_TYPES_KEY, next);
            return next;
        });
        setSelectedEventType((prev) => prev.filter((t) => t !== name));
    }, []);

    const removeCustomRequirement = useCallback((name: string) => {
        setExtraRequirements((prev) => {
            const next = prev.filter((t) => t !== name);
            saveCustom(CUSTOM_REQUIREMENTS_KEY, next);
            return next;
        });
        setSelectedRequirements((prev) => prev.filter((t) => t !== name));
    }, []);

    // Pre-fill from backend when screen mounts (existing booking data).
    useEffect(() => {
        if (!existingBooking?.event) {
            return;
        }
        const ev = existingBooking.event;
        if (ev.expectedAttendance) {
            setExpectedAttendance(String(ev.expectedAttendance));
        }
        if (ev.type) {
            setSelectedEventType([ev.type]);
            // Only treat as custom if it is NOT already a backend option.
            const isBackend = eventTypes.some(
                (t) => t.toLowerCase() === ev.type.toLowerCase(),
            );
            setExtraEventTypes((prev) => {
                if (isBackend) return prev;
                if (prev.includes(ev.type)) return prev;
                const next = [...prev, ev.type];
                saveCustom(CUSTOM_EVENT_TYPES_KEY, next);
                return next;
            });
        }
        if (Array.isArray(ev.hallRequirements) && ev.hallRequirements.length) {
            setSelectedRequirements(ev.hallRequirements);
            setExtraRequirements((prev) => {
                const missing = ev.hallRequirements.filter(
                    (req: string) =>
                        !prev.some(
                            (r: string) => r.toLowerCase() === req.toLowerCase(),
                        ) &&
                        !hallRequirements.some(
                            (h: string) => h.toLowerCase() === req.toLowerCase(),
                        ),
                );
                if (!missing.length) return prev;
                const next = [...prev, ...missing];
                saveCustom(CUSTOM_REQUIREMENTS_KEY, next);
                return next;
            });
        }
    }, [existingBooking, eventTypes, hallRequirements]);

    const [loader, setloader] = useState<boolean>(false)

    // Form is valid only when expected attendance + event type are provided.
    const formValid = useMemo(
        () =>
            expectedAttendance.trim().length > 0 &&
            Number(expectedAttendance) > 0 &&
            selectedEventType.length > 0,
        [expectedAttendance, selectedEventType],
    );

    const handleNext = async () => {
        if (loader) {
            return;
        }
        if (!formValid) {
            showMessage({
                message: 'Complete Required Fields',
                description: 'Please enter expected attendance and select an event type.',
                type: 'warning',
            });
            return;
        }

        // DRAFT SYSTEM: save the event section locally — no API call.
        setloader(true)
        try {
            updateDraft('event', {
                expectedAttendance: Number(expectedAttendance) || undefined,
                type: selectedEventType[0] ?? undefined,
                requirements: selectedRequirements,
            });

            navigation.navigate(BookingStepRoute.Step3Schedule, {
                bookingId,
            });
        } finally {
            setloader(false)
        }
    }
    return (
        <Wrapper safeBottom>
            <SubHeader
                navigation={navigation}
                title="Event Details"
            />
            <ScrollView
                showsVerticalScrollIndicator={false}
                className="flex-1"
            >
                {loadingMeta ? (
                    <EventDetailsSkeleton />
                ) : (
                    <>
                        <InputField
                            title="Expected Attendance *"
                            value={expectedAttendance}
                            setvalue={setExpectedAttendance}
                            placeholder="Enter expected number of guests"
                            keyType="numeric"
                            Icon={UsersRound}
                        />
                        <MultiSelector
                            title="Type of Event"
                            list={mergedEventTypes}
                            value={selectedEventType}
                            actionFunc={selectEventType}
                            selection="Single select"
                            Icon={CalendarDays}
                        />

                        {/* Add custom event type */}
                        <View className="flex-row items-center gap-2 mb-6">
                            <View
                                className="flex-1 flex-row items-center rounded-xl px-3"
                                style={{ backgroundColor: Theme.background.secondary }}
                            >
                                <TextInput
                                    className="flex-1 py-3 text-white"
                                    placeholder="Add custom event type"
                                    placeholderTextColor="#8F8B91"
                                    value={customEventType}
                                    onChangeText={setCustomEventType}
                                />
                            </View>
                            <TouchableOpacity
                                activeOpacity={0.85}
                                onPress={addCustomEventType}
                                className="w-11 h-11 rounded-xl items-center justify-center"
                                style={{ backgroundColor: Theme.button.primary }}
                            >
                                <Plus size={20} color={Theme.background.primary} />
                            </TouchableOpacity>
                        </View>

                        {/* Custom-created event types can be removed */}
                        {extraEventTypes.length > 0 && (
                            <View className="flex-row flex-wrap gap-2 mb-6">
                                {extraEventTypes.map((name) => (
                                    <TouchableOpacity
                                        key={name}
                                        activeOpacity={0.85}
                                        onPress={() => removeCustomEventType(name)}
                                        className="flex-row items-center gap-1 px-4 py-2.5 rounded-full border"
                                        style={{
                                            borderColor: Theme.button.primary,
                                            backgroundColor: 'rgba(248,239,203,0.12)',
                                        }}
                                    >
                                        <Text className="text-sm font-medium" style={{ color: Theme.text.primary }}>
                                            {name}
                                        </Text>
                                        <X size={14} color={Theme.button.primary} />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}

                        <View className="mb-3">
                            <Divider />
                        </View>

                <MultiSelector
                    title="Hall Requirements"
                    list={mergedRequirements}
                    value={selectedRequirements}
                    actionFunc={toggleRequirement}
                    selection="Multiple select"
                    Icon={CalendarCheck}
                />

                {/* Add custom requirement */}
                <View className="flex-row items-center gap-2 mb-4">
                    <View
                        className="flex-1 flex-row items-center rounded-xl px-3"
                        style={{ backgroundColor: Theme.background.secondary }}
                    >
                        <TextInput
                            className="flex-1 py-3 text-white"
                            placeholder="Add custom requirement"
                            placeholderTextColor="#8F8B91"
                            value={customRequirement}
                            onChangeText={setCustomRequirement}
                        />
                    </View>
                    <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={addCustomRequirement}
                        className="w-11 h-11 rounded-xl items-center justify-center"
                        style={{ backgroundColor: Theme.button.primary }}
                    >
                        <Plus size={20} color={Theme.background.primary} />
                    </TouchableOpacity>
                </View>

                {extraRequirements.length > 0 && (
                    <View className="flex-row flex-wrap gap-2 mb-4">
                        {extraRequirements.map((name) => (
                            <TouchableOpacity
                                key={name}
                                activeOpacity={0.85}
                                onPress={() => removeCustomRequirement(name)}
                                className="flex-row items-center gap-1 px-4 py-2.5 rounded-full border"
                                style={{
                                    borderColor: Theme.button.primary,
                                    backgroundColor: 'rgba(248,239,203,0.12)',
                                }}
                            >
                                <Text className="text-sm font-medium" style={{ color: Theme.text.primary }}>
                                    {name}
                                </Text>
                                <X size={14} color={Theme.button.primary} />
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                <View className="mb-3">
                    <Divider />
                </View>

                {metaError && (
                    <Text className="text-center text-sm mb-3" style={{ color: '#F87171' }}>
                        Could not load options. Please restart the app or try again.
                    </Text>
                )}
                    </>
                )}
            </ScrollView>
            <MainButton title="Next" actionFunc={handleNext} loader={loader || loadingBooking || loadingMeta} disabled={!formValid} />
        </Wrapper>
    );
};

export default Step2EventScreen;