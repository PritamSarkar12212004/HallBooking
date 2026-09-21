import React from 'react';
import {
    BadgeIndianRupee,
    CheckCircle2,
    Clock3,
    IndianRupee,
    ListChecks,
} from 'lucide-react-native';

import { Text, View } from '../../../lib/style/withTailwind';
import type { PaymentRecordAnalytics } from '../../../functions/booking/PaymentRecordFunction';
import { money } from '../../../functions/booking/PaymentRecordFunction';
import {
    RecordCard,
    RecordColors,
    RecordPill,
    RecordSectionTitle,
    toneColor,
} from './RecordPrimitives';

interface Props {
    analytics: PaymentRecordAnalytics;
    /** "3 days ago" jaisa relative label. */
    sinceLabel: string;
}

const NumberBlock = ({
    label,
    value,
    color,
}: {
    label: string;
    value: string;
    color: string;
}) => (
    <View className="flex-1">
        <Text
            className="text-[10px] font-bold tracking-wide mb-1"
            style={{ color: RecordColors.textMuted }}
        >
            {label}
        </Text>
        <Text className="text-lg font-extrabold" style={{ color }} numberOfLines={1}>
            {value}
        </Text>
    </View>
);

/**
 * Section 1 — Actual Amount.
 *
 * Kitna requirement tha, kitna paid hua aur kitna bacha — saath me har charge
 * head ka apna amount/paid/due, taake ek nazar me poora hisaab dikh jaaye.
 */
const ActualAmountCard = ({ analytics, sinceLabel }: Props) => {
    const {
        totalAmount,
        paidAmount,
        balanceAmount,
        progress,
        paymentStatus,
        statusTone,
        charges,
        lastPaymentLabel,
        daysSinceLastPayment,
        entries,
    } = analytics;

    const statusColor = toneColor(statusTone);

    return (
        <>
            <RecordSectionTitle
                icon={<BadgeIndianRupee size={16} color={RecordColors.accent} />}
                title="ACTUAL AMOUNT"
                right={<RecordPill label={paymentStatus} color={statusColor} />}
            />

            <RecordCard>
                {/* Totals */}
            <View className="flex-row">
                <NumberBlock
                    label="TOTAL"
                    value={money(totalAmount)}
                    color={RecordColors.text}
                />
                <NumberBlock
                    label="PAID"
                    value={money(paidAmount)}
                    color={RecordColors.success}
                />
                <NumberBlock
                    label="BALANCE"
                    value={money(balanceAmount)}
                    color={balanceAmount > 0 ? RecordColors.warning : RecordColors.success}
                />
            </View>

            {/* Progress */}
            <View
                className="h-2 rounded-full overflow-hidden mt-3"
                style={{ backgroundColor: RecordColors.raised }}
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
            <Text className="text-[10px] mt-1.5" style={{ color: RecordColors.textMuted }}>
                {progress}% settled
                {balanceAmount > 0 ? ` · ${money(balanceAmount)} still to collect` : ''}
            </Text>

            {/* Charge heads */}
            <View
                className="pt-3 mt-4"
                style={{ borderTopWidth: 1, borderTopColor: RecordColors.divider }}
            >
                <View className="flex-row items-center mb-3" style={{ gap: 6 }}>
                    <ListChecks size={13} color={RecordColors.accent} />
                    <Text
                        className="text-[10px] font-bold tracking-wide flex-1"
                        style={{ color: RecordColors.textSecondary }}
                    >
                        AMOUNT HEADS
                    </Text>
                    <Text className="text-[10px]" style={{ color: RecordColors.textMuted }}>
                        {charges.length} head{charges.length === 1 ? '' : 's'}
                    </Text>
                </View>

                {charges.length === 0 ? (
                    <Text className="text-xs" style={{ color: RecordColors.textMuted }}>
                        No amount heads added yet.
                    </Text>
                ) : (
                    charges.map((charge, index) => (
                        <View
                            key={`${charge.label}-${index}`}
                            className={index === charges.length - 1 ? '' : 'mb-3'}
                        >
                            <View className="flex-row items-center justify-between">
                                <View
                                    className="flex-row items-center flex-1 pr-2"
                                    style={{ gap: 7 }}
                                >
                                    {charge.paidPct >= 100 ? (
                                        <CheckCircle2 size={12} color={RecordColors.success} />
                                    ) : (
                                        <IndianRupee size={12} color={RecordColors.textMuted} />
                                    )}
                                    <Text
                                        className="text-sm flex-1"
                                        style={{ color: RecordColors.textSecondary }}
                                        numberOfLines={1}
                                    >
                                        {charge.label}
                                    </Text>
                                </View>
                                <Text
                                    className="text-sm font-bold"
                                    style={{ color: RecordColors.text }}
                                >
                                    {money(charge.amount)}
                                </Text>
                            </View>

                            <View className="flex-row items-center justify-between mt-1">
                                <Text className="text-[11px]" style={{ color: RecordColors.success }}>
                                    Paid {money(charge.paid)} ({charge.paidPct}%)
                                </Text>
                                {charge.due > 0 ? (
                                    <Text
                                        className="text-[11px]"
                                        style={{ color: RecordColors.warning }}
                                    >
                                        Due {money(charge.due)}
                                    </Text>
                                ) : (
                                    <Text
                                        className="text-[11px]"
                                        style={{ color: RecordColors.success }}
                                    >
                                        Cleared
                                    </Text>
                                )}
                            </View>
                        </View>
                    ))
                )}
            </View>

            {/* Last payment info */}
            <View
                className="pt-3 mt-1"
                style={{ borderTopWidth: 1, borderTopColor: RecordColors.divider }}
            >
                <View className="flex-row items-center" style={{ gap: 6 }}>
                    <Clock3 size={11} color={RecordColors.textMuted} />
                    <Text
                        className="text-[11px] flex-1"
                        style={{ color: RecordColors.textSecondary }}
                    >
                        {entries.length === 0
                            ? 'No payment received yet'
                            : `Last payment ${lastPaymentLabel}${
                                  sinceLabel ? ` · ${sinceLabel}` : ''
                              } · ${entries.length} entr${
                                  entries.length === 1 ? 'y' : 'ies'
                              }`}
                    </Text>
                </View>

                {typeof daysSinceLastPayment === 'number' &&
                daysSinceLastPayment > 7 &&
                balanceAmount > 0 ? (
                    <Text className="text-[11px] mt-2" style={{ color: RecordColors.warning }}>
                        ⚠ No payment received for {daysSinceLastPayment} days — follow up with
                        the applicant.
                    </Text>
                ) : null}
            </View>
            </RecordCard>
        </>
    );
};

export default ActualAmountCard;
