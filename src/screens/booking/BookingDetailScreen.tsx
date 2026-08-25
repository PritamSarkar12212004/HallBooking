import React from 'react';
import {
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from '../../lib/style/withTailwind';
import { ActivityIndicator } from 'react-native';
import Wrapper from '../../layouts/wraper/Wraper';
import { Theme } from '../../const/theme/Theme';
import {
    Building2,
    CalendarDays,
    Clock,
    Hash,
    IndianRupee,
    Mail,
    MapPin,
    Phone,
    UserRound,
    Users,
    WalletCards,
} from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAppSelector } from '../../hooks/redux/redux';
import useGetBookingById from '../../api/booking/hooks/useGetBookingById';
import PaymentStatusChip from '../../components/ui/PaymentStatusChip';
import SubHeader from '../../components/header/SubHeader';

const toStringValue = (v: any): string => {
    if (v === null || v === undefined || v === '') return '';
    if (typeof v === 'string') return v;
    if (typeof v === 'number' || typeof v === 'boolean') return String(v);
    if (Array.isArray(v)) return v.join(', ') || '';
    if (typeof v === 'object') {
        if (v.type) return v.type;
        if (v.label) return v.label;
        return '';
    }
    return String(v);
};

const Row = ({ icon: Icon, label, value }: any) => (
    <View className="flex-row items-center py-2.5">
        <View className="w-8 items-center justify-center">
            <Icon size={16} color="#8F8B91" />
        </View>
        <Text className="text-[#8F8B91] text-sm w-32 shrink-0">
            {label}
        </Text>
        <Text className="text-white text-sm flex-1 font-medium" numberOfLines={3}>
            {toStringValue(value) || '—'}
        </Text>
    </View>
);

const Section = ({ title, children }: any) => (
    <View
        className="rounded-2xl mb-5 p-4"
        style={{ backgroundColor: Theme.background.secondary }}
    >
        <Text className="text-white text-base font-bold mb-2">
            {title}
        </Text>
        {children}
    </View>
);

const BookingDetailScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<any>();
    const bookingId = route?.params?.bookingId ?? route?.params?.id;
    const user = useAppSelector((state) => state.user.user);

    const { booking, isLoading, isError } = useGetBookingById({
        id: bookingId,
        token: user?.token ?? '',
    });

    if (isLoading) {
        return (
            <Wrapper safeBottom>
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator
                        size="large"
                        color={Theme.button.primary}
                    />
                </View>
            </Wrapper>
        );
    }

    if (isError || !booking) {
        return (
            <Wrapper safeBottom>
                <View className="flex-1 items-center justify-center px-6">
                    <Text className="text-[#B8B5BA] text-center mb-2">
                        Could not load booking details.
                    </Text>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text style={{ color: Theme.button.primary }} className="font-semibold">
                            Go Back
                        </Text>
                    </TouchableOpacity>
                </View>
            </Wrapper>
        );
    }

    const b: any = booking;
    const eventName = b.eventName || b.event?.name || 'Booking';
    const applicant = b.applicant || {};
    const event = b.event || {};
    const arrangements = b.arrangements || {};
    const decorator = arrangements.decorator || {};
    const caterer = arrangements.caterer || {};
    const payment = b.payment || {};
    const declaration = b.declaration || {};

    const dateLabel =
        b.endDate && b.endDate !== b.startDate
            ? `${b.startDate} → ${b.endDate}`
            : b.startDate;

    const timeLabel =
        b.endTime && b.endTime !== b.startTime
            ? `${b.startTime} → ${b.endTime}`
            : b.startTime;

    const team = Array.isArray(b.allocatedTeam)
        ? b.allocatedTeam.join(', ')
        : '';

    return (
        <Wrapper safeBottom>
            <SubHeader title="Booking Detail" navigation={navigation} />
            <ScrollView
                showsVerticalScrollIndicator={false}
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 24 }}
            >
                <Section title="Overview">
                    <Row icon={Hash} label="Booking ID" value={b.bookingNumber} />
                    <Row icon={Building2} label="Event / Hall" value={eventName} />
                    <Row icon={CalendarDays} label="Date" value={dateLabel} />
                    <Row icon={Clock} label="Time" value={timeLabel} />
                    <Row icon={Users} label="Type" value={b.bookingType} />
                    <Row icon={Users} label="Booked By" value={b.bookedByStaff} />
                    <Row icon={Users} label="Team" value={team} />
                </Section>

                {/* Applicant */}
                <Section title="Applicant">
                    <Row icon={UserRound} label="Name" value={applicant.name || b.applicantName} />
                    <Row icon={Building2} label="Org" value={applicant.organization} />
                    <Row icon={Phone} label="Mobile" value={applicant.mobile || applicant.mobileNumber} />
                    <Row icon={Mail} label="Email" value={applicant.email} />
                    <Row icon={MapPin} label="Address" value={applicant.address} />
                    <Row icon={WalletCards} label="ID Proof" value={applicant.governmentIdType || applicant.governmentId} />
                </Section>

                {/* Event */}
                <Section title="Event Details">
                    <Row icon={Users} label="Attendance" value={event.expectedAttendance} />
                    <Row icon={Building2} label="Type" value={event.type} />
                    <Row
                        icon={Users}
                        label="Req."
                        value={
                            Array.isArray(event.requirements)
                                ? event.requirements.join(', ')
                                : ''
                        }
                    />
                </Section>

                {/* Arrangements */}
                <Section title="Arrangements">
                    <Row icon={UserRound} label="Decorator" value={decorator.name} />
                    <Row icon={Phone} label="Dec. Contact" value={decorator.contact} />
                    <Row icon={Clock} label="Dec. Timing" value={decorator.timing} />
                    <Row icon={UserRound} label="Caterer" value={caterer.name} />
                    <Row icon={Phone} label="Cat. Contact" value={caterer.contact} />
                    <Row icon={Building2} label="Kitchen" value={arrangements.kitchenRequired} />
                </Section>

                {/* Payment */}
                <Section title="Payment">
                    <View className="flex-row items-center justify-between mb-1">
                        <PaymentStatusChip status={(b.paymentStatus || 'Pending') as any} />
                        <Text style={{ color: Theme.button.primary }} className="font-bold text-lg">
                            ₹ {toStringValue(payment.totalAmount ?? b.totalAmount) || '0'}
                        </Text>
                    </View>
                    <Row icon={IndianRupee} label="Hall Rent" value={payment.hallRent} />
                    <Row icon={WalletCards} label="Deposit" value={payment.securityDeposit} />
                    <Row icon={IndianRupee} label="Total" value={payment.totalAmount} />
                    <Row icon={WalletCards} label="Advance" value={payment.advancePaid} />
                    <Row icon={IndianRupee} label="Balance" value={payment.balanceAmount} />
                    <Row icon={WalletCards} label="Mode" value={payment.mode} />
                    <Row icon={Hash} label="Txn. No." value={payment.transactionNumber} />
                </Section>

                {/* Declaration */}
                {(declaration.applicantSignature || declaration.managerSignature) && (
                    <Section title="Declaration">
                        <Row
                            icon={UserRound}
                            label="Status"
                            value="Signatures captured"
                        />
                    </Section>
                )}
            </ScrollView>
        </Wrapper>
    );
};

export default BookingDetailScreen;