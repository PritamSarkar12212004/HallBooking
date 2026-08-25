import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useRoute } from '@react-navigation/native';
import { BookingStepRoute, BookingStepParamList } from '../../const/routes/route';

// Booking step screens
import Step1ApplicantScreen from '../../screens/booking/steps/Step1ApplicantScreen';
import Step2EventScreen from '../../screens/booking/steps/Step2EventScreen';
import Step3ScheduleScreen from '../../screens/booking/steps/Step3ScheduleScreen';
import Step4AttendanceScreen from '../../screens/booking/steps/Step4AttendanceScreen';
import Step5RequirementsScreen from '../../screens/booking/steps/Step5RequirementsScreen';
import Step6DecorationScreen from '../../screens/booking/steps/Step6DecorationScreen';
import Step7PaymentScreen from '../../screens/booking/steps/Step7PaymentScreen';

const Stack = createStackNavigator<BookingStepParamList>();

const BookingStepStack = () => {
    const route = useRoute<any>();
    const bookingId = route?.params?.bookingId as string | undefined;
    const bookingNumber = route?.params?.bookingNumber as string | undefined;

    return (
        <Stack.Navigator
            initialRouteName={BookingStepRoute.Step1Applicant}
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
            }}
        >
            <Stack.Screen
                name={BookingStepRoute.Step1Applicant}
                component={Step1ApplicantScreen}
                initialParams={{ bookingId, bookingNumber }}
            />
            <Stack.Screen
                name={BookingStepRoute.Step2Event}
                component={Step2EventScreen}
            />
            <Stack.Screen
                name={BookingStepRoute.Step3Schedule}
                component={Step3ScheduleScreen}
            />
            <Stack.Screen
                name={BookingStepRoute.Step4Attendance}
                component={Step4AttendanceScreen}
            />
            <Stack.Screen
                name={BookingStepRoute.Step5Requirements}
                component={Step5RequirementsScreen}
            />
            <Stack.Screen
                name={BookingStepRoute.Step6Decoration}
                component={Step6DecorationScreen}
            />
            <Stack.Screen
                name={BookingStepRoute.Step7Payment}
                component={Step7PaymentScreen}
            />
        </Stack.Navigator>
    );
};

export default BookingStepStack;