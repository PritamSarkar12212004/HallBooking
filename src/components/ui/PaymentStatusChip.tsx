import React from 'react';
import { View, Text } from '../../lib/style/withTailwind';
import DashboardPalette from '../../const/theme/dashboardPalette';

type PaymentStatus = 'Paid' | 'Partial' | 'Pending';

interface PaymentStatusChipProps {
    status: PaymentStatus;
    /** Optional context icon shown before the status (e.g. wallet for payment status) */
    Icon?: React.ComponentType<{ size?: number; color?: string }>;
}

const statusColors: Record<PaymentStatus, { bg: string; text: string }> = {
    Paid: { bg: DashboardPalette.greenSoft, text: DashboardPalette.green },
    Partial: { bg: DashboardPalette.goldSoft, text: DashboardPalette.goldDeep },
    Pending: { bg: DashboardPalette.redSoft, text: DashboardPalette.red },
};

const PaymentStatusChip = ({ status, Icon }: PaymentStatusChipProps) => {
    const colors = statusColors[status] ?? statusColors.Pending;

    return (
        <View
            className="px-3 py-1 rounded-full self-start flex-row items-center gap-1"
            style={{ backgroundColor: colors.bg }}
        >
            {Icon && <Icon size={11} color={colors.text} />}
            <Text className="text-xs font-bold uppercase" style={{ color: colors.text }} numberOfLines={1}>
                {status}
            </Text>
        </View>
    );
};

export default PaymentStatusChip;