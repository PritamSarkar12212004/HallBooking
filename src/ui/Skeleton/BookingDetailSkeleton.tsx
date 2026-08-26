import React, { useEffect } from 'react';
import { View, ScrollView } from '../../lib/style/withTailwind';
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
        shimmer.value = withRepeat(withTiming(1, { duration: 1200 }), -1, false);
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        const opacity = interpolate(shimmer.value, [0, 0.5, 1], [0.35, 0.65, 0.35]);
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

const BookingDetailSkeleton = () => {
    return (
        <View className="flex-1">
            <ScrollView
                showsVerticalScrollIndicator={false}
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 50 }}
            >
                {/* Hero Image */}
                <View className="px-4 pt-2">
                    <SkeletonBox width="100%" height={200} borderRadius={24} />
                </View>

                {/* Title + Meta */}
                <View className="px-4 mt-5">
                    <SkeletonBox width="85%" height={28} style={{ marginBottom: 12 }} />
                    <SkeletonBox width="60%" height={14} style={{ marginBottom: 8 }} />
                    <SkeletonBox width="45%" height={14} />
                </View>

                {/* Info Cards */}
                <View className="px-4 mt-6 gap-3">
                    {[1, 2, 3].map((item) => (
                        <View
                            key={item}
                            className="flex-row items-center p-4 rounded-2xl"
                            style={{ backgroundColor: Theme.background.secondary }}
                        >
                            <SkeletonBox width={40} height={40} borderRadius={12} />
                            <View className="ml-3 flex-1">
                                <SkeletonBox width={80} height={12} style={{ marginBottom: 8 }} />
                                <SkeletonBox width={140} height={16} />
                            </View>
                        </View>
                    ))}
                </View>

                {/* Applicant Section */}
                <View className="px-4 mt-8">
                    <SkeletonBox width={140} height={14} style={{ marginBottom: 12 }} />
                    <View
                        className="rounded-2xl p-4"
                        style={{ backgroundColor: Theme.background.secondary }}
                    >
                        {[1, 2, 3, 4, 5].map((item) => (
                            <View
                                key={item}
                                className="flex-row items-center justify-between mb-3.5"
                            >
                                <SkeletonBox width={100} height={14} />
                                <SkeletonBox width={120} height={14} />
                            </View>
                        ))}
                    </View>
                </View>

                {/* Financial Section */}
                <View className="px-4 mt-8">
                    <SkeletonBox width={160} height={14} style={{ marginBottom: 12 }} />
                    <View
                        className="rounded-2xl p-4"
                        style={{ backgroundColor: Theme.background.secondary }}
                    >
                        {[1, 2, 3, 4, 5].map((item) => (
                            <View
                                key={item}
                                className="flex-row items-center justify-between mb-3.5"
                            >
                                <SkeletonBox width={110} height={14} />
                                <SkeletonBox width={90} height={14} />
                            </View>
                        ))}
                    </View>
                </View>

                {/* Team Section */}
                <View className="px-4 mt-8">
                    <SkeletonBox width={130} height={14} style={{ marginBottom: 12 }} />
                    <View
                        className="rounded-2xl p-4"
                        style={{ backgroundColor: Theme.background.secondary }}
                    >
                        {[1, 2, 3].map((item) => (
                            <View key={item} className="flex-row items-center mb-3">
                                <SkeletonBox width={36} height={36} borderRadius={18} />
                                <SkeletonBox width={120} height={14} style={{ marginLeft: 12 }} />
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

export default BookingDetailSkeleton;