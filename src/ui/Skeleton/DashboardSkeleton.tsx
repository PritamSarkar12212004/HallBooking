import React, { useEffect } from 'react';
import { ScrollView, View } from '../../lib/style/withTailwind';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    interpolate,
} from 'react-native-reanimated';

const C = {
    surface: '#1A1D24',
    surfaceLight: '#232733',
    border: '#2A2F3A',
    goldSoft: 'rgba(248, 239, 203, 0.12)',
    greenSoft: 'rgba(52, 211, 153, 0.12)',
    redSoft: 'rgba(248, 113, 113, 0.12)',
    blueSoft: 'rgba(96, 165, 250, 0.12)',
    purpleSoft: 'rgba(167, 139, 250, 0.12)',
};

const SkeletonBox = ({
    width,
    height,
    borderRadius = 8,
    style,
    color = '#3A3A40',
}: {
    width: number | string;
    height: number;
    borderRadius?: number;
    style?: any;
    color?: string;
}) => {
    const shimmer = useSharedValue(0);

    useEffect(() => {
        shimmer.value = withRepeat(
            withTiming(1, { duration: 1300 }),
            -1,
            false
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        const opacity = interpolate(shimmer.value, [0, 0.5, 1], [0.35, 0.7, 0.35]);
        return { opacity };
    });

    return (
        <Animated.View
            style={[
                { width, height, borderRadius, backgroundColor: color },
                animatedStyle,
                style,
            ]}
        />
    );
};

// ── Overview strip ──
const OverviewSkeleton = () => (
    <View className="px-5 mt-1">
        <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
                <SkeletonBox width={18} height={18} borderRadius={6} />
                <SkeletonBox width={110} height={18} />
            </View>
            <SkeletonBox
                width={36}
                height={36}
                borderRadius={12}
                color={C.surfaceLight}
                style={{ borderWidth: 1, borderColor: C.border }}
            />
        </View>
    </View>
);

// ── Stat card (matches w-[158px] with icon tile + chevron + title + value) ──
const StatCardSkeleton = () => (
    <View
        className="w-[158px] rounded-2xl p-4"
        style={{ backgroundColor: C.surfaceLight, borderWidth: 1, borderColor: C.border }}
    >
        <View className="flex-row items-center justify-between mb-3">
            <SkeletonBox width={40} height={40} borderRadius={12} />
            <SkeletonBox width={14} height={14} borderRadius={7} />
        </View>
        <SkeletonBox width="65%" height={11} />
        <SkeletonBox width="50%" height={22} style={{ marginTop: 8 }} />
    </View>
);

// ── Section header (icon tile + title + optional right badge) ──
const SectionHeaderSkeleton = ({
    rightBadge = false,
}: { rightBadge?: boolean }) => (
    <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-2">
            <SkeletonBox width={18} height={18} borderRadius={6} />
            <SkeletonBox width={140} height={18} />
        </View>
        {rightBadge && (
            <SkeletonBox width={74} height={26} borderRadius={99} color={C.goldSoft} />
        )}
    </View>
);

// ── Chart card shell (matches rounded-2xl p-5 surface) ──
const ChartShellSkeleton = ({ children }: { children: React.ReactNode }) => (
    <View
        className="rounded-2xl p-5"
        style={{ backgroundColor: C.surfaceLight, borderWidth: 1, borderColor: C.border }}
    >
        {children}
    </View>
);

// ── Revenue trend: gold area line skeleton ──
const RevenueTrendSkeleton = () => {
    const heights = [36, 58, 44, 78, 62, 96];
    return (
        <View className="mt-7 px-5">
            <SectionHeaderSkeleton rightBadge />
            <ChartShellSkeleton>
                <View className="flex-row items-end justify-between h-[120px]">
                    {heights.map((h, i) => (
                        <SkeletonBox
                            key={i}
                            width={26}
                            height={h}
                            borderRadius={6}
                            color={C.goldSoft}
                        />
                    ))}
                </View>
                <View className="flex-row justify-between mt-3">
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                        <SkeletonBox key={i} width={22} height={8} />
                    ))}
                </View>
            </ChartShellSkeleton>
        </View>
    );
};

// ── Weekly bookings: gold bar chart + growth badge ──
const WeeklyBookingsSkeleton = () => {
    const heights = [40, 68, 30, 56, 24, 76, 48];
    return (
        <View className="mt-7 px-5">
            <SectionHeaderSkeleton rightBadge />
            <ChartShellSkeleton>
                <View className="flex-row items-end justify-between h-[120px]">
                    {heights.map((h, i) => (
                        <SkeletonBox
                            key={i}
                            width={24}
                            height={h}
                            borderRadius={8}
                            color={C.goldSoft}
                        />
                    ))}
                </View>
                <View className="flex-row justify-between mt-3">
                    {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                        <SkeletonBox key={i} width={24} height={8} />
                    ))}
                </View>
            </ChartShellSkeleton>
        </View>
    );
};

// ── Payment status: donut + legend chips ──
const PaymentStatusSkeleton = () => (
    <View className="mt-7 px-5">
        <SectionHeaderSkeleton />
        <ChartShellSkeleton>
            <View className="items-center">
                <SkeletonBox
                    width={140}
                    height={140}
                    borderRadius={70}
                    color={C.surfaceLight}
                    style={{ borderWidth: 10, borderColor: C.border }}
                />
            </View>
            <View className="flex-row items-center justify-center flex-wrap mt-4" style={{ gap: 8 }}>
                {[0, 1, 2].map((i) => (
                    <SkeletonBox key={i} width={84} height={22} borderRadius={99} />
                ))}
            </View>
        </ChartShellSkeleton>
    </View>
);

// ── Hall demand: horizontal bars ──
const HallDemandSkeleton = () => (
    <View className="mt-7 px-5">
        <SectionHeaderSkeleton />
        <ChartShellSkeleton>
            {[82, 64, 48, 36, 24].map((w, i) => (
                <View key={i} className="flex-row items-center gap-3 mb-3">
                    <SkeletonBox width={34} height={16} borderRadius={6} />
                    <SkeletonBox
                        width={`${w}%`}
                        height={12}
                        borderRadius={6}
                        color={C.purpleSoft}
                    />
                </View>
            ))}
        </ChartShellSkeleton>
    </View>
);

// ── Event row (matches EventRow: icon tile + 2 lines + chips + time) ──
const EventRowSkeleton = () => (
    <View
        className="rounded-2xl p-4 mb-3"
        style={{ backgroundColor: C.surfaceLight, borderWidth: 1, borderColor: C.border }}
    >
        <View className="flex-row items-start justify-between">
            <View className="flex-1">
                <View className="flex-row items-center gap-2 mb-2">
                    <SkeletonBox width={32} height={32} borderRadius={10} />
                    <View className="flex-1">
                        <SkeletonBox width="55%" height={15} />
                        <SkeletonBox width="35%" height={10} style={{ marginTop: 6 }} />
                    </View>
                </View>
                <SkeletonBox width="45%" height={12} />
            </View>
            <View className="items-end gap-1.5">
                <SkeletonBox width={64} height={20} borderRadius={99} />
                <SkeletonBox width={64} height={20} borderRadius={99} />
            </View>
        </View>
        <View className="flex-row items-center gap-2 mt-3 ml-10">
            <SkeletonBox width={14} height={14} borderRadius={7} />
            <SkeletonBox width={110} height={10} />
        </View>
    </View>
);

// ── Event list section (title + N rows) ──
const EventListSkeleton = ({ rows = 3 }: { rows?: number }) => (
    <View className="mt-7 px-5">
        <SectionHeaderSkeleton />
        {Array.from({ length: rows }).map((_, i) => (
            <EventRowSkeleton key={i} />
        ))}
    </View>
);

// ── Full dashboard skeleton (mirrors CEODashboardScreen layout) ──
const DashboardSkeleton = () => (
    <ScrollView
        className="flex-1 rounded-t-[28px]"
        style={{ backgroundColor: C.surface }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 18, paddingBottom: 28 }}
    >
        <OverviewSkeleton />

        {/* Horizontal stat cards */}
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, gap: 12 }}
        >
            {[1, 2, 3, 4].map((i) => (
                <StatCardSkeleton key={i} />
            ))}
        </ScrollView>

        <RevenueTrendSkeleton />
        <WeeklyBookingsSkeleton />
        <PaymentStatusSkeleton />
        <HallDemandSkeleton />

        {/* Today's events */}
        <View className="mt-7 px-5">
            <SectionHeaderSkeleton />
            {[1, 2].map((i) => (
                <EventRowSkeleton key={i} />
            ))}
        </View>

        {/* Upcoming events */}
        <EventListSkeleton rows={2} />

        {/* Recent bookings */}
        <EventListSkeleton rows={2} />
    </ScrollView>
);

export default DashboardSkeleton;
