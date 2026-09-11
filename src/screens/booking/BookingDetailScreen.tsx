import React from 'react';
import Wrapper from '../../layouts/wraper/Wraper';
import SubHeader from '../../components/header/SubHeader';
import { Image, ScrollView, Text, TouchableOpacity, View } from '../../lib/style/withTailwind';
import useGetBookingById from '../../api/booking/hooks/useGetBookingById';
import { useAppSelector } from '../../hooks/redux/redux';
import { MainRoute } from '../../const/routes/route';
import {
    Calendar,
    Clock,
    MapPin,
    User,
    Phone,
    Mail,
    Building2,
    Tag,
    Pencil,
    Wallet,
} from 'lucide-react-native';
import { formatDate, formatTime } from '../../functions/formate/DateTimeFormate';
import BookingDetailSkeleton from '../../ui/Skeleton/BookingDetailSkeleton';

const Dark = {
    bg: '#0D0D12',
    surface: '#17171F',
    surfaceAlt: '#1F1F2A',
    border: '#2A2A36',
    textPrimary: '#FFFFFF',
    textSecondary: '#9498A5',
    accent: '#8B5CF6',
};

const BookingDetailScreen = ({ navigation, route }: any) => {
    const user = useAppSelector((state) => state.user.user);
    const { isLoading, isError, booking } = useGetBookingById({
        id: route.params?.id,
        token: user?.token,
    });

    const paymentStatus = booking?.paymentStatus ?? 'Pending';
    const statusColor =
        paymentStatus === 'Paid'
            ? '#22C55E'
            : paymentStatus === 'Partial'
                ? '#F59E0B'
                : '#EF4444';

    if (isError || (!isLoading && !booking)) {
        return (
            <Wrapper safeBottom style={{ backgroundColor: Dark.bg }}>
                <SubHeader navigation={navigation} title="Booking Details" dark />
                <View className="flex-1 items-center justify-center px-6">
                    <Text className="text-center mb-2" style={{ color: Dark.textSecondary }}>
                        Could not load booking details.
                    </Text>
                    <Text style={{ color: Dark.accent }} className="font-semibold">
                        Please go back and try again.
                    </Text>
                </View>
            </Wrapper>
        );
    }
    return (
        <Wrapper safeBottom style={{ backgroundColor: Dark.bg }}>
            <BookingDetailContent
                navigation={navigation}
                route={route}
                booking={booking}
                isLoading={isLoading}
                statusColor={statusColor}
            />
        </Wrapper>
    );
};

const BookingDetailContent = ({
    navigation,
    route,
    booking,
    isLoading,
    statusColor,
}: any) => {
    const bookingId = booking?._id ?? route.params?.id;
    const fin = booking?.financial ?? {};
    const finCharges = Array.isArray(fin.charges) ? fin.charges : [];
    const finTotalAmount =
        Number(fin.totalAmount) ||
        finCharges.reduce((sum: number, c: any) => sum + (Number(c.amount) || 0), 0);
    const finPaidAmount =
        Number(fin.advancePaid) ||
        finCharges.reduce((sum: number, c: any) => sum + (Number(c.paid) || 0), 0);
    const finBalanceAmount =
        Number(fin.balanceAmount) || Math.max(0, finTotalAmount - finPaidAmount);
    const finSecurityDeposit = Number(fin.securityDeposit) || 0;
    return (
        <>
            <SubHeader
                navigation={navigation}
                title="Booking Details"
                comp={
                    !isLoading && (
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() =>
                                navigation.navigate(MainRoute.EditFinance, {
                                    id: bookingId,
                                })
                            }
                            className="w-10 h-10 rounded-xl items-center justify-center"
                            style={{ backgroundColor: Dark.surfaceAlt }}
                        >
                            <Pencil size={18} color="#FFFFFF" />
                        </TouchableOpacity>
                    )
                }
            />
            {isLoading ? (
                <BookingDetailSkeleton />
            ) : (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    className="flex-1"
                    style={{ backgroundColor: Dark.bg }}
                    contentContainerStyle={{ paddingBottom: 110 }}
                >
                    <View className=" pt-3">
                        <View className="relative rounded-3xl overflow-hidden">
                            <Image
                                source={{
                                    uri:
                                        booking?.eventImage ||
                                        'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1469&auto=format&fit=crop',
                                }}
                                className="w-full"
                                style={{ aspectRatio: 3 / 2 }}
                                resizeMode="cover"
                            />

                            {/* Bottom fade so image blends into dark bg */}
                            <View
                                style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    height: 60,
                                    backgroundColor: 'rgba(13,13,18,0.55)',
                                }}
                            />

                            <View className="absolute top-4 left-4 flex-row items-center" style={{ gap: 6 }}>
                                <View
                                    className="px-3 py-1.5 rounded-full flex-row items-center"
                                    style={{ backgroundColor: statusColor }}
                                >
                                    <Text className="text-xs font-bold text-white">
                                        {booking.paymentStatus}
                                    </Text>
                                </View>
                                <View
                                    className="px-3 py-1.5 rounded-full flex-row items-center"
                                    style={{
                                        backgroundColor:
                                            booking.status === 'Cancelled'
                                                ? '#EF4444'
                                                : booking.status === 'Pending' || booking.status === 'Draft'
                                                    ? '#F59E0B'
                                                    : '#22C55E',
                                    }}
                                >
                                    <Text className="text-xs font-bold text-white">
                                        {booking.status === 'Cancelled'
                                            ? 'Cancelled'
                                            : booking.status === 'Confirmed' || booking.status === 'Office-Approved'
                                                ? 'Confirmed'
                                                : booking.status || 'Draft'}
                                    </Text>
                                </View>
                            </View>

                            <View
                                className="absolute bottom-3 left-4 px-3 py-1 rounded-full flex-row items-center"
                                style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                            >
                                <Tag size={11} color="#FFFFFF" />
                                <Text className="text-[11px] font-semibold text-white ml-1.5">
                                    #{booking.bookingNumber}
                                </Text>
                            </View>
                        </View>
                    </View>
                    <View className=" mt-5">
                        <Text
                            className="text-2xl font-bold leading-8 mb-1.5"
                            style={{ color: Dark.textPrimary }}
                        >
                            {booking.event?.name || 'Event Name'}
                        </Text>
                        <View className="flex-row items-center mb-1">
                            <MapPin size={13} color={Dark.textSecondary} />
                            <Text
                                className="text-xs ml-1.5 flex-1"
                                style={{ color: Dark.textSecondary }}
                                numberOfLines={1}
                            >
                                {booking.applicant?.address || 'No address provided'}
                            </Text>
                        </View>
                        <View className="flex-row items-center">
                            <User size={13} color={Dark.textSecondary} />
                            <Text
                                className="text-xs ml-1.5"
                                style={{ color: Dark.textSecondary }}
                            >
                                Booked by {booking.bookedByStaff || booking.createdByName}
                            </Text>
                        </View>
                    </View>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        className="mt-4"
                        contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
                    >
                        <Pill icon={<Tag size={13} color={Dark.accent} />} label={booking.event?.type || '—'} />
                        <Pill
                            icon={<Calendar size={13} color={Dark.accent} />}
                            label={formatDate(booking.schedule?.startDate)}
                        />
                        <Pill
                            icon={<Clock size={13} color={Dark.accent} />}
                            label={`${formatTime(booking.schedule?.startTime)} - ${formatTime(booking.schedule?.endTime)}`}
                        />
                        <Pill
                            icon={<Calendar size={13} color={Dark.accent} />}
                            label={`Ends ${formatDate(booking.schedule?.endDate)}`}
                        />
                    </ScrollView>
                    <View className=" mt-7">
                        <Text
                            className="text-sm font-bold mb-3 tracking-wide"
                            style={{ color: Dark.textPrimary }}
                        >
                            Applicant Details
                        </Text>

                        <View
                            className="rounded-2xl p-4"
                            style={{ backgroundColor: Dark.surface, borderWidth: 1, borderColor: Dark.border }}
                        >
                            <InfoRow icon={<User size={15} color={Dark.textSecondary} />} label="Name" value={booking.applicant?.name} />
                            <InfoRow icon={<Building2 size={15} color={Dark.textSecondary} />} label="Organization" value={booking.applicant?.organization} />
                            <InfoRow icon={<Phone size={15} color={Dark.textSecondary} />} label="Mobile" value={booking.applicant?.mobile} />
                            <InfoRow icon={<Mail size={15} color={Dark.textSecondary} />} label="Email" value={booking.applicant?.email} />
                            <InfoRow icon={<MapPin size={15} color={Dark.textSecondary} />} label="Address" value={booking.applicant?.address} last />
                        </View>
                    </View>
                    <View className="mt-7">
                        <Text
                            className="text-sm font-bold mb-3 tracking-wide"
                            style={{ color: Dark.textPrimary }}
                        >
                            Financial Summary
                        </Text>
                        <View
                            className="rounded-2xl p-4"
                            style={{ backgroundColor: Dark.surface, borderWidth: 1, borderColor: Dark.border }}
                        >
                            {booking.financial?.charges?.map(
                                (c: { label: string; amount?: number; paid?: number }, i: number) => (
                                    <InfoRow
                                        key={`${c.label}-${i}`}
                                        label={c.label}
                                        value={`₹${(Number(c.amount) || 0).toLocaleString()}`}
                                    />
                                ),
                            )}
                            {booking.financial?.units?.map(
                                (u: { label: string; quantity?: number; perUnit?: number; amount?: number; paid?: boolean }, i: number) => (
                                    <InfoRow
                                        key={`unit-${u.label}-${i}`}
                                        label={`${u.label} (Unit)${u.paid ? ' • Paid' : ''}`}
                                        value={`₹${(Number(u.amount) || 0).toLocaleString()}`}
                                    />
                                ),
                            )}
                            <InfoRow label="Total Amount" value={`₹${finTotalAmount.toLocaleString()}`} bold />
                            <InfoRow label="Total Paid" value={`₹${finPaidAmount.toLocaleString()}`} />
                            <InfoRow
                                label="Security Deposit (Refundable)"
                                value={`₹${finSecurityDeposit.toLocaleString()}`}
                            />
                            <InfoRow
                                label="Last Finance Update"
                                value={
                                    booking.financeHistory?.length
                                        ? `${formatDate(
                                              String(
                                                  booking.financeHistory[
                                                      booking.financeHistory.length - 1
                                                  ]?.editedAt,
                                              ),
                                          )} • ${
                                              booking.financeHistory[
                                                  booking.financeHistory.length - 1
                                              ]?.editedByName || '—'
                                          }`
                                        : booking.updatedAt
                                            ? formatDate(String(booking.updatedAt))
                                            : '—'
                                }
                            />
                            <InfoRow
                                label="Balance"
                                value={`₹${finBalanceAmount.toLocaleString()}`}
                                valueColor="#F59E0B"
                                last
                            />
                        </View>
                    </View>
                </ScrollView>
            )}
            {!isLoading && (
                <View
                    className="absolute  bottom-0 left-0 right-0 flex-row items-center justify-between px-5 py-4"
                    style={{
                        backgroundColor: Dark.bg,
                        borderTopWidth: 1,
                        borderTopColor: Dark.border,
                    }}
                >
                    <View>
                        <Text className="text-xs mb-0.5" style={{ color: Dark.textSecondary }}>
                            Balance Due
                        </Text>
                        <Text className="text-xl font-extrabold" style={{ color: '#F59E0B' }}>
                            ₹{finBalanceAmount.toLocaleString()}
                        </Text>
                    </View>

                    <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() =>
                            navigation.navigate(MainRoute.PaymentTrackRecord, {
                                id: booking?._id ?? route.params?.id,
                            })
                        }
                        className="flex-row items-center px-5 py-3.5 rounded-2xl"
                        style={{ backgroundColor: Dark.accent }}
                    >
                        <Wallet size={16} color="#FFFFFF" />
                        <Text className="text-sm font-bold text-white ml-2">
                            View Payments
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </>
    );
};
export default BookingDetailScreen;
const Pill = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
    <View
        className="flex-row items-center px-3.5 py-2 rounded-full"
        style={{ backgroundColor: Dark.surfaceAlt, borderWidth: 1, borderColor: Dark.border }}
    >
        {icon}
        <Text className="text-xs font-medium ml-1.5" style={{ color: Dark.textPrimary }}>
            {label}
        </Text>
    </View>
);

const InfoRow = ({
    icon,
    label,
    value,
    bold = false,
    valueColor,
    last = false,
}: {
    icon?: React.ReactNode;
    label: string;
    value?: string | number;
    bold?: boolean;
    valueColor?: string;
    last?: boolean;
}) => (
    <View className={`flex-row items-center justify-between ${last ? '' : 'mb-3.5'}`}>
        <View className="flex-row items-center flex-1">
            {icon && <View className="mr-2.5">{icon}</View>}
            <Text className="text-sm" style={{ color: Dark.textSecondary }}>
                {label}
            </Text>
        </View>
        <Text
            className={`text-sm ${bold ? 'font-bold' : 'font-medium'}`}
            style={{ color: valueColor || Dark.textPrimary, maxWidth: '55%' }}
            numberOfLines={2}
        >
            {value || '—'}
        </Text>
    </View>
);