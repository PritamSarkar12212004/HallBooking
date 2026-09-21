import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from '../../../lib/style/withTailwind';
import {
    CalendarCheck,
    CalendarClock,
    CalendarDays,
    ChevronRight,
    Clock3,
    TriangleAlert,
} from 'lucide-react-native';
import DashboardPalette from '../../../const/theme/dashboardPalette';
import SectionTitle from '../../card/dashboard/SectionTitle';
import AnalyticsRowList from '../AnalyticsRowList';
import AnalyticsStatPills from '../AnalyticsStatPills';
import { eventItems } from '../panelItems';
import type { AnalyticsPanelProps } from '../panelTypes';

/** 📅 Events — upcoming, chal rahe, complete aur cancelled events. */
const EventsPanel = ({ analytics, openBooking, openCalendar }: AnalyticsPanelProps) => {
    const { events } = analytics;

    const upcoming = useMemo(
        () => eventItems(events.upcoming.slice(0, 10), openBooking),
        [events.upcoming, openBooking],
    );
    const ongoing = useMemo(
        () => eventItems(events.ongoing.slice(0, 10), openBooking),
        [events.ongoing, openBooking],
    );
    const completed = useMemo(
        () => eventItems(events.completed.slice(0, 10), openBooking),
        [events.completed, openBooking],
    );
    const cancelled = useMemo(
        () => eventItems(events.cancelled.slice(0, 10), openBooking),
        [events.cancelled, openBooking],
    );

    return (
        <View className="gap-7">
            <View>
                <View className="flex-row items-start justify-between">
                    <SectionTitle
                        icon={CalendarDays}
                        tint={DashboardPalette.blue}
                        title="Events"
                        sub={`${events.counts.total} booked in this period`}
                    />
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={openCalendar}
                        className="flex-row items-center px-3 py-1.5 rounded-full"
                        style={{ backgroundColor: DashboardPalette.goldSoft }}
                    >
                        <Text
                            className="text-[11px] font-bold mr-1"
                            style={{ color: DashboardPalette.goldDeep }}
                        >
                            Calendar
                        </Text>
                        <ChevronRight size={12} color={DashboardPalette.goldDeep} />
                    </TouchableOpacity>
                </View>

                <View className="mt-3.5">
                    <AnalyticsStatPills
                        pills={[
                            {
                                key: 'upcoming',
                                label: 'Upcoming',
                                value: String(events.counts.upcoming),
                                tone: 'blue',
                            },
                            {
                                key: 'ongoing',
                                label: 'Ongoing',
                                value: String(events.counts.ongoing),
                                tone: 'gold',
                            },
                            {
                                key: 'completed',
                                label: 'Completed',
                                value: String(events.counts.completed),
                                tone: 'green',
                            },
                            {
                                key: 'cancelled',
                                label: 'Cancelled',
                                value: String(events.counts.cancelled),
                                tone: 'red',
                            },
                        ]}
                    />
                </View>
            </View>

            <View>
                <SectionTitle
                    icon={CalendarClock}
                    tint={DashboardPalette.blue}
                    title="Upcoming Events"
                    sub="Next events scheduled ahead"
                />
                <View className="mt-3.5">
                    <AnalyticsRowList items={upcoming} emptyText="No upcoming events." />
                </View>
            </View>

            <View>
                <SectionTitle
                    icon={Clock3}
                    tint={DashboardPalette.gold}
                    title="Ongoing Today"
                    sub="Events covering today"
                />
                <View className="mt-3.5">
                    <AnalyticsRowList items={ongoing} emptyText="Nothing running today." />
                </View>
            </View>

            <View>
                <SectionTitle
                    icon={CalendarCheck}
                    tint={DashboardPalette.green}
                    title="Completed Events"
                    sub="Closed in this period"
                />
                <View className="mt-3.5">
                    <AnalyticsRowList
                        items={completed}
                        emptyText="No completed events in this period."
                    />
                </View>
            </View>

            <View>
                <SectionTitle
                    icon={TriangleAlert}
                    tint={DashboardPalette.red}
                    title="Cancelled Events"
                    sub="Cancelled in this period"
                />
                <View className="mt-3.5">
                    <AnalyticsRowList
                        items={cancelled}
                        emptyText="No cancellations in this period."
                    />
                </View>
            </View>
        </View>
    );
};

export default EventsPanel;
