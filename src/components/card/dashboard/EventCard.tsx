import React from 'react';
import { View, Text, TouchableOpacity } from '../../../lib/style/withTailwind';
import { Building2, ChevronRight, Clock3, Users } from 'lucide-react-native';
import DashboardPalette from '../../../const/theme/dashboardPalette';
import { DashboardEventItem } from '../../../interface/api/dashboardInterface';
import { formatDate, formatTime } from '../../../functions/formate/DateTimeFormate';
import StatusChip from '../../ui/StatusChip';
import PaymentStatusChip from '../../ui/PaymentStatusChip';

interface EventCardProps {
    event: DashboardEventItem;
    showDate?: boolean;
    onPress: () => void;
}

/**
 * Tappable event row for Today's / Upcoming lists.
 * Memoized: re-renders only when the event ref, showDate or onPress changes.
 */
const EventCard = React.memo(({ event, showDate = false, onPress }: EventCardProps) => (
    <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        className="rounded-2xl p-4 mb-3"
        style={{ backgroundColor: DashboardPalette.card, borderWidth: 1, borderColor: DashboardPalette.border }}
    >
        <View className="flex-row items-center gap-3">
            <View className="w-11 h-11 rounded-2xl items-center justify-center" style={{ backgroundColor: DashboardPalette.goldSoft }}>
                <Building2 size={20} color={DashboardPalette.goldDeep} />
            </View>
            <View className="flex-1">
                <Text className="text-[15px] font-extrabold" style={{ color: DashboardPalette.ink }} numberOfLines={1}>
                    {event.hallName}
                </Text>
                <Text className="text-xs font-medium mt-0.5" style={{ color: DashboardPalette.inkSoft }} numberOfLines={1}>
                    {event.eventName}
                </Text>
            </View>
            <ChevronRight size={17} color={DashboardPalette.inkMuted} />
        </View>

        <View className="flex-row items-center mt-3 pl-1">
            <Clock3 size={13} color={DashboardPalette.inkMuted} />
            <Text className="text-xs font-semibold ml-1.5" style={{ color: DashboardPalette.inkSoft }}>
                {showDate && event.date ? `${formatDate(event.date)}  ·  ` : ''}
                {formatTime(event.startTime)} – {formatTime(event.endTime)}
            </Text>
        </View>

        <View className="flex-row items-center justify-between mt-3.5 pt-3.5" style={{ borderTopWidth: 1, borderTopColor: DashboardPalette.border }}>
            <View className="flex-row items-center flex-1 mr-2">
                <Users size={13} color={DashboardPalette.inkMuted} />
                <Text className="text-xs font-semibold ml-1.5" style={{ color: DashboardPalette.inkSoft }} numberOfLines={1}>
                    {event.applicantName}
                </Text>
            </View>
            <View className="flex-row items-center gap-1.5">
                <StatusChip status={event.status as any} />
                <PaymentStatusChip status={event.paymentStatus as any} />
            </View>
        </View>
    </TouchableOpacity>
));

EventCard.displayName = 'EventCard';

export default EventCard;