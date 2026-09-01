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
import { Receipt } from 'lucide-react-native';
import { formatDate, formatTime } from '../../functions/formate/DateTimeFormate';
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
    const totalReceived = payments.reduce(
        (sum: any, p: any) => sum + (Number(p.amount) || 0),
        0
    );

    return (
        <Wrapper safeBottom>
            <SubHeader navigation={navigation} title="Payment Track Record" />
            <ScrollView
                showsVerticalScrollIndicator={false}
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 24 }}
            >
                {/* Summary */}
                <View
                    className="rounded-2xl p-4 mb-6"
                    style={{ backgroundColor: Theme.background.secondary }}
                >
                    <Text className="text-xs mb-1" style={{ color: Theme.text.secondary }}>
                        TOTAL RECEIVED
                    </Text>
                    <Text className="text-2xl font-bold" style={{ color: Theme.text.primary }}>
                        ₹{totalReceived.toLocaleString()}
                    </Text>
                    <Text className="text-xs mt-1" style={{ color: Theme.text.secondary }}>
                        {payments.length} payment{payments.length === 1 ? '' : 's'} recorded
                    </Text>
                </View>

                {/* History */}
                <Text className="text-sm font-semibold mb-3" style={{ color: Theme.text.secondary }}>
                    PAYMENT HISTORY
                </Text>

                {payments.length === 0 ? (
                    <View
                        className="rounded-2xl p-6 items-center"
                        style={{ backgroundColor: Theme.background.secondary }}
                    >
                        <Receipt size={28} color={Theme.text.secondary} />
                        <Text className="text-sm mt-3" style={{ color: Theme.text.secondary }}>
                            No payments recorded yet.
                        </Text>
                    </View>
                ) : (
                    <View
                        className="rounded-2xl p-4"
                        style={{ backgroundColor: Theme.background.secondary }}
                    >
                        {payments.map((payment: any, index: number) => {
                            const isLast = index === payments.length - 1;
                            return (
                                <View key={index}>
                                    <View className="flex-row items-center justify-between">
                                        <View className="flex-row items-center flex-1">
                                            <View
                                                className="h-9 w-9 rounded-full items-center justify-center mr-3"
                                                style={{ backgroundColor: Theme.background.third }}
                                            >
                                                <Text
                                                    className="text-sm font-bold"
                                                    style={{ color: Theme.button.primary }}
                                                >
                                                    ₹
                                                </Text>
                                            </View>
                                            <View className="flex-1">
                                                <Text
                                                    className="text-base font-semibold"
                                                    style={{ color: Theme.text.primary }}
                                                >
                                                    ₹{Number(payment.amount).toLocaleString()}
                                                </Text>
                                                <Text className="text-xs mt-0.5" style={{ color: Theme.text.secondary }}>
                                                    {payment.mode || 'Cash'}
                                                    {payment.transactionId
                                                        ? ` • #${payment.transactionId}`
                                                        : ''}
                                                </Text>
                                            </View>
                                        </View>
                                        <View className="items-end">
                                            <Text className="text-xs font-medium" style={{ color: Theme.text.primary }}>
                                                {formatDate(payment.receivedAt)}
                                            </Text>
                                            <Text className="text-[10px] mt-0.5" style={{ color: Theme.text.secondary }}>
                                                {formatTime(payment.receivedAt)}
                                            </Text>
                                        </View>
                                    </View>
                                    {!isLast && (
                                        <View
                                            style={{
                                                height: 1,
                                                backgroundColor: '#2A2A30',
                                                marginVertical: 12,
                                            }}
                                        />
                                    )}
                                </View>
                            );
                        })}
                    </View>
                )}
            </ScrollView>
        </Wrapper>
    );
};

export default PaymentTrackRecordScreen;
