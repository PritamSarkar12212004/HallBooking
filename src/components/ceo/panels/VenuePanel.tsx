import React, { useMemo } from 'react';
import { View } from '../../../lib/style/withTailwind';
import { Building2, Gauge } from 'lucide-react-native';
import DashboardPalette from '../../../const/theme/dashboardPalette';
import SectionTitle from '../../card/dashboard/SectionTitle';
import AnalyticsBarList from '../AnalyticsBarList';
import AnalyticsKpiGrid from '../AnalyticsKpiGrid';
import type { AnalyticsPanelProps } from '../panelTypes';
import {
    buildVenueCards,
    hallUtilizationRows,
} from '../../../functions/ceo/AnalyticsFunction';

/** 🏢 Venue — hall-wise revenue, utilization aur availability. */
const VenuePanel = ({ analytics }: AnalyticsPanelProps) => {
    const { venue } = analytics;

    const cards = useMemo(() => buildVenueCards(venue), [venue]);
    const halls = useMemo(() => hallUtilizationRows(venue), [venue]);

    return (
        <View className="gap-7">
            <View>
                <SectionTitle
                    icon={Building2}
                    tint={DashboardPalette.violet}
                    title="Venue / Hall"
                    sub="Availability and hall-wise performance"
                />
                <View className="mt-3.5">
                    <AnalyticsKpiGrid cards={cards} />
                </View>
            </View>

            <View>
                <SectionTitle
                    icon={Gauge}
                    tint={DashboardPalette.gold}
                    title="Hall Performance"
                    sub="Bar = % of days the hall stayed booked"
                />
                <View className="mt-3.5">
                    <AnalyticsBarList
                        rows={halls}
                        emptyText="No halls configured yet."
                    />
                </View>
            </View>
        </View>
    );
};

export default VenuePanel;
