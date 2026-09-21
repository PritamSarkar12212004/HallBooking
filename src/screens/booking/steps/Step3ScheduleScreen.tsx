import React, { useState, useEffect, useRef } from 'react';
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
import { updateDraft } from '../../../manager/draftBookingStore';
import {
    getMobileError,
    isMobileValidOrEmpty,
    sanitizeMobileNumber,
} from '../../../functions/booking/PhoneFunction';
import useGetBookingById from '../../../api/booking/hooks/useGetBookingById';
import { useAppSelector } from '../../../hooks/redux/redux';
import { showMessage } from 'react-native-flash-message';

const Step3ScheduleScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const bookingId = route?.params?.bookingId as string | undefined;
    const user = useAppSelector((state) => state.user.user);
    const { booking: existingBooking, isLoading: loadingBooking } =
        useGetBookingById(bookingId && user?.token ? { id: bookingId, token: user.token } : null);
    const [decoratorName, setDecoratorName] = useState('');
    const [decoratorContact, setDecoratorContact] = useState('');
    const [catererName, setCatererName] = useState('');
    const [catererContact, setCatererContact] = useState('');
    const [selectedKitchen, setSelectedKitchen] = useState<string[]>([]);
    const prefilledFromBooking = useRef(false);
    // Contact number optional hai — par bhara ho to poora 10-digit chahiye.
    const [decoratorContactTouched, setDecoratorContactTouched] = useState(false);
    const [catererContactTouched, setCatererContactTouched] = useState(false);

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
    useEffect(() => {
        const arr = existingBooking?.arrangements;
        if (!arr) {
            return;
        }
        // Sirf ek baar — background refetch se user ke bhare hue fields na udein.
        if (prefilledFromBooking.current) {
            return;
        }
        prefilledFromBooking.current = true;

        if (arr.decorator?.name) setDecoratorName(arr.decorator.name);
        if (arr.decorator?.contact) setDecoratorContact(arr.decorator.contact);
        if (arr.caterer?.name) setCatererName(arr.caterer.name);
        if (arr.caterer?.contact) setCatererContact(arr.caterer.contact);
        if (arr.kitchenRequired !== undefined && arr.kitchenRequired !== null) {
            setSelectedKitchen([arr.kitchenRequired ? 'Yes' : 'No']);
        }
    }, [existingBooking]);

    const decoratorContactError = getMobileError(
        decoratorContact,
        decoratorContactTouched,
        { required: false },
    );
    const catererContactError = getMobileError(
        catererContact,
        catererContactTouched,
        { required: false },
    );

    // Dono contacts khaali ya valid 10-digit — warna Next blocked.
    const contactsValid =
        isMobileValidOrEmpty(decoratorContact) &&
        isMobileValidOrEmpty(catererContact);

    const handleNext = async () => {
        if (!contactsValid) {
            setDecoratorContactTouched(true);
            setCatererContactTouched(true);
            showMessage({
                message: 'Check Contact Numbers',
                description:
                    'Contact numbers are optional, but any number you enter must be a valid 10-digit mobile number.',
                type: 'warning',
            });
            return;
        }

        try {
            updateDraft('arrangements', {
                decoratorName,
                decoratorContact: decoratorContact.trim()
                    ? decoratorContact
                    : undefined,
                catererName,
                catererContact: catererContact.trim()
                    ? catererContact
                    : undefined,
                kitchenRequired: selectedKitchen[0] ?? 'No',
            });

            navigation.navigate(BookingStepRoute.Step4Attendance, {
                bookingId,
            });
        } catch (error: any) {
            showMessage({
                message: 'Draft Save Failed',
                description:
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
                        title="Decorator Name"
                        value={decoratorName}
                        setvalue={setDecoratorName}
                        placeholder="Enter decorator name"
                        keyType="default"
                        Icon={UserRound}
                    />

                    <InputField
                        title="Contact Number"
                        value={decoratorContact}
                        setvalue={(text: string) => {
                            setDecoratorContactTouched(true);
                            setDecoratorContact(sanitizeMobileNumber(text));
                        }}
                        placeholder="10-digit mobile number"
                        keyType="phone-pad"
                        Icon={Phone}
                    />
                    {/* Reserved error slot keeps layout stable (no UI jump) */}
                    <View style={{ minHeight: 16, justifyContent: 'center' }}>
                        {decoratorContactError ? (
                            <Text className="text-xs" style={{ color: '#FF6B6B' }}>
                                {decoratorContactError}
                            </Text>
                        ) : null}
                    </View>

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
                        title="Caterer Name"
                        value={catererName}
                        setvalue={setCatererName}
                        placeholder="Enter caterer name"
                        keyType="default"
                        Icon={UserRound}
                    />

                    <InputField
                        title="Contact Number"
                        value={catererContact}
                        setvalue={(text: string) => {
                            setCatererContactTouched(true);
                            setCatererContact(sanitizeMobileNumber(text));
                        }}
                        placeholder="10-digit mobile number"
                        keyType="phone-pad"
                        Icon={Phone}
                    />
                    {/* Reserved error slot keeps layout stable (no UI jump) */}
                    <View style={{ minHeight: 16, justifyContent: 'center' }}>
                        {catererContactError ? (
                            <Text className="text-xs" style={{ color: '#FF6B6B' }}>
                                {catererContactError}
                            </Text>
                        ) : null}
                    </View>
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
                loader={loadingBooking}
                disabled={!contactsValid}
            />

        </Wrapper>
    );
};

export default Step3ScheduleScreen;