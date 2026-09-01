import React, { useEffect, useRef } from 'react';
import LottieView from 'lottie-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

import Wrapper from '../../../layouts/wraper/Wraper';
import { Text, View } from '../../../lib/style/withTailwind';
import { Theme } from '../../../const/theme/Theme';
import animationConst from '../../../const/animation/animationConst';
import { MainRoute, TabRoute } from '../../../const/routes/route';

const SUCCESS_DURATION_MS = 2200;

const BookingSuccessScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const animationRef = useRef<LottieView>(null);

    useEffect(() => {
        animationRef.current?.play();
        const timer = setTimeout(() => {
            navigation.reset({
                index: 0,
                routes: [
                    {
                        name: MainRoute.MainTabs,
                        params: { screen: TabRoute.Bookings },
                    },
                ],
            });
        }, SUCCESS_DURATION_MS);

        return () => clearTimeout(timer);
    }, [navigation]);

    return (
        <Wrapper safeBottom>
            <View className="flex-1 items-center justify-center px-6">
                <View
                    className="w-64 h-64 items-center justify-center"
                    style={{ backgroundColor: 'transparent' }}
                >
                    <LottieView
                        ref={animationRef}
                        source={animationConst.success}
                        loop={false}
                        autoPlay
                        style={{ width: '100%', height: '100%' }}
                    />
                </View>

                <Text
                    className="text-2xl font-bold mt-4 text-center"
                    style={{ color: Theme.text.primary }}
                >
                    Booking Confirmed!
                </Text>

                <Text
                    className="text-sm mt-2 text-center"
                    style={{ color: Theme.text.secondary }}
                >
                    {route?.params?.bookingNumber
                        ? `Booking #${route.params.bookingNumber} has been created successfully.`
                        : 'The booking has been created successfully.'}
                </Text>
            </View>
        </Wrapper>
    );
};

export default BookingSuccessScreen;
