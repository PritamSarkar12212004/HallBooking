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

const TermsSkeleton = () => {
    return (
        <View className="mt-2">
            {/* Numbered terms row skeletons */}
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <View key={i} className="flex-row items-start mb-5">
                    <SkeletonBox width={24} height={24} borderRadius={12} style={{ marginRight: 12 }} />
                    <View className="flex-1">
                        <SkeletonBox width="100%" height={14} style={{ marginBottom: 6 }} />
                        <SkeletonBox width="85%" height={14} />
                    </View>
                </View>
            ))}

            {/* Acceptance box skeleton */}
            <SkeletonBox width="100%" height={96} borderRadius={16} style={{ marginTop: 8 }} />
        </View>
    );
};

export default TermsSkeleton;