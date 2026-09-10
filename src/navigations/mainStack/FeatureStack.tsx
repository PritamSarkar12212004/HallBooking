import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { FeatureRoute } from '../../const/routes/route';

import CaalenderScreen from '../../screens/features/CaalenderScreen';


const Stack = createStackNavigator();

const FeatureStack = () => {
    return (
        <Stack.Navigator
            initialRouteName={FeatureRoute.CalendarRange}
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
            }}
        >
            <Stack.Screen
                name={FeatureRoute.CalendarRange}
                component={CaalenderScreen}
            />
        </Stack.Navigator>
    );
};

export default FeatureStack;