import React, { useMemo, useState } from 'react';
import { ActivityIndicator } from 'react-native';

import { ScrollView, Text, View } from '../../lib/style/withTailwind';
import Wrapper from '../../layouts/wraper/Wraper';
import SubHeader from '../../components/header/SubHeader';
import FullScreenImage from '../../components/ui/FullScreenImage';
import { Theme } from '../../const/theme/Theme';
import { useAppSelector } from '../../hooks/redux/redux';
import useGetBookingById from '../../api/booking/hooks/useGetBookingById';

import {
    getPaymentRecordAnalytics,
    relativeDaysLabel,
} from '../../functions/booking/PaymentRecordFunction';

import ActualAmountCard from '../../components/booking/record/ActualAmountCard';
import SecurityDepositCard from '../../components/booking/record/SecurityDepositCard';
import UnitChargesList from '../../components/booking/record/UnitChargesList';
import PaymentEntriesList from '../../components/booking/record/PaymentEntriesList';

const TITLE = 'Payment Record';

/**
 * Payment Record — booking ke paise ka poora hisaab ek hi screen me:
 *
 *  1. ACTUAL AMOUNT — kitna requirement tha, kitna paid hua, kis head me
 *  2. SECURITY DEPOSIT — kitna liya, held/returned, deducted + reason
 *  3. UNITS — sab units ka total billed/paid + rate, reading, meter photo
 *  4. PAYMENTS RECEIVED — har payment: mode, reference, date, proof photo
 *
 * Proof ya meter photo tap karne par full screen khulta hai. Saare numbers
 * `getPaymentRecordAnalytics()` se aate hain — screen sirf UI hai.
 */
const PaymentTrackRecordScreen = ({ navigation, route }: any) => {
    const user = useAppSelector(state => state.user.user);
    const { isLoading, booking } = useGetBookingById({
        id: route.params?.id,
        token: user?.token,
    });

    /** Proof / meter photo ka full screen preview. */
    const [previewUri, setPreviewUri] = useState<string | null>(null);

    const analytics = useMemo(() => getPaymentRecordAnalytics(booking), [booking]);

    if (isLoading) {
        return (
            <Wrapper safeBottom>
                <SubHeader navigation={navigation} title={TITLE} />
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color={Theme.button.primary} />
                </View>
            </Wrapper>
        );
    }

    if (!booking) {
        return (
            <Wrapper safeBottom>
                <SubHeader navigation={navigation} title={TITLE} />
                <View className="flex-1 items-center justify-center px-6">
                    <Text style={{ color: Theme.text.secondary }} className="text-center">
                        Could not load booking. Please go back and try again.
                    </Text>
                </View>
            </Wrapper>
        );
    }

    return (
        <Wrapper safeBottom>
            <SubHeader navigation={navigation} title={TITLE} />

            <ScrollView
                showsVerticalScrollIndicator={false}
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 28 }}
            >
                <View className="mt-2" style={{ gap: 14 }}>
                    <ActualAmountCard
                        analytics={analytics}
                        sinceLabel={relativeDaysLabel(analytics.daysSinceLastPayment)}
                    />

                    <SecurityDepositCard analytics={analytics} />

                    <UnitChargesList
                        units={analytics.units}
                        billed={analytics.unitsBilled}
                        paid={analytics.unitsPaidTotal}
                        onViewPhoto={setPreviewUri}
                    />

                    <PaymentEntriesList
                        entries={analytics.entries}
                        receivedTotal={analytics.receivedTotal}
                        onViewProof={setPreviewUri}
                    />
                </View>
            </ScrollView>

            <FullScreenImage
                uri={previewUri}
                visible={!!previewUri}
                onClose={() => setPreviewUri(null)}
            />
        </Wrapper>
    );
};

export default PaymentTrackRecordScreen;
