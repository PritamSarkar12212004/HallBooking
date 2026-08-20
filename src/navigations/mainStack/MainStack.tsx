import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashBoardScreen from '../../screens/main/DashBoardScreen';


const Tab = createBottomTabNavigator()
const MainStack = () => {
    return (
        <Tab.Navigator screenOptions={{
            headerShown: false,
            animation: "fade"
        }}>
            <Tab.Screen name="ss" component={DashBoardScreen} />
        </Tab.Navigator>
    )
}

export default MainStack