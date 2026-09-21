import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import Wrapper from '../../layouts/wraper/Wraper';
import SubHeader from '../../components/header/SubHeader';
import {
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from '../../lib/style/withTailwind';
import MainButton from '../../components/buttons/MainButton';
import FinancePaymentSection from '../../components/booking/FinancePaymentSection';
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
    computeUnitsTotal,
    createDefaultUnitRows,
    draftItemsToUnitRows,
    resolveUnitMeterPhotoUrl,
    setUnitRowPhoto,
    unitRowsToPayload,
} from '../../components/booking/UnitsSection';
import { Theme } from '../../const/theme/Theme';
import { Check, Lock, Pencil } from 'lucide-react-native';
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
import useBusyLock from '../../hooks/busy/useBusyLock';
import uploadImage from '../../services/Cloudinary/uploadImg';
import useHallQr from '../../hooks/qr/useHallQr';
import FullScreenImage from '../../components/ui/FullScreenImage';
import {
    buildFinanceSnapshot,
    hasFinanceChanges,
    isMeterPhotoUrl,
    needsPaymentDetails,
} from '../../functions/booking/EditFinanceFunction';
import { isBookingForOther } from '../../functions/booking/EventFormFunction';
import { bookingForFieldsFromBooking } from '../../functions/booking/EditEventFunction';
import { MainRoute } from '../../const/routes/route';

const paymentModes = ['Cash', 'UPI', 'Cheque', 'NEFT/RTGS'];

const EditFinanceScreen = ({ navigation, route }: any) => {
    const bookingId = route.params?.id;
    // Booking Details se "Current Unit Add Karein" par aane par set hota hai —
    // tab missing-reading units ka input khula milta hai.
    const focusUnits = route.params?.focus === 'units';
    const user = useAppSelector((state) => state.user.user);

    const { isLoading, booking } = useGetBookingById({
        id: bookingId,
        token: user?.token,
    });

    const { qrUrl, bankHolderName } = useHallQr();
    // QR par tap karne par full screen preview khulta hai.
    const [qrPreview, setQrPreview] = useState<string | null>(null);
    // Payment proof tap karne par bhi full screen preview.
    const [proofPreview, setProofPreview] = useState<string | null>(null);
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
    // Units are ALWAYS pending — entering currentUnit/perUnit does NOT mean payment received.
    const unitsPaid = 0;
    const {
        totalAmount: chargesTotal,
        totalPaid: chargesPaid,
    } = computeChargeTotals(rows);
    const effectiveTotal = chargesTotal + unitsTotal;
    // Paid = only charge payments (units are always pending)
    const advanceNum = chargesPaid + unitsPaid;
    const effectiveBalance = Math.max(0, effectiveTotal - advanceNum);

    // Booking kisi aur ke liye hai? (tab hi booking-for card dikhta hai)
    const bookingForInfo = bookingForFieldsFromBooking(booking?.event);

    // "All Paid" = every charge fully paid (units are always pending, not considered)
    const chargesAllPaid =
        rows.length > 0 &&
        rows.every((r) => num(r.amount) > 0 && num(r.paid) === num(r.amount));
    const allPaid = chargesAllPaid;

    const handleToggleAllPaid = () => {
        const next = !allPaid;
        setRows((prev) =>
            prev.map((r) => ({ ...r, paid: next ? r.amount : '' })),
        );
        // Do NOT toggle unitRows — units are always pending
    };

    // Units jo Finalize block karte hain (per unit rate / current reading
    // missing) — hint card ke liye ek-ek line.
    const unitPendingIssues = unitRows
        .filter((row) => row.label.trim().length > 0)
        .map((row) => {
            const label = row.label.trim();
            if (num(row.perUnit) <= 0) {
                return `• ${label} — set the per unit rate.`;
            }
            if (row.includeNow && num(row.currentUnit) <= 0) {
                return `• ${label} — enter the current meter reading.`;
            }
            return null;
        })
        .filter((line): line is string => line !== null);

    const requiresTransaction =
        paymentMode[0] === 'UPI' ||
        paymentMode[0] === 'Cheque' ||
        paymentMode[0] === 'NEFT/RTGS';

    // Payment proof har mode me **zaroori** hai (Cash me bhi receipt mandatory)
    // — jab naya paisa record ho raha ho. Deposit-only ya amount-detail
    // changes par payment section khulta hi nahi.
    const savedAdvance = num(booking?.financial?.advancePaid);
    const recordingNewPayment = advanceNum > savedAdvance;
    const proofRequired =
        recordingNewPayment &&
        paymentMode.length > 0 &&
        !photo?.uri;

    /**
     * Ek URL units ke meter photo ka hai? Aisa image payment proof nahi hota —
     * purane data me mix ho gaya ho to use proof ki tarah na dikhate hain aur
     * save par clear kar dete hain, warna wo Payment Record ke "Payments
     * Received" me proof ban ke dikhta rehta hai.
     */
    const isMeterPhoto = (uri?: string | null): boolean =>
        isMeterPhotoUrl(
            uri,
            booking?.financial?.units,
            unitRows.map((row) => row.meterPhotoUrl),
        );

    /**
     * Purani payment ka proof — sirf HISTORY ki tarah dikhta hai (tap → full
     * screen), naye proof picker me prefill NAHI hota. Isse har nayi payment
     * apna fresh proof le paati hai; purana proof uski apni entry ke saath hi
     * history me rehta hai.
     */
    const previousProofUri: string | null =
        lastPayment?.proof && !isMeterPhoto(lastPayment.proof)
            ? lastPayment.proof
            : null;

    // Naya image chuna gaya (local uri) — Save enable karne ke liye.
    const proofDirty = Boolean(photo?.uri && !photo.uri.startsWith('http'));

    // --- Payment gate ----------------------------------------------------
    // Mode of payment / transaction / proof sirf tab maangte hain jab Customer
    // Paid ya Security Deposit me kuch add/change hua ho. Actual Amount ke
    // charge heads (add / kam / badal) aur unit reading par ye section chhupa
    // rehta hai — wo sirf bill ki detail hai, payment record nahi.
    const originalSnapshot = useMemo(
        () =>
            booking
                ? buildFinanceSnapshot(
                      booking.financial?.charges,
                      booking.financial?.units,
                      booking.financial?.securityDeposit,
                  )
                : null,
        [booking],
    );

    const currentSnapshot = useMemo(
        () =>
            buildFinanceSnapshot(
                chargeRowsToPayload(rows),
                unitRowsToPayload(unitRows),
                num(securityDeposit),
            ),
        [rows, unitRows, securityDeposit],
    );

    // Kuch bhi badla? (charges / paid / deposit / units / naya proof) — warna Save disabled.
    const hasChanges = useMemo(
        () =>
            proofDirty ||
            (prefilled && hasFinanceChanges(originalSnapshot, currentSnapshot)),
        [proofDirty, prefilled, originalSnapshot, currentSnapshot],
    );

    const showPaymentDetails = useMemo(
        () => needsPaymentDetails(originalSnapshot, currentSnapshot),
        [originalSnapshot, currentSnapshot],
    );

    const formValid = useMemo(() => {
        // Kuch change nahi hua — Save band hi rehta hai.
        if (!hasChanges) return false;

        // Paisa record nahi ho raha (amount / unit correction) — payment
        // details ki zarurat nahi, save karne do.
        if (!showPaymentDetails) return true;

        const totalOk = effectiveTotal > 0;
        const advanceOk = advanceNum > 0 && advanceNum <= effectiveTotal;
        const modeOk = paymentMode.length > 0;
        if (!totalOk || !advanceOk || !modeOk) return false;
        if (requiresTransaction && transactionNumber.trim().length === 0) return false;
        if (proofRequired && !photo?.uri) return false;
        return true;
    }, [
        hasChanges,
        showPaymentDetails,
        effectiveTotal,
        advanceNum,
        paymentMode,
        requiresTransaction,
        transactionNumber,
        proofRequired,
        photo,
    ]);

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
                // Draft items -> rows (reading + optional meter photo carry hote hain).
                setUnitRows(
                    draftItemsToUnitRows(
                        fin.units as {
                            label: string;
                            perUnit?: number;
                            currentUnit?: number;
                            meterPhoto?: string;
                            paid?: boolean;
                        }[],
                        { openReadingInput: focusUnits },
                    ),
                );
            }
            if (fin.securityDeposit) setSecurityDeposit(String(fin.securityDeposit));
            if (fin.mode) setPaymentMode([fin.mode]);
        }
        const last = booking.payments?.[booking.payments.length - 1];
        if (last?.transactionId) setTransactionNumber(last.transactionId);
        // NOTE: purana proof yahan photo me prefill NAHI karte — wo history
        // hai. Nayi payment ka proof user khud upload karega (ya optional
        // rehne dega). `previousProofUri` use alag se dikhta hai.
        setPrefilled(true);
    }, [booking, prefilled, focusUnits]);

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

    /* ------------------------- unit meter photo (optional) ------------------------- */

    const [uploadingUnitRowId, setUploadingUnitRowId] = useState<string | null>(null);
    // Photo upload ke dauraan bhi navigation lock (back karne par upload
    // adhoora chhoot na jaaye).
    useBusyLock(Boolean(uploadingUnitRowId), 'Uploading photo…');

    /** Local preview turant dikhta hai, phir compress + Cloudinary upload. */
    const applyUnitPhoto = async (rowId: string, uri: string) => {
        setUnitRows((prev) => setUnitRowPhoto(prev, rowId, uri));
        setUploadingUnitRowId(rowId);
        try {
            const url = await resolveUnitMeterPhotoUrl(uri);
            setUnitRows((prev) => setUnitRowPhoto(prev, rowId, uri, url || null));
        } catch (error: any) {
            console.log('Meter photo upload failed', error);
            setUnitRows((prev) => setUnitRowPhoto(prev, rowId, null));
            showMessage({
                message: 'Upload Failed',
                description: 'Meter photo could not be uploaded. Please try again.',
                type: 'danger',
            });
        } finally {
            setUploadingUnitRowId(null);
        }
    };

    const captureUnitPhoto = async (row: UnitRow) => {
        const result = await launchCamera({
            mediaType: 'photo',
            cameraType: 'back',
            quality: 0.8,
            saveToPhotos: false,
        });
        const picked = result.assets?.[0];
        if (picked?.uri) await applyUnitPhoto(row.id, picked.uri);
    };

    const pickUnitPhoto = async (row: UnitRow) => {
        const result = await launchImageLibrary({
            mediaType: 'photo',
            quality: 0.8,
            selectionLimit: 1,
        });
        const picked = result.assets?.[0];
        if (picked?.uri) await applyUnitPhoto(row.id, picked.uri);
    };

    const removeUnitPhoto = (row: UnitRow) => {
        setUnitRows((prev) => setUnitRowPhoto(prev, row.id, null));
    };

    const queryClient = useQueryClient();
    const { updateSectionAsync, isLoading: updateLoading } =
        useUpdateBookingSection();

    // Ended event ka finance freeze hai — yahan se koi change nahi hone dena.
    const isEnded = booking?.status === 'Ended';

    const handleSave = async () => {
        if (isEnded) {
            showMessage({
                message: 'Event Already Ended',
                description: 'This booking is locked. No further changes are allowed.',
                type: 'warning',
            });
            return;
        }
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
            // Payment proof sirf NAYE image ka upload hota hai — purana proof
            // kabhi dobara nahi bhejte (wo backend ki history me already saved
            // hai; use dobara bhejne par naya paisa record purani image ke
            // saath chipak jaata tha).
            const hasNewProof = Boolean(
                photo?.uri && !photo.uri.startsWith('http'),
            );

            let paymentProofPhoto: string | undefined;
            if (hasNewProof) {
                const uploaded = await uploadImage(photo.uri);
                paymentProofPhoto = uploaded.secure_url;
            }

            // Unit ka meter photo purane data me proof ban gaya ho to use
            // latest payment se clear kar dete hain (wo proof nahi hai).
            const legacyMeterProof =
                Boolean(lastPayment?.proof) && isMeterPhoto(lastPayment?.proof);

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
                    removePaymentProof: legacyMeterProof ? true : undefined,
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
                <SubHeader navigation={navigation} title="Update" />
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color={Theme.button.primary} />
                </View>
            </Wrapper>
        );
    }

    if (!booking) {
        return (
            <Wrapper safeBottom>
                <SubHeader navigation={navigation} title="Update" />
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
            <SubHeader navigation={navigation} title="Update" />
            <ScrollView
                showsVerticalScrollIndicator={false}
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 24 }}
            >
                <View className="mt-2">
                    {/* Booking kisi aur ke liye hai to us person ki details
                        yahan dikhati hain — "Update" se usi ki screen khulti hai. */}
                    {isBookingForOther(bookingForInfo.bookingFor) ? (
                        <View
                            className="rounded-2xl px-4 py-3 mb-4"
                            style={{
                                backgroundColor: Theme.background.secondary,
                                borderWidth: 1,
                                borderColor: Theme.button.primary,
                            }}
                        >
                            <Text
                                className="text-[10px] font-bold tracking-wide mb-1"
                                style={{ color: Theme.button.primary }}
                            >
                                BOOKING FOR SOMEONE ELSE
                            </Text>
                            <Text
                                className="text-sm font-semibold mb-3"
                                style={{ color: Theme.text.primary }}
                            >
                                {bookingForInfo.bookingForName || 'Unnamed'}
                            </Text>

                            <TouchableOpacity
                                activeOpacity={0.85}
                                onPress={() =>
                                    navigation.navigate(MainRoute.EditEvent, {
                                        id: bookingId,
                                    })
                                }
                                className="flex-row items-center justify-center rounded-xl py-2.5"
                                style={{
                                    backgroundColor: Theme.background.third,
                                    borderWidth: 1,
                                    borderColor: '#3E4654',
                                }}
                            >
                                <Pencil size={14} color={Theme.button.primary} />
                                <Text
                                    className="text-xs font-bold ml-2"
                                    style={{ color: Theme.text.primary }}
                                >
                                    Update
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ) : null}

                    {/* Booking Details se "Current Unit Add Karein" par aaye ho to
                        yahan saaf batate hain ki kya bharna hai. */}
                    {focusUnits && prefilled && unitPendingIssues.length > 0 ? (
                        <View
                            className="rounded-2xl px-4 py-3 mb-4"
                            style={{
                                backgroundColor: 'rgba(245,158,11,0.12)',
                                borderWidth: 1,
                                borderColor: '#F59E0B',
                            }}
                        >
                            <Text className="text-sm font-bold mb-1" style={{ color: '#F59E0B' }}>
                                {unitPendingIssues.length} unit
                                {unitPendingIssues.length > 1 ? 's' : ''} incomplete
                            </Text>
                            {unitPendingIssues.map((line) => (
                                <Text
                                    key={line}
                                    className="text-xs"
                                    style={{ color: Theme.text.secondary }}
                                >
                                    {line}
                                </Text>
                            ))}
                            <Text
                                className="text-[11px] mt-1.5"
                                style={{ color: '#8F8B91' }}
                            >
                                Fill them below and save — this unlocks Finalize
                                Event.
                            </Text>
                        </View>
                    ) : null}

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
                        onCapturePhoto={captureUnitPhoto}
                        onPickPhoto={pickUnitPhoto}
                        onRemovePhoto={removeUnitPhoto}
                        uploadingRowId={uploadingUnitRowId}
                    />
                </View>

                {/* Mode of payment + UPI QR + transaction + proof sirf tab
                    dikhte hain jab Customer Paid ya Security Deposit me kuch
                    add/change hua ho — warna ye hissa dikhta hi nahi. */}
                {showPaymentDetails ? (
                    <FinancePaymentSection
                        modes={paymentModes}
                        mode={paymentMode}
                        onSelectMode={selectPaymentMode}
                        qrUrl={qrUrl}
                        bankHolderName={bankHolderName}
                        amountDue={effectiveBalance}
                        onViewQr={setQrPreview}
                        requiresTransaction={requiresTransaction}
                        transactionNumber={transactionNumber}
                        setTransactionNumber={setTransactionNumber}
                        proofRequired={proofRequired}
                        previousProofUri={previousProofUri}
                        photoUri={photo?.uri ?? null}
                        onCapturePhoto={capturePhoto}
                        onPickPhoto={selectPhoto}
                        onRemovePhoto={removePhoto}
                        onViewProof={() =>
                            setProofPreview(photo?.uri ?? previousProofUri)
                        }
                    />
                ) : null}

                {isEnded ? (
                    <View
                        className="flex-row items-center rounded-2xl px-4 py-3.5"
                        style={{
                            backgroundColor: 'rgba(59,130,246,0.12)',
                            borderWidth: 1,
                            borderColor: '#3B82F6',
                        }}
                    >
                        <Lock size={16} color="#3B82F6" />
                        <Text
                            className="text-xs font-semibold ml-2 flex-1"
                            style={{ color: '#3B82F6' }}
                        >
                            Event already ended — no further changes are allowed.
                        </Text>
                    </View>
                ) : (
                    <>
                        <MainButton
                            title="Save Changes"
                            Icon={Check}
                            loader={saving || updateLoading}
                            disabled={!formValid}
                            actionFunc={handleSave}
                        />

                        {!hasChanges ? (
                            <Text
                                className="text-[11px] text-center mt-2"
                                style={{ color: '#8F8B91' }}
                            >
                                No changes yet — Save enables when you update an
                                amount, paid value, deposit or a unit.
                            </Text>
                        ) : null}
                    </>
                )}
            </ScrollView>

            <FullScreenImage
                uri={qrPreview}
                visible={!!qrPreview}
                onClose={() => setQrPreview(null)}
                caption={bankHolderName}
            />

            {/* Payment proof / cash receipt full screen */}
            <FullScreenImage
                uri={proofPreview}
                visible={!!proofPreview}
                onClose={() => setProofPreview(null)}
            />
        </Wrapper>
    );
};

export default EditFinanceScreen;
