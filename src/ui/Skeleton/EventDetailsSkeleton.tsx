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

const EventDetailsSkeleton = () => {
    return (
        <View className="px-4 pt-2">
            {/* Expected attendance */}
            <SkeletonBox width="40%" height={15} style={{ marginBottom: 10 }} />
            <SkeletonBox width="100%" height={52} borderRadius={12} style={{ marginBottom: 24 }} />

            {/* Event type selector chips */}
            <SkeletonBox width="45%" height={15} style={{ marginBottom: 12 }} />
            <View className="flex-row flex-wrap gap-2 mb-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <SkeletonBox
                        key={i}
                        width={i % 3 === 0 ? 110 : 90}
                        height={36}
                        borderRadius={18}
                        style={{ marginRight: 4 }}
                    />
                ))}
            </View>

            {/* Hall requirements chips */}
            <SkeletonBox width="50%" height={15} style={{ marginBottom: 12 }} />
            <View className="flex-row flex-wrap gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <SkeletonBox
                        key={i}
                        width={i % 2 === 0 ? 120 : 100}
                        height={36}
                        borderRadius={18}
                        style={{ marginRight: 4 }}
                    />
                ))}
            </View>
        </View>
    );
};

export default EventDetailsSkeleton;