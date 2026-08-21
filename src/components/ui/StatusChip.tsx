import React from 'react';
import { View, Text } from '../../lib/style/withTailwind';

type BookingStatus = 'Confirmed' | 'Pending' | 'Cancelled';

interface StatusChipProps {
    status: BookingStatus;
}

const statusColors: Record<BookingStatus, { bg: string; text: string }> = {
    Confirmed: { bg: '#DCFCE7', text: '#16A34A' },
    Pending: { bg: '#FEF9C3', text: '#CA8A04' },
    Cancelled: { bg: '#FEE2E2', text: '#DC2626' },
};

const StatusChip = ({ status }: StatusChipProps) => {
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

export default StatusChip;