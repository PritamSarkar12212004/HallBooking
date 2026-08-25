import React, { useEffect } from 'react';
import {
    View,
    Text,
    ActivityIndicator,
} from '../../lib/style/withTailwind';

import { Theme } from '../../const/theme/Theme';
import { Building2 } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { route } from '../../const/routes/route';

import { readStorage } from '../../manager/storage/storageManager';
import token from '../../const/token/token';
import { useAppDispatch } from '../../hooks/redux/redux';
import { setUser } from '../../store/slices/userSlice';

const SplashScreen = () => {
    const navigation = useNavigation();
    const dispatch = useAppDispatch()
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const isAuth = readStorage({
                    key: token.isAuth,
                });
                if (isAuth) {
                    const stored = readStorage({ key: token.isAuthData });
                    let data: any = null;
                    try {
                        data = stored ? JSON.parse(stored) : null;
                    } catch (e) {
                        data = null;
                    }
                    dispatch(
                        setUser({
                            phone: data?.phone,
                            photo: data?.photo,
                            name: data?.name,
                            gender: data?.gender,
                            email: data?.email,
                            city: data?.city,
                            _id: data?._id,
                            token: "sss"
                        }),
                    );
                    navigation.reset({
                        index: 0,
                        routes: [
                            {
                                name: route.home,
                            },
                        ],
                    });
                } else {
                    navigation.reset({
                        index: 0,
                        routes: [
                            {
                                name: route.onboard,
                            },
                        ],
                    });
                }
            } catch (error) {
                console.log('Auth check error:', error);

                navigation.reset({
                    index: 0,
                    routes: [
                        {
                            name: route.onboard,
                        },
                    ],
                });
            }
        };
        checkAuth();
    }, [navigation]);

    return (
        <View
            className="flex-1 items-center justify-center"
            style={{
                backgroundColor: Theme.background.primary,
            }}
        >
            <View
                className="w-24 h-24 rounded-3xl items-center justify-center mb-6"
                style={{
                    backgroundColor: Theme.button.primary,
                }}
            >
                <Building2
                    size={48}
                    color={Theme.background.primary}
                />
            </View>

            <Text className="text-white text-2xl font-bold">
                Hall Booking
            </Text>

            <Text className="text-[#8F8B91] text-sm mt-2">
                Manage your events seamlessly
            </Text>

            <ActivityIndicator
                size="large"
                color={Theme.button.primary}
                className="mt-8"
            />
        </View>
    );
};

export default SplashScreen;