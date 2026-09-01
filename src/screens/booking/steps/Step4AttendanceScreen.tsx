import React, { useMemo, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';

import {
    Check,
    CheckCircle2,
} from 'lucide-react-native';

import Wrapper from '../../../layouts/wraper/Wraper';
import SubHeader from '../../../components/header/SubHeader';

import {
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from '../../../lib/style/withTailwind';

import MainButton from '../../../components/buttons/MainButton';

import { Theme } from '../../../const/theme/Theme';
import { BookingStepRoute } from '../../../const/routes/route';
import { updateDraft } from '../../../manager/draftBookingStore';
import useGetBookingMeta from '../../../api/booking/hooks/useGetBookingMeta';
import { useAppSelector } from '../../../hooks/redux/redux';
import TermsSkeleton from '../../../ui/Skeleton/TermsSkeleton';

const Step4AttendanceScreen = () => {

    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const bookingId = route?.params?.bookingId as string | undefined;
    const user = useAppSelector((state) => state.user.user);
    const { meta, isLoading: loadingTerms, isError: termsError } =
        useGetBookingMeta(user?.token);

    const terms = useMemo(
        () => meta?.terms ?? [],
        [meta],
    );

    const [accepted, setAccepted] = useState(false);
    const [loader, setLoader] = useState(false);

    const isNextDisabled = useMemo(
        () => !accepted || loader || loadingTerms,
        [accepted, loader, loadingTerms]
    );

    const handleAccept = () => {
        setAccepted(prev => !prev);
    };

    const handleNext = async () => {

        if (!accepted) {
            return;
        }

        // DRAFT SYSTEM: just mark terms accepted in the local draft — no API call.
        setLoader(true);
        try {
            updateDraft('termsAccepted', true);

            navigation.navigate(
                BookingStepRoute.Step5Requirements,
                { bookingId }
            );
        } finally {
            setLoader(false);
        }
    };

    return (
        <Wrapper safeBottom>
            <SubHeader
                navigation={navigation}
                title="Terms & Conditions"
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                className="flex-1"
                contentContainerStyle={{
                    paddingBottom: 20,
                }}
            >
                <View
                    className="rounded-2xl mb-5"
                    style={{
                    }}
                >
                    {loadingTerms ? (
                        <TermsSkeleton />
                    ) : termsError ? (
                        <Text className="text-center text-sm my-6" style={{ color: '#F87171' }}>
                            Could not load terms. Please restart the app or try again.
                        </Text>
                    ) : (
                    <View className="gap-4">

                        {terms.map((term, index) => (

                            <View
                                key={index}
                                className="flex-row items-start"
                            >

                                {/* Number */}
                                <View
                                    className="w-6 h-6 rounded-full items-center justify-center mr-3"
                                    style={{
                                        backgroundColor:
                                            Theme.button.primary + '18',
                                    }}
                                >
                                    <Text
                                        className="text-xs font-bold"
                                        style={{
                                            color:
                                                Theme.button.primary,
                                        }}
                                    >
                                        {index + 1}
                                    </Text>
                                </View>
                                <Text
                                    className="flex-1 text-[#B8B5BA] text-sm leading-5"
                                >
                                    {term}
                                </Text>

                            </View>

                        ))}

                    </View>
                    )}

                </View>

                {/* Acceptance */}
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleAccept}
                    className="rounded-2xl p-4"
                    style={{
                        backgroundColor:
                            accepted
                                ? Theme.button.primary + '12'
                                : Theme.background.secondary,

                        borderWidth: 1,

                        borderColor:
                            accepted
                                ? Theme.button.primary
                                : '#3E4654',
                    }}
                >

                    <View className="flex-row items-start">

                        {/* Checkbox */}
                        <View
                            className="w-6 h-6 rounded-md items-center justify-center"
                            style={{
                                backgroundColor:
                                    accepted
                                        ? Theme.button.primary
                                        : 'transparent',

                                borderWidth:
                                    accepted ? 0 : 1.5,

                                borderColor:
                                    '#667085',
                            }}
                        >

                            {accepted && (
                                <Check
                                    size={16}
                                    color={
                                        Theme.background.primary
                                    }
                                />
                            )}

                        </View>

                        {/* Acceptance Text */}
                        <View className="flex-1 ml-3">

                            <Text className="text-white text-sm font-semibold">
                                I agree to the Terms & Conditions
                            </Text>

                            <Text className="text-[#8F8B91] text-xs leading-5 mt-1">
                                I confirm that I have read and understood
                                all the above booking terms and agree to
                                comply with them.
                            </Text>

                        </View>

                    </View>

                </TouchableOpacity>

                {/* Confirmation Status */}
                {accepted && (
                    <View className="flex-row items-center mt-3 px-1">

                        <CheckCircle2
                            size={15}
                            color={Theme.button.primary}
                        />

                        <Text
                            className="text-xs ml-2"
                            style={{
                                color:
                                    Theme.button.primary,
                            }}
                        >
                            Terms accepted
                        </Text>

                    </View>
                )}

            </ScrollView>

            {/* Next */}
            <MainButton
                title="Continue"
                actionFunc={handleNext}
                disabled={isNextDisabled}
                loader={loader || loadingTerms}
            />

        </Wrapper>
    );
};

export default Step4AttendanceScreen;