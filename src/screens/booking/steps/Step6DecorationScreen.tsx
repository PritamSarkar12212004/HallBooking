import React, { useCallback, useState } from 'react';
import { Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Camera } from 'lucide-react-native';

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
import { capturePhoto } from '../../../module/ImagePickerModule';
import uploadImage from '../../../services/Cloudinary/uploadImg';
import useUpdateBookingSection from '../../../api/booking/hooks/useUpdateBookingSection';
import { useAppSelector } from '../../../hooks/redux/redux';
import { showMessage } from 'react-native-flash-message';


const term =
    'I hereby declare that the information provided above is true and correct. I have read and agree to abide by the terms and conditions of the hall booking.';

const Step6DecorationScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const bookingId = route?.params?.bookingId as string | undefined;
    const user = useAppSelector((state) => state.user.user);
    const { updateSectionAsync, isLoading: saving } = useUpdateBookingSection();

    const [loader, setLoader] = useState(false);

    const [applicantSignature, setApplicantSignature] =
        useState<any | null>(null);

    const [managerSignature, setManagerSignature] =
        useState<any | null>(null);

    const handleApplicantSignature = useCallback(async () => {
        const photo = await capturePhoto({
            cameraType: 'back',
        });

        if (photo) {
            setApplicantSignature(photo);
        }
    }, []);

    const handleManagerSignature = useCallback(async () => {
        const photo = await capturePhoto({
            cameraType: 'front',
        });

        if (photo) {
            setManagerSignature(photo);
        }
    }, []);

    const handleNext = async () => {
        if (loader || saving) {
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

        setLoader(true);
        try {
            // Upload signatures to Cloudinary if new images were captured.
            let applicantPhoto = '';
            let managerPhoto = '';
            if (applicantSignature?.uri) {
                const up = await uploadImage(applicantSignature.uri);
                applicantPhoto = up.secure_url;
            }
            if (managerSignature?.uri) {
                const up = await uploadImage(managerSignature.uri);
                managerPhoto = up.secure_url;
            }

            await updateSectionAsync({
                id: bookingId,
                section: 'declaration',
                token: user.token,
                data: {
                    applicantSignature: applicantPhoto,
                    managerSignature: managerPhoto,
                    termsAccepted: true,
                },
            });

            navigation.navigate(
                BookingStepRoute.Step7Payment,
                { bookingId }
            );
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
            setLoader(false);
        }
    };

    return (
        <Wrapper safeBottom>
            <SubHeader
                navigation={navigation}
                title="Declaration"
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                className="flex-1"
                contentContainerStyle={{
                    paddingBottom: 20,
                }}
            >
                <Text className="text-[#B8B5BA] text-sm leading-5 mb-6">
                    {term}
                </Text>
                <Text className="text-white text-sm font-semibold mb-3">
                    Signatures
                </Text>

                <View className="gap-3 mb-6">
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={handleApplicantSignature}
                        className="rounded-full p-4 items-center justify-center"
                        style={{
                            backgroundColor:
                                Theme.background.secondary,
                            borderWidth: 1,
                            borderColor: '#3E4654',
                            borderStyle: 'dashed',
                            overflow: 'hidden',
                            width: '100%',
                            aspectRatio: 1
                        }}
                    >
                        {applicantSignature?.uri ? (
                            <Image
                                source={{
                                    uri: applicantSignature.uri,
                                }}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                }}
                                resizeMode="cover"
                            />
                        ) : (
                            <>
                                <Camera
                                    size={28}
                                    color={Theme.button.primary}
                                />

                                <Text className="text-[#B8B5BA] text-sm mt-2">
                                    Applicant
                                </Text>

                                <Text className="text-[#777] text-xs mt-1">
                                    Tap to capture
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>

                    {/* Manager Signature */}
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={handleManagerSignature}
                        className="rounded-full p-4 items-center justify-center"
                        style={{
                            backgroundColor:
                                Theme.background.secondary,
                            borderWidth: 1,
                            borderColor: '#3E4654',
                            borderStyle: 'dashed',
                            overflow: 'hidden',
                            width: '100%',
                            aspectRatio: 1
                        }}
                    >
                        {managerSignature?.uri ? (
                            <Image
                                source={{
                                    uri: managerSignature.uri,
                                }}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                }}
                                resizeMode="cover"
                            />
                        ) : (
                            <>
                                <Camera
                                    size={28}
                                    color={Theme.button.primary}
                                />

                                <Text className="text-[#B8B5BA] text-sm mt-2">
                                    Manager
                                </Text>

                                <Text className="text-[#777] text-xs mt-1">
                                    Tap to capture
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <MainButton
                title="Done"
                actionFunc={handleNext}
                loader={loader || saving}
            />
        </Wrapper>
    );
};

export default Step6DecorationScreen;