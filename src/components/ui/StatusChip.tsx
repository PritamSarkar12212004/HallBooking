import React from 'react';
import { View, Text } from '../../lib/style/withTailwind';
import DashboardPalette from '../../const/theme/dashboardPalette';

type BookingStatus = 'Confirmed' | 'Pending' | 'Cancelled';

interface StatusChipProps {
    status: BookingStatus;
    /** Optional context icon shown before the status (e.g. calendar-check for booking status) */
    Icon?: React.ComponentType<{ size?: number; color?: string }>;
}

const statusColors: Record<BookingStatus, { bg: string; text: string }> = {
    Confirmed: { bg: DashboardPalette.greenSoft, text: DashboardPalette.green },
    Pending: { bg: DashboardPalette.blueSoft, text: DashboardPalette.blue },
    Cancelled: { bg: DashboardPalette.redSoft, text: DashboardPalette.red },
};

const StatusChip = ({ status, Icon }: StatusChipProps) => {
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

export default StatusChip;