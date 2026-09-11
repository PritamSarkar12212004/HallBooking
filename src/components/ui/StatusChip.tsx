import React from 'react';
import { View, Text } from '../../lib/style/withTailwind';
import DashboardPalette from '../../const/theme/dashboardPalette';

// Mirrors the backend Booking.status enum.
type BookingStatus = 'Draft' | 'Pending' | 'Office-Approved' | 'Confirmed' | 'Cancelled';

interface StatusChipProps {
    status: BookingStatus;
    /** Optional context icon shown before the status (e.g. calendar-check for booking status) */
    Icon?: React.ComponentType<{ size?: number; color?: string }>;
}

const statusColors: Record<BookingStatus, { bg: string; text: string }> = {
    Confirmed: { bg: DashboardPalette.greenSoft, text: DashboardPalette.green },
    'Office-Approved': { bg: DashboardPalette.greenSoft, text: DashboardPalette.green },
    Pending: { bg: DashboardPalette.blueSoft, text: DashboardPalette.blue },
    Draft: { bg: DashboardPalette.goldSoft, text: DashboardPalette.goldDeep },
    Cancelled: { bg: DashboardPalette.redSoft, text: DashboardPalette.red },
};

const StatusChip = ({ status, Icon }: StatusChipProps) => {
    const colors = statusColors[status] ?? statusColors.Pending;
    // Office-Approved ka matlab bhi confirmed hi hai — user ko same dikhe.
    const display = status === 'Office-Approved' ? 'Confirmed' : status;

    return (
        <View
            className="px-3 py-1 rounded-full self-start flex-row items-center gap-1"
            style={{ backgroundColor: colors.bg }}
        >
            {Icon && <Icon size={11} color={colors.text} />}
            <Text className="text-xs font-bold uppercase" style={{ color: colors.text }} numberOfLines={1}>
                {display}
            </Text>
        </View>
    );
};

export default StatusChip;