import React, { useState } from 'react';
import Wrapper from '../../layouts/wraper/Wraper';
import SubHeader from '../../components/header/SubHeader';
import {
    ScrollView,
    Text,
    View,
} from '../../lib/style/withTailwind';
import InputField from '../../components/input/InputField';
import MainButton from '../../components/buttons/MainButton';
import { Theme } from '../../const/theme/Theme';
import { ActivityIndicator } from 'react-native';
import { IndianRupee, WalletCards, Check } from 'lucide-react-native';
import { showMessage } from 'react-native-flash-message';
import { useAppSelector } from '../../hooks/redux/redux';
import useGetBookingById from '../../api/booking/hooks/useGetBookingById';
import useUpdateBookingSection from '../../api/booking/hooks/useUpdateBookingSection';
import { useQueryClient } from '@tanstack/react-query';

const EditFinanceScreen = ({ navigation, route }: any) => {
    const bookingId = route.params?.id;
    const user = useAppSelector((state) => state.user.user);

    const { isLoading, booking } = useGetBookingById({
        id: bookingId,
        token: user?.token,
    });

    const financial = booking?.financial || {};
    const lastPayment =
        booking?.payments && booking.payments.length > 0
            ? booking.payments[booking.payments.length - 1]
            : {};

    const [hallRent, setHallRent] = useState('');
    const [securityDeposit, setSecurityDeposit] = useState('');
    const [totalAmount, setTotalAmount] = useState('');
    const [advancePaid, setAdvancePaid] = useState('');
    const [balanceAmount, setBalanceAmount] = useState('');
    const [saving, setSaving] = useState(false);

    const { updateSection, isLoading: updateLoading } =
        useUpdateBookingSection();
    const queryClient = useQueryClient();

    if (isLoading) {
        return (
            <Wrapper safeBottom>
                <SubHeader navigation={navigation} title="Edit Finance" />
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color={Theme.button.primary} />
                </View>
            </Wrapper>
        );
    }

    if (!booking) {
        return (
            <Wrapper safeBottom>
                <SubHeader navigation={navigation} title="Edit Finance" />
                <View className="flex-1 items-center justify-center px-6">
                    <Text style={{ color: Theme.text.secondary }} className="text-center">
                        Could not load booking. Please go back.
                    </Text>
                </View>
            </Wrapper>
        );
    }

    const refRent = financial?.hallRent ?? 0;
    const refDeposit = financial?.securityDeposit ?? 0;
    const refTotal = financial?.totalAmount ?? 0;
    const refAdvance = financial?.advancePaid ?? 0;
    const refBalance = financial?.balanceAmount ?? 0;
    const refMode = lastPayment?.mode || financial?.mode || 'Cash';

    const num = (v: string, fallback: number) =>
        v === '' ? fallback : Number(v);

    const rentVal = num(hallRent, refRent);
    const depositVal = num(securityDeposit, refDeposit);
    const totalVal = num(totalAmount, refTotal);
    const advanceVal = num(advancePaid, refAdvance);
    const balanceVal = num(balanceAmount, refBalance);

    const hasChanges =
        rentVal !== refRent ||
        depositVal !== refDeposit ||
        totalVal !== refTotal ||
        advanceVal !== refAdvance ||
        balanceVal !== refBalance;

    const isValid =
        !Number.isNaN(rentVal) &&
        !Number.isNaN(depositVal) &&
        !Number.isNaN(totalVal) &&
        !Number.isNaN(advanceVal) &&
        totalVal >= 0;

    const handleSave = () => {
        if (!hasChanges || saving) {
            return;
        }

        if (!isValid) {
            showMessage({
                message: 'Invalid Amount',
                description: 'Please enter valid numeric amounts.',
                type: 'warning',
            });
            return;
        }

        const data: Record<string, unknown> = {
            hallRent: rentVal,
            securityDeposit: depositVal,
            totalAmount: totalVal,
            advancePaid: advanceVal,
            balanceAmount: balanceVal,
            mode: refMode,
        };

        setSaving(true);
        updateSection(
            {
                id: bookingId,
                section: 'payment',
                data: { payment: data },
                token: user?.token ?? '',
            },
            {
                onSuccess: () => {
                    setSaving(false);
                    // Refetch the booking so Booking Detail shows the new values.
                    queryClient.invalidateQueries({
                        queryKey: ['booking', bookingId],
                    });
                    showMessage({
                        message: 'Finance Updated',
                        description: 'Payment details saved successfully.',
                        type: 'success',
                    });
                    navigation.goBack();
                },
                onError: (error: any) => {
                    setSaving(false);
                    showMessage({
                        message: 'Update Failed',
                        description:
                            error?.response?.data?.message ||
                            error?.message ||
                            'Please try again.',
                        type: 'danger',
                    });
                },
            }
        );
    };

    return (
        <Wrapper safeBottom>
            <SubHeader navigation={navigation} title="Edit Finance" />
            <ScrollView
                showsVerticalScrollIndicator={false}
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 24 }}
            >
                <InputField
                    title="Hall Rent"
                    value={hallRent}
                    setvalue={setHallRent}
                    placeholder={String(financial?.hallRent ?? '')}
                    keyType="numeric"
                    Icon={IndianRupee}
                />
                <InputField
                    title="Security Deposit"
                    value={securityDeposit}
                    setvalue={setSecurityDeposit}
                    placeholder={String(financial?.securityDeposit ?? '')}
                    keyType="numeric"
                    Icon={WalletCards}
                />
                <InputField
                    title="Total Amount"
                    value={totalAmount}
                    setvalue={setTotalAmount}
                    placeholder={String(financial?.totalAmount ?? '')}
                    keyType="numeric"
                    Icon={IndianRupee}
                />
                <InputField
                    title="Advance Paid"
                    value={advancePaid}
                    setvalue={setAdvancePaid}
                    placeholder={String(financial?.advancePaid ?? '')}
                    keyType="numeric"
                    Icon={WalletCards}
                />
                <InputField
                    title="Balance Amount"
                    value={balanceAmount}
                    setvalue={setBalanceAmount}
                    placeholder={String(financial?.balanceAmount ?? '')}
                    keyType="numeric"
                    Icon={IndianRupee}
                />

                {!isValid && (
                    <View className="mb-3 px-1">
                        <Text
                            className="text-xs font-semibold"
                            style={{ color: '#EF4444' }}
                        >
                            Please enter valid numeric amounts.
                        </Text>
                    </View>
                )}

                <View className="mt-4">
                    <MainButton
                        title="Save Changes"
                        Icon={Check}
                        loader={saving || updateLoading}
                        disabled={!hasChanges || !isValid}
                        actionFunc={handleSave}
                    />
                </View>
            </ScrollView>
        </Wrapper>
    );
};

export default EditFinanceScreen;