import React, { useState } from 'react';
import { ScrollView, View } from '../../lib/style/withTailwind';

import Wrapper from '../../layouts/wraper/Wraper';
import MainDerder from '../../components/header/MainDerder';

import DateButton from '../../components/buttons/DateButton';
import InputField from '../../components/input/InputField';
import MultiSelector from '../../components/Selector/MultiSelector';
import MainButton from '../../components/buttons/MainButton';
import DatePickerModal from '../../components/picker/DatePickerModal';
import { Building2, PanelsTopLeft, UserRound } from 'lucide-react-native';
import { Divider } from 'react-native-paper';
import { DrawerRoute } from '../../const/routes/route';

const staffMembers = [
    'Rahul Kumar',
    'Priya Singh',
    'Amit Verma',
    'Sneha Gupta',
];

const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

const daysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

const today = new Date();
const currentYear = today.getFullYear();
const currentMonthIndex = today.getMonth();
const todayDay = today.getDate();

const HallCalendarScreen = ({ navigation }: any) => {
    const [startDate, setStartDate] = useState('21 Aug 2026');
    const [endDate, setEndDate] = useState('21 Aug 2026');

    const [bookingName, setBookingName] = useState('');
    const [bookingTakenBy, setBookingTakenBy] = useState('');

    const [selectedStaff, setSelectedStaff] = useState<string[]>([]);

    const [calendarVisible, setCalendarVisible] = useState(false);

    const [activeField, setActiveField] = useState<'start' | 'end'>('start');

    const [selectedDay, setSelectedDay] = useState<number | null>(null);

    const [viewMonthIndex, setViewMonthIndex] = useState(currentMonthIndex);
    const [viewYear, setViewYear] = useState(currentYear);

    const [loader, setLoader] = useState<boolean>(false)

    const toggleStaff = (name: string) => {
        setSelectedStaff(prev =>
            prev.includes(name)
                ? prev.filter(n => n !== name)
                : [...prev, name]
        );
    };

    const openCalendar = (field: 'start' | 'end') => {
        setActiveField(field);

        const existingDate =
            field === 'start'
                ? startDate
                : endDate;

        const day = Number(existingDate.split(' ')[0]);

        setSelectedDay(
            Number.isNaN(day) ? null : day
        );

        setCalendarVisible(true);
    };

    const closeCalendar = () => {
        setCalendarVisible(false);
        setSelectedDay(null);
    };

    const confirmDate = () => {
        if (!selectedDay) return;

        const dateStr = `${selectedDay} ${monthNames[viewMonthIndex].slice(0, 3)} ${viewYear}`;

        if (activeField === 'start') {
            setStartDate(dateStr);
        } else {
            setEndDate(dateStr);
        }

        closeCalendar();
    };

    const goPreviousMonth = () => {
        if (viewMonthIndex === 0) {
            setViewMonthIndex(11);
            setViewYear(viewYear - 1);
        } else {
            setViewMonthIndex(viewMonthIndex - 1);
        }
    };

    const goNextMonth = () => {
        if (viewMonthIndex === 11) {
            setViewMonthIndex(0);
            setViewYear(viewYear + 1);
        } else {
            setViewMonthIndex(viewMonthIndex + 1);
        }
    };

    const actionPress = () => {
        setLoader(true)
        setTimeout(() => {
            setLoader(false)
            navigation.navigate(DrawerRoute.NewBooking)
        }, 200);
    }
    const isCurrentMonth = viewMonthIndex === currentMonthIndex && viewYear === currentYear;

    const monthName = `${monthNames[viewMonthIndex]} ${viewYear}`;
    const daysInMonth = daysInMonths[viewMonthIndex];

    const startDayNum = Number(startDate.split(' ')[0]);


    const liveStartDay = activeField === 'end' ? startDayNum : null;
    const liveEndDay = activeField === 'end' ? selectedDay : null;

    return (
        <Wrapper safeBottom>

            <MainDerder
                navigation={navigation}
                title="Halls"
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                className="flex-1"
            >

                <DateButton
                    title="Start Date *"
                    subTitle={startDate}
                    actionFunc={() =>
                        openCalendar('start')
                    }
                />
                <View className="mb-2">
                    <Divider />
                </View>
                <DateButton
                    title="End Date *"
                    subTitle={endDate}
                    actionFunc={() =>
                        openCalendar('end')
                    }
                />
                <View className="mb-2">
                    <Divider />
                </View>
                <InputField
                    title="Event / Hall Name *"
                    value={bookingName}
                    setvalue={setBookingName}
                    placeholder="Enter event / hall name"
                    keyType="default"
                    Icon={Building2}
                />
                <View className="mb-2">
                    <Divider />
                </View>
                <InputField
                    title="Booking Taken By *"
                    value={bookingTakenBy}
                    setvalue={setBookingTakenBy}
                    placeholder="Enter staff name"
                    keyType="default"
                    Icon={UserRound}
                />
                <View className="mb-3">
                    <Divider />
                </View>
                <MultiSelector
                    title="Allocate Team"
                    list={staffMembers}
                    value={selectedStaff}
                    actionFunc={toggleStaff}
                    selection="Multiple select"
                    Icon={PanelsTopLeft}
                />
            </ScrollView>

            <MainButton
                title="Next"
                loader={loader}
                actionFunc={actionPress}
            />

            <DatePickerModal
                visible={calendarVisible}
                title={
                    activeField === 'start'
                        ? 'Select Start Date'
                        : 'Select End Date'
                }
                selectedDay={selectedDay}
                monthName={monthName}
                daysInMonth={daysInMonth}
                minDay={isCurrentMonth ? todayDay : undefined}
                startDay={liveStartDay}
                endDay={liveEndDay}
                onClose={closeCalendar}
                onSelectDay={setSelectedDay}
                onConfirm={confirmDate}
                onPreviousMonth={goPreviousMonth}
                onNextMonth={goNextMonth}
            />

        </Wrapper>
    );
};

export default HallCalendarScreen;