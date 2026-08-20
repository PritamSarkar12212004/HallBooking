import React, { useState, useRef, useEffect } from 'react'
import Wrapper from '../../layouts/wraper/Wraper';
import { Text, TextInput, View, TouchableOpacity } from '../../lib/style/withTailwind';
import AuthNavigation from '../../components/navigation/AuthNavigation';
import { Theme } from '../../const/theme/Theme';

const OTP_LENGTH = 6;
const RESEND_TIMER = 30;

const OtpScreen = ({ route, navigation }: any) => {
    const phoneNumber = route?.params?.phonenumber || '';

    const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
    const [focusedIndex, setFocusedIndex] = useState<number | null>(0);
    const [timer, setTimer] = useState(RESEND_TIMER);
    const inputRefs = useRef<any[]>([]);

    const isValid = otp.every((digit) => digit !== '');

    useEffect(() => {
        if (timer <= 0) return;
        const interval = setInterval(() => setTimer((t) => t - 1), 1000);
        return () => clearInterval(interval);
    }, [timer]);

    const handleChange = (value: string, index: number) => {
        // handle paste of full code
        if (value.length > 1) {
            const pasted = value.slice(0, OTP_LENGTH).split('');
            const newOtp = [...otp];
            pasted.forEach((char, i) => {
                if (index + i < OTP_LENGTH) newOtp[index + i] = char;
            });
            setOtp(newOtp);
            const nextIndex = Math.min(index + pasted.length, OTP_LENGTH - 1);
            inputRefs.current[nextIndex]?.focus();
            return;
        }

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleResend = () => {
        if (timer > 0) return;
        setTimer(RESEND_TIMER);
    };

    return (
        <Wrapper paddingTop={20} paddingBottom={20}>
            <View className="flex-1 bg-black gap-4">
                <AuthNavigation need={true} navigation={navigation} />

                <View className="flex-1">
                    <View className="w-full mb-2">
                        <Text className="text-white text-2xl font-bold leading-tight">
                            Verify Your Number
                        </Text>
                        <Text className="text-white/60 text-base mt-3 leading-relaxed">
                            Enter the 6-digit code sent to{'\n'}
                            <Text className="text-white font-semibold">+91 {phoneNumber}</Text>
                        </Text>
                    </View>

                    <View className="w-full mt-8">
                        <View className="w-full flex-row justify-between">
                            {otp.map((digit, index) => (
                                <TextInput
                                    key={index}
                                    ref={(ref: any) => (inputRefs.current[index] = ref)}
                                    className="text-white text-xl font-bold text-center rounded-xl"
                                    style={{
                                        backgroundColor: Theme.background.secondary,
                                        borderWidth: 1.5,
                                        borderColor: focusedIndex === index
                                            ? '#ffffff'
                                            : digit
                                                ? 'rgba(255,255,255,0.3)'
                                                : 'transparent',
                                        width: 48,
                                        height: 56,
                                    }}
                                    keyboardType="number-pad"
                                    maxLength={OTP_LENGTH}
                                    value={digit}
                                    onChangeText={(value) => handleChange(value, index)}
                                    onKeyPress={(e) => handleKeyPress(e, index)}
                                    onFocus={() => setFocusedIndex(index)}
                                    onBlur={() => setFocusedIndex(null)}
                                    selectTextOnFocus
                                />
                            ))}
                        </View>

                        <View className="w-full flex-row items-center justify-center mt-6 gap-1">
                            <Text className="text-white/50 text-sm">
                                Didn't receive the code?
                            </Text>
                            <TouchableOpacity onPress={handleResend} disabled={timer > 0}>
                                <Text
                                    className="text-sm font-bold"
                                    style={{ color: timer > 0 ? 'rgba(255,255,255,0.3)' : '#ffffff' }}
                                >
                                    {timer > 0 ? `Resend in ${timer}s` : 'Resend Code'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View className="px-5 pb-6">
                    <TouchableOpacity
                        disabled={!isValid}
                        activeOpacity={0.9}
                        className="w-full items-center justify-center rounded-xl"
                        style={{
                            backgroundColor: isValid ? Theme.button.primary : Theme.background.secondary,
                            height: 54,
                        }}
                    >
                        <Text
                            className="text-base font-bold"
                            style={{ color: isValid ? "black" : 'white' }}
                        >
                            Verify & Continue
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Wrapper>
    )
}

export default OtpScreen