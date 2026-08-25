import React, { useState, useEffect } from 'react';
import Wrapper from '../../../layouts/wraper/Wraper';
import { useNavigation, useRoute } from '@react-navigation/native';
import SubHeader from '../../../components/header/SubHeader';
import { ScrollView, Text, View } from '../../../lib/style/withTailwind';
import InputField from '../../../components/input/InputField';
import MainButton from '../../../components/buttons/MainButton';
import {
    Cookie,
    Phone,
    UserRound,
    Utensils,
} from 'lucide-react-native';
import { Divider } from 'react-native-paper';
import MultiSelector from '../../../components/Selector/MultiSelector';
import { BookingStepRoute } from '../../../const/routes/route';
import useUpdateBookingSection from '../../../api/booking/hooks/useUpdateBookingSection';
import useGetBookingById from '../../../api/booking/hooks/useGetBookingById';
import { useAppSelector } from '../../../hooks/redux/redux';
import { showMessage } from 'react-native-flash-message';

const Step3ScheduleScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const bookingId = route?.params?.bookingId as string | undefined;
    const user = useAppSelector((state) => state.user.user);
    const { updateSectionAsync, isLoading: saving } = useUpdateBookingSection();
    const { booking: existingBooking, isLoading: loadingBooking } =
        useGetBookingById(bookingId && user?.token ? { id: bookingId, token: user.token } : null);

    // Decoration
    const [decoratorName, setDecoratorName] = useState('');
    const [decoratorContact, setDecoratorContact] = useState('');

    // Catering
    const [catererName, setCatererName] = useState('');
    const [catererContact, setCatererContact] = useState('');

    const [selectedKitchen, setSelectedKitchen] = useState<string[]>([]);

    const selectKitchen = (name: string) => {
        setSelectedKitchen(prev =>
            prev[0] === name
                ? []
                : [name]
        );
    };
    const eventTypes = [
        'Yes',
        'No',
    ];

    // Pre-fill from backend when screen mounts.
    useEffect(() => {
        const arr = existingBooking?.arrangements;
        if (!arr) {
            return;
        }
        if (arr.decorator?.name) setDecoratorName(arr.decorator.name);
        if (arr.decorator?.contact) setDecoratorContact(arr.decorator.contact);
        if (arr.caterer?.name) setCatererName(arr.caterer.name);
        if (arr.caterer?.contact) setCatererContact(arr.caterer.contact);
        if (arr.kitchenRequired !== undefined && arr.kitchenRequired !== null) {
            setSelectedKitchen([arr.kitchenRequired ? 'Yes' : 'No']);
        }
    }, [existingBooking]);

    const handleNext = async () => {
        if (saving) {
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

        try {
            await updateSectionAsync({
                id: bookingId,
                section: 'arrangements',
                token: user.token,
                data: {
                    decoratorName,
                    decoratorContact,
                    catererName,
                    catererContact,
                    kitchenRequired: selectedKitchen[0] ?? 'No',
                },
            });

            navigation.navigate(BookingStepRoute.Step4Attendance, {
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
        }
    };


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
                        value={selectedKitchen}
                        actionFunc={selectKitchen}
                        selection="Single select"
                        Icon={Cookie}
                    />
                </View>
            </ScrollView>

            <MainButton
                title="Next"
                actionFunc={handleNext}
                loader={saving || loadingBooking}
            />

        </Wrapper>
    );
};

export default Step3ScheduleScreen;