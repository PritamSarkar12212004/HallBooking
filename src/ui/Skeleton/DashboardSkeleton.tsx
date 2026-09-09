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

const StatCardSkeleton = () => (
    <View
        className="w-[150px] rounded-2xl p-4 mr-3"
        style={{ backgroundColor: Theme.background.secondary }}
    >
        <SkeletonBox width={38} height={38} borderRadius={10} style={{ marginBottom: 12 }} />
        <SkeletonBox width="60%" height={12} />
        <SkeletonBox width="45%" height={16} style={{ marginTop: 8 }} />
    </View>
);

const ChartSkeleton = () => (
    <View
        className="rounded-2xl p-5"
        style={{ backgroundColor: Theme.background.secondary }}
    >
        <SkeletonBox width="40%" height={16} style={{ marginBottom: 18 }} />
        <SkeletonBox width="100%" height={120} borderRadius={10} />
    </View>
);

const EventRowSkeleton = () => (
    <View
        className="rounded-2xl p-4 mb-3"
        style={{ backgroundColor: Theme.background.secondary }}
    >
        <SkeletonBox width="55%" height={15} style={{ marginBottom: 10 }} />
        <SkeletonBox width="35%" height={13} style={{ marginBottom: 14 }} />
        <SkeletonBox width="45%" height={12} />
    </View>
);

const DashboardSkeleton = () => (
    <View className="px-4 pt-4">
        <View className="flex-row">
            {[1, 2].map((i) => (
                <StatCardSkeleton key={i} />
            ))}
        </View>
        <ChartSkeleton />
        <View className="mt-5">
            {[1, 2, 3].map((i) => (
                <EventRowSkeleton key={i} />
            ))}
        </View>
    </View>
);

export default DashboardSkeleton;