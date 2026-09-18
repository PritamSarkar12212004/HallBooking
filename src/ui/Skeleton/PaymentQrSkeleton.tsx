import React, { useEffect } from 'react';
import { View } from '../../lib/style/withTailwind';
import { Theme } from '../../const/theme/Theme';
import Palette from '../../components/profile/const/profilePalette';
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

/**
 * Payment QR screen ka loading shimmer.
 *
 * Jab tak backend se `paymentQr` response nahi aata, screen ka asli layout
 * (Bank Holder Name input → QR upload box → Save button) skeleton ke roop me
 * dikhta hai, taaki load hone par UI jump na kare.
 */
const PaymentQrSkeleton = () => {
    return (
        <View className="pt-2">
            {/* Bank Holder Name input */}
            <SkeletonBox width="42%" height={13} style={{ marginBottom: 10 }} />
            <SkeletonBox width="100%" height={48} borderRadius={12} />

            {/* QR upload box */}
            <View
                className="mt-5 items-center justify-center rounded-3xl py-6 px-4"
                style={{
                    backgroundColor: Palette.surface,
                    borderWidth: 1,
                    borderColor: Palette.border,
                }}
            >
                <SkeletonBox width={56} height={56} borderRadius={16} />
                <SkeletonBox width="45%" height={14} style={{ marginTop: 14 }} />
                <SkeletonBox width="65%" height={11} style={{ marginTop: 10 }} />
            </View>

            {/* Save Payment QR button */}
            <SkeletonBox
                width="100%"
                height={52}
                borderRadius={12}
                style={{ marginTop: 24 }}
            />
        </View>
    );
};

export default PaymentQrSkeleton;
