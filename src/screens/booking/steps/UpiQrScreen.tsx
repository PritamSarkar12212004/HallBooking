import React from 'react';
import { Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { QrCode, CheckCircle2 } from 'lucide-react-native';

import Wrapper from '../../../layouts/wraper/Wraper';
import SubHeader from '../../../components/header/SubHeader';
import { ScrollView, Text, TouchableOpacity, View } from '../../../lib/style/withTailwind';
import MainButton from '../../../components/buttons/MainButton';
import { Theme } from '../../../const/theme/Theme';
import useGetBookingMeta from '../../../api/booking/hooks/useGetBookingMeta';
import { useAppSelector } from '../../../hooks/redux/redux';

const UpiQrScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const amount = route?.params?.amount as number | undefined;
    const user = useAppSelector((state) => state.user.user);
    const { meta } = useGetBookingMeta(user?.token);

    const upi = meta?.upi;

    if (!upi) {
        return (
            <Wrapper safeBottom>
                <SubHeader navigation={navigation} title="UPI Payment" />
                <View className="flex-1 items-center justify-center px-8">
                    <Text className="text-center" style={{ color: Theme.text.secondary }}>
                        UPI details could not be loaded.
                    </Text>
                </View>
            </Wrapper>
        );
    }

    return (
        <Wrapper safeBottom>
            <SubHeader navigation={navigation} title="UPI Payment" />
            <ScrollView
                showsVerticalScrollIndicator={false}
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 20 }}
            >
                <View className="items-center mt-4">
                    <QrCode size={26} color={Theme.button.primary} />
                    <Text className="text-white text-xl font-bold mt-3">
                        Scan &amp; Pay
                    </Text>
                    <Text className="text-[#8F8B91] text-sm mt-1 text-center px-8">
                        Scan this QR using your UPI app (Google Pay, PhonePe, Paytm) to pay.
                    </Text>

                    {amount !== undefined && (
                        <Text className="text-white text-lg font-bold mt-4">
                            ₹{amount.toLocaleString()}
                        </Text>
                    )}
                </View>

                <View
                    className="items-center justify-center mx-8 my-6 p-4 rounded-3xl"
                    style={{ backgroundColor: '#FFFFFF' }}
                >
                    <Image
                        source={{ uri: upi.qrUrl }}
                        style={{ width: 240, height: 240 }}
                        resizeMode="contain"
                    />
                </View>

                <View className="px-8">
                    <View className="flex-row justify-between py-2">
                        <Text className="text-[#8F8B91] text-sm">UPI ID</Text>
                        <Text className="text-white text-sm font-medium">{upi.id}</Text>
                    </View>
                    <View className="flex-row justify-between py-2">
                        <Text className="text-[#8F8B91] text-sm">Payee</Text>
                        <Text className="text-white text-sm font-medium">{upi.name}</Text>
                    </View>
                </View>

                <View className="mt-6 px-2">
                    <MainButton
                        title="I have paid"
                        Icon={CheckCircle2}
                        actionFunc={() => {
                            // Back to Step5 to add payment proof.
                            navigation.goBack();
                        }}
                    />
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => navigation.goBack()}
                        className="items-center py-3"
                    >
                        <Text style={{ color: Theme.text.secondary }}>Back to payment details</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </Wrapper>
    );
};

export default UpiQrScreen;