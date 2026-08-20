import React, { useState } from 'react'
import Wrapper from '../../layouts/wraper/Wraper';
import { Text, TextInput, View, TouchableOpacity } from '../../lib/style/withTailwind';
import AuthNavigation from '../../components/navigation/AuthNavigation';
import { Theme } from '../../const/theme/Theme';
import { route } from '../../const/routes/route';

const AuthScreen = ({ navigation }: any) => {
    const [phone, setPhone] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const isValid = phone.length === 10;

    const handleContinue = () => {
        if (!isValid) return;
        navigation.navigate(route.otp, { phonenumber: phone });
    };

    return (
        <Wrapper paddingTop={20} paddingBottom={20}>
            <View className="flex-1 bg-black gap-4">
                <AuthNavigation need={false} navigation={navigation} />
                <View className="flex-1">
                    <View className="w-full mb-2">
                        <Text className="text-white text-2xl font-bold leading-tight">
                            Continue With Phone Number
                        </Text>
                        <Text className="text-white/60 text-base mt-3 leading-relaxed">
                            Sign in or sign up using your{'\n'}phone number
                        </Text>
                    </View>
                    <View className="w-full mt-8 gap-2">
                        <Text className="text-white/80 text-sm font-medium">
                            Phone Number
                        </Text>

                        <View
                            className="w-full flex-row items-center rounded-xl px-4"
                            style={{
                                backgroundColor: Theme.background.secondary,
                                borderWidth: 1.5,
                                borderColor: isFocused ? '#ffffff' : 'transparent',
                                height: 56,
                            }}
                        >
                            <Text className="text-white text-base font-semibold mr-3">
                                +91
                            </Text>
                            <View
                                style={{
                                    width: 1,
                                    height: 22,
                                    backgroundColor: 'rgba(255,255,255,0.15)',
                                    marginRight: 12,
                                }}
                            />
                            <TextInput
                                className="flex-1 text-white text-base"
                                placeholder="Enter your phone number"
                                placeholderTextColor="rgba(255,255,255,0.35)"
                                keyboardType="phone-pad"
                                maxLength={10}
                                value={phone}
                                onChangeText={setPhone}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                onSubmitEditing={handleContinue}
                                returnKeyType="done"
                                style={{ height: 56 }}
                            />
                        </View>

                        <Text className="text-white/40 text-xs mt-1">
                            We'll send you a one-time verification code
                        </Text>
                    </View>
                </View>
                <View className="px-5 pb-6">
                    <TouchableOpacity
                        disabled={!isValid}
                        activeOpacity={0.9}
                        onPress={handleContinue}
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
                            Continue
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Wrapper>
    )
}

export default AuthScreen