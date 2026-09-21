import React, { useMemo } from 'react';
import { View } from '../../../lib/style/withTailwind';
import { Users, Wallet2 } from 'lucide-react-native';
import DashboardPalette from '../../../const/theme/dashboardPalette';
import SectionTitle from '../../card/dashboard/SectionTitle';
import AnalyticsKpiGrid from '../AnalyticsKpiGrid';
import AnalyticsRowList, { AnalyticsRowItem } from '../AnalyticsRowList';
import { pendingItems } from '../panelItems';
import type { AnalyticsPanelProps } from '../panelTypes';
import {
    buildCustomerCards,
    money,
} from '../../../functions/ceo/AnalyticsFunction';
import { formatDate } from '../../../functions/formate/DateTimeFormate';

/** 👥 Customers — repeat business, top customers aur pending dues. */
const CustomersPanel = ({ analytics, openBooking }: AnalyticsPanelProps) => {
    const { customers } = analytics;

    const cards = useMemo(() => buildCustomerCards(customers), [customers]);

    const topCustomers: AnalyticsRowItem[] = useMemo(
        () =>
            customers.topCustomers.map((row, index) => ({
                key: `${row.mobile || row.name}-${index}`,
                title: row.name,
                subtitle: [row.mobile, row.organization].filter(Boolean).join(' · '),
                meta: `${row.bookings} booking(s)${
                    row.lastBookingAt ? ` · last ${formatDate(row.lastBookingAt)}` : ''
                }`,
                value: money(row.revenue),
                valueHint: row.pending > 0 ? `${money(row.pending)} due` : 'fully paid',
            })),
        [customers.topCustomers],
    );

    const pending = useMemo(
        () => pendingItems(customers.pendingList.slice(0, 20), openBooking),
        [customers.pendingList, openBooking],
    );

    return (
        <View className="gap-7">
            <View>
                <SectionTitle
                    icon={Users}
                    tint={DashboardPalette.blue}
                    title="Customers"
                    sub="New vs repeat, and who owes what"
                />
                <View className="mt-3.5">
                    <AnalyticsKpiGrid cards={cards} />
                </View>
            </View>

            <View>
                <SectionTitle
                    icon={Users}
                    tint={DashboardPalette.green}
                    title="Top Customers"
                    sub="Highest collected in this period"
                />
                <View className="mt-3.5">
                    <AnalyticsRowList
                        items={topCustomers}
                        emptyText="No customers in this period."
                    />
                </View>
            </View>

            <View>
                <SectionTitle
                    icon={Wallet2}
                    tint={DashboardPalette.red}
                    title="Pending Dues"
                    sub="Bookings with a balance — tap to open"
                />
                <View className="mt-3.5">
                    <AnalyticsRowList
                        items={pending}
                        emptyText="Everything is collected for this period."
                    />
                </View>
            </View>
        </View>
    );
};

export default CustomersPanel;
