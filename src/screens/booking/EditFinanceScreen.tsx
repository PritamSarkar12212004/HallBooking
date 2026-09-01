import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Image } from 'react-native';
import Wrapper from '../../layouts/wraper/Wraper';
import SubHeader from '../../components/header/SubHeader';
import {
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from '../../lib/style/withTailwind';
import InputField from '../../components/input/InputField';
import MultiSelector from '../../components/Selector/MultiSelector';
import MainButton from '../../components/buttons/MainButton';
import CamGalPickerButton from '../../components/buttons/CamGalPickerButton';
import { Theme } from '../../const/theme/Theme';
import {
    Camera,
    Check,
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
import { showMessage } from 'react-native-flash-message';
import { useAppSelector } from '../../hooks/redux/redux';
import useGetBookingById from '../../api/booking/hooks/useGetBookingById';
import useUpdateBookingSection from '../../api/booking/hooks/useUpdateBookingSection';
import { useQueryClient } from '@tanstack/react-query';
import uploadImage from '../../services/Cloudinary/uploadImg';

const paymentModes = ['Cash', 'UPI', 'Cheque', 'NEFT/RTGS'];

const EditFinanceScreen = ({ navigation, route }: any) => {
    const bookingId = route.params?.id;
    const user = useAppSelector((state) => state.user.user);

    const { isLoading, booking } = useGetBookingById({
        id: bookingId,
        token: user?.token,
    });

    const financial = booking?.financial || {};
    const lastPayment =
        booking?.payments && booking.payments.length > 0
            ? booking.payments[booking.payments.length - 1]
            : ({} as any);

    const [totalAmount, setTotalAmount] = useState('');
    const [hallRent, setHallRent] = useState('');
    const [instrument, setInstrument] = useState('');
    const [securityDeposit, setSecurityDeposit] = useState('');
    const [advancePaid, setAdvancePaid] = useState('');
    const [finalPayment, setFinalPayment] = useState('');
    const [paymentMode, setPaymentMode] = useState<string[]>([]);
    const [transactionNumber, setTransactionNumber] = useState('');
    const [photo, setPhoto] = useState<any | null>(null);
    const [saving, setSaving] = useState(false);
    const [prefilled, setPrefilled] = useState(false);

    const selectPaymentMode = (mode: string) => {
        setPaymentMode(prev =>
            prev[0] === mode
                ? []
                : [mode]
        );
    };

    // Amount fields accept digits only — alphabets/symbols stripped live.
    const handleAmountChange = (setter: (v: string) => void) => (text: string) => {
        setter(text.replace(/[^0-9]/g, ''));
    };

    const num = (v: string) => {
        const n = Number(v);
        return Number.isFinite(n) ? n : 0;
    };

    // Balance auto-calculated live, identical everywhere.
//   Balance = Total − Advance − Instrument − Hall Rent − Final Payment
// Security Deposit is a refundable hold, so it is NOT subtracted.
const instrumentNum = num(instrument);
    const securityDepositNum = num(securityDeposit);
    const effectiveTotal = num(totalAmount);
    const hallRentNum = num(hallRent);
    const advanceNum = num(advancePaid);
    const finalNum = num(finalPayment);

    const effectiveBalance = Math.max(
        0,
        effectiveTotal - advanceNum - instrumentNum - hallRentNum - finalNum,
    );

    // Sum of every non-refundable component must not exceed the total.
    const amountsExceed =
        effectiveTotal > 0 &&
        (advanceNum + finalNum + instrumentNum + hallRentNum) > effectiveTotal;

    const warnedRef = useRef(false);
    useEffect(() => {
        if (amountsExceed && !warnedRef.current) {
            warnedRef.current = true;
            showMessage({
                message: 'Invalid Amounts',
                description:
                    'Advance + Final Payment + Instrument + Hall Rent is more than the Total Amount.',
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

    // Payment proof required for non-cash modes (existing backend proof counts).
    const requiresProof =
        paymentMode.length > 0 &&
        paymentMode[0] !== 'Cash' &&
        !lastPayment?.proofPhoto;

    const formValid = useMemo(() => {
        const totalOk = effectiveTotal > 0;
        const advanceOk = advanceNum > 0 && advanceNum <= effectiveTotal;
        const modeOk = paymentMode.length > 0;
        if (!totalOk || !advanceOk || !modeOk) return false;
        if (amountsExceed) return false;
        if (requiresTransaction && transactionNumber.trim().length === 0) return false;
        if (requiresProof && !photo?.uri) return false;
        return true;
    }, [
        effectiveTotal,
        advanceNum,
        paymentMode,
        amountsExceed,
        requiresTransaction,
        transactionNumber,
        requiresProof,
        photo,
    ]);

    // Pre-fill all fields from backend booking (editable defaults).
    useEffect(() => {
        if (prefilled || !booking) return;
        const fin = booking.financial;
        if (fin) {
            if (fin.totalAmount) setTotalAmount(String(fin.totalAmount));
            if (fin.hallRent) setHallRent(String(fin.hallRent));
            if (fin.instrument) setInstrument(String(fin.instrument));
            if (fin.securityDeposit) setSecurityDeposit(String(fin.securityDeposit));
            if (fin.advancePaid) setAdvancePaid(String(fin.advancePaid));
            if (fin.finalPayment) setFinalPayment(String(fin.finalPayment));
            if (fin.mode) setPaymentMode([fin.mode]);
        }
        const last = booking.payments?.[booking.payments.length - 1];
        if (last?.transactionId) setTransactionNumber(last.transactionId);
        if (last?.proofPhoto) setPhoto({ uri: last.proofPhoto });
        setPrefilled(true);
    }, [booking, prefilled]);

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

    const handleImageResult = (result: ImagePickerResponse) => {
        if (result.didCancel || result.errorCode) return;
        const selectedPhoto = result.assets?.[0];
        if (!selectedPhoto?.uri) return;
        setPhoto(selectedPhoto);
    };

    const removePhoto = () => {
        setPhoto(null);
    };

    const queryClient = useQueryClient();
    const { updateSectionAsync, isLoading: updateLoading } =
        useUpdateBookingSection();

    const handleSave = async () => {
        if (!formValid || saving || updateLoading) {
            if (!formValid) {
                showMessage({
                    message: 'Complete Required Fields',
                    description: 'Please fill valid payment details, select mode, and add proof (if needed).',
                    type: 'warning',
                });
            }
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

        setSaving(true);
        try {
            // Upload payment proof to Cloudinary if a NEW image was chosen
            // (existing backend proof URLs are kept as-is).
            let paymentProofPhoto: string | undefined = lastPayment?.proofPhoto;
            if (photo?.uri && !photo.uri.startsWith('http')) {
                const uploaded = await uploadImage(photo.uri);
                paymentProofPhoto = uploaded.secure_url;
            }

            await updateSectionAsync({
                id: bookingId,
                section: 'payment',
                token: user.token,
                data: {
                    hallRent: hallRentNum || undefined,
                    instrument: instrumentNum || undefined,
                    securityDeposit: securityDepositNum || undefined,
                    totalAmount: effectiveTotal || undefined,
                    advancePaid: advanceNum || undefined,
                    finalPayment: finalNum || undefined,
                    balanceAmount: effectiveBalance || undefined,
                    mode: paymentMode[0] ?? undefined,
                    transactionNumber: requiresTransaction ? transactionNumber : undefined,
                    paymentProofPhoto,
                },
            });

            queryClient.invalidateQueries({
                queryKey: ['booking', bookingId],
            });
            showMessage({
                message: 'Finance Updated',
                description: 'Payment details saved successfully.',
                type: 'success',
            });
            navigation.goBack();
        } catch (error: any) {
            showMessage({
                message: 'Update Failed',
                description:
                    error?.response?.data?.message ||
                    error?.message ||
                    'Please try again.',
                type: 'danger',
            });
        } finally {
            setSaving(false);
        }
    };

    if (isLoading) {
        return (
            <Wrapper safeBottom>
                <SubHeader navigation={navigation} title="Update Finance" />
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color={Theme.button.primary} />
                </View>
            </Wrapper>
        );
    }

    if (!booking) {
        return (
            <Wrapper safeBottom>
                <SubHeader navigation={navigation} title="Update Finance" />
                <View className="flex-1 items-center justify-center px-6">
                    <Text style={{ color: Theme.text.secondary }} className="text-center">
                        Could not load booking. Please go back.
                    </Text>
                </View>
            </Wrapper>
        );
    }

    return (
        <Wrapper safeBottom>
            <SubHeader navigation={navigation} title="Update Finance" />
            <ScrollView
                showsVerticalScrollIndicator={false}
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 24 }}
            >
                <View className="flex-row items-center gap-2 mb-4 mt-2">
                    <IndianRupee size={20} color={Theme.button.primary} />
                    <Text className="text-white text-base font-semibold">
                        Payment Summary
                    </Text>
                </View>

                {/* Total Amount — manual input, digits only */}
                <InputField
                    title="Total Amount *"
                    value={totalAmount}
                    setvalue={handleAmountChange(setTotalAmount)}
                    placeholder={String(financial?.totalAmount ?? '')}
                    keyType="numeric"
                    Icon={IndianRupee}
                />
                {/* Hall Rent — manual input, digits only */}
                <InputField
                    title="Hall Rent *"
                    value={hallRent}
                    setvalue={handleAmountChange(setHallRent)}
                    placeholder={String(financial?.hallRent ?? '')}
                    keyType="numeric"
                    Icon={IndianRupee}
                />
                <InputField
                    title="Instrument / Table *"
                    value={instrument}
                    setvalue={handleAmountChange(setInstrument)}
                    placeholder={String(financial?.instrument ?? '')}
                    keyType="numeric"
                    Icon={ReceiptText}
                />
                <InputField
                    title="Security Deposit *"
                    value={securityDeposit}
                    setvalue={handleAmountChange(setSecurityDeposit)}
                    placeholder={String(financial?.securityDeposit ?? '')}
                    keyType="numeric"
                    Icon={ShieldCheck}
                />
                {/* Advance Paid — manual input, digits only */}
                <InputField
                    title="Advance Paid *"
                    value={advancePaid}
                    setvalue={handleAmountChange(setAdvancePaid)}
                    placeholder={String(financial?.advancePaid ?? '')}
                    keyType="numeric"
                    Icon={WalletCards}
                />
                {/* Final Payment — manual input, digits only (optional) */}
                <InputField
                    title="Final Payment"
                    value={finalPayment}
                    setvalue={handleAmountChange(setFinalPayment)}
                    placeholder={String(financial?.finalPayment ?? '')}
                    keyType="numeric"
                    Icon={IndianRupee}
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
                {/* Inline warning (UI jump-free reserved slot) */}
                <View style={{ minHeight: 18, justifyContent: 'center' }}>
                    {amountsExceed ? (
                        <Text className="text-xs" style={{ color: '#FF6B6B' }}>
                            ⚠ Advance + Final Payment exceeds the Total Amount
                        </Text>
                    ) : null}
                </View>

                <MultiSelector
                    title="Mode of Payment"
                    list={paymentModes}
                    value={paymentMode}
                    actionFunc={selectPaymentMode}
                    selection="Single select"
                    Icon={CreditCard}
                />

                {requiresTransaction && (
                    <View className="mb-2 mt-3">
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

                <View className="mb-6 mt-3">
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
                                backgroundColor: Theme.background.secondary,
                                borderWidth: 1,
                                borderColor: Theme.button.primary,
                            }}
                        >
                            <Image
                                source={{ uri: photo.uri }}
                                style={{ width: '100%', height: 200 }}
                                resizeMode="cover"
                            />
                            <View className="flex-row gap-2 p-3">
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={capturePhoto}
                                    className="flex-1 flex-row items-center justify-center rounded-lg py-3"
                                    style={{ backgroundColor: Theme.button.primary }}
                                >
                                    <Camera size={17} color="#000" />
                                    <Text className="ml-2 font-semibold" style={{ color: '#000' }}>
                                        Retake
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={removePhoto}
                                    className="flex-row items-center justify-center rounded-lg px-4 py-3"
                                    style={{ backgroundColor: '#3A2020' }}
                                >
                                    <Trash2 size={18} color="#FF6B6B" />
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

                <MainButton
                    title="Save Changes"
                    Icon={Check}
                    loader={saving || updateLoading}
                    disabled={!formValid}
                    actionFunc={handleSave}
                />
            </ScrollView>
        </Wrapper>
    );
};

export default EditFinanceScreen;
