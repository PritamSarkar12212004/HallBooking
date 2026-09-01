import React from 'react';
import {
    ScrollView,
    Text,
    View,
} from '../../lib/style/withTailwind';
import { ActivityIndicator } from 'react-native';
import Wrapper from '../../layouts/wraper/Wraper';
import SubHeader from '../../components/header/SubHeader';
import { Theme } from '../../const/theme/Theme';
import {  WalletCards, IndianRupee, ShieldCheck, ReceiptText } from 'lucide-react-native';
import { useAppSelector } from '../../hooks/redux/redux';
import useGetBookingById from '../../api/booking/hooks/useGetBookingById';

const PaymentTrackRecordScreen = ({ navigation, route }: any) => {
    const user = useAppSelector((state) => state.user.user);
    const { isLoading, booking } = useGetBookingById({
        id: route.params?.id,
        token: user?.token,
    });

    if (isLoading) {
        return (
            <Wrapper safeBottom>
                <SubHeader navigation={navigation} title="Payment Track Record" />
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color={Theme.button.primary} />
                </View>
            </Wrapper>
        );
    }

    if (!booking) {
        return (
            <Wrapper safeBottom>
                <SubHeader navigation={navigation} title="Payment Track Record" />
                <View className="flex-1 items-center justify-center px-6">
                    <Text style={{ color: Theme.text.secondary }} className="text-center">
                        Could not load booking. Please go back.
                    </Text>
                </View>
            </Wrapper>
        );
    }

    const payments = Array.isArray(booking.payments) ? booking.payments : [];
    const fin = booking.financial ?? {};
    const totalReceived = payments.reduce(
        (sum: any, p: any) => sum + (Number(p.amount) || 0),
        0,
    );
    const totalAmount = Number(fin.totalAmount) || 0;
    const balanceAmount = Number(fin.balanceAmount) || 0;
    const paymentStatus = booking.paymentStatus ?? 'Pending';
    const statusColor =
        paymentStatus === 'Paid'
            ? '#22C55E'
            : paymentStatus === 'Partial'
                ? '#F59E0B'
                : '#EF4444';
    // Progress: advance + recorded payments vs total.
    const progress = totalAmount > 0
        ? Math.min(100, Math.round((((Number(fin.advancePaid) || 0) + totalReceived) / totalAmount) * 100))
        : 0;

    const summaryRows = [
        { icon: <IndianRupee size={15} color={Theme.text.secondary} />, label: 'Hall Rent', value: fin.hallRent },
        { icon: <ReceiptText size={15} color={Theme.text.secondary} />, label: 'Instrument / Table', value: fin.instrument },
        { icon: <ShieldCheck size={15} color={Theme.text.secondary} />, label: 'Security Deposit (Refundable)', value: fin.securityDeposit },
        { icon: <WalletCards size={15} color={Theme.text.secondary} />, label: 'Advance Paid', value: fin.advancePaid },
    ];

    return (
        <Wrapper safeBottom>
            <SubHeader navigation={navigation} title="Payment Track Record" />
            <ScrollView
                showsVerticalScrollIndicator={false}
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 24 }}
            >
                <View
                    className="rounded-2xl p-4 mb-5"
                    style={{ backgroundColor: Theme.background.secondary }}
                >
                    <View className="flex-row items-center justify-between mb-3">
                        <Text className="text-xs" style={{ color: Theme.text.secondary }}>
                            PAYMENT STATUS
                        </Text>
                        <View
                            className="px-3 py-1 rounded-full"
                            style={{ backgroundColor: statusColor }}
                        >
                            <Text className="text-xs font-bold" style={{ color: '#fff' }}>
                                {paymentStatus}
                            </Text>
                        </View>
                    </View>

                    <View className="flex-row items-center justify-between mb-3">
                        <View>
                            <Text className="text-xs mb-0.5" style={{ color: Theme.text.secondary }}>
                                Total Amount
                            </Text>
                            <Text className="text-xl font-bold" style={{ color: Theme.text.primary }}>
                                ₹{totalAmount.toLocaleString()}
                            </Text>
                        </View>
                        <View className="items-end">
                            <Text className="text-xs mb-0.5" style={{ color: Theme.text.secondary }}>
                                Balance Due
                            </Text>
                            <Text
                                className="text-xl font-bold"
                                style={{ color: balanceAmount > 0 ? '#F59E0B' : '#22C55E' }}
                            >
                                ₹{balanceAmount.toLocaleString()}
                            </Text>
                        </View>
                    </View>
                    <View
                        className="h-2 rounded-full overflow-hidden mb-2"
                        style={{ backgroundColor: Theme.background.third }}
                    >
                        <View
                            style={{
                                width: `${progress}%`,
                                height: '100%',
                                backgroundColor: statusColor,
                                borderRadius: 999,
                            }}
                        />
                    </View>
                    <Text className="text-xs" style={{ color: Theme.text.secondary }}>
                        {progress}% received • ₹{totalReceived.toLocaleString()} in {payments.length} payment{payments.length === 1 ? '' : 's'}
                    </Text>
                </View>
                <Text className="text-sm font-semibold mb-3" style={{ color: Theme.text.secondary }}>
                    FINANCIAL BREAKDOWN
                </Text>
                <View
                    className="rounded-2xl p-4 mb-6"
                    style={{ backgroundColor: Theme.background.secondary }}
                >
                    {summaryRows.map((row, i) => (
                        <View key={row.label}>
                            <View className="flex-row items-center justify-between py-2.5">
                                <View className="flex-row items-center flex-1">
                                    <View className="mr-2.5">{row.icon}</View>
                                    <Text className="text-sm" style={{ color: Theme.text.secondary }}>
                                        {row.label}
                                    </Text>
                                </View>
                                <Text
                                    className="text-sm font-semibold"
                                    style={{ color: Theme.text.primary }}
                                >
                                    ₹{(Number(row.value) || 0).toLocaleString()}
                                </Text>
                            </View>
                            {i < summaryRows.length - 1 && (
                                <View style={{ height: 1, backgroundColor: '#2A2A30' }} />
                            )}
                        </View>
                    ))}
                </View>
            </ScrollView>
        </Wrapper>
    );
};

export default PaymentTrackRecordScreen;
