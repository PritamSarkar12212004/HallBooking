import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import OneBoardScreen from '../screens/onboard/OneBoardScreen';
import { route } from '../const/routes/route';
import AuthScreen from '../screens/auth/AuthScreen';
import OtpScreen from '../screens/auth/OtpScreen';
import SplashScreen from '../screens/loder/SplashScreen';
import MainStack from './mainStack/MainStack';
import SetupScreen from '../screens/auth/SetupScreen';

export type RootStackParamList = {
    [route.onboard]: undefined;
    [route.login]: undefined;
    [route.home]: undefined;
    [route.otp]: undefined;
    [route.setUp]: undefined;
    [route.splash]: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const RootNavigation = () => {
    return (
        <Stack.Navigator
            initialRouteName={route.login}
            screenOptions={{
                headerShown: false,
                animation: "slide_from_right"
            }}
        >
            <Stack.Screen
                name={route.splash}
                component={SplashScreen}
            />
            <Stack.Screen
                name={route.onboard}
                component={OneBoardScreen}
            />
            <Stack.Screen
                name={route.login}
                component={AuthScreen}
            />
            <Stack.Screen
                name={route.otp}
                component={OtpScreen}
            />
            <Stack.Screen
                name={route.setUp}
                component={SetupScreen}
            />
            <Stack.Screen
                name={route.home}
                component={MainStack}
            />
        </Stack.Navigator>
    );
};

export default RootNavigation;