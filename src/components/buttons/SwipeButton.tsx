import React, { useCallback, useState } from 'react';
import { LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Text } from '../../lib/style/withTailwind';
import { ChevronRight } from 'lucide-react-native';

const THUMB = 52;
const PAD = 4;

type Props = {
  label?: string;
  onComplete: () => void;
  bg?: string;
  accent?: string;
  border?: string;
  textColor?: string;
};

const SwipeButton = ({
  label = 'Swipe to continue',
  onComplete,
  bg = '#1F1F2A',
  accent = '#8B5CF6',
  border = '#2A2A36',
  textColor = '#FFFFFF',
}: Props) => {
  const [trackWidth, setTrackWidth] = useState(0);
  const x = useSharedValue(0);
  const done = useSharedValue(0);

  const maxX = Math.max(0, trackWidth - THUMB - PAD * 2);

  const onLayout = (e: LayoutChangeEvent) => {
    setTrackWidth(e.nativeEvent.layout.width);
  };

  const handleComplete = useCallback(() => {
    onComplete?.();
    setTimeout(() => {
      x.value = withTiming(0, { duration: 180 });
      done.value = 0;
    }, 800);
  }, [onComplete, x, done]);

  const pan = Gesture.Pan()
    .activeOffsetX([-8, 8])
    .onUpdate(e => {
      if (done.value === 1 || maxX <= 0) return;
      x.value = Math.min(Math.max(0, e.translationX), maxX);
    })
    .onEnd(() => {
      if (done.value === 1) return;
      if (x.value >= maxX * 0.92) {
        x.value = withTiming(maxX, { duration: 120 }, finished => {
          if (finished) {
            done.value = 1;
            runOnJS(handleComplete)();
          }
        });
      } else {
        x.value = withSpring(0, { damping: 18, stiffness: 180 });
      }
    });

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
  }));

  const fillStyle = useAnimatedStyle(() => ({
    width: x.value + THUMB + PAD * 2,
  }));

  const labelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      x.value,
      [0, Math.max(1, maxX * 0.5)],
      [1, 0],
      Extrapolation.CLAMP,
    ),
  }));

  const checkStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      x.value,
      [Math.max(1, maxX * 0.7), maxX],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        onLayout={onLayout}
        style={{
          height: THUMB + PAD * 2,
          borderRadius: 999,
          backgroundColor: bg,
          borderWidth: 1,
          borderColor: border,
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <Animated.View
          style={[
            {
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              backgroundColor: accent,
              borderRadius: 999,
            },
            fillStyle,
          ]}
        />

        <Animated.View
          style={[
            { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
            labelStyle,
          ]}
          pointerEvents="none"
        >
          <Text
            style={{
              color: textColor,
              fontWeight: '700',
              fontSize: 14,
              letterSpacing: 0.4,
            }}
          >
            {label}
          </Text>
        </Animated.View>

        <Animated.View
          style={[
            { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
            checkStyle,
          ]}
          pointerEvents="none"
        >
          <Text
            style={{
              color: '#FFFFFF',
              fontWeight: '800',
              fontSize: 14,
              letterSpacing: 0.4,
            }}
          >
            Done
          </Text>
        </Animated.View>

        <Animated.View
          style={[
            {
              width: THUMB,
              height: THUMB,
              borderRadius: THUMB / 2,
              backgroundColor: accent,
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: PAD,
            },
            thumbStyle,
          ]}
        >
          <ChevronRight size={22} color="#FFFFFF" />
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
};

export default SwipeButton;
