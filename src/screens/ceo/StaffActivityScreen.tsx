import React from 'react';
import EventsCalendar from '../../components/calendar/EventsCalendar';

const StaffActivityScreen = ({ navigation }: any) => {
    return <EventsCalendar navigation={navigation} title="Staff Activity" />;
};

export default StaffActivityScreen;