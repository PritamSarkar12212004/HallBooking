import React, { useState, useEffect } from 'react';
import Wrapper from '../../../layouts/wraper/Wraper';
import { useNavigation, useRoute } from '@react-navigation/native';
import SubHeader from '../../../components/header/SubHeader';
import { ScrollView, View } from '../../../lib/style/withTailwind';
import MultiSelector from '../../../components/Selector/MultiSelector';
import { Divider } from 'react-native-paper';
import {
    CalendarCheck,
    CalendarDays,
    UsersRound,

} from 'lucide-react-native';
import MainButton from '../../../components/buttons/MainButton';
import { BookingStepRoute } from '../../../const/routes/route';
import InputField from '../../../components/input/InputField';
import useUpdateBookingSection from '../../../api/booking/hooks/useUpdateBookingSection';
import useGetBookingById from '../../../api/booking/hooks/useGetBookingById';
import { useAppSelector } from '../../../hooks/redux/redux';
import { showMessage } from 'react-native-flash-message';

const eventTypes = [
    'Wedding',
    'Birthday Party',
    'Engagement',
    'Reception',
    'Corporate Event',
    'Conference',
    'Seminar',
    'Workshop',
    'Exhibition',
    'Product Launch',
    'Anniversary',
    'Farewell Party',
    'School / College Event',
    'Cultural Program',
    'Religious Event',
];

const hallRequirements = [
    'Stage',
    'Tables',
    'Chairs',
    'Dining Area',
    'Catering',
    'Sound System',
    'Microphone',
    'Projector',
    'LED Screen',
    'Air Conditioning',
    'Decoration',
    'Lighting',
    'Parking',
    'Green Room',
    'Registration Desk',
];

const Step2EventScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const bookingId = route?.params?.bookingId as string | undefined;
    const user = useAppSelector((state) => state.user.user);
    const { updateSectionAsync, isLoading: saving } = useUpdateBookingSection();
    const { booking: existingBooking, isLoading: loadingBooking } =
        useGetBookingById(bookingId && user?.token ? { id: bookingId, token: user.token } : null);

    const [expectedAttendance, setExpectedAttendance] = useState('');
    const [selectedEventType, setSelectedEventType] =
        useState<string[]>([]);

    const [selectedRequirements, setSelectedRequirements] =
        useState<string[]>([]);

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
        }
        if (Array.isArray(ev.hallRequirements) && ev.hallRequirements.length) {
            setSelectedRequirements(ev.hallRequirements);
        }
    }, [existingBooking]);

    const [loader, setloader] = useState<boolean>(false)
    const handleNext = async () => {
        if (saving || loader) {
            return;
        }
        if (!bookingId) {
            showMessage({
                message: 'Booking Error',
                description: 'Booking id is missing. Please restart from Halls screen.',
                type: 'danger',
            });
            return;
        }
        if (!user?.token) {
            showMessage({
                message: 'Authentication Error',
                description: 'User token is missing.',
                type: 'danger',
            });
            return;
        }

        setloader(true)
        try {
            await updateSectionAsync({
                id: bookingId,
                section: 'event',
                token: user.token,
                data: {
                    expectedAttendance: Number(expectedAttendance) || undefined,
                    type: selectedEventType[0] ?? undefined,
                    requirements: selectedRequirements,
                },
            });

            navigation.navigate(BookingStepRoute.Step3Schedule, {
                bookingId,
            });
        } catch (error: any) {
            showMessage({
                message: 'Save Failed',
                description:
                    error?.response?.data?.message ||
                    error?.message ||
                    'Please try again.',
                type: 'danger',
                duration: 3000,
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
                    list={eventTypes}
                    value={selectedEventType}
                    actionFunc={selectEventType}
                    selection="Single select"
                    Icon={CalendarDays}
                />

                <View className="mb-3">
                    <Divider />
                </View>

                <MultiSelector
                    title="Hall Requirements"
                    list={hallRequirements}
                    value={selectedRequirements}
                    actionFunc={toggleRequirement}
                    selection="Multiple select"
                    Icon={CalendarCheck}
                />

                <View className="mb-3">
                    <Divider />
                </View>

            </ScrollView>
            <MainButton title="Next" actionFunc={handleNext} loader={loader || saving || loadingBooking} />
        </Wrapper>
    );
};

export default Step2EventScreen;