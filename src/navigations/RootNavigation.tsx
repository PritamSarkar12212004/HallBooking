import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import OneBoardScreen from '../screens/onboard/OneBoardScreen';
import { route } from '../const/routes/route';

export type RootStackParamList = {
    [route.onboard]: undefined;
    [route.login]: undefined;
    [route.home]: undefined;
    [route.modal]: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const RootNavigation = () => {
    return (
        <Stack.Navigator
            initialRouteName={route.onboard}
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen
                name={route.onboard}
                component={OneBoardScreen}
            />
        </Stack.Navigator>
    );
};

export default RootNavigation;