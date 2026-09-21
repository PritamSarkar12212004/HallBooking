import React from 'react';
import { CheckCircle2, ShieldCheck, TriangleAlert } from 'lucide-react-native';

import { Text, View } from '../../../lib/style/withTailwind';
import type { PaymentRecordAnalytics } from '../../../functions/booking/PaymentRecordFunction';
import { money } from '../../../functions/booking/PaymentRecordFunction';
import {
    RecordCard,
    RecordColors,
    RecordPill,
    RecordSectionTitle,
} from './RecordPrimitives';

interface Props {
    analytics: PaymentRecordAnalytics;
}

/**
 * Section 2 — Security Deposit.
 *
 * Refundable hold hai (total/balance me count nahi hota), isliye alag card:
 * kitna liya, wapas hua ya nahi, kitna deduct hua aur kyun.
 */
const SecurityDepositCard = ({ analytics }: Props) => {
    const {
        securityDeposit,
        depositReturned,
        depositDeducted,
        depositReason,
    } = analytics;

    return (
        <>
            <RecordSectionTitle
                icon={<ShieldCheck size={16} color={RecordColors.accent} />}
                title="SECURITY DEPOSIT"
            />

            <RecordCard>
                {securityDeposit <= 0 ? (
                    <Text className="text-xs" style={{ color: RecordColors.textMuted }}>
                        No security deposit taken for this booking.
                    </Text>
                ) : (
                    <>
                        <View className="flex-row items-center justify-between">
                            <Text
                                className="text-xs"
                                style={{ color: RecordColors.textSecondary }}
                            >
                                Deposit amount
                            </Text>
                            <Text
                                className="text-lg font-extrabold"
                                style={{ color: RecordColors.info }}
                            >
                                {money(securityDeposit)}
                            </Text>
                        </View>

                        <View className="flex-row items-center justify-between mt-3">
                            <Text
                                className="text-xs"
                                style={{ color: RecordColors.textSecondary }}
                            >
                                Status
                            </Text>
                            {depositReturned ? (
                                <RecordPill
                                    label="Returned"
                                    color={RecordColors.success}
                                    soft
                                    icon={
                                        <CheckCircle2
                                            size={10}
                                            color={RecordColors.success}
                                        />
                                    }
                                />
                            ) : (
                                <RecordPill
                                    label="Held (refundable)"
                                    color={RecordColors.warning}
                                    soft
                                    icon={
                                        <TriangleAlert
                                            size={10}
                                            color={RecordColors.warning}
                                        />
                                    }
                                />
                            )}
                        </View>

                        {depositDeducted > 0 ? (
                            <View className="flex-row items-center justify-between mt-3">
                                <Text
                                    className="text-xs"
                                    style={{ color: RecordColors.textSecondary }}
                                >
                                    Deducted
                                </Text>
                                <Text
                                    className="text-sm font-bold"
                                    style={{ color: RecordColors.danger }}
                                >
                                    {money(depositDeducted)}
                                </Text>
                            </View>
                        ) : null}

                        {depositReason ? (
                            <View
                                className="pt-3 mt-3"
                                style={{
                                    borderTopWidth: 1,
                                    borderTopColor: RecordColors.divider,
                                }}
                            >
                                <Text
                                    className="text-[10px] font-bold mb-1"
                                    style={{ color: RecordColors.textMuted }}
                                >
                                    REASON
                                </Text>
                                <Text
                                    className="text-xs leading-5"
                                    style={{ color: RecordColors.textSecondary }}
                                >
                                    {depositReason}
                                </Text>
                            </View>
                        ) : null}

                        <Text
                            className="text-[10px] mt-3"
                            style={{ color: RecordColors.textMuted }}
                        >
                            Refundable — not included in the total amount or balance.
                        </Text>
                    </>
                )}
            </RecordCard>
        </>
    );
};

export default SecurityDepositCard;
