import React, { useEffect, useMemo, useState } from 'react';
import { Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

import {
    Camera,
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
import FinanceChargesSection, {
    ChargeRow,
    chargeRowsToPayload,
    computeChargeTotals,
    createDefaultChargeRows,
    newChargeRow,
    num,
} from '../../../components/booking/FinanceChargesSection';
import UnitsSection, {
    UnitRow,
    computeUnitsPaidTotal,
    computeUnitsTotal,
    createDefaultUnitRows,
    newUnitRow,
    unitRowsToPayload,
} from '../../../components/booking/UnitsSection';

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

    // Section 1 (actual amount) + Section 2 (paid per head) share one row list.
    const [rows, setRows] = useState<ChargeRow[]>(() => {
        const d = getDraft()?.payment;
        if (d?.charges && d.charges.length > 0) {
            return d.charges.map((c) =>
                newChargeRow(
                    c.label,
                    c.amount ? String(c.amount) : '',
                    c.paid ? String(c.paid) : '',
                ),
            );
        }
        return createDefaultChargeRows();
    });
    // Units captured on the previous step (editable + paid toggle here).
    const [unitRows, setUnitRows] = useState<UnitRow[]>(() => {
        const d = getDraft()?.units;
        if (d && d.length > 0) {
            return d.map((u) =>
                newUnitRow(
                    u.label,
                    u.quantity ? String(u.quantity) : '',
                    u.perUnit ? String(u.perUnit) : '',
                    !!u.paid,
                ),
            );
        }
        return createDefaultUnitRows();
    });
    const [securityDeposit, setSecurityDeposit] = useState(
        () => {
            const d = getDraft()?.payment;
            return d?.securityDeposit ? String(d.securityDeposit) : '';
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

    // Totals are derived live from the charge rows + units.
    const {
        totalAmount: chargesTotal,
        totalPaid: chargesPaid,
    } = computeChargeTotals(rows);
    const unitsTotal = computeUnitsTotal(unitRows);
    const unitsPaid = computeUnitsPaidTotal(unitRows);
    const effectiveTotal = chargesTotal + unitsTotal;
    // Paid = charge payments + units marked paid.
    const paidTotal = chargesPaid + unitsPaid;
    const securityDepositNum = num(securityDeposit);

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

    // Warning: total paid exceeds the total amount.
    const amountsExceed = effectiveTotal > 0 && paidTotal > effectiveTotal;

    // Popup warning once, when the paid amount starts exceeding the total.
    const warnedRef = React.useRef(false);
    useEffect(() => {
        if (amountsExceed && !warnedRef.current) {
            warnedRef.current = true;
            showMessage({
                message: 'Invalid Amounts',
                description: 'Total paid is more than the Total Amount.',
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

    // Form valid when total>0, some payment received, mode chosen, and (if
    // needed) transaction no + proof provided. UPI shows an inline QR to scan.

    const formValid = useMemo(() => {
        const totalOk = effectiveTotal > 0;
        const paidOk = paidTotal > 0 && paidTotal <= effectiveTotal;
        const modeOk = paymentMode.length > 0;
        if (!totalOk || !paidOk || !modeOk) return false;
        if (amountsExceed) return false;
        if (requiresTransaction && transactionNumber.trim().length === 0) return false;
        if (requiresProof && !photo?.uri) return false;
        return true;
    }, [
        effectiveTotal,
        paidTotal,
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
            // Units (with their paid flags) are saved to the draft as well.
            updateDraft('units', unitRowsToPayload(unitRows));
            updateDraft('payment', {
                charges: chargeRowsToPayload(rows),
                units: unitRowsToPayload(unitRows),
                securityDeposit: securityDepositNum || undefined,
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

                {/* Inline warning when paid exceeds the total (UI jump-free reserved slot) */}
                <View style={{ minHeight: 18, justifyContent: 'center' }}>
                    {amountsExceed ? (
                        <Text className="text-xs mb-3" style={{ color: '#FF6B6B' }}>
                            Total paid is more than the Total Amount
                        </Text>
                    ) : null}
                </View>

                <View className="mb-3 mt-3">

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