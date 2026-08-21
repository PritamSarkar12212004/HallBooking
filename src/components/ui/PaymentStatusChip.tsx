import React from 'react';
import { View, Text } from '../../lib/style/withTailwind';

type PaymentStatus = 'Paid' | 'Partial' | 'Pending';

interface PaymentStatusChipProps {
    status: PaymentStatus;
}

const statusColors: Record<PaymentStatus, { bg: string; text: string }> = {
    Paid: { bg: '#DCFCE7', text: '#16A34A' },
    Partial: { bg: '#FEF9C3', text: '#CA8A04' },
    Pending: { bg: '#FEE2E2', text: '#DC2626' },
};

const PaymentStatusChip = ({ status }: PaymentStatusChipProps) => {
    const colors = statusColors[status] ?? statusColors.Pending;

    return (
        <View
            className="px-3 py-1 rounded-full self-start"
            style={{ backgroundColor: colors.bg }}
        >
            <Text className="text-xs font-bold uppercase" style={{ color: colors.text }}>
                {status}
            </Text>
        </View>
    );
};

export default PaymentStatusChip;