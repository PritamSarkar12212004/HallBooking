import React, { useEffect, useMemo, useState } from 'react';
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
import useGetBookingById from '../../../api/booking/hooks/useGetBookingById';
import {
    getDraft,
    updateDraft,
} from '../../../manager/draftBookingStore';
import { useAppSelector } from '../../../hooks/redux/redux';
import { showMessage } from 'react-native-flash-message';
import useGetBookingMeta from '../../../api/booking/hooks/useGetBookingMeta';

const Step5RequirementsScreen = () => {

    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const bookingId = route?.params?.bookingId as string | undefined;
    const user = useAppSelector((state) => state.user.user);
    const { booking: existingBooking, isLoading: loadingBooking } =
        useGetBookingById(bookingId && user?.token ? { id: bookingId, token: user.token } : null);
    const { meta } = useGetBookingMeta(user?.token);
    const upiInfo = meta?.upi;

    const [instrument, setInstrument] = useState(
        () => {
            const d = getDraft()?.payment;
            return d?.instrument ? String(d.instrument) : '';
        },
    );
    const [securityDeposit, setSecurityDeposit] = useState(
        () => {
            const d = getDraft()?.payment;
            return d?.securityDeposit ? String(d.securityDeposit) : '';
        },
    );
    const [totalAmount, setTotalAmount] = useState(
        () => {
            const d = getDraft()?.payment;
            return d?.totalAmount ? String(d.totalAmount) : '';
        },
    );
    const [advancePaid, setAdvancePaid] = useState(
        () => {
            const d = getDraft()?.payment;
            return d?.advancePaid ? String(d.advancePaid) : '';
        },
    );
    const [hallRent, setHallRent] = useState(
        () => {
            const d = getDraft()?.payment;
            return d?.hallRent ? String(d.hallRent) : '';
        },
    );
    const [paymentMode, setPaymentMode] = useState<string[]>(
        () => {
            const d = getDraft()?.payment;
            return d?.mode ? [d.mode] : [];
        },
    );
    const [, setloader] = useState(false);

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

    const [photo, setPhoto] = useState<any | null>(null);

    // Amount fields accept digits only — alphabets/symbols are stripped live.
    const handleAmountChange = (setter: (v: string) => void) => (text: string) => {
        setter(text.replace(/[^0-9]/g, ''));
    };

    // Auto-calc derived values from inputs (live, no button needed).
    const num = (v: string) => {
        const n = Number(v);
        return Number.isFinite(n) ? n : 0;
    };

    // All five manual inputs: Total, Hall Rent, Instrument, Security Deposit, Advance Paid.
    // Auto-calc only Balance:
    //   Balance = total − advance − instrument − hallRent
    const instrumentNum = num(instrument);
    const securityDepositNum = num(securityDeposit);
    const effectiveTotal = num(totalAmount);
    const hallRentNum = num(hallRent);
    const advanceNum = num(advancePaid);
    const effectiveBalance = Math.max(
        0,
        effectiveTotal - advanceNum - instrumentNum - hallRentNum,
    );

    // Warning: advance + instrument + hall rent exceed the total amount.
    const amountsExceed =
        effectiveTotal > 0 &&
        (advanceNum + instrumentNum + hallRentNum) > effectiveTotal;

    // Popup warning once, when the amounts start exceeding the total.
    const warnedRef = React.useRef(false);
    useEffect(() => {
        if (amountsExceed && !warnedRef.current) {
            warnedRef.current = true;
            showMessage({
                message: 'Invalid Amounts',
                description: 'Advance + Instrument + Hall Rent is more than the Total Amount.',
                type: 'warning',
                duration: 3500,
            });
        }
        if (!amountsExceed) {
            warnedRef.current = false;
        }
    }, [amountsExceed]);

    const requiresTransaction =
        paymentMode[0] === 'UPI' ||
        paymentMode[0] === 'Cheque' ||
        paymentMode[0] === 'NEFT/RTGS';

    // Payment proof required for non-cash modes.
    const requiresProof = paymentMode.length > 0 && paymentMode[0] !== 'Cash';

    // Form valid when total>0, advance present, mode chosen, and (if needed)
    // transaction no + proof provided. UPI shows an inline QR to scan.

    const formValid = useMemo(() => {
        const totalOk = effectiveTotal > 0;
        const partsOk = instrumentNum > 0 && securityDepositNum > 0 && hallRentNum > 0;
        const advanceOk = advanceNum > 0 && advanceNum <= effectiveTotal;
        const modeOk = paymentMode.length > 0;
        if (!totalOk || !partsOk || !advanceOk || !modeOk) return false;
        if (amountsExceed) return false;
        if (requiresTransaction && transactionNumber.trim().length === 0) return false;
        if (requiresProof && !photo?.uri) return false;
        return true;
    }, [
        effectiveTotal,
        instrumentNum,
        securityDepositNum,
        hallRentNum,
        advanceNum,
        amountsExceed,
        paymentMode,
        requiresTransaction,
        transactionNumber,
        requiresProof,
        photo,
    ]);

    // Pre-fill from backend when screen mounts.
    useEffect(() => {
        const fin = existingBooking?.financial;
        if (!fin) {
            return;
        }
        if (fin.hallRent) setHallRent(String(fin.hallRent));
        if (fin.instrument) setInstrument(String(fin.instrument));
        if (fin.securityDeposit) setSecurityDeposit(String(fin.securityDeposit));
        if (fin.totalAmount) setTotalAmount(String(fin.totalAmount));
        if (fin.advancePaid) setAdvancePaid(String(fin.advancePaid));
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
        if (!formValid) {
            showMessage({
                message: 'Complete Required Fields',
                description: 'Please fill payment details, select mode, and add proof (if needed).',
                type: 'warning',
            });
            return;
        }

        setloader(true);
        try {
            // Upload payment proof to Cloudinary if a new image was chosen.
            let paymentProofPhoto = '';
            if (photo?.uri) {
                const uploaded = await uploadImage(photo.uri);
                paymentProofPhoto = uploaded.secure_url;
            }

            // DRAFT SYSTEM: save the payment section locally — no API call.
            updateDraft('payment', {
                hallRent: hallRentNum || undefined,
                instrument: instrumentNum || undefined,
                securityDeposit: securityDepositNum || undefined,
                totalAmount: effectiveTotal || undefined,
                advancePaid: advanceNum || undefined,
                balanceAmount: effectiveBalance || undefined,
                mode: paymentMode[0] ?? undefined,
                transactionNumber: requiresTransaction ? transactionNumber : undefined,
                paymentProofPhoto,
            });

            navigation.navigate(BookingStepRoute.Step6Decoration, {
                bookingId,
            });
        } catch (error: any) {
            showMessage({
                message: 'Upload Failed',
                description:
                    error?.response?.data?.message ||
                    error?.message ||
                    'Please try again.',
                type: 'danger',
                duration: 3000,
            });
        } finally {
            setloader(false);
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
                    {/* Total Amount — manual input, digits only */}
                    <InputField
                        title="Total Amount *"
                        value={totalAmount}
                        setvalue={handleAmountChange(setTotalAmount)}
                        placeholder="Enter total amount"
                        keyType="numeric"
                        Icon={IndianRupee}
                    />
                    {/* Hall Rent — manual input, digits only */}
                    <InputField
                        title="Hall Rent *"
                        value={hallRent}
                        setvalue={handleAmountChange(setHallRent)}
                        placeholder="Enter hall rent"
                        keyType="numeric"
                        Icon={IndianRupee}
                    />
                    <InputField
                        title="Instrument / Table *"
                        value={instrument}
                        setvalue={handleAmountChange(setInstrument)}
                        placeholder="Enter instrument / table amount"
                        keyType="numeric"
                        Icon={ReceiptText}
                    />
                    <InputField
                        title="Security Deposit *"
                        value={securityDeposit}
                        setvalue={handleAmountChange(setSecurityDeposit)}
                        placeholder="Enter security deposit"
                        keyType="numeric"
                        Icon={ShieldCheck}
                    />
                    {/* Advance Paid — manual input, digits only */}
                    <InputField
                        title="Advance Paid *"
                        value={advancePaid}
                        setvalue={handleAmountChange(setAdvancePaid)}
                        placeholder="Enter advance paid amount"
                        keyType="numeric"
                        Icon={WalletCards}
                    />
                    {/* Balance Amount — always auto-calculated */}
                    <View
                        className="rounded-xl px-4 py-3 mb-4 flex-row items-center justify-between"
                        style={{ backgroundColor: Theme.background.secondary }}
                    >
                        <Text className="text-white text-base font-semibold">
                            Balance Amount
                        </Text>
                        <Text className="text-white text-lg font-bold" style={{ color: Theme.button.primary }}>
                            ₹{(effectiveBalance || 0).toLocaleString()}
                        </Text>
                    </View>
                    {/* Inline warning when amounts exceed the total (UI jump-free reserved slot) */}
                    <View style={{ minHeight: 18, justifyContent: 'center' }}>
                        {amountsExceed ? (
                            <Text className="text-xs" style={{ color: '#FF6B6B' }}>
                                ⚠ Advance + Instrument + Hall Rent exceeds the Total Amount
                            </Text>
                        ) : null}
                    </View>

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

                {/* UPI: inline dummy QR from backend (scan to pay) */}
                {paymentMode[0] === 'UPI' && upiInfo && (
                    <View
                        className="rounded-2xl p-4 items-center mb-6"
                        style={{ backgroundColor: Theme.background.secondary }}
                    >
                        <Text className="text-white text-base font-semibold mb-1">
                            Scan to Pay (UPI)
                        </Text>
                        <Text className="text-[#8F8B91] text-xs mb-3">
                            {upiInfo.name} • {upiInfo.id}
                        </Text>
                        <Image
                            source={{ uri: upiInfo.qrUrl }}
                            style={{ width: 220, height: 220, borderRadius: 12 }}
                            resizeMode="contain"
                        />
                        <Text className="text-sm mt-3 font-semibold" style={{ color: Theme.button.primary }}>
                            Amount: ₹{(effectiveTotal || 0).toLocaleString()}
                        </Text>
                        <Text className="text-[#8F8B91] text-xs mt-1 text-center">
                            Scan the QR with any UPI app, then add the payment proof below.
                        </Text>
                    </View>
                )}

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
                        {paymentMode[0] === 'Cash'
                            ? 'Cash payment does not require a proof.'
                            : 'Capture or select payment receipt'}
                    </Text>
                    {requiresProof && (photo?.uri ? (
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

                    ))}

                </View>

            </ScrollView>
            <MainButton
                title="Next"
                actionFunc={handleNext}
                loader={loadingBooking}
                disabled={!formValid}
            />

        </Wrapper>
    );
};

export default Step5RequirementsScreen;