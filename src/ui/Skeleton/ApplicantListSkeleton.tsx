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
    }, [shimmer]);

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

const ApplicantCardSkeleton = () => {
    return (
        <View
            className="flex-row items-center rounded-2xl p-3 mb-3"
            style={{ backgroundColor: Theme.background.secondary }}
        >
            <SkeletonBox width={56} height={56} borderRadius={16} />
            <View className="flex-1 ml-3">
                <View className="flex-row items-center justify-between">
                    <SkeletonBox width="55%" height={15} />
                    <SkeletonBox width={62} height={14} borderRadius={999} />
                </View>
                <SkeletonBox width="40%" height={13} style={{ marginTop: 10 }} />
                <SkeletonBox width="65%" height={11} style={{ marginTop: 10 }} />
            </View>
        </View>
    );
};

/**
 * Applicant list shimmer.
 *
 * `count`   – kitne placeholder cards (initial load par zyada, filter change
 *             par kam dikhane ke liye).
 * `className` – outer padding control; Wrapper already horizontal padding
 *             deta hai, isliye default me sirf top spacing rakhi hai taaki
 *             skeleton aur asli cards exactly align karein.
 */
const ApplicantListSkeleton = ({
    count = 6,
    className = 'pt-2',
}: {
    count?: number;
    className?: string;
}) => {
    return (
        <View className={className}>
            {Array.from({ length: count }, (_, index) => (
                <ApplicantCardSkeleton key={index} />
            ))}
        </View>
    );
};

export default ApplicantListSkeleton;