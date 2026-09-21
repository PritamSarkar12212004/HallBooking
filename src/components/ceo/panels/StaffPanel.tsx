import React, { useMemo } from 'react';
import { View } from '../../../lib/style/withTailwind';
import { ClipboardList, Users } from 'lucide-react-native';
import DashboardPalette from '../../../const/theme/dashboardPalette';
import SectionTitle from '../../card/dashboard/SectionTitle';
import AnalyticsKpiGrid from '../AnalyticsKpiGrid';
import AnalyticsRowList, { AnalyticsRowItem } from '../AnalyticsRowList';
import { assignmentItems } from '../panelItems';
import type { AnalyticsPanelProps } from '../panelTypes';
import {
    buildStaffCards,
    money,
} from '../../../functions/ceo/AnalyticsFunction';

const roleLabel = (role?: string): string => {
    switch (String(role ?? '').toUpperCase()) {
        case 'CEO':
            return 'CEO';
        case 'OFFICE':
            return 'Office';
        case 'STAFF':
            return 'Staff';
        default:
            return 'Team';
    }
};

/** 👨‍💼 Staff — kaun kitna handle kar raha hai aur kaun sa event. */
const StaffPanel = ({ analytics, openBooking }: AnalyticsPanelProps) => {
    const { staff } = analytics;

    const cards = useMemo(() => buildStaffCards(staff), [staff]);

    const staffRows: AnalyticsRowItem[] = useMemo(
        () =>
            staff.staff.map((row, index) => ({
                key: row.userId || `${row.name}-${index}`,
                title: row.name,
                subtitle: roleLabel(row.role),
                meta: [
                    `${row.bookingsHandled} booking(s) handled`,
                    `${row.bookingsCreated} created`,
                    row.lastActivityAt ? `last active ${row.lastActivityAt.slice(0, 10)}` : '',
                ]
                    .filter(Boolean)
                    .join(' · '),
                value: money(row.collected),
                valueHint: row.pending > 0 ? `${money(row.pending)} due` : 'no dues',
            })),
        [staff.staff],
    );

    const assignments = useMemo(
        () => assignmentItems(staff.assignments.slice(0, 20), openBooking),
        [staff.assignments, openBooking],
    );

    return (
        <View className="gap-7">
            <View>
                <SectionTitle
                    icon={Users}
                    tint={DashboardPalette.violet}
                    title="Staff / Employees"
                    sub="Collection and activity, staff-wise"
                />
                <View className="mt-3.5">
                    <AnalyticsKpiGrid cards={cards} />
                </View>
            </View>

            <View>
                <SectionTitle
                    icon={Users}
                    tint={DashboardPalette.blue}
                    title="Staff Performance"
                    sub="Bookings handled and money received"
                />
                <View className="mt-3.5">
                    <AnalyticsRowList
                        items={staffRows}
                        emptyText="No staff records yet."
                    />
                </View>
            </View>

            <View>
                <SectionTitle
                    icon={ClipboardList}
                    tint={DashboardPalette.gold}
                    title="Who Handled Which Event"
                    sub="Bookings with a staff owner in this period"
                />
                <View className="mt-3.5">
                    <AnalyticsRowList
                        items={assignments}
                        emptyText="No event assigned to staff in this period."
                    />
                </View>
            </View>
        </View>
    );
};

export default StaffPanel;
