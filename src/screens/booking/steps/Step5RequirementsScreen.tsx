import React, { useEffect, useState } from 'react';
import { Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

import {
    Camera,
    CreditCard,
    GalleryHorizontal,
    IndianRupee,
    ReceiptText,
    ShieldCheck,
    Trash2,
    WalletCards,
} from 'lucide-react-native';

import {
    launchCamera,
    launchImageLibrary,
    ImagePickerResponse,
} from 'react-native-image-picker';

import Wrapper from '../../../layouts/wraper/Wraper';
import SubHeader from '../../../components/header/SubHeader';

import {
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from '../../../lib/style/withTailwind';

import InputField from '../../../components/input/InputField';
import MultiSelector from '../../../components/Selector/MultiSelector';
import MainButton from '../../../components/buttons/MainButton';
import CamGalPickerButton from '../../../components/buttons/CamGalPickerButton';

import { Theme } from '../../../const/theme/Theme';
import { BookingStepRoute } from '../../../const/routes/route';
import uploadImage from '../../../services/Cloudinary/uploadImg';
import useUpdateBookingSection from '../../../api/booking/hooks/useUpdateBookingSection';
import useGetBookingById from '../../../api/booking/hooks/useGetBookingById';
import { useAppSelector } from '../../../hooks/redux/redux';
import { showMessage } from 'react-native-flash-message';

const Step5RequirementsScreen = () => {

    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const bookingId = route?.params?.bookingId as string | undefined;
    const user = useAppSelector((state) => state.user.user);
    const { updateSectionAsync, isLoading: saving } = useUpdateBookingSection();
    const { booking: existingBooking, isLoading: loadingBooking } =
        useGetBookingById(bookingId && user?.token ? { id: bookingId, token: user.token } : null);

    const [hallRent, setHallRent] = useState('');
    const [securityDeposit, setSecurityDeposit] = useState('');
    const [totalAmount, setTotalAmount] = useState('');
    const [advancePaid, setAdvancePaid] = useState('');
    const [balanceAmount, setBalanceAmount] = useState('');
    const [paymentMode, setPaymentMode] = useState<string[]>([]);

    const paymentModes = [
        'Cash',
        'UPI',
        'Cheque',
        'NEFT/RTGS',
    ];

    const selectPaymentMode = (mode: string) => {
        setPaymentMode(prev =>
            prev[0] === mode
                ? []
                : [mode]
        );
    };

    const [transactionNumber, setTransactionNumber] =
        useState('');

    const requiresTransaction =
        paymentMode[0] === 'UPI' ||
        paymentMode[0] === 'Cheque' ||
        paymentMode[0] === 'NEFT/RTGS';

    const [photo, setPhoto] = useState<any | null>(null);

    // Pre-fill from backend when screen mounts.
    useEffect(() => {
        const fin = existingBooking?.financial;
        if (!fin) {
            return;
        }
        if (fin.hallRent) setHallRent(String(fin.hallRent));
        if (fin.securityDeposit) setSecurityDeposit(String(fin.securityDeposit));
        if (fin.totalAmount) setTotalAmount(String(fin.totalAmount));
        if (fin.advancePaid) setAdvancePaid(String(fin.advancePaid));
        if (fin.balanceAmount !== undefined) setBalanceAmount(String(fin.balanceAmount));
        if (fin.mode) setPaymentMode([fin.mode]);
        if (existingBooking?.payments?.[0]?.transactionId) {
            setTransactionNumber(existingBooking.payments[0].transactionId);
        }
    }, [existingBooking]);


    const capturePhoto = async () => {

        const result = await launchCamera({
            mediaType: 'photo',
            cameraType: 'back',
            quality: 0.8,
            saveToPhotos: false,
        });

        handleImageResult(result);
    };

    const selectPhoto = async () => {

        const result = await launchImageLibrary({
            mediaType: 'photo',
            quality: 0.8,
            selectionLimit: 1,
        });

        handleImageResult(result);
    };

    const handleImageResult = (
        result: ImagePickerResponse
    ) => {

        if (result.didCancel) {
            return;
        }

        if (result.errorCode) {

            console.log(
                'Image Picker Error:',
                result.errorCode,
                result.errorMessage
            );

            return;
        }

        const selectedPhoto = result.assets?.[0];

        if (!selectedPhoto?.uri) {
            return;
        }

        setPhoto(selectedPhoto);
    };


    const removePhoto = () => {
        setPhoto(null);
    };

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
            // Upload payment proof to Cloudinary if a new image was chosen.
            let paymentProofPhoto = '';
            if (photo?.uri) {
                const uploaded = await uploadImage(photo.uri);
                paymentProofPhoto = uploaded.secure_url;
            }

            await updateSectionAsync({
                id: bookingId,
                section: 'payment',
                token: user.token,
                data: {
                    hallRent: Number(hallRent) || undefined,
                    securityDeposit: Number(securityDeposit) || undefined,
                    totalAmount: Number(totalAmount) || undefined,
                    advancePaid: Number(advancePaid) || undefined,
                    balanceAmount: Number(balanceAmount) || undefined,
                    mode: paymentMode[0] ?? undefined,
                    transactionNumber: requiresTransaction ? transactionNumber : undefined,
                    paymentProofPhoto,
                },
            });

            navigation.navigate(BookingStepRoute.Step6Decoration, {
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
                title="Payment Details"
            />
            <ScrollView
                showsVerticalScrollIndicator={false}
                className="flex-1"
            >
                <View className="mb-6">
                    <View className="flex-row items-center gap-2 mb-4">
                        <IndianRupee
                            size={20}
                            color={Theme.button.primary}
                        />
                        <Text className="text-white text-base font-semibold">
                            Payment Summary
                        </Text>
                    </View>
                    <InputField
                        title="Hall Rent *"
                        value={hallRent}
                        setvalue={setHallRent}
                        placeholder="Enter hall rent"
                        keyType="numeric"
                        Icon={IndianRupee}
                    />
                    <InputField
                        title="Security Deposit *"
                        value={securityDeposit}
                        setvalue={setSecurityDeposit}
                        placeholder="Enter security deposit"
                        keyType="numeric"
                        Icon={ShieldCheck}
                    />
                    <InputField
                        title="Total Amount *"
                        value={totalAmount}
                        setvalue={setTotalAmount}
                        placeholder="Enter total amount"
                        keyType="numeric"
                        Icon={ReceiptText}
                    />
                    <InputField
                        title="Advance Paid *"
                        value={advancePaid}
                        setvalue={setAdvancePaid}
                        placeholder="Enter advance paid amount"
                        keyType="numeric"
                        Icon={WalletCards}
                    />
                    <InputField
                        title="Balance Amount"
                        value={balanceAmount}
                        setvalue={setBalanceAmount}
                        placeholder="Enter balance amount"
                        keyType="numeric"
                        Icon={IndianRupee}
                    />

                </View>
                <View className="mb-3">

                    <MultiSelector
                        title="Mode of Payment"
                        list={paymentModes}
                        value={paymentMode}
                        actionFunc={selectPaymentMode}
                        selection="Single select"
                        Icon={CreditCard}
                    />

                </View>

                {requiresTransaction && (
                    <View className="mb-5">
                        <InputField
                            title={
                                paymentMode[0] === 'Cheque'
                                    ? 'Cheque Number *'
                                    : 'Transaction / Reference Number *'
                            }
                            value={transactionNumber}
                            setvalue={setTransactionNumber}
                            placeholder={
                                paymentMode[0] === 'Cheque'
                                    ? 'Enter cheque number'
                                    : 'Enter transaction/reference number'
                            }
                            keyType="default"
                            Icon={ReceiptText}
                        />

                    </View>

                )}
                <View className="mb-6">

                    <Text className="text-white text-base font-semibold mb-1">
                        Payment Proof
                    </Text>

                    <Text className="text-[#8F8B91] text-xs mb-4">
                        Capture or select payment receipt
                    </Text>
                    {photo?.uri ? (
                        <View
                            className="rounded-xl overflow-hidden"
                            style={{
                                backgroundColor:
                                    Theme.background.secondary,

                                borderWidth: 1,

                                borderColor:
                                    Theme.button.primary,
                            }}
                        >
                            <Image
                                source={{
                                    uri: photo.uri,
                                }}
                                style={{
                                    width: '100%',
                                    height: 200,
                                }}
                                resizeMode="cover"
                            />
                            <View className="flex-row gap-2 p-3">
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={capturePhoto}
                                    className="flex-1 flex-row items-center justify-center rounded-lg py-3"
                                    style={{
                                        backgroundColor:
                                            Theme.button.primary,
                                    }}
                                >

                                    <Camera
                                        size={17}
                                        color="#000"
                                    />

                                    <Text
                                        className="ml-2 font-semibold"
                                        style={{
                                            color: '#000',
                                        }}
                                    >
                                        Retake
                                    </Text>

                                </TouchableOpacity>

                                {/* DELETE */}

                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={removePhoto}
                                    className="flex-row items-center justify-center rounded-lg px-4 py-3"
                                    style={{
                                        backgroundColor:
                                            '#3A2020',
                                    }}
                                >

                                    <Trash2
                                        size={18}
                                        color="#FF6B6B"
                                    />

                                </TouchableOpacity>

                            </View>

                        </View>

                    ) : (

                        <View className="flex-row gap-3">

                            <CamGalPickerButton
                                title="Camera"
                                actionFun={capturePhoto}
                                Icon={Camera}
                            />

                            <CamGalPickerButton
                                title="Gallery"
                                actionFun={selectPhoto}
                                Icon={GalleryHorizontal}
                            />

                        </View>

                    )}

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

export default Step5RequirementsScreen;