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
import {  WalletCards, IndianRupee, ShieldCheck, ReceiptText, History, ArrowRight } from 'lucide-react-native';
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
    // Progress computed LIVE from the same fields the balance uses, so it
    // always matches the Balance card and ignores any stale stored balance.
    // Settled = Hall Rent + Instrument + Advance + Final Payment
    // (Security deposit is a refundable hold and excluded.)
    const paidAmount =
        (Number(fin.hallRent) || 0) +
        (Number(fin.instrument) || 0) +
        (Number(fin.advancePaid) || 0) +
        (Number(fin.finalPayment) || 0);
    const progress = totalAmount > 0
        ? Math.min(100, Math.round((paidAmount / totalAmount) * 100))
        : 0;

    const summaryRows = [
        { icon: <IndianRupee size={15} color={Theme.text.secondary} />, label: 'Hall Rent', value: fin.hallRent },
        { icon: <ReceiptText size={15} color={Theme.text.secondary} />, label: 'Instrument / Table', value: fin.instrument },
        { icon: <ShieldCheck size={15} color={Theme.text.secondary} />, label: 'Security Deposit (Refundable)', value: fin.securityDeposit },
        { icon: <WalletCards size={15} color={Theme.text.secondary} />, label: 'Advance Paid', value: fin.advancePaid },
        { icon: <IndianRupee size={15} color={Theme.text.secondary} />, label: 'Final Payment', value: fin.finalPayment },
    ];

    // Field label map for the audit trail.
    const fieldLabels: Record<string, string> = {
        hallRent: 'Hall Rent',
        instrument: 'Instrument',
        securityDeposit: 'Security Deposit',
        totalAmount: 'Total Amount',
        advancePaid: 'Advance Paid',
        finalPayment: 'Final Payment',
    };

    // Balance is derived — never shown as a change diff.
    // Security deposit is a refundable hold — it must NOT appear in the change
    // history diff or the Net Impact total. balanceAmount is derived too.
    const isTrackable = (field: string) =>
        field !== 'balanceAmount' && field !== 'securityDeposit';

    const financeHistory = Array.isArray(booking.financeHistory)
        ? booking.financeHistory
        : [];

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


                {/* FINANCE CHANGE HISTORY — modern timeline of who changed what */}
                {financeHistory.length > 0 && (
                    <>
                        <View className="flex-row items-center gap-2 mb-3">
                            <History size={16} color={Theme.button.primary} />
                            <Text className="text-sm font-semibold" style={{ color: Theme.text.secondary }}>
                                FINANCE CHANGE HISTORY
                            </Text>
                            <View
                                className="px-2 py-0.5 rounded-full"
                                style={{ backgroundColor: Theme.background.third }}
                            >
                                <Text className="text-xs font-bold" style={{ color: Theme.button.primary }}>
                                    {financeHistory.length}
                                </Text>
                            </View>
                        </View>

                        <View className="mb-6">
                            {[...financeHistory].reverse().map((entry: any, i: number) => {
                                const changes = (Array.isArray(entry.changes) ? entry.changes : []).filter(
                                    (c: any) => isTrackable(c.field),
                                );
                                const totalDiff = changes.reduce(
                                    (s: number, c: any) => s + (Number(c.to) || 0) - (Number(c.from) || 0),
                                    0,
                                );
                                const isLast = i === financeHistory.length - 1;
                                return (
                                    <View key={i} className="flex-row mb-3">
                                        {/* Timeline rail */}
                                        <View className="items-center mr-3">
                                            <View
                                                className="w-9 h-9 rounded-full items-center justify-center"
                                                style={{ backgroundColor: Theme.background.third, borderWidth: 2, borderColor: Theme.button.primary }}
                                            >
                                                <Text style={{ color: Theme.button.primary, fontWeight: '800', fontSize: 13 }}>
                                                    {(entry.editedByName || 'U').charAt(0).toUpperCase()}
                                                </Text>
                                            </View>
                                            {!isLast && (
                                                <View
                                                    className="w-0.5 flex-1 mt-1"
                                                    style={{ backgroundColor: Theme.background.third, minHeight: 40 }}
                                                />
                                            )}
                                        </View>

                                        {/* Entry card */}
                                        <View
                                            className="flex-1 rounded-2xl p-4 mb-1"
                                            style={{ backgroundColor: Theme.background.secondary }}
                                        >
                                            {/* Who + when */}
                                            <View className="flex-row items-center justify-between mb-3">
                                                <View className="flex-1">
                                                    <Text className="text-base font-bold" style={{ color: Theme.text.primary }}>
                                                        {entry.editedByName || 'Unknown'}
                                                    </Text>
                                                    <Text className="text-xs mt-0.5" style={{ color: Theme.text.secondary }}>
                                                        {entry.editedByMobile || '—'}
                                                    </Text>
                                                </View>
                                                <View
                                                    className="items-end rounded-lg px-2.5 py-1.5"
                                                    style={{ backgroundColor: Theme.background.third }}
                                                >
                                                    <Text className="text-xs font-semibold" style={{ color: Theme.text.primary }}>
                                                        {entry.editedAt ? formatDate(String(entry.editedAt)) : '—'}
                                                    </Text>
                                                    <Text className="text-xs" style={{ color: Theme.text.secondary }}>
                                                        {entry.editedAt ? formatTime(String(entry.editedAt)) : ''}
                                                    </Text>
                                                </View>
                                            </View>

                                            {/* Each changed field: readable diff row */}
                                            {changes.map((c: any, j: number) => {
                                                const from = Number(c.from) || 0;
                                                const to = Number(c.to) || 0;
                                                const diff = to - from;
                                                const increased = diff > 0;
                                                return (
                                                    <View
                                                        key={j}
                                                        className="rounded-xl p-3 mb-2"
                                                        style={{
                                                            backgroundColor: Theme.background.third,
                                                            borderLeftWidth: 3,
                                                            borderLeftColor: increased ? '#22C55E' : '#F87171',
                                                        }}
                                                    >
                                                        <View className="flex-row items-center justify-between mb-1.5">
                                                            <Text className="text-sm font-semibold" style={{ color: Theme.text.secondary }}>
                                                                {fieldLabels[c.field] || c.field}
                                                            </Text>
                                                            {diff !== 0 && (
                                                                <View
                                                                    className="px-2 py-0.5 rounded-full"
                                                                    style={{ backgroundColor: increased ? 'rgba(34,197,94,0.15)' : 'rgba(248,113,113,0.15)' }}
                                                                >
                                                                    <Text
                                                                        className="text-xs font-bold"
                                                                        style={{ color: increased ? '#22C55E' : '#F87171' }}
                                                                    >
                                                                        {increased ? '+' : '−'}₹{Math.abs(diff).toLocaleString()}
                                                                    </Text>
                                                                </View>
                                                            )}
                                                        </View>
                                                        <View className="flex-row items-center gap-2">
                                                            <Text
                                                                className="text-base"
                                                                style={{ color: Theme.text.secondary, textDecorationLine: 'line-through' }}
                                                            >
                                                                ₹{from.toLocaleString()}
                                                            </Text>
                                                            <ArrowRight size={16} color={Theme.button.primary} />
                                                            <Text className="text-lg font-bold" style={{ color: Theme.text.primary }}>
                                                                ₹{to.toLocaleString()}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                );
                                            })}

                                            {/* Net impact */}
                                            {changes.length > 1 && totalDiff !== 0 && (
                                                <View className="flex-row items-center justify-between mt-1 px-1">
                                                    <Text className="text-xs font-semibold" style={{ color: Theme.text.secondary }}>
                                                        Net Impact ({changes.length} field{changes.length === 1 ? '' : 's'})
                                                    </Text>
                                                    <Text
                                                        className="text-sm font-bold"
                                                        style={{ color: totalDiff > 0 ? '#22C55E' : '#F87171' }}
                                                    >
                                                        {totalDiff > 0 ? '+' : '−'}₹{Math.abs(totalDiff).toLocaleString()}
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    </>
                )}

            </ScrollView>
        </Wrapper>
    );
};

export default PaymentTrackRecordScreen;
