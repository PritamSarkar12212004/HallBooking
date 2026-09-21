import React from 'react';
import { Camera, CreditCard, Hash, ReceiptText } from 'lucide-react-native';

import { Image, Text, TouchableOpacity, View } from '../../../lib/style/withTailwind';
import type { PaymentEntry } from '../../../functions/booking/PaymentRecordFunction';
import { money } from '../../../functions/booking/PaymentRecordFunction';
import {
    RecordCard,
    RecordColors,
    RecordEmpty,
    RecordPill,
    RecordSectionTitle,
} from './RecordPrimitives';

interface Props {
    entries: PaymentEntry[];
    receivedTotal: number;
    onViewProof: (uri: string) => void;
}

const MODE_COLORS: Record<string, string> = {
    Cash: RecordColors.success,
    UPI: RecordColors.info,
    Cheque: RecordColors.warning,
    'NEFT/RTGS': RecordColors.accent,
};

/**
 * Har received payment ek entry me — amount, mode, reference, date aur proof
 * photo. Isse pata chalta hai ki paisa kab, kaise aur kitna aaya (running total
 * ke saath).
 */
const PaymentEntriesList = ({ entries, receivedTotal, onViewProof }: Props) => (
    <>
        <RecordSectionTitle
            icon={<CreditCard size={16} color={RecordColors.accent} />}
            title="PAYMENTS RECEIVED"
            right={
                entries.length > 0 ? (
                    <Text className="text-xs font-bold" style={{ color: RecordColors.success }}>
                        {money(receivedTotal)}
                    </Text>
                ) : undefined
            }
        />

        {entries.length === 0 ? (
            <RecordCard>
                <RecordEmpty text="No payment received yet — the first payment will appear here." />
            </RecordCard>
        ) : (
            <View style={{ gap: 10 }}>
                {[...entries].reverse().map(entry => (
                    <RecordCard key={`${entry.receivedAt}-${entry.index}`}>
                        <View className="flex-row items-center">
                            {/* Payment number */}
                            <View
                                className="w-9 h-9 rounded-xl items-center justify-center mr-3"
                                style={{
                                    backgroundColor: RecordColors.tile,
                                    borderWidth: 1,
                                    borderColor: RecordColors.border,
                                }}
                            >
                                <Text
                                    className="text-xs font-extrabold"
                                    style={{ color: RecordColors.accent }}
                                >
                                    #{entry.index}
                                </Text>
                            </View>

                            <View className="flex-1 pr-2">
                                <Text className="text-base font-extrabold" style={{ color: RecordColors.success }}>
                                    {money(entry.amount)}
                                </Text>
                                <Text className="text-[11px] mt-0.5" style={{ color: RecordColors.textSecondary }}>
                                    {entry.dateLabel}
                                    {entry.timeLabel ? ` · ${entry.timeLabel}` : ''}
                                </Text>
                            </View>

                            <RecordPill
                                label={entry.mode}
                                color={MODE_COLORS[entry.mode] ?? RecordColors.accent}
                                soft
                            />
                        </View>

                        <View
                            className="pt-3 mt-3"
                            style={{ borderTopWidth: 1, borderTopColor: RecordColors.divider }}
                        >
                            <View className="flex-row items-center" style={{ gap: 6 }}>
                                <Hash size={11} color={RecordColors.textMuted} />
                                <Text className="text-[11px] flex-1" style={{ color: RecordColors.textSecondary }}>
                                    {entry.transactionId
                                        ? `Ref ${entry.transactionId}`
                                        : 'No reference number'}
                                </Text>
                                <Text className="text-[11px]" style={{ color: RecordColors.textMuted }}>
                                    Running total {money(entry.runningTotal)}
                                </Text>
                            </View>

                            {entry.proof ? (
                                <TouchableOpacity
                                    activeOpacity={0.9}
                                    onPress={() => onViewProof(entry.proof)}
                                    className="flex-row items-center mt-3"
                                    style={{ gap: 10 }}
                                >
                                    <Image
                                        source={{ uri: entry.proof }}
                                        style={{ width: 52, height: 52, borderRadius: 12 }}
                                        resizeMode="cover"
                                    />
                                    <View className="flex-1">
                                        <View className="flex-row items-center" style={{ gap: 5 }}>
                                            <ReceiptText size={12} color={RecordColors.accent} />
                                            <Text
                                                className="text-[11px] font-bold"
                                                style={{ color: RecordColors.accent }}
                                            >
                                                Payment proof
                                            </Text>
                                        </View>
                                        <Text className="text-[10px] mt-0.5" style={{ color: RecordColors.textMuted }}>
                                            Tap to view full screen
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ) : (
                                <View className="flex-row items-center mt-3" style={{ gap: 6 }}>
                                    <Camera size={11} color={RecordColors.textMuted} />
                                    <Text className="text-[10px]" style={{ color: RecordColors.textMuted }}>
                                        No proof attached for this payment
                                    </Text>
                                </View>
                            )}
                        </View>
                    </RecordCard>
                ))}
            </View>
        )}
    </>
);

export default PaymentEntriesList;
