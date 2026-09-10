import React, { useEffect, useMemo, useState } from 'react';
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
import FinanceChargesSection, {
    ChargeRow,
    chargeRowsToPayload,
    computeChargeTotals,
    createDefaultChargeRows,
    newChargeRow,
    num,
} from '../../components/booking/FinanceChargesSection';
import UnitsSection, {
    UnitRow,
    computeUnitsPaidTotal,
    computeUnitsTotal,
    createDefaultUnitRows,
    newUnitRow,
    unitRowsToPayload,
} from '../../components/booking/UnitsSection';
import { Theme } from '../../const/theme/Theme';
import {
    Camera,
    Check,
    CreditCard,
    GalleryHorizontal,
    ReceiptText,
    Trash2,
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
import useGetBookingMeta from '../../api/booking/hooks/useGetBookingMeta';

const paymentModes = ['Cash', 'UPI', 'Cheque', 'NEFT/RTGS'];

const EditFinanceScreen = ({ navigation, route }: any) => {
    const bookingId = route.params?.id;
    const user = useAppSelector((state) => state.user.user);

    const { isLoading, booking } = useGetBookingById({
        id: bookingId,
        token: user?.token,
    });

    const upiInfo = useGetBookingMeta(user?.token).meta?.upi;
    const lastPayment =
        booking?.payments && booking.payments.length > 0
            ? booking.payments[booking.payments.length - 1]
            : ({} as any);

    // Section 1 (actual amount) + Section 2 (paid per head) share one row list.
    const [rows, setRows] = useState<ChargeRow[]>(createDefaultChargeRows);
    const [unitRows, setUnitRows] = useState<UnitRow[]>(createDefaultUnitRows);
    const [securityDeposit, setSecurityDeposit] = useState('');
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

    // Totals are derived live from the charge rows (see FinanceChargesSection).
    const unitsTotal = computeUnitsTotal(unitRows);
    const unitsPaid = computeUnitsPaidTotal(unitRows);
    const {
        totalAmount: chargesTotal,
        totalPaid: chargesPaid,
    } = computeChargeTotals(rows);
    const effectiveTotal = chargesTotal + unitsTotal;
    // Paid = charge payments + units marked paid.
    const advanceNum = chargesPaid + unitsPaid;
    const effectiveBalance = Math.max(0, effectiveTotal - advanceNum);

    // "All Paid" = every charge fully paid and every unit marked paid.
    const chargesAllPaid =
        rows.length > 0 &&
        rows.every((r) => num(r.amount) > 0 && num(r.paid) === num(r.amount));
    const allPaid = chargesAllPaid && unitRows.every((u) => u.paid);

    const handleToggleAllPaid = () => {
        const next = !allPaid;
        setRows((prev) =>
            prev.map((r) => ({ ...r, paid: next ? r.amount : '' })),
        );
        setUnitRows((prev) => prev.map((u) => ({ ...u, paid: next })));
    };

    const requiresTransaction =
        paymentMode[0] === 'UPI' ||
        paymentMode[0] === 'Cheque' ||
        paymentMode[0] === 'NEFT/RTGS';

    // Payment proof required for non-cash modes (existing backend proof counts).
    const requiresProof =
        paymentMode.length > 0 &&
        paymentMode[0] !== 'Cash' &&
        !lastPayment?.proof;

    const formValid = useMemo(() => {
        const totalOk = effectiveTotal > 0;
        const advanceOk = advanceNum > 0 && advanceNum <= effectiveTotal;
        const modeOk = paymentMode.length > 0;
        if (!totalOk || !advanceOk || !modeOk) return false;
        if (requiresTransaction && transactionNumber.trim().length === 0) return false;
        if (requiresProof && !photo?.uri) return false;
        return true;
    }, [
        effectiveTotal,
        advanceNum,
        paymentMode,
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
            if (fin.charges && fin.charges.length > 0) {
                setRows(
                    (fin.charges as { label: string; amount?: number; paid?: number }[]).map((c) =>
                        newChargeRow(
                            c.label,
                            c.amount ? String(c.amount) : '',
                            c.paid ? String(c.paid) : '',
                        ),
                    ),
                );
            }
            if (fin.units && fin.units.length > 0) {
                setUnitRows(
                    (fin.units as { label: string; quantity?: number; perUnit?: number; paid?: boolean }[]).map((u) =>
                        newUnitRow(
                            u.label,
                            u.quantity ? String(u.quantity) : '',
                            u.perUnit ? String(u.perUnit) : '',
                            !!u.paid,
                        ),
                    ),
                );
            }
            if (fin.securityDeposit) setSecurityDeposit(String(fin.securityDeposit));
            if (fin.mode) setPaymentMode([fin.mode]);
        }
        const last = booking.payments?.[booking.payments.length - 1];
        if (last?.transactionId) setTransactionNumber(last.transactionId);
        if (last?.proof) setPhoto({ uri: last.proof });
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
            let paymentProofPhoto: string | undefined = lastPayment?.proof;
            if (photo?.uri && !photo.uri.startsWith('http')) {
                const uploaded = await uploadImage(photo.uri);
                paymentProofPhoto = uploaded.secure_url;
            }

            await updateSectionAsync({
                id: bookingId,
                section: 'payment',
                token: user.token,
                data: {
                    charges: chargeRowsToPayload(rows),
                    units: unitRowsToPayload(unitRows),
                    securityDeposit: num(securityDeposit) || undefined,
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
                <View className="mt-2">
                    <FinanceChargesSection
                        rows={rows}
                        setRows={setRows}
                        securityDeposit={securityDeposit}
                        setSecurityDeposit={setSecurityDeposit}
                        extraAmount={unitsTotal}
                        extraPaid={unitsPaid}
                        allPaid={allPaid}
                        onToggleAllPaid={handleToggleAllPaid}
                    />
                    <UnitsSection
                        rows={unitRows}
                        setRows={setUnitRows}
                        showPaid
                    />
                </View>

                <MultiSelector
                    title="Mode of Payment"
                    list={paymentModes}
                    value={paymentMode}
                    actionFunc={selectPaymentMode}
                    selection="Single select"
                    Icon={CreditCard}
                />

                {/* UPI: inline QR from backend — scan to pay */}
                {paymentMode[0] === 'UPI' && upiInfo && (
                    <View
                        className="rounded-2xl p-4 items-center mb-4 mt-3"
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
                            style={{ width: 200, height: 200, borderRadius: 12 }}
                            resizeMode="contain"
                        />
                        <Text className="text-sm mt-3 font-semibold" style={{ color: Theme.button.primary }}>
                            Amount: ₹{(effectiveBalance || 0).toLocaleString()}
                        </Text>
                        <Text className="text-[#8F8B91] text-xs mt-1 text-center">
                            Scan the QR with any UPI app, then add the payment proof below.
                        </Text>
                    </View>
                )}

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
