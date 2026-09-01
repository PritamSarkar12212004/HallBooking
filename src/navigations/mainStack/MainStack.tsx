import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { TabRoute, MainRoute } from '../../const/routes/route';
import TabUiNavi from '../../ui/navigation/TabUiNavi';

import HomeScreen from '../../screens/main/HomeScreen';
import BookingListScreen from '../../screens/main/BookingListScreen';
import HallCalendarScreen from '../../screens/booking/HallCalendarScreen';
import NotificationScreen from '../../screens/main/NotificationScreen';
import ProfileScreen from '../../screens/main/ProfileScreen';

import CEODashboardScreen from '../../screens/ceo/CEODashboardScreen';
import StaffActivityScreen from '../../screens/ceo/StaffActivityScreen';
import ReportsScreen from '../../screens/ceo/ReportsScreen';

import BookingDetailScreen from '../../screens/booking/BookingDetailScreen';
import AddPaymentScreen from '../../screens/booking/AddPaymentScreen';
import EditFinanceScreen from '../../screens/booking/EditFinanceScreen';
import PaymentTrackRecordScreen from '../../screens/booking/PaymentTrackRecordScreen';
import HandoverChecklistScreen from '../../screens/booking/HandoverChecklistScreen';
import OfficeApprovalScreen from '../../screens/booking/OfficeApprovalScreen';

import BookingStepStack from './BookingStepStack';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const StaffTabs = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                animation: "fade"
            }}
            tabBar={(props) => <TabUiNavi {...props} />}
        >
            <Tab.Screen name={TabRoute.Home} component={HomeScreen} />
            <Tab.Screen name={TabRoute.Bookings} component={BookingListScreen} />
            <Tab.Screen name={TabRoute.Notification} component={NotificationScreen} />
            <Tab.Screen name={TabRoute.Profile} component={ProfileScreen} />
        </Tab.Navigator>
    );
};

const CEOTabs = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                animation: "fade"
            }}
            tabBar={(props) => <TabUiNavi {...props} />}
        >
            <Tab.Screen name={TabRoute.Dashboard} component={CEODashboardScreen} />
            <Tab.Screen name={TabRoute.Bookings} component={BookingListScreen} />
            <Tab.Screen name={TabRoute.Notification} component={NotificationScreen} />
            <Tab.Screen name={TabRoute.Staff} component={StaffActivityScreen} />
            <Tab.Screen name={TabRoute.Profile} component={ProfileScreen} />
        </Tab.Navigator>
    );
};

interface MainStackProps {
    userRole?: 'staff' | 'manager' | 'ceo';
    userName?: string;
}

const MainStack = ({ userRole = 'staff' }: MainStackProps) => {
    const isCEO = userRole === 'ceo';
    const MainTabs = isCEO ? CEOTabs : StaffTabs;

    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                animation: "slide_from_right"
            }}
        >
            <Stack.Screen
                name={MainRoute.MainTabs}
                component={MainTabs}
            />
            <Stack.Screen
                name={MainRoute.NewBooking}
                component={BookingStepStack}
            />
            <Stack.Screen
                name={MainRoute.BookingDetail}
                component={BookingDetailScreen}
            />
            <Stack.Screen
                name={MainRoute.AddPayment}
                component={AddPaymentScreen}
            />
            <Stack.Screen
                name={MainRoute.EditFinance}
                component={EditFinanceScreen}
            />
            <Stack.Screen
                name={MainRoute.PaymentTrackRecord}
                component={PaymentTrackRecordScreen}
            />
            <Stack.Screen
                name={MainRoute.HandoverChecklist}
                component={HandoverChecklistScreen}
            />
            <Stack.Screen
                name={MainRoute.OfficeApproval}
                component={OfficeApprovalScreen}
            />
            <Stack.Screen
                name={MainRoute.StaffActivity}
                component={StaffActivityScreen}
            />
            <Stack.Screen
                name={MainRoute.Reports}
                component={ReportsScreen}
            />
            <Stack.Screen
                name={MainRoute.Profile}
                component={ProfileScreen}
            />
            <Stack.Screen
                name={MainRoute.HallCalendar}
                component={HallCalendarScreen}
            />
        </Stack.Navigator>
    );
};

export default MainStack;