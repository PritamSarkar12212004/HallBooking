import React, { useCallback, useState } from 'react';
import Wrapper from '../../layouts/wraper/Wraper';
import {
    TextInput,
    View,
} from '../../lib/style/withTailwind';
import AuthNavigation from '../../components/navigation/AuthNavigation';
import { route } from '../../const/routes/route';
import AuthButton from '../../components/auth/buttons/AuthButton';
import {
    AuthTopFrame,
    MainFrame,
} from '../../components/auth/frame/AuthFrame';
import useAuthApi from '../../api/auth/hooks/useAuthApi';
import { showMessage } from 'react-native-flash-message';

const validatePhoneNumber = (phone: string): boolean => {
    return /^[6-9][0-9]{9}$/.test(phone);
};

const AuthScreen = ({ navigation }: any) => {

    const [phone, setPhone] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const {
        sendOtpAsync,
        isLoading,
    } = useAuthApi();

    const isValid = validatePhoneNumber(phone);
    const handleChange = useCallback((value: string) => {
        const numericValue = value.replace(/[^0-9]/g, '');
        setPhone(numericValue);
    }, []);

    const handleContinue = useCallback(async () => {
        if (!validatePhoneNumber(phone)) {
            showMessage({
                message: 'Invalid phone number',
                description: 'Please enter a valid 10 digit mobile number.',
                type: 'warning',
            });
            return;
        }
        try {
            const response = await sendOtpAsync({
                phone,
            });
            if (response?.success) {
                showMessage({
                    message: 'OTP Sent',
                    description: response.message || 'OTP sent successfully.',
                    type: 'success',
                });
                navigation.navigate(route.otp, {
                    phonenumber: phone,
                });

            } else {
                showMessage({
                    message: 'Unable to send OTP',
                    description: response?.message || 'Please try again.',
                    type: 'danger',
                });
            }

        } catch (error: any) {

            console.log('OTP API Error:', error);

            const message =
                error?.response?.data?.message ||
                error?.message ||
                'Something went wrong. Please try again.';

            showMessage({
                message: 'OTP Failed',
                description: message,
                type: 'danger',
            });

        }

    }, [
        phone,
        navigation,
        sendOtpAsync,
    ]);
    return (
        <Wrapper
            paddingHorizontal={0}
            paddingTop={0}
        >

            <View className="flex-1 px-4 gap-4">
                <AuthNavigation
                    need={false}
                    navigation={navigation}
                />
                <View className="flex-1">
                    <AuthTopFrame
                        title="Continue With Phone Number"
                        dis="Sign in or sign up using your phone number"
                    />
                    <MainFrame
                        title="Phone Number"
                        dis="We'll send you a one-time verification code"
                        isFocused={isFocused}
                        input={
                            <TextInput
                                className="flex-1 text-white text-base"
                                placeholder="Enter your phone number"
                                placeholderTextColor="rgba(255,255,255,0.35)"
                                keyboardType="phone-pad"
                                maxLength={10}
                                value={phone}
                                onChangeText={handleChange}
                                onFocus={() => {
                                    setIsFocused(true);
                                }}
                                onBlur={() => {
                                    setIsFocused(false);
                                }}
                                onSubmitEditing={handleContinue}
                                returnKeyType="done"
                                style={{
                                    height: 56,
                                }}
                            />
                        }
                    />
                </View>
                <View className=" pb-6">
                    <AuthButton
                        title="Continue"

                        handleContinue={handleContinue}

                        isValid={isValid}

                        loading={isLoading}
                    />
                </View>
            </View>
        </Wrapper>
    );
};

export default AuthScreen;