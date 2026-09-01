import React from 'react';
import { Image, Text, TouchableOpacity, View } from '../../../lib/style/withTailwind';
import { Theme } from '../../../const/theme/Theme';
import { bookingListInterface } from '../../../interface/api/bookintInterface';
import {
    Calendar,
    Clock,
    User,
    ChevronRight,
    Building2,
    CheckCircle2,
    Wallet2,
} from 'lucide-react-native';
import { formatDate, formatTime } from '../../../functions/formate/DateTimeFormate';
import { StyleSheet } from 'react-native';

interface Props {
    item: bookingListInterface;
    actionPress: any
}

const BookingListCard = React.memo(({ item, actionPress }: Props) => {
    const isPending = (item.balanceAmount || 0) > 0;
    const statusColor = isPending ? '#F59E0B' : '#22C55E';
    const statusLabel =
        item.paymentStatus === 'Paid'
            ? 'Paid'
            : isPending
                ? 'Balance Due'
                : 'Draft';

    // Progress = portion of the total already received/cleared.
    const total = item.totalAmount || 0;
    const received = Math.max(0, total - (item.balanceAmount || 0));
    const pct = total > 0 ? Math.min(100, Math.round((received / total) * 100)) : 0;

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => actionPress(item.id)}
            className="rounded-2xl overflow-hidden mb-3"
            style={{
                backgroundColor: Theme.background.secondary,
                borderWidth: 1,
                borderColor: Theme.background.third,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.12,
                shadowRadius: 8,
                elevation: 3,
            }}
        >
            {/* Cover image */}
            <View>
                <Image
                    source={{ uri: item.eventImage }}
                    className="w-full"
                    style={{ aspectRatio: 2 / 1, backgroundColor: Theme.background.third }}
                    resizeMode="cover"
                />
                {/* Dark scrim for legibility over any image */}
                <View
                    style={{
                        ...StyleSheet.absoluteFill,
                        backgroundColor: 'rgba(10,10,14,0.35)',
                    }}
                />

                {/* Status badge */}
                <View
                    className="absolute top-2.5 right-2.5 flex-row items-center px-2 py-1 rounded-full"
                    style={{
                        backgroundColor: 'rgba(0,0,0,0.55)',
                        borderWidth: 1,
                        borderColor: statusColor,
                    }}
                >
                    {isPending ? (
                        <Wallet2 size={11} color={statusColor} />
                    ) : (
                        <CheckCircle2 size={11} color={statusColor} />
                    )}
                    <Text className="text-[10px] font-bold ml-1" style={{ color: statusColor }}>
                        {statusLabel}
                    </Text>
                </View>

                {/* Date pill */}
                <View
                    className="absolute bottom-2.5 left-2.5 flex-row items-center px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
                >
                    <Calendar size={11} color="#FFFFFF" />
                    <Text className="text-[11px] font-semibold text-white ml-1.5">
                        {formatDate(item.startDate)}
                    </Text>
                </View>
            </View>

            {/* Body */}
            <View className="p-3.5">
                {/* Event name + type/hall */}
                <View className="flex-row items-start justify-between mb-2">
                    <View className="flex-1 mr-2">
                        <Text
                            className="text-base font-bold"
                            style={{ color: Theme.text.primary }}
                            numberOfLines={1}
                        >
                            {item.eventName}
                        </Text>
                        <View className="flex-row items-center mt-1">
                            <Building2 size={12} color={Theme.button.primary} />
                            <Text
                                className="text-xs ml-1"
                                style={{ color: Theme.text.secondary }}
                                numberOfLines={1}
                            >
                                {item.eventType} • {item.hallName}
                            </Text>
                        </View>
                    </View>
                    <ChevronRight size={18} color={Theme.text.tertiary} />
                </View>

                {/* Time */}
                <View className="flex-row items-center mb-2.5">
                    <Clock size={12} color={Theme.text.secondary} />
                    <Text className="text-xs ml-1.5" style={{ color: Theme.text.secondary }}>
                        {formatTime(item.startTime)}
                        {item.endTime ? ` – ${formatTime(item.endTime)}` : ''}
                    </Text>
                </View>

                {/* Progress */}
                <View className="mb-3">
                    <View
                        className="h-1.5 rounded-full overflow-hidden"
                        style={{ backgroundColor: Theme.background.third }}
                    >
                        <View
                            style={{
                                width: `${pct}%`,
                                height: '100%',
                                backgroundColor: statusColor,
                                borderRadius: 999,
                            }}
                        />
                    </View>
                </View>

                {/* Amounts */}
                <View className="flex-row" style={{ gap: 8 }}>
                    <View
                        className="flex-1 rounded-lg px-2.5 py-2"
                        style={{ backgroundColor: Theme.background.third }}
                    >
                        <Text
                            className="text-[10px] font-semibold mb-0.5"
                            style={{ color: Theme.text.secondary }}
                        >
                            Total Amount
                        </Text>
                        <Text className="text-sm font-extrabold" style={{ color: Theme.text.primary }}>
                            ₹{(total || 0).toLocaleString()}
                        </Text>
                    </View>

                    <View
                        className="flex-1 rounded-lg px-2.5 py-2"
                        style={{ backgroundColor: `${statusColor}15` }}
                    >
                        <Text
                            className="text-[10px] font-semibold mb-0.5"
                            style={{ color: statusColor }}
                        >
                            {isPending ? 'Balance Due' : 'Received'}
                        </Text>
                        <Text className="text-sm font-extrabold" style={{ color: statusColor }}>
                            ₹{(isPending ? (item.balanceAmount || 0) : (item.totalAmount || 0)).toLocaleString()}
                        </Text>
                    </View>
                </View>

                {/* Footer: booked by + advance */}
                <View
                    className="flex-row items-center justify-between mt-3 pt-3"
                    style={{ borderTopWidth: 1, borderTopColor: Theme.background.third }}
                >
                    <View className="flex-row items-center flex-1">
                        <View
                            className="items-center justify-center rounded-full mr-2"
                            style={{ width: 20, height: 20, backgroundColor: Theme.button.primary }}
                        >
                            <User size={11} color={Theme.background.primary} />
                        </View>
                        <View className="flex-1">
                            <Text
                                className="text-[9px] font-semibold"
                                style={{ color: Theme.text.tertiary }}
                            >
                                APPLICANT
                            </Text>
                            <Text
                                className="text-xs font-semibold"
                                style={{ color: Theme.text.primary }}
                                numberOfLines={1}
                            >
                                {item.applicantName}
                            </Text>
                        </View>
                    </View>
                    <View className="items-end">
                        <Text className="text-[9px] font-semibold" style={{ color: Theme.text.tertiary }}>
                            ADVANCE
                        </Text>
                        <Text className="text-xs font-bold" style={{ color: Theme.text.secondary }}>
                            ₹{(item.advancePaid || 0).toLocaleString()}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
});

export default BookingListCard;
