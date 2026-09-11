import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from '../../../lib/style/withTailwind';
import { CalendarX, CalendarCheck2, BadgeCheck } from 'lucide-react-native';
import DashboardPalette from '../../../const/theme/dashboardPalette';
import { useAppSelector } from '../../../hooks/redux/redux';
import useListBookings from '../../../api/booking/hooks/useListBookings';
import { bookingListInterface } from '../../../interface/api/bookintInterface';

// Normalize any backend date string into YYYY-MM-DD
const toDateKey = (value: any): string => {
    if (!value) return '';
    const d = new Date(value);
    if (isNaN(d.getTime())) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

const todayKey = toDateKey(new Date());

interface BookingStatusStripProps {
    onPress: () => void;
}

/**
 * ENDED / TODAY / CONFIRMED summary strip — same date-based status logic as
 * the calendar agenda chips, shown as three cards on the Home & CEO dashboards.
 * Reads the shared bookings cache (same query as the Calendar feature), so no
 * duplicate network call when the calendar is already loaded.
 */
const BookingStatusStrip = ({ onPress }: BookingStatusStripProps) => {
    const user = useAppSelector((state) => state.user.user);
    const { bookings } = useListBookings(user?.token);

    const counts = useMemo(() => {
        let ended = 0;
        let today = 0;
        let confirmed = 0;

        (bookings ?? []).forEach((b: bookingListInterface) => {
            const startKey = toDateKey(b.startDate);
            const endKeyRaw = toDateKey(b.endDate || b.startDate);
            const endKey = !endKeyRaw || endKeyRaw < startKey ? startKey : endKeyRaw;
            if (!startKey) return;

            if (endKey < todayKey) ended += 1;
            else if (startKey <= todayKey && todayKey <= endKey) today += 1;
            else confirmed += 1;
        });

        return { ended, today, confirmed };
    }, [bookings]);

    const cards = [
        { title: 'Ended', value: counts.ended, icon: CalendarX, color: DashboardPalette.red, soft: DashboardPalette.redSoft },
        { title: 'Today', value: counts.today, icon: CalendarCheck2, color: DashboardPalette.blue, soft: DashboardPalette.blueSoft },
        { title: 'Confirmed', value: counts.confirmed, icon: BadgeCheck, color: DashboardPalette.green, soft: DashboardPalette.greenSoft },
    ];

    return (
        <View className="flex-row justify-between">
            {cards.map((card) => (
                <TouchableOpacity
                    key={card.title}
                    activeOpacity={0.85}
                    onPress={onPress}
                    className="w-[32%] rounded-2xl p-3.5"
                    style={{ backgroundColor: DashboardPalette.card, borderWidth: 1, borderColor: DashboardPalette.border }}
                >
                    <View className="w-9 h-9 rounded-xl items-center justify-center" style={{ backgroundColor: card.soft }}>
                        <card.icon size={18} color={card.color} />
                    </View>
                    <Text className="text-[20px] font-extrabold mt-2.5" style={{ color: card.color }}>
                        {card.value}
                    </Text>
                    <Text className="text-[10px] font-bold uppercase tracking-wide mt-0.5" style={{ color: DashboardPalette.inkSoft }}>
                        {card.title}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
};

export default BookingStatusStrip;
