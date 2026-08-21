import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Theme } from '../../const/theme/Theme';
import { TabRoute, DrawerRoute, BookingStepRoute } from '../../const/routes/route';
import TabUiNavi from '../../ui/navigation/TabUiNavi';
import DrawerUiNavi from '../../ui/navigation/DrawerUiNavi';

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

// New booking multi-step screens
import Step1ApplicantScreen from '../../screens/booking/steps/Step1ApplicantScreen';
import Step2EventScreen from '../../screens/booking/steps/Step2EventScreen';
import Step3ScheduleScreen from '../../screens/booking/steps/Step3ScheduleScreen';
import Step4AttendanceScreen from '../../screens/booking/steps/Step4AttendanceScreen';
import Step5RequirementsScreen from '../../screens/booking/steps/Step5RequirementsScreen';
import Step6DecorationScreen from '../../screens/booking/steps/Step6DecorationScreen';
import Step7PaymentScreen from '../../screens/booking/steps/Step7PaymentScreen';

const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

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

const MainStack = ({ userRole = 'staff', userName = 'Rahul Kumar' }: MainStackProps) => {
    const isCEO = userRole === 'ceo';
    const MainTabs = isCEO ? CEOTabs : StaffTabs;

    return (
        <Drawer.Navigator
            screenOptions={{
                headerShown: false,
                drawerStyle: {
                    backgroundColor: '#000000',
                    width: 300,
                },
                drawerActiveTintColor: Theme.button.primary,
                drawerInactiveTintColor: '#8F8B91',
                drawerActiveBackgroundColor: `${Theme.button.primary}15`,
                drawerLabelStyle: {
                    fontSize: 15,
                    fontWeight: '500',
                },
                swipeEdgeWidth: 60,
            }}
            drawerContent={(props) => <DrawerUiNavi {...props} userRole={userRole} userName={userName} />}
        >
            <Drawer.Screen
                name={DrawerRoute.MainTabs}
                component={MainTabs}
                options={{
                    drawerLabel: 'Home',
                    title: 'Home',
                }}
            />
            <Drawer.Screen
                name={DrawerRoute.NewBooking}
                component={Step1ApplicantScreen}
                options={{ drawerLabel: 'New Booking' }}
            />
            <Drawer.Screen
                name={DrawerRoute.BookingDetail}
                component={BookingDetailScreen}
                options={{ drawerLabel: 'Booking Detail' }}
            />
            <Drawer.Screen
                name={DrawerRoute.AddPayment}
                component={AddPaymentScreen}
                options={{ drawerLabel: 'Add Payment' }}
            />
            <Drawer.Screen
                name={DrawerRoute.HandoverChecklist}
                component={HandoverChecklistScreen}
                options={{ drawerLabel: 'Handover Checklist' }}
            />
            <Drawer.Screen
                name={DrawerRoute.OfficeApproval}
                component={OfficeApprovalScreen}
                options={{ drawerLabel: 'Office Approval' }}
            />
            <Drawer.Screen
                name={DrawerRoute.StaffActivity}
                component={StaffActivityScreen}
                options={{ drawerLabel: 'Staff Activity' }}
            />
            <Drawer.Screen
                name={DrawerRoute.Reports}
                component={ReportsScreen}
                options={{ drawerLabel: 'Reports' }}
            />
            <Drawer.Screen
                name={DrawerRoute.Profile}
                component={ProfileScreen}
                options={{ drawerLabel: 'Profile' }}
            />

            {/* Booking step screens */}
            <Drawer.Screen
                name={BookingStepRoute.Step1Applicant}
                component={Step1ApplicantScreen}
                options={{ drawerItemStyle: { display: 'none' } }}
            />
            <Drawer.Screen
                name={BookingStepRoute.Step2Event}
                component={Step2EventScreen}
                options={{ drawerItemStyle: { display: 'none' } }}
            />
            <Drawer.Screen
                name={BookingStepRoute.Step3Schedule}
                component={Step3ScheduleScreen}
                options={{ drawerItemStyle: { display: 'none' } }}
            />
            <Drawer.Screen
                name={BookingStepRoute.Step4Attendance}
                component={Step4AttendanceScreen}
                options={{ drawerItemStyle: { display: 'none' } }}
            />
            <Drawer.Screen
                name={BookingStepRoute.Step5Requirements}
                component={Step5RequirementsScreen}
                options={{ drawerItemStyle: { display: 'none' } }}
            />
            <Drawer.Screen
                name={BookingStepRoute.Step6Decoration}
                component={Step6DecorationScreen}
                options={{ drawerItemStyle: { display: 'none' } }}
            />
            <Drawer.Screen
                name={BookingStepRoute.Step7Payment}
                component={Step7PaymentScreen}
                options={{ drawerItemStyle: { display: 'none' } }}
            />
        </Drawer.Navigator>
    );
};

export default MainStack;