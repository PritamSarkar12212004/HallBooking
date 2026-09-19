import React, { useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { CreditCard, ReceiptText } from 'lucide-react-native';

import Wrapper from '../../../layouts/wraper/Wraper';
import SubHeader from '../../../components/header/SubHeader';
import { ScrollView, Text, View } from '../../../lib/style/withTailwind';

import InputField from '../../../components/input/InputField';
import MultiSelector from '../../../components/Selector/MultiSelector';
import MainButton from '../../../components/buttons/MainButton';
import FinanceChargesSection from '../../../components/booking/FinanceChargesSection';
import LockedUnitsList from '../../../components/booking/LockedUnitsList';
import PaymentProofSection from '../../../components/booking/PaymentProofSection';
import UpiQrCard from '../../../components/booking/UpiQrCard';
import FullScreenImage from '../../../components/ui/FullScreenImage';

import { BookingStepRoute } from '../../../const/routes/route';
import usePaymentForm from '../../../hooks/booking/usePaymentForm';

/**
 * Payment Details (Step5) — sirf UI.
 *
 * Charges + deposit bharna, mode of payment chunna, UPI par hall ka QR dikhana,
 * transaction number aur payment proof — sab `usePaymentForm`
 * (src/hooks/booking/usePaymentForm.ts) me hai; rules `PaymentFunction.ts`,
 * charges `ChargeFunction.ts` aur units `UnitsFunction.ts` me.
 *
 * Units is step par LOCKED hain — rate/reading Units screen par set hote hain,
 * isliye `LockedUnitsList` sirf dikhata hai.
 */
const Step5RequirementsScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const bookingId = route?.params?.bookingId as string | undefined;

    const {
        /* charges + refundable deposit */
        rows,
        setRows,
        summary,
        allPaid,
        toggleAllPaid,
        securityDeposit,
        setSecurityDeposit,

        /* units (read-only is step par) */
        unitRows,

        /* mode of payment */
        paymentModes,
        paymentMode,
        selectPaymentMode,

        /* transaction / cheque number */
        requiresTransaction,
        transactionNumber,
        setTransactionNumber,
        transactionTitle,
        transactionPlaceholder,

        /* payment proof */
        photo,
        proofHint,
        requiresProof,
        captureProof,
        pickProof,
        removeProof,

        /* UPI QR (CEO upload karta hai) */
        qrUrl,
        bankHolderName,

        /* submit */
        formValid,
        loader,
        handleNext,
    } = usePaymentForm({
        bookingId,
        onNext: () =>
            navigation.navigate(BookingStepRoute.Step6Decoration, { bookingId }),
    });

    // Sirf view state — full screen previews.
    const [qrPreview, setQrPreview] = useState<string | null>(null);
    const [proofPreview, setProofPreview] = useState<string | null>(null);

    const proofUri: string | null = photo?.uri ?? null;
    const viewProof = () => {
        if (proofUri) setProofPreview(proofUri);
    };

    return (
        <Wrapper safeBottom>
            <SubHeader navigation={navigation} title="Payment Details" />

            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                <FinanceChargesSection
                    rows={rows}
                    setRows={setRows}
                    securityDeposit={securityDeposit}
                    setSecurityDeposit={setSecurityDeposit}
                    extraAmount={summary.unitsTotal}
                    extraPaid={summary.unitsPaid}
                    allPaid={allPaid}
                    onToggleAllPaid={toggleAllPaid}
                />

                {/* Units screen par set kiye gaye units — yahan LOCKED. */}
                {unitRows.length > 0 && (
                    <LockedUnitsList rows={unitRows} onViewPhoto={setProofPreview} />
                )}

                {/* Paid > total par inline warning (jump-free reserved slot) */}
                <View style={{ minHeight: 18, justifyContent: 'center' }}>
                    {summary.amountsExceed ? (
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

                {/* UPI: QR + bank holder name (CEO upload karta hai) */}
                {paymentMode[0] === 'UPI' && (
                    <UpiQrCard
                        qrUrl={qrUrl}
                        bankHolderName={bankHolderName}
                        amount={summary.effectiveTotal}
                        onViewQr={setQrPreview}
                    />
                )}

                {requiresTransaction && (
                    <View className="mb-5">
                        <InputField
                            title={transactionTitle}
                            value={transactionNumber}
                            setvalue={setTransactionNumber}
                            placeholder={transactionPlaceholder}
                            keyType="default"
                            Icon={ReceiptText}
                        />
                    </View>
                )}

                {/* Payment proof — non-cash modes me zaroori, Cash me optional */}
                <PaymentProofSection
                    photoUri={proofUri}
                    hint={proofHint}
                    required={requiresProof}
                    onCapture={captureProof}
                    onPickFromGallery={pickProof}
                    onRemove={removeProof}
                    onView={viewProof}
                />
            </ScrollView>

            <MainButton
                title="Next"
                actionFunc={handleNext}
                loader={loader}
                disabled={!formValid}
            />

            <FullScreenImage
                uri={qrPreview}
                visible={!!qrPreview}
                onClose={() => setQrPreview(null)}
                caption={bankHolderName}
            />

            {/* Payment proof / meter photo full screen preview */}
            <FullScreenImage
                uri={proofPreview}
                visible={!!proofPreview}
                onClose={() => setProofPreview(null)}
            />
        </Wrapper>
    );
};

export default Step5RequirementsScreen;
