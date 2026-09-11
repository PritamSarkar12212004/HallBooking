import React, { useEffect } from 'react';
import {
    View,
} from '../../lib/style/withTailwind';

import { Theme } from '../../const/theme/Theme';
import { useNavigation } from '@react-navigation/native';
import { route } from '../../const/routes/route';

import { readStorage } from '../../manager/storage/storageManager';
import token from '../../const/token/token';
import { useAppDispatch } from '../../hooks/redux/redux';
import { setUser } from '../../store/slices/userSlice';
import { storageToken } from '../../const/token/storageToken';

import FastImage from 'react-native-fast-image';
import ImgConst from '../../const/img/ImgConst';

import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    cancelAnimation,
} from 'react-native-reanimated';

const AnimatedFastImage =
    Animated.createAnimatedComponent(FastImage);

const SplashScreen = () => {
    const navigation = useNavigation();
    const dispatch = useAppDispatch();

    // Start from 0
    const scale = useSharedValue(0);

    useEffect(() => {
        // 0 → 1 : Zoom in only once
        scale.value = withTiming(
            1,
            {
                duration: 1200,
            },
            (finished) => {
                if (finished) {
                    // Navigation must happen on JS thread
                }
            },
        );

        // Navigate after animation
        const timer = setTimeout(() => {
            cancelAnimation(scale);

            const checkAuth = async () => {
                try {
                    const isAuth = readStorage({
                        key: token.isAuth,
                    });

                    const tokenKey = readStorage({
                        key: storageToken,
                    });

                    if (isAuth && tokenKey) {
                        const stored = readStorage({
                            key: token.isAuthData,
                        });

                        let data: any = null;

                        try {
                            data = stored
                                ? JSON.parse(stored)
                                : null;
                        } catch {
                            data = null;
                        }

                        if (data) {
                            dispatch(
                                setUser({
                                    phone: data?.phone,
                                    photo: data?.photo,
                                    name: data?.name,
                                    gender: data?.gender,
                                    email: data?.email,
                                    city: data?.city,
                                    _id: data?._id,
                                    token: tokenKey,
                                }),
                            );
                        }

                        navigation.reset({
                            index: 0,
                            routes: [
                                {
                                    name: route.home as never,
                                },
                            ],
                        });
                    } else {
                        navigation.reset({
                            index: 0,
                            routes: [
                                {
                                    name: route.login as never,
                                },
                            ],
                        });
                    }
                } catch (error) {
                    console.log(
                        'Auth check error:',
                        error,
                    );

                    navigation.reset({
                        index: 0,
                        routes: [
                            {
                                name: route.login as never,
                            },
                        ],
                    });
                }
            };

            checkAuth();
        }, 1500);

        return () => {
            clearTimeout(timer);
            cancelAnimation(scale);
        };
    }, [navigation, dispatch, scale]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    scale: scale.value,
                },
            ],
        };
    });

    return (
        <View
            className="flex-1 items-center justify-center"
            style={{
                backgroundColor: Theme.background.primary,
            }}
        >
            <AnimatedFastImage
                source={ImgConst.MainImg}
                resizeMode={FastImage.resizeMode.contain}
                style={[
                    {
                        width: '55%',
                        aspectRatio: 1,
                        maxWidth: 220,
                        maxHeight: 220,
                    },
                    animatedStyle,
                ]}
            />
        </View>
    );
};

export default SplashScreen;