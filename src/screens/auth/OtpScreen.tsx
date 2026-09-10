import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

import { OtpInput } from 'react-native-otp-entry';
import type {
    OtpInputRef,
    Theme as OtpInputTheme,
} from 'react-native-otp-entry';

import Wrapper from '../../layouts/wraper/Wraper';
import {
    Text,
    View,
} from '../../lib/style/withTailwind';
import AuthNavigation from '../../components/navigation/AuthNavigation';
import { AuthTopFrame } from '../../components/auth/frame/AuthFrame';
import AuthButton from '../../components/auth/buttons/AuthButton';
import { route as appRoute } from '../../const/routes/route';
import useVerifyOtpApi from '../../api/auth/hooks/auth/useVerifyOtpApi';
import { showMessage } from 'react-native-flash-message';
import { useAppDispatch } from '../../hooks/redux/redux';
import { setUser } from '../../store/slices/userSlice';
import { writeStorage } from '../../manager/storage/storageManager';
import { storageToken } from '../../const/token/storageToken';
import token from '../../const/token/token';
import { Theme } from '../../const/theme/Theme';
import { removeListener, startOtpListener } from 'react-native-otp-verify';

const OTP_LENGTH = 6;
const OTP_REGEX = new RegExp(`^\\d{${OTP_LENGTH}}$`);
const OTP_EXTRACT_REGEX = new RegExp(`\\d{${OTP_LENGTH}}`);
const FOCUS_COLOR = '#FFFFFF';
const ERROR_COLOR = '#FF6B6B';

const OtpScreen = ({ route, navigation }: any) => {
    const phoneNumber = route?.params?.phonenumber ?? '';
    const {
        verifyOtpAsync,
        isLoading,
    } = useVerifyOtpApi();
    const [otp, setOtp] = useState('');
    const [error, setError] = useState<string | null>(null);
    const otpInputRef = useRef<OtpInputRef>(null);
    const dispatch = useAppDispatch();
    const isValid = OTP_REGEX.test(otp);

    const persistSignIn = (data: any) => {
        dispatch(setUser({
            token: data?.token,
            _id: data?.user._id,
            phone: data?.user.phone,
            photo: data?.user.photo,
            name: data?.user.name,
            gender: data?.user.gender,
            email: data?.user.email,
            city: data?.user.city,
        }));
        writeStorage({ key: storageToken, data: data?.token });
    };

    const otpTheme = useMemo<OtpInputTheme>(
        () => ({
            pinCodeContainerStyle: {
                width: 48,
                height: 56,
                borderRadius: 12,
                borderWidth: 1.5,
                backgroundColor: Theme.background.secondary,
                borderColor: error
                    ? ERROR_COLOR
                    : 'rgba(255,255,255,0.15)',
            },
            filledPinCodeContainerStyle: {
                borderColor: error
                    ? ERROR_COLOR
                    : 'rgba(255,255,255,0.3)',
            },
            pinCodeTextStyle: {
                color: Theme.text.primary,
                fontSize: 20,
                fontWeight: '700',
            },
            focusStickStyle: {
                borderRadius: 2,
            },
        }),
        [error]
    );

    const handleOtpChange = useCallback((value: string) => {
        const numericValue = value
            .replace(/[^0-9]/g, '')
            .slice(0, OTP_LENGTH);
        setOtp(numericValue);
        setError(null);
    }, []);

    const handleVerify = useCallback(async () => {
        if (isLoading) {
            return;
        }
        if (!OTP_REGEX.test(otp)) {
            setError(`Please enter the complete ${OTP_LENGTH}-digit OTP.`);
            otpInputRef.current?.focus();
            return;
        }
        const code = otp;
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
            const data = response.data;
            persistSignIn(data);
            if (data?.isNewUser) {
                navigation.replace(appRoute.setUp, {
                    phonenumber: phoneNumber,
                });
            } else {
                writeStorage({ key: token.isAuth, data: true });
                writeStorage({
                    key: token.isAuthData,
                    data: {
                        _id: data?.user._id,
                        phone: data?.user.phone,
                        photo: data?.user.photo,
                        name: data?.user.name,
                        gender: data?.user.gender,
                        email: data?.user.email,
                        city: data?.user.city,
                    },
                });
                navigation.reset({
                    index: 0,
                    routes: [
                        {
                            name: appRoute.home,
                        },
                    ],
                });
            }
        } catch (err: any) {
            const message =
                err?.response?.data?.message ||
                err?.message ||
                'Invalid OTP. Please try again.';
            // Validation feedback: mark the boxes, clear them and refocus.
            setError(message);
            otpInputRef.current?.clear();
            setOtp('');
            otpInputRef.current?.focus();
            showMessage({
                message: 'Verification Failed',
                description: message,
                type: 'danger',
                duration: 3000,
            });
        }

    }, [
        isLoading,
        otp,
        phoneNumber,
        verifyOtpAsync,
        navigation,
        dispatch
    ]);
    useEffect(() => {
        startOtpListener(message => {
            const match = OTP_EXTRACT_REGEX.exec(message);
            console.log(match)
            const extractedOtp = match ? match[0] : null;
            if (!extractedOtp) {
                return;
            }
            otpInputRef.current?.setValue(extractedOtp);
        });
        return () => removeListener();
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
                        <OtpInput
                            ref={otpInputRef}
                            numberOfDigits={OTP_LENGTH}
                            type="numeric"
                            autoFocus={false}
                            focusColor={error ? ERROR_COLOR : FOCUS_COLOR}
                            onTextChange={handleOtpChange}
                            theme={otpTheme}
                        />
                    </View>
                    <View
                        className="w-full mt-2 px-1"
                        style={{ minHeight: 18, justifyContent: 'center' }}
                    >
                        {error ? (
                            <Text
                                className="text-xs"
                                style={{ color: ERROR_COLOR }}
                            >
                                {error}
                            </Text>
                        ) : null}
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