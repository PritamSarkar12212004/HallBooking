import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { TabRoute, MainRoute } from '../../const/routes/route';
import TabUiNavi from '../../ui/navigation/TabUiNavi';

// Main tab screens
import HomeScreen from '../../screens/main/HomeScreen';
import BookingListScreen from '../../screens/main/BookingListScreen';
import HallCalendarScreen from '../../screens/main/HallCalendarScreen';
import ProfileScreen from '../../screens/main/ProfileScreen';

// CEO screens
import CEODashboardScreen from '../../screens/ceo/CEODashboardScreen';
import StaffActivityScreen from '../../screens/ceo/StaffActivityScreen';
import ReportsScreen from '../../screens/ceo/ReportsScreen';

// Booking management screens
import BookingDetailScreen from '../../screens/booking/BookingDetailScreen';
import AddPaymentScreen from '../../screens/booking/AddPaymentScreen';
import HandoverChecklistScreen from '../../screens/booking/HandoverChecklistScreen';
import OfficeApprovalScreen from '../../screens/booking/OfficeApprovalScreen';

// New booking multi-step stack navigator
import BookingStepStack from './BookingStepStack';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Staff Tabs
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
            <Tab.Screen name={TabRoute.Halls} component={HallCalendarScreen} />
            <Tab.Screen name={TabRoute.Profile} component={ProfileScreen} />
        </Tab.Navigator>
    );
};

// CEO Tabs
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
            <Tab.Screen name={TabRoute.Halls} component={HallCalendarScreen} />
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
        </Stack.Navigator>
    );
};

export default MainStack;