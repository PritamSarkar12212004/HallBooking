import React, { useState } from 'react'
import Wrapper from '../../layouts/wraper/Wraper';
import { TextInput, View } from '../../lib/style/withTailwind';
import AuthNavigation from '../../components/navigation/AuthNavigation';
import { route } from '../../const/routes/route';
import AuthButton from '../../components/auth/buttons/AuthButton';
import { AuthTopFrame, MainFrame } from '../../components/auth/frame/AuthFrame';

const AuthScreen = ({ navigation }: any) => {
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState<boolean>(false)
    const [isFocused, setIsFocused] = useState(false);
    const isValid = phone.length === 10;

    const handleContinue = () => {
        if (!isValid) return;
        setLoading(true)
        setTimeout(() => {
            setLoading(false)
            navigation.navigate(route.otp, { phonenumber: phone });
        }, 2000);

    };

    return (
        <Wrapper paddingTop={20} paddingBottom={20}>
            <View className="flex-1 bg-black gap-4">
                <AuthNavigation need={false} navigation={navigation} />
                <View className="flex-1">
                    <AuthTopFrame
                        title="Continue With Phone Number"
                        dis="Sign in or sign up using your phone number"
                    />
                    <MainFrame
                        title="Phone Number"
                        dis="We'll send you a one-time verification code"
                        isFocused={isFocused}
                        input={<TextInput
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
                        />}
                    />
                </View>
                <View className="px-5 pb-6">
                    <AuthButton title="Continue" handleContinue={handleContinue} isValid={isValid} loading={loading} />
                </View>
            </View>
        </Wrapper>
    )
}

export default AuthScreen