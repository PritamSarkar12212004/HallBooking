import React, { useState } from 'react';
import { ActivityIndicator, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { QrCode, CheckCircle2 } from 'lucide-react-native';

import Wrapper from '../../../layouts/wraper/Wraper';
import SubHeader from '../../../components/header/SubHeader';
import { ScrollView, Text, TouchableOpacity, View } from '../../../lib/style/withTailwind';
import MainButton from '../../../components/buttons/MainButton';
import FullScreenImage from '../../../components/ui/FullScreenImage';
import { Theme } from '../../../const/theme/Theme';
import useHallQr from '../../../hooks/qr/useHallQr';

const UpiQrScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const amount = route?.params?.amount as number | undefined;
    // QR backend se aata hai — jab tak CEO upload nahi karta `qrUrl` null hai.
    const { qrUrl, bankHolderName, isLoading } = useHallQr();
    // QR par tap karne par full screen preview khulta hai.
    const [qrPreview, setQrPreview] = useState<string | null>(null);

    if (isLoading && !qrUrl) {
        return (
            <Wrapper safeBottom>
                <SubHeader navigation={navigation} title="UPI Payment" />
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator color={Theme.button.primary} />
                </View>
            </Wrapper>
        );
    }

    if (!qrUrl) {
        return (
            <Wrapper safeBottom>
                <SubHeader navigation={navigation} title="UPI Payment" />
                <View className="flex-1 items-center justify-center px-8">
                    <QrCode size={30} color={Theme.text.tertiary} />
                    <Text className="text-white text-base font-semibold mt-3 text-center">
                        Payment QR not available
                    </Text>
                    <Text className="text-center mt-2" style={{ color: Theme.text.secondary }}>
                        The hall payment QR has not been uploaded yet. Please contact the hall office.
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
                    {/* Tap QR → full screen preview */}
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => setQrPreview(qrUrl)}
                    >
                        <Image
                            source={{ uri: qrUrl }}
                            style={{ width: 240, height: 240 }}
                            resizeMode="contain"
                        />
                    </TouchableOpacity>
                </View>

                <Text
                    className="text-[10px] text-center px-8"
                    style={{ color: Theme.text.tertiary }}
                >
                    Tap the QR to view it full screen
                </Text>

                <View className="px-8">
                    <View className="flex-row justify-between py-2">
                        <Text className="text-[#8F8B91] text-sm">Bank Holder</Text>
                        <Text className="text-white text-sm font-medium">{bankHolderName}</Text>
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

            <FullScreenImage
                uri={qrPreview}
                visible={!!qrPreview}
                onClose={() => setQrPreview(null)}
                caption={bankHolderName}
            />
        </Wrapper>
    );
};

export default UpiQrScreen;