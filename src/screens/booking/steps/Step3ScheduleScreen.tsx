import React, { useState } from 'react';
import Wrapper from '../../../layouts/wraper/Wraper';
import { useNavigation } from '@react-navigation/native';
import SubHeader from '../../../components/header/SubHeader';
import { ScrollView, Text, View } from '../../../lib/style/withTailwind';
import InputField from '../../../components/input/InputField';
import MainButton from '../../../components/buttons/MainButton';
import {
    Clock3,
    Cookie,
    Phone,
    UserRound,
    Utensils,
} from 'lucide-react-native';
import { Divider } from 'react-native-paper';
import MultiSelector from '../../../components/Selector/MultiSelector';

const Step3ScheduleScreen = () => {
    const navigation = useNavigation();

    // Decoration
    const [decoratorName, setDecoratorName] = useState('');
    const [decoratorContact, setDecoratorContact] = useState('');
    const [decorationTiming, setDecorationTiming] = useState('');

    // Catering
    const [catererName, setCatererName] = useState('');
    const [catererContact, setCatererContact] = useState('');

    const handleNext = () => {
        const data = {
            decoration: {
                decoratorName,
                contactNumber: decoratorContact,
                timing: decorationTiming,
            },
            catering: {
                catererName,
                contactNumber: catererContact,
            },
        };


        navigation.navigate('Step4');
    };
    const [selectedEventType, setSelectedEventType] =
        useState<string[]>([]);

    const selectEventType = (name: string) => {
        setSelectedEventType(prev =>
            prev[0] === name
                ? []
                : [name]
        );
    };
    const eventTypes = [
        'Yes',
        'No',
    ];


    return (
        <Wrapper safeBottom>
            <SubHeader
                navigation={navigation}
                title="Event Arrangements"
            />
            <ScrollView
                showsVerticalScrollIndicator={false}
                className="flex-1"
            >
                <View className="mb-5">

                    <View className="flex-row items-center gap-2 mb-4">
                        <UserRound
                            size={20}
                            color="#FFFFFF"
                        />

                        <Text className="text-white text-base font-semibold">
                            Decoration Details
                        </Text>
                    </View>
                    <InputField
                        title="Decorator Name *"
                        value={decoratorName}
                        setvalue={setDecoratorName}
                        placeholder="Enter decorator name"
                        keyType="default"
                        Icon={UserRound}
                    />

                    <InputField
                        title="Contact Number"
                        value={decoratorContact}
                        setvalue={setDecoratorContact}
                        placeholder="Enter contact number"
                        keyType="phone-pad"
                        Icon={Phone}
                    />

                    <InputField
                        title="Decoration Timing"
                        value={decorationTiming}
                        setvalue={setDecorationTiming}
                        placeholder="e.g. 10:00 AM - 2:00 PM"
                        keyType="default"
                        Icon={Clock3}
                    />

                </View>

                <View className="mb-5">
                    <Divider />
                </View>

                <View className="mb-5">
                    <View className="flex-row items-center gap-2 mb-4">
                        <Utensils
                            size={20}
                            color="#FFFFFF"
                        />

                        <Text className="text-white text-base font-semibold">
                            Catering Details
                        </Text>
                    </View>

                    <InputField
                        title="Caterer Name *"
                        value={catererName}
                        setvalue={setCatererName}
                        placeholder="Enter caterer name"
                        keyType="default"
                        Icon={UserRound}
                    />

                    <InputField
                        title="Contact Number"
                        value={catererContact}
                        setvalue={setCatererContact}
                        placeholder="Enter contact number"
                        keyType="phone-pad"
                        Icon={Phone}
                    />
                    <View className="mb-3">
                        <Divider />
                    </View>
                    <MultiSelector
                        title="Kichen Required"
                        list={eventTypes}
                        value={selectedEventType}
                        actionFunc={selectEventType}
                        selection="Single select"
                        Icon={Cookie}
                    />
                </View>
            </ScrollView>

            <MainButton
                title="Next"
                actionFunc={handleNext}
            />

        </Wrapper>
    );
};

export default Step3ScheduleScreen;