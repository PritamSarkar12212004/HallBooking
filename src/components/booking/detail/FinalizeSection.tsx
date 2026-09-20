import React from 'react';
import {
    CheckCircle2,
    Circle,
    Lock,
    ReceiptText,
    TriangleAlert,
    Wallet,
} from 'lucide-react-native';

import { Text, TouchableOpacity, View } from '../../../lib/style/withTailwind';
import { BookingDetailPalette as P } from '../../../const/theme/bookingDetailPalette';
import type {
    ChecklistItem,
    FinanceSummary,
} from '../../../functions/booking/BookingDetailFunction';
import { money } from '../../../functions/booking/BookingDetailFunction';
import SwipeButton from '../../buttons/SwipeButton';
import { SectionHeading, SectionStepHeader } from './DetailPrimitives';

interface Props {
    checklist: ChecklistItem[];
    finance: FinanceSummary;
    /** null = swipe enabled; warna exact reason. */
    finalizeBlocker: string | null;
    isEnded: boolean;
    onFinalize: () => void;
    onFixUnits: () => void;
    onPayments: () => void;
}

const ChecklistRow = ({ item }: { item: ChecklistItem }) => (
    <View className="flex-row items-start mb-3.5">
        {item.ok ? (
            <CheckCircle2 size={17} color={P.success} />
        ) : item.blocking ? (
            <TriangleAlert size={17} color={P.danger} />
        ) : (
            <Circle size={17} color={P.warning} />
        )}

        <View className="flex-1 ml-2.5">
            <View className="flex-row items-center" style={{ gap: 6 }}>
                <Text className="text-sm font-bold" style={{ color: P.textPrimary }}>
                    {item.label}
                </Text>
                {item.blocking && !item.ok ? (
                    <Text
                        className="text-[9px] font-extrabold px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: P.dangerSoft, color: P.danger }}
                    >
                        BLOCKING
                    </Text>
                ) : null}
            </View>

            <Text className="text-[11px] mt-1 leading-4" style={{ color: P.textSecondary }}>
                {item.hint}
            </Text>
        </View>
    </View>
);

/**
 * Section 5 — Finalize.
 *
 * Sabse pehle checklist (kya bacha hai), phir swipe. Unit ki current reading
 * missing ho to swipe **locked** rehta hai aur reason saaf likha hota hai — user
 * swipe kar hi nahi paayega.
 */
const FinalizeSection = ({
    checklist,
    finance,
    finalizeBlocker,
    isEnded,
    onFinalize,
    onFixUnits,
    onPayments,
}: Props) => {
    const blocked = finalizeBlocker !== null;

    if (isEnded) {
        return (
            <>
                <SectionStepHeader
                    index={5}
                    title="Finalize"
                    subtitle="Event end karke settlement complete karein"
                    status={{ label: 'Event ended', tone: 'info' }}
                />

                <View
                    className="rounded-2xl p-4 mb-4 flex-row items-start"
                    style={{
                        backgroundColor: P.infoSoft,
                        borderWidth: 1,
                        borderColor: P.info,
                    }}
                >
                    <Lock size={16} color={P.info} />
                    <Text
                        className="text-xs font-semibold ml-2.5 flex-1 leading-5"
                        style={{ color: P.info }}
                    >
                        Event ended hai — ye booking lock ho chuki hai. Units ka
                        hisaab aur payment final ho gaya, ab koi change nahi ho sakta.
                    </Text>
                </View>

                <SectionHeading
                    icon={<ReceiptText size={16} color={P.accent} />}
                    title="Final Summary"
                />

                <View
                    className="rounded-2xl p-4 mb-4"
                    style={{ backgroundColor: P.surface, borderWidth: 1, borderColor: P.border }}
                >
                    <View className="flex-row items-center justify-between mb-3">
                        <Text className="text-sm" style={{ color: P.textSecondary }}>
                            Total amount
                        </Text>
                        <Text className="text-sm font-bold" style={{ color: P.textPrimary }}>
                            {money(finance.totalAmount)}
                        </Text>
                    </View>
                    <View className="flex-row items-center justify-between mb-3">
                        <Text className="text-sm" style={{ color: P.textSecondary }}>
                            Paid
                        </Text>
                        <Text className="text-sm font-bold" style={{ color: P.success }}>
                            {money(finance.paidAmount)}
                        </Text>
                    </View>
                    <View className="flex-row items-center justify-between">
                        <Text className="text-sm" style={{ color: P.textSecondary }}>
                            Balance
                        </Text>
                        <Text
                            className="text-sm font-bold"
                            style={{
                                color: finance.balanceAmount > 0 ? P.warning : P.success,
                            }}
                        >
                            {money(finance.balanceAmount)}
                        </Text>
                    </View>
                </View>

                <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={onPayments}
                    className="flex-row items-center justify-center rounded-2xl py-4 mb-4"
                    style={{ backgroundColor: P.accent, gap: 8 }}
                >
                    <Wallet size={16} color="#FFFFFF" />
                    <Text className="text-sm font-bold text-white">View Payments</Text>
                </TouchableOpacity>
            </>
        );
    }

    return (
        <>
            <SectionStepHeader
                index={5}
                title="Finalize"
                subtitle="Event end karke settlement complete karein"
                status={
                    blocked
                        ? { label: 'Locked', tone: 'danger' }
                        : { label: 'Ready', tone: 'success' }
                }
            />

            <SectionHeading
                icon={<ReceiptText size={16} color={P.accent} />}
                title="Finalize Checklist"
            />

            <View
                className="rounded-2xl p-4 mb-4"
                style={{ backgroundColor: P.surface, borderWidth: 1, borderColor: P.border }}
            >
                {checklist.map((item) => (
                    <ChecklistRow key={item.key} item={item} />
                ))}

                <View
                    className="pt-3 flex-row items-center justify-between"
                    style={{ borderTopWidth: 1, borderTopColor: P.divider }}
                >
                    <Text className="text-sm" style={{ color: P.textSecondary }}>
                        Balance to collect
                    </Text>
                    <Text
                        className="text-base font-extrabold"
                        style={{ color: finance.balanceAmount > 0 ? P.warning : P.success }}
                    >
                        {money(finance.balanceAmount)}
                    </Text>
                </View>
            </View>

            {/* Blocking reason */}
            {blocked ? (
                <View
                    className="rounded-2xl p-4 mb-4"
                    style={{
                        backgroundColor: P.dangerSoft,
                        borderWidth: 1,
                        borderColor: P.danger,
                    }}
                >
                    <View className="flex-row items-center mb-2" style={{ gap: 8 }}>
                        <Lock size={16} color={P.danger} />
                        <Text className="text-sm font-bold" style={{ color: P.danger }}>
                            Swipe locked
                        </Text>
                    </View>

                    <Text className="text-xs leading-5" style={{ color: P.textSecondary }}>
                        {finalizeBlocker}
                    </Text>

                    {checklist.some((item) => item.key === 'units' && !item.ok) ? (
                        <TouchableOpacity
                            activeOpacity={0.85}
                            onPress={onFixUnits}
                            className="mt-3 rounded-xl py-3 items-center"
                            style={{ backgroundColor: P.danger }}
                        >
                            <Text className="text-sm font-bold" style={{ color: '#FFFFFF' }}>
                                Current Unit Add Karein
                            </Text>
                        </TouchableOpacity>
                    ) : null}
                </View>
            ) : (
                <View
                    className="rounded-2xl p-4 mb-4"
                    style={{
                        backgroundColor: P.successSoft,
                        borderWidth: 1,
                        borderColor: P.success,
                    }}
                >
                    <View className="flex-row items-center" style={{ gap: 8 }}>
                        <CheckCircle2 size={16} color={P.success} />
                        <Text className="text-xs font-semibold flex-1" style={{ color: P.success }}>
                            Sab checks pass hain — neeche swipe karke event end karein.
                        </Text>
                    </View>
                </View>
            )}

            <SwipeButton
                label={blocked ? 'Locked — reading pending' : 'Swipe to Finalize Event'}
                onComplete={onFinalize}
                disabled={blocked}
                accent={P.accent}
                bg={P.surfaceAlt}
                border={P.border}
            />

            <Text className="text-[11px] mt-3 leading-5" style={{ color: P.textMuted }}>
                Swipe karne par units ka hisaab ho jaayega, final payment record
                hoga aur event end ho jaayega.
            </Text>

            <TouchableOpacity
                activeOpacity={0.85}
                onPress={onPayments}
                className="flex-row items-center justify-center rounded-2xl py-4 mt-4"
                style={{
                    backgroundColor: P.surface,
                    borderWidth: 1,
                    borderColor: P.border,
                    gap: 8,
                }}
            >
                <Wallet size={16} color={P.textSecondary} />
                <Text className="text-sm font-bold" style={{ color: P.textPrimary }}>
                    View Payment History
                </Text>
            </TouchableOpacity>
        </>
    );
};

export default FinalizeSection;
