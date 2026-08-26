import React from 'react';
import Wrapper from '../../layouts/wraper/Wraper';
import SubHeader from '../../components/header/SubHeader';
import { Image, ScrollView, Text, TouchableOpacity, View } from '../../lib/style/withTailwind';
import useGetBookingById from '../../api/booking/hooks/useGetBookingById';
import { useAppSelector } from '../../hooks/redux/redux';
import { Theme } from '../../const/theme/Theme';
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
    Edit,
} from 'lucide-react-native';
import { formatDate, formatTime } from '../../functions/formate/DateTimeFormate';
import BookingDetailSkeleton from '../../ui/Skeleton/BookingDetailSkeleton';

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
            <Wrapper safeBottom>
                <SubHeader navigation={navigation} title="Booking Details" />
                <View className="flex-1 items-center justify-center px-6">
                    <Text className="text-center mb-2" style={{ color: Theme.text.secondary }}>
                        Could not load booking details.
                    </Text>
                    <Text style={{ color: Theme.button.primary }} className="font-semibold">
                        Please go back and try again.
                    </Text>
                </View>
            </Wrapper>
        );
    }
    return (
        <Wrapper safeBottom>
            <SubHeader navigation={navigation} title="Booking Details" comp={

                !isLoading && <TouchableOpacity
                    className=" flex items-center"
                    activeOpacity={0.8}
                    onPress={() =>
                        navigation.navigate(MainRoute.EditFinance, {
                            id: booking?._id ?? route.params?.id,
                        })
                    }
                    style={{ backgroundColor: Theme.background.secondary }}
                >
                    <Edit size={20} color={Theme.button.primary} />
                </TouchableOpacity>
            }
            />
            {
                isLoading ? <BookingDetailSkeleton /> : <ScrollView
                    showsVerticalScrollIndicator={false}
                    className="flex-1"
                >
                    <View className="">
                        <View className="relative rounded-3xl overflow-hidden">
                            <Image
                                source={{
                                    uri: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1469&auto=format&fit=crop',
                                }}
                                className="w-full"
                                style={{ aspectRatio: 2 / 1 }}
                                resizeMode="cover"
                            />

                            <View
                                className="absolute top-4 left-4 px-3 py-1.5 rounded-full flex-row items-center"
                                style={{ backgroundColor: statusColor }}
                            >
                                <Text className="text-xs font-bold text-white">
                                    {booking.paymentStatus}
                                </Text>
                            </View>
                        </View>
                    </View>
                    <View className=" mt-5">
                        <Text
                            className="text-2xl font-bold leading-8 mb-2"
                            style={{ color: Theme.text.primary }}
                        >
                            {booking.event?.name || 'Event Name'}
                        </Text>

                        <Text className="text-sm mb-1" style={{ color: Theme.text.secondary }}>
                            {booking.event?.type} • Booking #{booking.bookingNumber}
                        </Text>

                        <Text className="text-sm" style={{ color: Theme.text.secondary }}>
                            Booked by {booking.bookedByStaff || booking.createdByName}
                        </Text>
                    </View>

                    {/* ========== INFO CARDS ========== */}
                    <View className=" mt-6 gap-3">
                        {/* Event Type */}
                        <View
                            className="flex-row items-center p-4 rounded-2xl"
                            style={{ backgroundColor: Theme.background.secondary }}
                        >
                            <View
                                className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                                style={{ backgroundColor: Theme.background.third }}
                            >
                                <Tag size={18} color={Theme.button.primary} />
                            </View>
                            <View>
                                <Text className="text-xs mb-0.5" style={{ color: Theme.text.secondary }}>
                                    Event Type
                                </Text>
                                <Text className="text-base font-semibold" style={{ color: Theme.text.primary }}>
                                    {booking.event?.type || '—'}
                                </Text>
                            </View>
                        </View>

                        {/* Date & Time */}
                        <View
                            className="flex-row items-center p-4 rounded-2xl"
                            style={{ backgroundColor: Theme.background.secondary }}
                        >
                            <View
                                className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                                style={{ backgroundColor: Theme.background.third }}
                            >
                                <Calendar size={18} color={Theme.button.primary} />
                            </View>
                            <View className="flex-1">
                                <Text className="text-xs mb-0.5" style={{ color: Theme.text.secondary }}>
                                    Date & Time
                                </Text>
                                <Text className="text-base font-semibold" style={{ color: Theme.text.primary }}>
                                    {formatDate(booking.schedule?.startDate)}
                                </Text>
                                <Text className="text-sm mt-0.5" style={{ color: Theme.text.secondary }}>
                                    {formatTime(booking.schedule?.startTime)} - {formatTime(booking.schedule?.endTime)}
                                </Text>
                            </View>
                        </View>

                        {/* Schedule End */}
                        <View
                            className="flex-row items-center p-4 rounded-2xl"
                            style={{ backgroundColor: Theme.background.secondary }}
                        >
                            <View
                                className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                                style={{ backgroundColor: Theme.background.third }}
                            >
                                <Clock size={18} color={Theme.button.primary} />
                            </View>
                            <View>
                                <Text className="text-xs mb-0.5" style={{ color: Theme.text.secondary }}>
                                    End Date
                                </Text>
                                <Text className="text-base font-semibold" style={{ color: Theme.text.primary }}>
                                    {formatDate(booking.schedule?.endDate)}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* ========== APPLICANT ========== */}
                    <View className=" mt-8">
                        <Text
                            className="text-sm font-semibold mb-3"
                            style={{ color: Theme.text.secondary }}
                        >
                            APPLICANT DETAILS
                        </Text>

                        <View
                            className="rounded-2xl p-4"
                            style={{ backgroundColor: Theme.background.secondary }}
                        >
                            <InfoRow icon={<User size={16} color={Theme.text.secondary} />} label="Name" value={booking.applicant?.name} />
                            <InfoRow icon={<Building2 size={16} color={Theme.text.secondary} />} label="Organization" value={booking.applicant?.organization} />
                            <InfoRow icon={<Phone size={16} color={Theme.text.secondary} />} label="Mobile" value={booking.applicant?.mobile} />
                            <InfoRow icon={<Mail size={16} color={Theme.text.secondary} />} label="Email" value={booking.applicant?.email} />
                            <InfoRow icon={<MapPin size={16} color={Theme.text.secondary} />} label="Address" value={booking.applicant?.address} last />
                        </View>
                    </View>

                    {/* ========== FINANCIAL ========== */}
                    <View className=" mt-8">
                        <Text
                            className="text-sm font-semibold mb-3"
                            style={{ color: Theme.text.secondary }}
                        >
                            FINANCIAL SUMMARY
                        </Text>

                        <View
                            className="rounded-2xl p-4"
                            style={{ backgroundColor: Theme.background.secondary }}
                        >
                            <InfoRow label="Hall Rent" value={`₹${booking.financial?.hallRent?.toLocaleString()}`} />
                            <InfoRow label="Security Deposit" value={`₹${booking.financial?.securityDeposit?.toLocaleString()}`} />
                            <InfoRow label="Total Amount" value={`₹${booking.financial?.totalAmount?.toLocaleString()}`} bold />
                            <InfoRow label="Advance Paid" value={`₹${booking.financial?.advancePaid?.toLocaleString()}`} />
                            <InfoRow
                                label="Balance"
                                value={`₹${booking.financial?.balanceAmount?.toLocaleString()}`}
                                valueColor="#F59E0B"
                                last
                            />
                        </View>
                    </View>

                    {/* ========== TEAM ========== */}
                    {booking.allocatedTeam?.length > 0 && (
                        <View className=" mt-8">
                            <Text
                                className="text-sm font-semibold mb-3"
                                style={{ color: Theme.text.secondary }}
                            >
                                ALLOCATED TEAM
                            </Text>

                            <View
                                className="rounded-2xl p-4"
                                style={{ backgroundColor: Theme.background.secondary }}
                            >
                                {booking.allocatedTeam.map((member: string, index: number) => (
                                    <View
                                        key={index}
                                        className={`flex-row items-center ${index !== booking.allocatedTeam.length - 1 ? 'mb-3' : ''}`}
                                    >
                                        <View
                                            className="w-9 h-9 rounded-full items-center justify-center mr-3"
                                            style={{ backgroundColor: Theme.background.third }}
                                        >
                                            <Text style={{ color: Theme.text.primary, fontWeight: '600' }}>
                                                {member.charAt(0)}
                                            </Text>
                                        </View>
                                        <Text style={{ color: Theme.text.primary }}>{member}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}
                </ScrollView>
            }
        </Wrapper>
    );
};

export default BookingDetailScreen;

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
            <Text className="text-sm" style={{ color: Theme.text.secondary }}>
                {label}
            </Text>
        </View>
        <Text
            className={`text-sm ${bold ? 'font-bold' : 'font-medium'}`}
            style={{ color: valueColor || Theme.text.primary, maxWidth: '55%' }}
            numberOfLines={2}
        >
            {value || '—'}
        </Text>
    </View>
);