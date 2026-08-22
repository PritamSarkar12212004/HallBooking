import React, { useState } from 'react';
import Wrapper from '../../../layouts/wraper/Wraper';
import { useNavigation } from '@react-navigation/native';
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
    'Generator / Backup Power',
    'Parking',
    'Green Room',
    'Registration Desk',
];

const Step2EventScreen = () => {

    const navigation = useNavigation();
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

    const [loader, setloader] = useState<boolean>(false)
    const handleNext = () => {
        setloader(true)
        setTimeout(() => {
            setloader(false)
            navigation.navigate(BookingStepRoute.Step3Schedule);
        }, 200)
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
            <MainButton title="Next" actionFunc={handleNext} loader={loader} />
        </Wrapper>
    );
};

export default Step2EventScreen;