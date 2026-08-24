import React, { useEffect, useRef, useState } from 'react';

import Wrapper from '../../layouts/wraper/Wraper';
import {
    Text,
    TouchableOpacity,
    View,
} from '../../lib/style/withTailwind';

import AuthNavigation from '../../components/navigation/AuthNavigation';
import { AuthTopFrame, OtpInput } from '../../components/auth/frame/AuthFrame';
import AuthButton from '../../components/auth/buttons/AuthButton';
import { route as appRoute } from '../../const/routes/route';
const OTP_LENGTH = 6;
const RESEND_TIMER = 30;

const OtpScreen = ({ route, navigation }: any) => {
    const phoneNumber = route?.params?.phonenumber || '';

    const [otp, setOtp] = useState<string[]>(
        Array(OTP_LENGTH).fill('')
    );
    const [focusedIndex, setFocusedIndex] = useState<number | null>(0);
    const [timer, setTimer] = useState(RESEND_TIMER);
    const inputRefs = useRef<any[]>([]);
    const isValid = otp.every((digit) => digit !== '');

    useEffect(() => {
        if (timer <= 0) return;

        const interval = setInterval(() => {
            setTimer((t) => t - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [timer]);

    const handleChange = (value: string, index: number) => {

        if (value.length > 1) {
            const pasted = value
                .slice(0, OTP_LENGTH)
                .split('');

            const newOtp = [...otp];

            pasted.forEach((char, i) => {
                if (index + i < OTP_LENGTH) {
                    newOtp[index + i] = char;
                }
            });

            setOtp(newOtp);

            const nextIndex = Math.min(
                index + pasted.length,
                OTP_LENGTH - 1
            );

            inputRefs.current[nextIndex]?.focus();

            return;
        }

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (
            value &&
            index < OTP_LENGTH - 1
        ) {
            inputRefs.current[index + 1]?.focus();
        }
    };


    const handleResend = () => {
        if (timer > 0) return;
        setTimer(RESEND_TIMER);
        console.log('Resend OTP');
    };
    const handleVerify = () => {
        if (!isValid) return;

        const code = otp.join('');

        console.log('OTP:', code);

        navigation.navigate(appRoute.home);
    };
    return (
        <Wrapper paddingHorizontal={0} paddingTop={0} >

            <View className="flex-1 px-4 gap-4">
                <AuthNavigation
                    need={true}
                    navigation={navigation}
                />
                <View className="flex-1">
                    <AuthTopFrame
                        title="Verify Your Number"
                        dis={`Enter the 6-digit code sent to +91 ${phoneNumber}`}
                    />
                    <View className="w-full mt-8">
                        <View className="w-full flex-row justify-between">
                            {otp.map((digit, index) => (
                                <OtpInput
                                    key={index}
                                    value={digit}
                                    isFocused={
                                        focusedIndex === index
                                    }
                                    onChangeText={(value) =>
                                        handleChange(
                                            value,
                                            index
                                        )
                                    }
                                    onFocus={() =>
                                        setFocusedIndex(index)
                                    }
                                    onBlur={() =>
                                        setFocusedIndex(null)
                                    }
                                />
                            ))}
                        </View>
                        <View className="w-full flex-row items-center justify-center mt-6 gap-1">
                            <Text className="text-white/50 text-sm">
                                Didn't receive the code?
                            </Text>
                            <TouchableOpacity
                                onPress={handleResend}
                                disabled={timer > 0}
                            >
                                <Text
                                    className="text-sm font-bold"
                                    style={{
                                        color:
                                            timer > 0
                                                ? 'rgba(255,255,255,0.3)'
                                                : '#ffffff',
                                    }}
                                >
                                    {timer > 0
                                        ? `Resend in ${timer}s`
                                        : 'Resend Code'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                <View className="px-5 pb-6">
                    <AuthButton handleContinue={handleVerify} title={"Verify"} isValid={isValid} loading={false} />
                </View>
            </View>
        </Wrapper>
    );
};

export default OtpScreen;