import React from 'react';
import {
    ArrowDownRight,
    BadgeIndianRupee,
    Camera,
    CheckCircle2,
    Gauge,
    History,
    ShieldCheck,
    TriangleAlert,
    Wallet,
} from 'lucide-react-native';

import { Image, Text, TouchableOpacity, View } from '../../../lib/style/withTailwind';
import { BookingDetailPalette as P } from '../../../const/theme/bookingDetailPalette';
import type {
    FinanceSummary,
    UnitIssue,
} from '../../../functions/booking/BookingDetailFunction';
import { money } from '../../../functions/booking/BookingDetailFunction';
import {
    DetailAccordion,
    DetailBadge,
    DetailCard,
    DetailRow,
    EmptyLine,
    SectionHeading,
} from './DetailPrimitives';

interface Props {
    finance: FinanceSummary;
    unitIssues: UnitIssue[];
    /** CEO ke read-only view me action nahi hota — isliye optional. */
    onFixUnits?: () => void;
    onPreview: (uri?: string | null) => void;
}

const TotalBox = ({ label, value, tone }: { label: string; value: string; tone: string }) => (
    <View
        className="rounded-xl px-3 py-3 flex-1"
        style={{ backgroundColor: P.surfaceAlt, borderWidth: 1, borderColor: P.border }}
    >
        <Text className="text-[10px] font-bold" style={{ color: P.textMuted }}>
            {label}
        </Text>
        <Text className="text-base font-extrabold mt-1" style={{ color: tone }}>
            {value}
        </Text>
    </View>
);

const UnitCard = ({
    unit,
    index,
    onPreview,
}: {
    unit: FinanceSummary['units'][number];
    index: number;
    onPreview: (uri?: string | null) => void;
}) => {
    // Dono cheezein Finalize ko block karti hain (rate + current reading).
    const rateMissing = unit.perUnit <= 0;
    const needsFix = unit.readingMissing || rateMissing;

    return (
    <View
        className="rounded-2xl p-4 mb-3"
        style={{
            backgroundColor: P.surface,
            borderWidth: 1,
            borderColor: needsFix ? P.warning : P.border,
        }}
    >
        <View className="flex-row items-center justify-between mb-2.5">
            <View className="flex-row items-center flex-1 pr-2" style={{ gap: 8 }}>
                <View
                    className="w-7 h-7 rounded-lg items-center justify-center"
                    style={{ backgroundColor: P.accentSoft }}
                >
                    <Text className="text-[11px] font-extrabold" style={{ color: P.accent }}>
                        {index + 1}
                    </Text>
                </View>
                <Text
                    className="text-sm font-bold flex-1"
                    style={{ color: P.textPrimary }}
                    numberOfLines={1}
                >
                    {unit.label}
                </Text>
            </View>

            <DetailBadge
                label={unit.paid ? 'Paid' : 'Pending'}
                tone={unit.paid ? 'success' : 'warning'}
                solid={false}
            />
        </View>

        <View className="flex-row mb-2.5" style={{ gap: 8 }}>
            <View
                className="rounded-xl px-3 py-2 flex-1"
                style={{
                    backgroundColor: rateMissing ? P.warningSoft : P.surfaceAlt,
                    borderWidth: rateMissing ? 1 : 0,
                    borderColor: rateMissing ? P.warning : 'transparent',
                }}
            >
                <Text className="text-[10px] font-bold" style={{ color: P.textMuted }}>
                    PER UNIT RATE
                </Text>
                <Text
                    className="text-sm font-bold mt-1"
                    style={{ color: rateMissing ? P.warning : P.textPrimary }}
                >
                    {rateMissing ? 'Set rate' : money(unit.perUnit)}
                </Text>
            </View>

            <View
                className="rounded-xl px-3 py-2 flex-1"
                style={{
                    backgroundColor: unit.readingMissing ? P.warningSoft : P.surfaceAlt,
                    borderWidth: unit.readingMissing ? 1 : 0,
                    borderColor: unit.readingMissing ? P.warning : 'transparent',
                }}
            >
                <Text className="text-[10px] font-bold" style={{ color: P.textMuted }}>
                    CURRENT UNIT
                </Text>
                <Text
                    className="text-sm font-bold mt-1"
                    style={{ color: unit.readingMissing ? P.warning : P.textPrimary }}
                >
                    {unit.readingMissing ? 'Add reading' : unit.currentUnit.toLocaleString('en-IN')}
                </Text>
            </View>
        </View>

        {unit.quantity > 0 || unit.amount > 0 ? (
            <View className="flex-row items-center justify-between mb-1">
                <Text className="text-xs" style={{ color: P.textSecondary }}>
                    Used units
                </Text>
                <Text className="text-xs font-semibold" style={{ color: P.textPrimary }}>
                    {unit.quantity > 0 ? unit.quantity.toLocaleString('en-IN') : '—'}
                    {unit.amount > 0 ? ` · ${money(unit.amount)}` : ''}
                </Text>
            </View>
        ) : null}

        {needsFix ? (
          <View className="flex-row items-center mt-1.5" style={{ gap: 6 }}>
              <TriangleAlert size={12} color={P.warning} />
              <Text className="text-[11px] flex-1" style={{ color: P.warning }}>
                  {unit.readingMissing
                      ? 'Finalize Event stays locked until the reading is added.'
                      : 'Finalize Event stays locked until the rate is set.'}
              </Text>
          </View>
        ) : null}

        {unit.meterPhoto ? (
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => onPreview(unit.meterPhoto)}
                className="flex-row items-center mt-3"
                style={{ gap: 8 }}
            >
                <Image
                    source={{ uri: unit.meterPhoto }}
                    style={{ width: 44, height: 44, borderRadius: 10 }}
                    resizeMode="cover"
                />
                <View className="flex-1">
                    <View className="flex-row items-center" style={{ gap: 5 }}>
                        <Camera size={12} color={P.accent} />
                        <Text className="text-[11px] font-bold" style={{ color: P.accent }}>
                            Meter photo
                        </Text>
                    </View>
                    <Text className="text-[10px] mt-0.5" style={{ color: P.textMuted }}>
                        Tap to view full screen
                    </Text>
                </View>
            </TouchableOpacity>
        ) : null}
    </View>
    );
};

/**
 * Section 4 — Finance.
 *
 * Charges ka paid progress, har unit ki reading (pending ho to saaf warning),
 * totals aur security deposit — sab alag alag, saaf sections me.
 */
const FinanceSection = ({ finance, unitIssues, onFixUnits, onPreview }: Props) => {
    const settledPct =
        finance.totalAmount > 0
            ? Math.round((finance.paidAmount / finance.totalAmount) * 100)
            : 0;

    return (
        <DetailAccordion
            index={4}
            title="Finance"
            subtitle="Charges, units and balance summary"
            status={
                unitIssues.length > 0
                    ? { label: `${unitIssues.length} pending`, tone: 'warning' }
                    : finance.balanceAmount > 0
                    ? { label: money(finance.balanceAmount), tone: 'warning' }
                    : { label: 'Settled', tone: 'success' }
            }
        >
            {/* Totals */}
            <View className="flex-row mb-2.5" style={{ gap: 10 }}>
                <TotalBox
                    label="TOTAL AMOUNT"
                    value={money(finance.totalAmount)}
                    tone={P.textPrimary}
                />
                <TotalBox
                    label="PAID"
                    value={money(finance.paidAmount)}
                    tone={P.success}
                />
            </View>
            <View className="flex-row mb-4" style={{ gap: 10 }}>
                <TotalBox
                    label="BALANCE DUE"
                    value={money(finance.balanceAmount)}
                    tone={finance.balanceAmount > 0 ? P.warning : P.success}
                />
                <TotalBox
                    label="SECURITY DEPOSIT"
                    value={money(finance.securityDeposit)}
                    tone={P.accent}
                />
            </View>

            {/* Settled progress */}
            <DetailCard>
                <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-xs font-bold" style={{ color: P.textSecondary }}>
                        Payment settled
                    </Text>
                    <Text className="text-xs font-extrabold" style={{ color: P.accent }}>
                        {settledPct}%
                    </Text>
                </View>
                <View
                    className="rounded-full overflow-hidden"
                    style={{ height: 6, backgroundColor: P.surfaceAlt }}
                >
                    <View
                        className="h-full rounded-full"
                        style={{
                            width: `${Math.min(100, settledPct)}%`,
                            backgroundColor:
                                settledPct >= 100 ? P.success : P.warning,
                        }}
                    />
                </View>
                {finance.lastEditedAt ? (
                    <View className="flex-row items-center mt-3" style={{ gap: 6 }}>
                        <History size={12} color={P.textMuted} />
                        <Text className="text-[11px]" style={{ color: P.textMuted }}>
                            Last finance update: {finance.lastEditedAt}
                            {finance.lastEditedBy ? ` · ${finance.lastEditedBy}` : ''}
                        </Text>
                    </View>
                ) : null}
            </DetailCard>

            {/* Units */}
            <SectionHeading
                icon={<Gauge size={16} color={P.accent} />}
                title="Units"
                right={
                    finance.units.length > 0 ? (
                        <Text className="text-[11px] font-bold" style={{ color: P.textMuted }}>
                            {finance.units.length} units
                        </Text>
                    ) : undefined
                }
            />

            {unitIssues.length > 0 ? (
                <View
                    className="rounded-2xl p-4 mb-4"
                    style={{
                        backgroundColor: P.warningSoft,
                        borderWidth: 1,
                        borderColor: P.warning,
                    }}
                >
                    <View className="flex-row items-center mb-2" style={{ gap: 8 }}>
                        <TriangleAlert size={16} color={P.warning} />
                        <Text className="text-sm font-bold" style={{ color: P.warning }}>
                            Finalize blocked
                        </Text>
                    </View>
                    {unitIssues.map((issue) => (
                        <Text
                            key={`${issue.kind}-${issue.label}`}
                            className="text-xs leading-5"
                            style={{ color: P.textSecondary }}
                        >
                            • {issue.message}
                        </Text>
                    ))}

                    {onFixUnits ? (
                        <TouchableOpacity
                            activeOpacity={0.85}
                            onPress={onFixUnits}
                            className="mt-3 rounded-xl py-3 items-center"
                            style={{ backgroundColor: P.warning }}
                        >
                            <Text className="text-sm font-bold" style={{ color: '#0B0B0F' }}>
                                Add Current Unit
                            </Text>
                        </TouchableOpacity>
                    ) : null}
                </View>
            ) : null}

            {finance.units.length === 0 ? (
                <DetailCard>
                    <EmptyLine text="No units added in this booking." />
                </DetailCard>
            ) : (
                finance.units.map((unit, index) => (
                    <UnitCard
                        key={`${unit.label}-${index}`}
                        unit={unit}
                        index={index}
                        onPreview={onPreview}
                    />
                ))
            )}

            {/* Charges */}
            <SectionHeading
                icon={<Wallet size={16} color={P.accent} />}
                title="Charges"
            />

            <DetailCard>
                {finance.charges.length === 0 ? (
                    <EmptyLine text="No charge heads recorded." />
                ) : (
                    finance.charges.map((charge, index) => (
                        <View
                            key={`${charge.label}-${index}`}
                            className="mb-3.5"
                        >
                            <View className="flex-row items-center justify-between">
                                <Text
                                    className="text-sm flex-1 pr-2"
                                    style={{ color: P.textSecondary }}
                                    numberOfLines={1}
                                >
                                    {charge.label}
                                </Text>
                                <Text
                                    className="text-sm font-bold"
                                    style={{ color: P.textPrimary }}
                                >
                                    {money(charge.amount)}
                                </Text>
                            </View>

                            <View className="flex-row items-center justify-between mt-1.5">
                                <View className="flex-row items-center" style={{ gap: 5 }}>
                                    {charge.paidPct >= 100 ? (
                                        <CheckCircle2 size={12} color={P.success} />
                                    ) : (
                                        <ArrowDownRight size={12} color={P.warning} />
                                    )}
                                    <Text className="text-[11px]" style={{ color: P.textMuted }}>
                                        Paid {money(charge.paid)} ({charge.paidPct}%)
                                    </Text>
                                </View>

                                <View
                                    className="h-1.5 w-24 rounded-full overflow-hidden"
                                    style={{ backgroundColor: P.surfaceAlt }}
                                >
                                    <View
                                        className="h-full rounded-full"
                                        style={{
                                            width: `${Math.min(100, charge.paidPct)}%`,
                                            backgroundColor:
                                                charge.paidPct >= 100
                                                    ? P.success
                                                    : charge.paidPct > 0
                                                    ? P.warning
                                                    : P.textMuted,
                                        }}
                                    />
                                </View>
                            </View>
                        </View>
                    ))
                )}

                <View className="pt-3" style={{ borderTopWidth: 1, borderTopColor: P.divider }}>
                    <DetailRow label="Charges total" value={money(finance.chargesTotal)} />
                    <DetailRow label="Units total" value={money(finance.unitsTotal)} />
                    <DetailRow
                        icon={<BadgeIndianRupee size={14} color={P.textSecondary} />}
                        label="Total amount"
                        value={money(finance.totalAmount)}
                        bold
                    />
                    <DetailRow
                        label="Balance due"
                        value={money(finance.balanceAmount)}
                        valueColor={finance.balanceAmount > 0 ? P.warning : P.success}
                        bold
                        last
                    />
                </View>
            </DetailCard>

            {/* Security deposit */}
            <SectionHeading
                icon={<ShieldCheck size={16} color={P.accent} />}
                title="Security Deposit"
            />

            <DetailCard>
                {finance.securityDeposit <= 0 ? (
                    <EmptyLine text="No security deposit was taken for this booking." />
                ) : (
                    <>
                        <DetailRow
                            label="Deposit amount"
                            value={money(finance.securityDeposit)}
                            bold
                        />
                        <DetailRow
                            label="Returned"
                            value={finance.depositReturned ? 'Yes' : 'Not yet'}
                            valueColor={finance.depositReturned ? P.success : P.warning}
                        />
                        <DetailRow
                            label="Deducted"
                            value={money(finance.depositDeducted)}
                        />
                        <DetailRow
                            label="Reason"
                            value={finance.depositReason}
                            last={finance.depositReturned === false}
                        />
                    </>
                )}
            </DetailCard>
        </DetailAccordion>
    );
};

export default FinanceSection;
