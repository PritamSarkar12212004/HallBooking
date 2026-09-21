import React from 'react';
import {
    Building2,
    CalendarClock,
    Gauge,
    Tag,
    User,
    Wallet,
} from 'lucide-react-native';

import { Image, Text, TouchableOpacity, View } from '../../../lib/style/withTailwind';
import { BookingDetailPalette as P } from '../../../const/theme/bookingDetailPalette';
import type { BookingOverview } from '../../../functions/booking/BookingDetailFunction';
import { money } from '../../../functions/booking/BookingDetailFunction';
import { DetailBadge } from './DetailPrimitives';

interface Props {
    overview: BookingOverview;
    unitsCount: number;
    hasUnitIssues: boolean;
    balanceAmount: number;
    onPreview: (uri?: string | null) => void;
}

const FALLBACK_IMAGE =
    'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1469&auto=format&fit=crop';

/**
 * Booking ki pehchaan — hamesha khuli rehti hai (collapsible nahi).
 *
 * Event photo, event name, hall ka naam aur status ek nazar me dikhte hain;
 * baaki detail ab band sections me hai jo tap karne par khulte hain.
 */
const BookingHero = ({
    overview,
    unitsCount,
    hasUnitIssues,
    balanceAmount,
    onPreview,
}: Props) => (
    <View>
        <View className="rounded-3xl overflow-hidden">
            <Image
                source={{ uri: overview.eventImage || FALLBACK_IMAGE }}
                className="w-full"
                style={{ aspectRatio: 3 / 2 }}
                resizeMode="cover"
            />

            <View
                className="absolute top-3 left-3 flex-row items-center"
                style={{ gap: 6 }}
            >
                <DetailBadge label={overview.status.label} tone={overview.status.tone} />
                <DetailBadge
                    label={overview.paymentStatus.label}
                    tone={overview.paymentStatus.tone}
                    solid={false}
                />
            </View>

            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => onPreview(overview.eventImage || FALLBACK_IMAGE)}
                className="absolute bottom-3 left-3 flex-row items-center px-3 py-1.5 rounded-full"
                style={{ backgroundColor: 'rgba(0,0,0,0.55)', gap: 6 }}
            >
                <Tag size={11} color="#FFFFFF" />
                <Text className="text-[11px] font-bold text-white">
                    #{overview.bookingNumber}
                </Text>
            </TouchableOpacity>

            <View
                className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full"
                style={{
                    backgroundColor: P.accentSoft,
                    borderWidth: 1,
                    borderColor: P.accent,
                }}
            >
                <Text className="text-[11px] font-bold" style={{ color: P.accent }}>
                    {overview.eventType}
                </Text>
            </View>
        </View>

        <Text
            className="text-2xl font-extrabold leading-8 mt-4"
            style={{ color: P.textPrimary }}
            numberOfLines={2}
        >
            {overview.eventName}
        </Text>

        <View className="flex-row items-center mt-2 mb-1.5" style={{ gap: 6 }}>
            <Building2 size={14} color={P.accent} />
            <Text className="text-sm font-bold" style={{ color: P.accent }}>
                {overview.hallName}
            </Text>
            {overview.hallCapacity > 0 ? (
                <Text className="text-xs" style={{ color: P.textMuted }}>
                    · capacity {overview.hallCapacity}
                </Text>
            ) : null}
        </View>

        {/* Date + time ek line me — schedule kholne ki zarurat nahi. */}
        <View className="flex-row items-center mt-1.5" style={{ gap: 6 }}>
            <CalendarClock size={13} color={P.accent} />
            <Text
                className="text-xs font-semibold flex-1"
                style={{ color: P.textSecondary }}
                numberOfLines={1}
            >
                {overview.schedule.dateLine} · {overview.schedule.timeLine}
            </Text>
        </View>

        <View className="flex-row items-center mt-1.5" style={{ gap: 6 }}>
            <User size={13} color={P.textSecondary} />
            <Text className="text-xs" style={{ color: P.textSecondary }}>
                Booked by {overview.bookedBy}
                {overview.createdAt ? ` · ${overview.createdAt}` : ''}
            </Text>
        </View>

        {/* Ek nazar me: balance + units ki halat */}
        <View className="flex-row mt-3.5" style={{ gap: 10 }}>
            <View
                className="flex-1 rounded-xl px-3 py-2.5 flex-row items-center"
                style={{
                    backgroundColor: P.surface,
                    borderWidth: 1,
                    borderColor: balanceAmount > 0 ? P.warning : P.border,
                    gap: 8,
                }}
            >
                <Wallet
                    size={14}
                    color={balanceAmount > 0 ? P.warning : P.success}
                />
                <Text className="text-xs" style={{ color: P.textSecondary }}>
                    Balance
                </Text>
                <Text
                    className="text-sm font-extrabold flex-1 text-right"
                    style={{ color: balanceAmount > 0 ? P.warning : P.success }}
                >
                    {money(balanceAmount)}
                </Text>
            </View>
        </View>

        <View
            className="flex-row items-center mt-2.5 rounded-xl px-3 py-2.5"
            style={{
                backgroundColor: P.surface,
                borderWidth: 1,
                borderColor: hasUnitIssues ? P.warning : P.border,
                gap: 8,
            }}
        >
            <Gauge size={14} color={hasUnitIssues ? P.warning : P.textSecondary} />
            <Text className="text-xs flex-1" style={{ color: P.textSecondary }}>
                {unitsCount === 0
                    ? 'No units added'
                    : hasUnitIssues
                    ? `${unitsCount} units · reading/rate pending`
                    : `${unitsCount} units · all set`}
            </Text>
        </View>
    </View>
);

export default BookingHero;
