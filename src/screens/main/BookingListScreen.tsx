import React, { useMemo, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from '../../lib/style/withTailwind';
import { ActivityIndicator } from 'react-native';
import {
    Building2,
    CalendarDays,
    ChevronRight,
    Clock,
    Hash,
    Plus,
    UserRound,
    Users,
} from 'lucide-react-native';

import Wrapper from '../../layouts/wraper/Wraper';
import MainDerder from '../../components/header/MainDerder';
import MainSearchInput from '../../components/input/MainSearchInput';
import StatusChip from '../../components/ui/StatusChip';
import PaymentStatusChip from '../../components/ui/PaymentStatusChip';
import { Theme } from '../../const/theme/Theme';
import { MainRoute } from '../../const/routes/route';
import { useAppSelector } from '../../hooks/redux/redux';
import useListBookings from '../../api/booking/hooks/useListBookings';

const safeStr = (v: any): string => {
    if (v === null || v === undefined) return '';
    if (typeof v === 'string') return v;
    if (typeof v === 'number' || typeof v === 'boolean') return String(v);
    if (Array.isArray(v)) return v.join(', ');
    if (typeof v === 'object') {
        if (v.name) return v.name;
        if (v.label) return v.label;
        if (v.value) return v.value;
        return '';
    }
    return String(v);
};

const BookingListScreen = ({ navigation }: any) => {
    const user = useAppSelector((state) => state.user.user);
    const [search, setSearch] = useState('');

    const { bookings, isLoading, isError, refetch } =
        useListBookings(user?.token);

    const filtered = useMemo(() => {
        if (!bookings || !Array.isArray(bookings)) {
            return [];
        }
        const term = search.trim().toLowerCase();
        if (!term) {
            return bookings;
        }
        return bookings.filter((b: any) =>
            (b.bookingNumber || '').toLowerCase().includes(term) ||
            (b.event?.name || b.eventName || '').toLowerCase().includes(term) ||
            (b.applicant?.name || b.applicantName || '').toLowerCase().includes(term) ||
            (b.bookedByStaff || '').toLowerCase().includes(term)
        );
    }, [bookings, search]);

    return (
        <Wrapper safeBottom>
            <MainDerder
                navigation={navigation}
                title="Bookings"
                right={
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() =>
                            navigation.navigate(MainRoute.HallCalendar)
                        }
                        style={{
                            backgroundColor: Theme.button.primary,
                            width: 36,
                            height: 36,
                            borderRadius: 18,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Plus size={20} color="#000" />
                    </TouchableOpacity>
                }
            />
            <MainSearchInput
                placeholder="Search by name or booking ID..."
                value={search}
                setvalue={setSearch}
            />

            {isLoading ? (
                <View className="flex-1 items-center justify-center py-20">
                    <ActivityIndicator size="large" color={Theme.button.primary} />
                </View>
            ) : isError ? (
                <View className="flex-1 items-center justify-center py-20 px-6">
                    <Text className="text-[#B8B5BA] text-center mb-3">
                        Could not load bookings.
                    </Text>
                    <TouchableOpacity onPress={() => refetch()}>
                        <Text style={{ color: Theme.button.primary }} className="font-semibold">
                            Tap to retry
                        </Text>
                    </TouchableOpacity>
                </View>
            ) : filtered.length === 0 ? (
                <View className="flex-1 items-center justify-center py-20">
                    <Text className="text-[#8F8B91]">
                        No bookings found
                    </Text>
                </View>
            ) : (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    className="flex-1 px-4"
                    contentContainerStyle={{ paddingBottom: 20 }}
                >
                    {filtered.map((b: any) => {
                        const applicantName = safeStr(
                            b.applicant?.name || b.applicantName || ''
                        );

                        const eventTitle = safeStr(
                            b.event?.name || b.eventName || b.bookingNumber
                        );

                        const bookingType = safeStr(
                            b.bookingType || '1 Day'
                        );

                        const dateStr = safeStr(b.startDate || b.date || '');
                        const endDateStr = safeStr(b.endDate || '');
                        const timeStr = safeStr(b.startTime || b.time || '');
                        const endTimeStr = safeStr(b.endTime || '');

                        const staffName = safeStr(
                            b.bookedByStaff || b.staffName || ''
                        );
                        const team =
                            Array.isArray(b.allocatedTeam) &&
                                b.allocatedTeam.length > 0
                                ? b.allocatedTeam.join(', ')
                                : '';

                        const dateLabel =
                            endDateStr && endDateStr !== dateStr
                                ? `${dateStr} → ${endDateStr}`
                                : dateStr || '—';

                        const timeLabel =
                            endTimeStr && endTimeStr !== timeStr
                                ? `${timeStr} → ${endTimeStr}`
                                : timeStr || '—';

                        return (
                            <TouchableOpacity
                                key={b._id || b.id}
                                activeOpacity={0.85}
                                onPress={() =>
                                    navigation.navigate(
                                        MainRoute.BookingDetail,
                                        { bookingId: b._id || b.id },
                                    )
                                }
                                className="rounded-2xl overflow-hidden mb-4"
                                style={{
                                    backgroundColor: Theme.background.secondary,
                                    borderWidth: 1,
                                    borderColor: '#2A2A30',
                                }}
                            >
                                <View style={{ height: 4, backgroundColor: Theme.button.primary }} />

                                <View className="p-4 pb-3">
                                    <View className="flex-row items-start justify-between mb-2">
                                        <View className="flex-1 mr-3">
                                            <Text className="text-white font-bold text-base leading-snug">
                                                {eventTitle || 'Booking'}
                                            </Text>
                                            <View className="flex-row items-center gap-1.5 mt-1">
                                                <Hash size={13} color="#8F8B91" />
                                                <Text className="text-[#8F8B91] text-xs font-medium">
                                                    #{b.bookingNumber || '—'}
                                                </Text>
                                            </View>
                                        </View>
                                        <StatusChip
                                            status={(b.status || 'Pending') as any}
                                        />
                                    </View>

                                    <View className="flex-row items-center justify-between">
                                        <View className="flex-row items-center gap-1.5 flex-1 mr-2">
                                            <UserRound
                                                size={14}
                                                color={Theme.button.primary}
                                            />
                                            <Text
                                                className="text-[#B8B5BA] text-xs"
                                                numberOfLines={1}
                                            >
                                                {applicantName || '—'}
                                            </Text>
                                        </View>
                                        <PaymentStatusChip
                                            status={(b.paymentStatus || 'Pending') as any}
                                        />
                                    </View>
                                </View>

                                <View style={{ height: 1, backgroundColor: '#2A2A30' }} />

                                <View className="px-4 py-3">
                                    <View className="flex-row items-center mb-2.5">
                                        <CalendarDays size={16} color="#8F8B91" />
                                        <Text className="text-[#B8B5BA] text-xs font-medium ml-2">
                                            {dateLabel}
                                        </Text>
                                    </View>

                                    <View className="flex-row items-center mb-2.5">
                                        <Clock size={16} color="#8F8B91" />
                                        <Text className="text-[#B8B5BA] text-xs font-medium ml-2">
                                            {timeLabel}
                                        </Text>
                                    </View>

                                    <View className="flex-row items-center mb-2.5">
                                        <Building2 size={16} color="#8F8B91" />
                                        <Text
                                            className="text-[#B8B5BA] text-xs font-medium ml-2"
                                            numberOfLines={1}
                                        >
                                            {b.hallName || b.hall?.name || 'Hall'}
                                        </Text>
                                    </View>

                                    <View className="flex-row items-center">
                                        <Users size={16} color="#8F8B91" />
                                        <Text className="text-[#B8B5BA] text-xs font-medium ml-2">
                                            {staffName || '—'}
                                        </Text>
                                    </View>
                                </View>

                                <View
                                    className="flex-row items-center justify-between px-4 py-2.5"
                                    style={{ backgroundColor: '#202024' }}
                                >
                                    <Text className="text-[#8F8B91] text-[11px] font-semibold uppercase tracking-wide">
                                        {bookingType} · {team || 'No team'}
                                    </Text>
                                    <View className="flex-row items-center">
                                        <Text
                                            style={{ color: Theme.button.primary }}
                                            className="text-xs font-semibold mr-1"
                                        >
                                            View Details
                                        </Text>
                                        <ChevronRight size={15} color={Theme.button.primary} />
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            )}
        </Wrapper>
    );
};

export default BookingListScreen;