import React, { useEffect } from 'react';
import { ScrollView, View } from '../../lib/style/withTailwind';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    interpolate,
} from 'react-native-reanimated';

// Mirrors HomeScreen's dark soft palette so the skeleton matches the real design.
const C = {
    sheet: '#1A1D24',
    card: '#232733',
    border: '#2A2F3A',
    block: '#343A46',
    goldSoft: 'rgba(212, 175, 55, 0.22)',
    greenSoft: 'rgba(52, 211, 153, 0.18)',
    redSoft: 'rgba(248, 113, 113, 0.18)',
    blueSoft: 'rgba(96, 165, 250, 0.18)',
    violetSoft: 'rgba(167, 139, 250, 0.18)',
};

const SkeletonBox = ({
    width,
    height,
    borderRadius = 8,
    style,
    color = C.block,
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

// ── Golden revenue hero (label + big number + progress + 2 pills) ──
const HeroSkeleton = () => (
    <View
        className="rounded-[26px] p-5"
        style={{ backgroundColor: C.card, borderWidth: 1, borderColor: C.border }}
    >
        <View className="flex-row items-center justify-between">
            <SkeletonBox width={120} height={14} borderRadius={7} color={C.goldSoft} />
            <SkeletonBox width={18} height={18} borderRadius={9} color={C.goldSoft} />
        </View>
        <SkeletonBox width="54%" height={40} style={{ marginTop: 10 }} />

        <View className="mt-5">
            <View className="flex-row items-center justify-between mb-2">
                <SkeletonBox width={100} height={12} />
                <SkeletonBox width={34} height={12} />
            </View>
            <SkeletonBox width="100%" height={10} borderRadius={5} color={C.goldSoft} />
        </View>

        <View className="flex-row gap-2 mt-5">
            <SkeletonBox width="48%" height={38} borderRadius={12} color={C.sheet} />
            <SkeletonBox width="48%" height={38} borderRadius={12} color={C.sheet} />
        </View>
    </View>
);

// ── Quick action card (icon tile + 2 lines) ──
const QuickActionSkeleton = ({ tint }: { tint: string }) => (
    <View
        className="flex-1 rounded-2xl p-4"
        style={{ backgroundColor: C.card, borderWidth: 1, borderColor: C.border }}
    >
        <SkeletonBox width={40} height={40} borderRadius={12} color={tint} />
        <SkeletonBox width="72%" height={13} style={{ marginTop: 12 }} />
        <SkeletonBox width="55%" height={10} style={{ marginTop: 7 }} />
    </View>
);

// ── KPI tile (icon + big value + label) ──
const KpiSkeleton = ({ tint }: { tint: string }) => (
    <View
        className="w-[48%] rounded-2xl p-4 mb-3"
        style={{ backgroundColor: C.card, borderWidth: 1, borderColor: C.border }}
    >
        <SkeletonBox width={40} height={40} borderRadius={12} color={tint} />
        <SkeletonBox width="50%" height={22} style={{ marginTop: 14 }} />
        <SkeletonBox width="64%" height={11} style={{ marginTop: 8 }} />
    </View>
);

// ── Section title (icon tile + title + sub) ──
const SectionTitleSkeleton = ({ tint }: { tint: string }) => (
    <View className="flex-row items-center gap-2.5">
        <SkeletonBox width={36} height={36} borderRadius={12} color={tint} />
        <View className="flex-1">
            <SkeletonBox width="58%" height={16} />
            <SkeletonBox width="40%" height={10} style={{ marginTop: 6 }} />
        </View>
    </View>
);

// ── Weekly bookings chart (bars + label row) ──
const WeeklyChartSkeleton = () => {
    const heights = [48, 72, 36, 60, 26, 80, 52];
    return (
        <View
            className="rounded-3xl p-5"
            style={{ backgroundColor: C.card, borderWidth: 1, borderColor: C.border }}
        >
            <View className="flex-row items-end justify-between h-[110px]">
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
                    <SkeletonBox key={i} width={22} height={8} />
                ))}
            </View>
        </View>
    );
};

// ── Event row (icon tile + 2 lines + chips + time) ──
const EventRowSkeleton = () => (
    <View
        className="rounded-2xl p-4 mb-3"
        style={{ backgroundColor: C.card, borderWidth: 1, borderColor: C.border }}
    >
        <View className="flex-row items-center gap-3">
            <SkeletonBox width={44} height={44} borderRadius={16} color={C.goldSoft} />
            <View className="flex-1">
                <SkeletonBox width="58%" height={15} />
                <SkeletonBox width="44%" height={11} style={{ marginTop: 6 }} />
            </View>
            <SkeletonBox width={17} height={17} borderRadius={9} />
        </View>
        <View className="flex-row items-center mt-4">
            <SkeletonBox width={14} height={14} borderRadius={7} />
            <SkeletonBox width={150} height={11} style={{ marginLeft: 8 }} />
        </View>
        <View
            className="flex-row items-center justify-between mt-4 pt-4"
            style={{ borderTopWidth: 1, borderTopColor: C.border }}
        >
            <SkeletonBox width="36%" height={12} />
            <View className="flex-row items-center gap-2">
                <SkeletonBox width={58} height={22} borderRadius={99} />
                <SkeletonBox width={64} height={22} borderRadius={99} />
            </View>
        </View>
    </View>
);

// ── Full HomeScreen skeleton (mirrors HomeScreen layout) ──
const HomeScreenSkeleton = () => (
    <ScrollView
        className="flex-1 rounded-t-[28px]"
        style={{ backgroundColor: C.sheet }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 18, paddingBottom: 28 }}
    >
        <HeroSkeleton />

        {/* Quick actions */}
        <View className="flex-row gap-3 mt-5">
            <QuickActionSkeleton tint={C.goldSoft} />
            <QuickActionSkeleton tint={C.blueSoft} />
        </View>

        {/* KPI grid */}
        <View className="flex-row flex-wrap justify-between mt-3">
            <KpiSkeleton tint={C.goldSoft} />
            <KpiSkeleton tint={C.redSoft} />
            <KpiSkeleton tint={C.blueSoft} />
            <KpiSkeleton tint={C.violetSoft} />
        </View>

        {/* Weekly chart */}
        <View className="mt-2">
            <View className="flex-row items-end justify-between mb-4">
                <SectionTitleSkeleton tint={C.goldSoft} />
                <SkeletonBox width={74} height={26} borderRadius={99} color={C.greenSoft} />
            </View>
            <WeeklyChartSkeleton />
        </View>

        {/* Today's events */}
        <View className="mt-7">
            <View className="flex-row items-end justify-between mb-4">
                <SectionTitleSkeleton tint={C.greenSoft} />
                <SkeletonBox width={52} height={18} />
            </View>
            {[1, 2].map((i) => (
                <EventRowSkeleton key={i} />
            ))}
        </View>

        {/* Upcoming events */}
        <View className="mt-7">
            <View className="flex-row items-end justify-between mb-4">
                <SectionTitleSkeleton tint={C.violetSoft} />
                <SkeletonBox width={52} height={18} />
            </View>
            {[1, 2].map((i) => (
                <EventRowSkeleton key={i} />
            ))}
        </View>
    </ScrollView>
);

export default HomeScreenSkeleton;
