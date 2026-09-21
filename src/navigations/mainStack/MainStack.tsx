import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { TabRoute, MainRoute } from '../../const/routes/route';
import TabUiNavi from '../../ui/navigation/TabUiNavi';

import HomeScreen from '../../screens/main/HomeScreen';
import BookingListScreen from '../../screens/main/BookingListScreen';
import HallCalendarScreen from '../../screens/booking/HallCalendarScreen';
import NotificationScreen from '../../screens/main/NotificationScreen';
import ApplicantListScreen from '../../screens/main/ApplicantListScreen';
import ProfileScreen from '../../screens/main/ProfileScreen';
import ProfileQrScreen from '../../screens/main/ProfileQrScreen';

import CEODashboardScreen from '../../screens/ceo/CEODashboardScreen';
import StaffActivityScreen from '../../screens/ceo/StaffActivityScreen';
import ReportsScreen from '../../screens/ceo/ReportsScreen';
import CEOAnalyticsScreen from '../../screens/ceo/CEOAnalyticsScreen';

import BookingDetailScreen from '../../screens/booking/BookingDetailScreen';
import EditFinanceScreen from '../../screens/booking/EditFinanceScreen';
import EditEventScreen from '../../screens/booking/EditEventScreen';
import PaymentTrackRecordScreen from '../../screens/booking/PaymentTrackRecordScreen';

import BookingStepStack from './BookingStepStack';
import FeatureStack from './FeatureStack';
import { useAppSelector } from '../../hooks/redux/redux';
import { isCeoPhone } from '../../const/role/role';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Tab bar renderer component ke BAHAR — inline arrow dene par har render me naya
// component banta hai aur poora tab bar dobara mount ho jaata hai.
const renderTabBar = (props: any) => <TabUiNavi {...props} />;

const StaffTabs = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                animation: "fade"
            }}
            tabBar={renderTabBar}
        >
            <Tab.Screen name={TabRoute.Home} component={HomeScreen} />
            <Tab.Screen name={TabRoute.Bookings} component={BookingListScreen} />
            <Tab.Screen name={TabRoute.Notification} component={NotificationScreen} />
            <Tab.Screen name={TabRoute.Applicants} component={ApplicantListScreen} />
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
            tabBar={renderTabBar}
        >
            <Tab.Screen name={TabRoute.Dashboard} component={CEODashboardScreen} />
            <Tab.Screen name={TabRoute.Bookings} component={BookingListScreen} />
            {/* CEO ke side par Notification aur Applicants tabs nahi chahiye —
                applicants/customers ka poora picture Analytics tab me hai. */}
            <Tab.Screen name={TabRoute.Analytics} component={CEOAnalyticsScreen} />
            <Tab.Screen name={TabRoute.Profile} component={ProfileScreen} />
        </Tab.Navigator>
    );
};

interface MainStackProps {
    userRole?: 'staff' | 'manager' | 'ceo';
    userName?: string;
}

const MainStack = ({ userRole }: MainStackProps) => {
    const user = useAppSelector((state) => state.user.user);
    // CEO access is allowed only for the whitelisted CEO phone numbers.
    const isCEO = userRole ? userRole === 'ceo' : isCeoPhone(user?.phone);
    const MainTabs = isCEO ? CEOTabs : StaffTabs;

    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                animation: "slide_from_right",
                freezeOnBlur: true
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
                name={MainRoute.EditFinance}
                component={EditFinanceScreen}
            />
            {/* Event details (Booking For + us person ki details/photo) update */}
            <Stack.Screen
                name={MainRoute.EditEvent}
                component={EditEventScreen}
            />
            <Stack.Screen
                name={MainRoute.PaymentTrackRecord}
                component={PaymentTrackRecordScreen}
            />
            <Stack.Screen
                name={MainRoute.Reports}
                component={ReportsScreen}
            />
            <Stack.Screen
                name={MainRoute.Profile}
                component={ProfileScreen}
            />
            {/* CEO Profile → QR Code (dynamic hall payment QR) */}
            <Stack.Screen
                name={MainRoute.ProfileQr}
                component={ProfileQrScreen}
            />
            <Stack.Screen
                name={MainRoute.HallCalendar}
                component={HallCalendarScreen}
            />
            <Stack.Screen
                name={MainRoute.FeatureCalendar}
                component={FeatureStack}
            />
            {/* Staff Activity calendar — pehle bottom tab tha, ab CEO Dashboard
                ke card se is stack screen par navigate hota hai. */}
            <Stack.Screen
                name={MainRoute.StaffActivity}
                component={StaffActivityScreen}
            />
        </Stack.Navigator>
    );
};

export default MainStack;