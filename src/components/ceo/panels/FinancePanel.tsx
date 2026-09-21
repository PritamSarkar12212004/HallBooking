import React, { useMemo } from 'react';
import { View } from '../../../lib/style/withTailwind';
import { CreditCard, FileText, ReceiptIndianRupee } from 'lucide-react-native';
import DashboardPalette from '../../../const/theme/dashboardPalette';
import SectionTitle from '../../card/dashboard/SectionTitle';
import AnalyticsBarList from '../AnalyticsBarList';
import AnalyticsKpiGrid from '../AnalyticsKpiGrid';
import AnalyticsRowList from '../AnalyticsRowList';
import { eventRevenueItems, paymentItems } from '../panelItems';
import type { AnalyticsPanelProps } from '../panelTypes';
import {
    buildFinanceCards,
    modeRows,
} from '../../../functions/ceo/AnalyticsFunction';

/** 💰 Finance — collection kahan se aaya, kya baaki hai, har payment. */
const FinancePanel = ({ analytics, openBooking }: AnalyticsPanelProps) => {
    const { finance } = analytics;

    const cards = useMemo(() => buildFinanceCards(finance), [finance]);
    const modes = useMemo(() => modeRows(finance), [finance]);
    const payments = useMemo(
        () => paymentItems(finance.paymentHistory.slice(0, 15), openBooking),
        [finance.paymentHistory, openBooking],
    );
    const revenueEvents = useMemo(
        () => eventRevenueItems(finance.eventWiseRevenue.slice(0, 12), openBooking),
        [finance.eventWiseRevenue, openBooking],
    );

    return (
        <View className="gap-7">
            <View>
                <SectionTitle
                    icon={ReceiptIndianRupee}
                    tint={DashboardPalette.green}
                    title="Finance"
                    sub="Collection, dues and deposits"
                />
                <View className="mt-3.5">
                    <AnalyticsKpiGrid cards={cards} />
                </View>
            </View>

            <View>
                <SectionTitle
                    icon={CreditCard}
                    tint={DashboardPalette.blue}
                    title="Collection by Mode"
                    sub="Cash · UPI · Cheque · NEFT/RTGS"
                />
                <View className="mt-3.5">
                    <AnalyticsBarList
                        rows={modes}
                        emptyText="No payment received in this period."
                    />
                </View>
            </View>

            <View>
                <SectionTitle
                    icon={FileText}
                    tint={DashboardPalette.violet}
                    title="Payment History"
                    sub="Latest payments received in this period"
                />
                <View className="mt-3.5">
                    <AnalyticsRowList
                        items={payments}
                        emptyText="No payments recorded in this period."
                    />
                </View>
            </View>

            <View>
                <SectionTitle
                    icon={ReceiptIndianRupee}
                    tint={DashboardPalette.gold}
                    title="Event-wise Revenue"
                    sub="Billed vs collected, highest first"
                />
                <View className="mt-3.5">
                    <AnalyticsRowList
                        items={revenueEvents}
                        emptyText="No bookings in this period."
                    />
                </View>
            </View>
        </View>
    );
};

export default FinancePanel;
