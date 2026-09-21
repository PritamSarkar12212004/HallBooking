import React, { useEffect } from 'react';
import { View } from '../../lib/style/withTailwind';
import { Theme } from '../../const/theme/Theme';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    interpolate,
} from 'react-native-reanimated';

const SkeletonBox = ({
    width,
    height,
    borderRadius = 8,
    style,
}: {
    width: number | string;
    height: number;
    borderRadius?: number;
    style?: any;
}) => {
    const shimmer = useSharedValue(0);

    useEffect(() => {
        shimmer.value = withRepeat(
            withTiming(1, { duration: 1200 }),
            -1,
            false
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        const opacity = interpolate(shimmer.value, [0, 0.5, 1], [0.4, 0.7, 0.4]);
        return { opacity };
    });

    return (
        <Animated.View
            style={[
                {
                    width,
                    height,
                    borderRadius,
                    backgroundColor: Theme.background.third || '#3A3A40',
                },
                animatedStyle,
                style,
            ]}
        />
    );
};

/** Dashboard ke dark cards ka base style — asli screen ke cardStyle jaisa. */
const cardStyle = {
    backgroundColor: Theme.background.secondary,
    borderWidth: 1,
    borderColor: Theme.border.primary,
};

/** SectionHeader (title + sub) placeholder. */
const SectionHeaderSkeleton = () => (
    <View className="mb-3.5">
        <SkeletonBox width="38%" height={16} />
        <SkeletonBox width="26%" height={11} style={{ marginTop: 6 }} />
    </View>
);

/** KPI card placeholder — icon box + title + value + hint bars. */
const StatCardSkeleton = () => (
    <View className="flex-1 rounded-2xl p-3.5 mb-3" style={cardStyle}>
        <SkeletonBox width={36} height={36} borderRadius={12} />
        <SkeletonBox width="70%" height={11} style={{ marginTop: 10 }} />
        <SkeletonBox width="45%" height={17} style={{ marginTop: 6 }} />
        <SkeletonBox width="55%" height={10} style={{ marginTop: 6 }} />
    </View>
);

/** Event row placeholder — title + meta + amount bar. */
const EventRowSkeleton = () => (
    <View className="rounded-2xl p-3.5 mb-2.5 flex-row items-center" style={cardStyle}>
        <View className="flex-1 pr-2">
            <SkeletonBox width="62%" height={14} />
            <SkeletonBox width="45%" height={11} style={{ marginTop: 6 }} />
            <SkeletonBox width="35%" height={10} style={{ marginTop: 6 }} />
        </View>
        <SkeletonBox width={64} height={13} />
    </View>
);

/** Bar-chart jaisa shimmer — Revenue Trend / Weekly Bookings placeholders. */
export const ChartBarsSkeleton = () => {
    const bars = [96, 150, 64, 172, 112, 78];

    return (
        <View className="flex-row items-end justify-between" style={{ height: 180 }}>
            {bars.map((height, index) => (
                <SkeletonBox key={index} width={22} height={height} borderRadius={6} />
            ))}
        </View>
    );
};

/**
 * CEO Dashboard ka loading shimmer.
 *
 * Asli screen ke layout ko bar-bar mirror karta hai — 6 KPI cards (2 per row),
 * Staff Activity quick link, dono chart cards (Revenue Trend + Weekly
 * Bookings), Today's Events aur Upcoming — taaki data aane par UI jump na kare.
 */
const CeoDashboardSkeleton = () => {
    return (
        <View>
            {/* KPI grid — 3 rows x 2 cards */}
            {[0, 1, 2].map((row) => (
                <View key={row} className="flex-row gap-3">
                    <StatCardSkeleton />
                    <StatCardSkeleton />
                </View>
            ))}

            {/* Staff Activity Calendar quick link */}
            <View className="mt-4 rounded-2xl p-3.5 flex-row items-center" style={cardStyle}>
                <SkeletonBox width={15} height={15} borderRadius={4} />
                <SkeletonBox width="38%" height={12} style={{ marginLeft: 8 }} />
            </View>

            {/* Revenue Trend */}
            <View className="mt-6">
                <SectionHeaderSkeleton />
                <View className="rounded-2xl p-4" style={cardStyle}>
                    <ChartBarsSkeleton />
                </View>
            </View>

            {/* Weekly Bookings */}
            <View className="mt-6">
                <SectionHeaderSkeleton />
                <View className="rounded-2xl p-4" style={cardStyle}>
                    <ChartBarsSkeleton />
                </View>
            </View>

            {/* Today's Events */}
            <View className="mt-6">
                <SectionHeaderSkeleton />
                <EventRowSkeleton />
                <EventRowSkeleton />
            </View>

            {/* Upcoming */}
            <View className="mt-6">
                <SectionHeaderSkeleton />
                <EventRowSkeleton />
                <EventRowSkeleton />
            </View>
        </View>
    );
};

export default CeoDashboardSkeleton;
