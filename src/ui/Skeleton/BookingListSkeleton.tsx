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

const BookingCardSkeleton = () => {
    return (
        <View
            className="rounded-2xl overflow-hidden mb-4"
            style={{ backgroundColor: Theme.background.secondary }}
        >
            <SkeletonBox width="100%" height={160} borderRadius={0} />
            <View className="">
                <SkeletonBox width="70%" height={18} style={{ marginBottom: 12 }} />
                <SkeletonBox width="50%" height={14} style={{ marginBottom: 16 }} />
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                        <SkeletonBox width={90} height={14} />
                        <SkeletonBox width={70} height={14} style={{ marginLeft: 12 }} />
                    </View>
                    <SkeletonBox width={80} height={14} />
                </View>
            </View>
        </View>
    );
};

const BookingListSkeleton = () => {
    return (
        <View className="px-4 pt-2">
            {[1, 2, 3, 4].map((item) => (
                <BookingCardSkeleton key={item} />
            ))}
        </View>
    );
};

export default BookingListSkeleton;