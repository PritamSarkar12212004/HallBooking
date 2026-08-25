import React, {
    useCallback,
    useRef,
    useState,
} from 'react';

import Wrapper from '../../layouts/wraper/Wraper';
import {
    View,
} from '../../lib/style/withTailwind';
import AuthNavigation from '../../components/navigation/AuthNavigation';
import {
    AuthTopFrame,
    OtpInput,
} from '../../components/auth/frame/AuthFrame';
import AuthButton from '../../components/auth/buttons/AuthButton';
import { route as appRoute } from '../../const/routes/route';
import useVerifyOtpApi from '../../api/auth/hooks/auth/useVerifyOtpApi';
import { showMessage } from 'react-native-flash-message';
import { useAppDispatch } from '../../hooks/redux/redux';
import { setUser } from '../../store/slices/userSlice';
import { writeStorage } from '../../manager/storage/storageManager';
import { storageToken } from '../../const/token/storageToken';
import token from '../../const/token/token';

const OTP_LENGTH = 6;

const OtpScreen = ({ route, navigation }: any) => {
    const phoneNumber = route?.params?.phonenumber ?? '';
    const {
        verifyOtpAsync,
        isLoading,
    } = useVerifyOtpApi();
    const [otp, setOtp] = useState<string[]>(
        () => Array(OTP_LENGTH).fill('')
    );

    const [focusedIndex, setFocusedIndex] = useState<number | null>(0);
    const inputRefs = useRef<any[]>([]);
    const isValid = otp.every(Boolean);
    const dispatch = useAppDispatch()
    const handleChange = useCallback(
        (value: string, index: number) => {
            const numericValue = value.replace(/[^0-9]/g, '');
            if (numericValue.length > 1) {
                const pasted = numericValue
                    .slice(0, OTP_LENGTH)
                    .split('');

                setOtp(prevOtp => {
                    const newOtp = [...prevOtp];
                    pasted.forEach((char, i) => {

                        const position = index + i;

                        if (position < OTP_LENGTH) {
                            newOtp[position] = char;
                        }

                    });
                    return newOtp;
                });
                const nextIndex = Math.min(
                    index + pasted.length,
                    OTP_LENGTH - 1
                );
                inputRefs.current[nextIndex]?.focus();
                return;
            }
            setOtp(prevOtp => {
                const newOtp = [...prevOtp];
                newOtp[index] = numericValue;
                return newOtp;
            });
            if (
                numericValue &&
                index < OTP_LENGTH - 1
            ) {
                inputRefs.current[index + 1]?.focus();
            }
        },
        []
    );

    const handleVerify = useCallback(async () => {
        if (!isValid || isLoading) {
            return;
        }
        const code = otp.join('');
        try {
            const response = await verifyOtpAsync({
                phone: phoneNumber,
                otp: code,
            });
            showMessage({
                message: 'OTP Verified',
                description: 'Your phone number has been verified successfully.',
                type: 'success',
            });
            if (response.data?.isNewUser) {
                dispatch(setUser({
                    token: response.data?.token,
                    _id: response.data?.user._id,
                    phone: response.data?.user.phone,
                    photo: response.data?.user.photo,
                    name: response.data?.user.name,
                    gender: response.data?.user.gender,
                    email: response.data?.user.email,
                    city: response.data?.user.city,
                }))
                writeStorage({ key: storageToken, data: response.data?.token })
                navigation.replace(appRoute.setUp, {
                    phonenumber: phoneNumber,
                });
            } else {
                console.log(response.data)
                dispatch(setUser({
                    token: response.data?.token,
                    _id: response.data?.user._id,
                    phone: response.data?.user.phone,
                    photo: response.data?.user.photo,
                    name: response.data?.user.name,
                    gender: response.data?.user.gender,
                    email: response.data?.user.email,
                    city: response.data?.user.city,
                }))
                writeStorage({ key: storageToken, data: response.data?.token })
                writeStorage({ key: token.isAuth, data: true })
                writeStorage({
                    key: token.isAuthData,
                    data: {
                        _id: response.data?.user._id,
                        phone: response.data?.user.phone,
                        photo: response.data?.user.photo,
                        name: response.data?.user.name,
                        gender: response.data?.user.gender,
                        email: response.data?.user.email,
                        city: response.data?.user.city,
                    }
                })
                navigation.reset({
                    index: 0,
                    routes: [
                        {
                            name: appRoute.home,
                        },
                    ],
                });
            }

        } catch (error) {
            const message =
                error?.response?.data?.message ||
                error?.message ||
                'Invalid OTP. Please try again.';
            showMessage({
                message: 'Verification Failed',
                description: message,
                type: 'danger',
                duration: 3000,
            });
        }

    }, [
        isValid,
        isLoading,
        otp,
        phoneNumber,
        verifyOtpAsync,
        navigation,
        dispatch
    ]);

    const handleFocus = useCallback(
        (index: number) => {
            setFocusedIndex(index);
        },
        []
    );

    const handleBlur = useCallback(() => {
        setFocusedIndex(null);
    }, []);

    return (
        <Wrapper
            paddingHorizontal={0}
            paddingTop={0}
        >
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
                                    onChangeText={(value: string) =>
                                        handleChange(
                                            value,
                                            index
                                        )
                                    }
                                    onFocus={() =>
                                        handleFocus(index)
                                    }
                                    onBlur={handleBlur}
                                />
                            ))}
                        </View>
                    </View>
                </View>
                <View className=" pb-6">
                    <AuthButton
                        title="Verify"
                        handleContinue={handleVerify}
                        isValid={isValid}
                        loading={isLoading}
                    />
                </View>
            </View>
        </Wrapper>
    );
};

export default OtpScreen;