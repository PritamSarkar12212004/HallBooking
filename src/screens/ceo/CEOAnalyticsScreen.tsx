import React, { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from '../../lib/style/withTailwind';
import { RefreshCw, TriangleAlert } from 'lucide-react-native';

import MainDerder from '../../components/header/MainDerder';
import DashboardSkeleton from '../../ui/Skeleton/DashboardSkeleton';
import DashboardPalette from '../../const/theme/dashboardPalette';
import { MainRoute } from '../../const/routes/route';
import { useAppSelector } from '../../hooks/redux/redux';
import useGetCeoAnalytics from '../../api/analytics/hooks/useGetCeoAnalytics';

import OverviewPanel from '../../components/ceo/panels/OverviewPanel';
import FinancePanel from '../../components/ceo/panels/FinancePanel';
import EventsPanel from '../../components/ceo/panels/EventsPanel';
import VenuePanel from '../../components/ceo/panels/VenuePanel';
import CustomersPanel from '../../components/ceo/panels/CustomersPanel';
import StaffPanel from '../../components/ceo/panels/StaffPanel';
import DocumentsPanel from '../../components/ceo/panels/DocumentsPanel';
import ReportsPanel from '../../components/ceo/panels/ReportsPanel';

import {
    ANALYTICS_SECTIONS,
    AnalyticsSectionKey,
    DEFAULT_PERIOD,
    PERIOD_OPTIONS,
    formatPeriodRange,
} from '../../functions/ceo/AnalyticsFunction';
import type { AnalyticsPeriodKey } from '../../interface/api/ceoAnalyticsInterface';

/**
 * CEO Business Analytics — 7 sections ek hi screen par.
 *
 * Overview · Finance · Events · Venue · Customers · Staff · Reports.
 * Top par period filter (Today / 7 days / Month / Quarter / Year / All) —
 * badalne par sirf data dobara aata hai, section wahi rehta hai.
 */
const CEOAnalyticsScreen = ({ navigation }: any) => {
    const user = useAppSelector((state) => state.user.user);

    const [period, setPeriod] = useState<AnalyticsPeriodKey>(DEFAULT_PERIOD);
    const [section, setSection] = useState<AnalyticsSectionKey>('overview');
    const [refreshing, setRefreshing] = useState(false);

    const { analytics, isLoading, isFetching, isError, refetch } = useGetCeoAnalytics(
        user?.token,
        period,
    );

    const openBooking = useCallback(
        (id: string) => {
            navigation.navigate(MainRoute.BookingDetail, { id });
        },
        [navigation],
    );

    const openCalendar = useCallback(() => {
        navigation.navigate(MainRoute.FeatureCalendar);
    }, [navigation]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await refetch();
        } finally {
            setRefreshing(false);
        }
    }, [refetch]);

    const panelProps = useMemo(
        () => ({
            analytics: analytics!,
            openBooking,
            openCalendar,
        }),
        [analytics, openBooking, openCalendar],
    );

    const activeSection = ANALYTICS_SECTIONS.find((item) => item.key === section);

    const renderPanel = () => {
        if (!analytics) return null;

        switch (section) {
            case 'finance':
                return <FinancePanel {...panelProps} />;
            case 'events':
                return <EventsPanel {...panelProps} />;
            case 'venue':
                return <VenuePanel {...panelProps} />;
            case 'customers':
                return <CustomersPanel {...panelProps} />;
            case 'staff':
                return <StaffPanel {...panelProps} />;
            case 'documents':
                return <DocumentsPanel {...panelProps} />;
            case 'reports':
                return <ReportsPanel {...panelProps} />;
            case 'overview':
            default:
                return <OverviewPanel {...panelProps} />;
        }
    };

    return (
        <SafeAreaView
            className="flex-1"
            style={{ backgroundColor: DashboardPalette.bg }}
            edges={['top']}
        >
            <View className="px-4">
                <MainDerder
                    navigation={navigation}
                    title="Business Analytics"
                    right={
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={onRefresh}
                            className="w-9 h-9 rounded-xl items-center justify-center"
                            style={{ backgroundColor: DashboardPalette.card }}
                        >
                            {isFetching ? (
                                <ActivityIndicator
                                    size="small"
                                    color={DashboardPalette.goldDeep}
                                />
                            ) : (
                                <RefreshCw size={15} color={DashboardPalette.goldDeep} />
                            )}
                        </TouchableOpacity>
                    }
                />

                {/* Period filter */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 8, paddingBottom: 4 }}
                >
                    {PERIOD_OPTIONS.map((option) => {
                        const active = option.key === period;
                        return (
                            <TouchableOpacity
                                key={option.key}
                                activeOpacity={0.85}
                                onPress={() => setPeriod(option.key)}
                                className="px-3.5 py-2 rounded-full"
                                style={{
                                    backgroundColor: active
                                        ? DashboardPalette.gold
                                        : DashboardPalette.card,
                                    borderWidth: 1,
                                    borderColor: active
                                        ? DashboardPalette.gold
                                        : DashboardPalette.border,
                                }}
                            >
                                <Text
                                    className="text-[11.5px] font-bold"
                                    style={{
                                        color: active
                                            ? DashboardPalette.bg
                                            : DashboardPalette.inkSoft,
                                    }}
                                >
                                    {option.short}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                {/* Section tabs */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 8, paddingTop: 10, paddingBottom: 12 }}
                >
                    {ANALYTICS_SECTIONS.map((item) => {
                        const active = item.key === section;
                        return (
                            <TouchableOpacity
                                key={item.key}
                                activeOpacity={0.85}
                                onPress={() => setSection(item.key)}
                                className="px-3.5 py-2 rounded-xl"
                                style={{
                                    backgroundColor: active
                                        ? DashboardPalette.goldSoft
                                        : DashboardPalette.card,
                                    borderWidth: 1,
                                    borderColor: active
                                        ? DashboardPalette.gold
                                        : DashboardPalette.border,
                                }}
                            >
                                <Text
                                    className="text-[12px] font-extrabold"
                                    style={{
                                        color: active
                                            ? DashboardPalette.goldDeep
                                            : DashboardPalette.inkSoft,
                                    }}
                                >
                                    {item.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            <View className="flex-1">
                {isLoading && !analytics ? (
                    <DashboardSkeleton />
                ) : isError && !analytics ? (
                    <View className="flex-1 items-center justify-center px-8">
                        <TriangleAlert size={28} color={DashboardPalette.red} />
                        <Text
                            className="text-sm font-semibold mt-3 text-center"
                            style={{ color: DashboardPalette.ink }}
                        >
                            Could not load analytics.
                        </Text>
                        <TouchableOpacity
                            activeOpacity={0.85}
                            onPress={onRefresh}
                            className="mt-4 px-5 py-2.5 rounded-full"
                            style={{ backgroundColor: DashboardPalette.gold }}
                        >
                            <Text
                                className="text-xs font-bold"
                                style={{ color: DashboardPalette.bg }}
                            >
                                Try again
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <ScrollView
                        className="flex-1 rounded-t-[28px]"
                        style={{ backgroundColor: DashboardPalette.sheet }}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{
                            paddingHorizontal: 16,
                            paddingTop: 18,
                            paddingBottom: 32,
                        }}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                tintColor={DashboardPalette.goldDeep}
                                colors={[DashboardPalette.goldDeep]}
                                progressBackgroundColor={DashboardPalette.card}
                            />
                        }
                    >
                        {/* Section title + selected period */}
                        <View className="mb-5">
                            <Text
                                className="text-[13px] font-extrabold"
                                style={{ color: DashboardPalette.ink }}
                            >
                                {activeSection?.label}
                            </Text>
                            <Text
                                className="text-[11px] mt-0.5"
                                style={{ color: DashboardPalette.inkSoft }}
                            >
                                {activeSection?.sub}
                                {analytics ? ` · ${formatPeriodRange(analytics.period)}` : ''}
                            </Text>
                        </View>

                        {renderPanel()}
                    </ScrollView>
                )}
            </View>
        </SafeAreaView>
    );
};

export default CEOAnalyticsScreen;
