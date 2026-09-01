import React, { useCallback, useState } from 'react';
import type { Asset } from 'react-native-image-picker';

import Wrapper from '../../layouts/wraper/Wraper';
import MainDerder from '../../components/header/MainDerder';

import {
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from '../../lib/style/withTailwind';

import { Theme } from '../../const/theme/Theme';

import {
    Camera,
    Check,
    LogOut,
    Mail,
    MapPin,
    Pencil,
    PersonStanding,
    Phone,
    UserRound,
} from 'lucide-react-native';

import InputField from '../../components/input/InputField';
import MainButton from '../../components/buttons/MainButton';
import { pickFromGallery } from '../../module/ImagePickerModule';
import { route as appRoute } from '../../const/routes/route';
import { useAppDispatch, useAppSelector } from '../../hooks/redux/redux';
import { clearUser, updateUser } from '../../store/slices/userSlice';
import {
    removeStorage,
    writeStorage,
} from '../../manager/storage/storageManager';
import token from '../../const/token/token';
import useUpdateProfile from '../../api/auth/hooks/auth/useUpdateProfile';
import uploadImage from '../../services/Cloudinary/uploadImg';
import { showMessage } from 'react-native-flash-message';

const ProfileScreen = ({ navigation }: any) => {
    const data = useAppSelector((state) => state.user.user)
    const dispatch = useAppDispatch();

    const [activeEdit, setActiveEdit] = useState<boolean>(false);
    const [name, setName] = useState<string | any>(data?.name);
    const [email, setEmail] = useState<string | any>(data?.email);
    const [city, setCity] = useState<string | any>(data?.city);
    const [number, setNumber] = useState<string | any>(data?.phone);
    const [saving, setSaving] = useState<boolean>(false)
    const [img, setImg] = useState<Asset | null | any>(data?.photo);

    const { updateProfileAsync } = useUpdateProfile()

    const displayImgUri =
        typeof img === 'string' ? img : img?.uri ?? data?.photo;

    const handleEdit = () => {
        setActiveEdit(prev => !prev);
    };

    const handleSave = useCallback(async () => {
        if (saving) return;

        if (!name?.trim()) {
            showMessage({
                message: 'Name required',
                description: 'Please enter your name.',
                type: 'warning',
            });
            return;
        }
        if (email && !/\S+@\S+\.\S+/.test(email)) {
            showMessage({
                message: 'Invalid email',
                description: 'Please enter a valid email address.',
                type: 'warning',
            });
            return;
        }

        setSaving(true);
        try {
            let photoUrl: string = data?.photo ?? '';
            if (typeof img !== 'string' && img?.uri) {
                const uploaded = await uploadImage(img.uri);
                photoUrl = uploaded.secure_url;
            }

            await updateProfileAsync({
                name: name?.trim?.(),
                email: email?.trim?.(),
                city: city?.trim?.(),
                photo: photoUrl,
                token: data?.token ?? '',
            });

            const updated = {
                name: name?.trim?.(),
                email: email?.trim?.(),
                city: city?.trim?.(),
                photo: photoUrl,
            };

            dispatch(updateUser(updated));

            const storedData = {
                _id: data?._id,
                phone: data?.phone,
                photo: photoUrl,
                name: updated.name,
                gender: data?.gender,
                email: updated.email,
                city: updated.city,
            };
            writeStorage({ key: token.isAuthData, data: storedData });

            showMessage({
                message: 'Profile Updated',
                description: 'Your profile has been saved successfully.',
                type: 'success',
            });
            setActiveEdit(false);
        } catch (error: any) {
            showMessage({
                message: 'Update Failed',
                description:
                    error?.response?.data?.message ||
                    error?.message ||
                    'Please try again.',
                type: 'danger',
                duration: 3000,
            });
        } finally {
            setSaving(false);
        }
    }, [saving, name, email, city, img, data, updateProfileAsync, dispatch]);

    const handleGalleryPhoto = useCallback(async () => {
        const photo = await pickFromGallery();
        if (photo) {
            setImg(photo);
        }
    }, []);

    const handleLogout = useCallback(() => {
        dispatch(clearUser());
        removeStorage({ key: token.isAuth });
        removeStorage({ key: token.isAuthData });
        navigation.reset({
            index: 0,
            routes: [
                {
                    name: appRoute.login,
                },
            ],
        });
    }, [dispatch, navigation]);

    return (
        <Wrapper safeBottom>
            <MainDerder
                navigation={navigation}
                title="Profile"
            />
            <ScrollView
                showsVerticalScrollIndicator={false}
                className="flex-1"
                contentContainerStyle={{
                    paddingBottom: 30,
                }}
            >
                <View className="w-full items-center ">
                    <View
                        className="rounded-full items-center justify-center relative"
                        style={{
                            width: '60%',
                            aspectRatio: 1,
                        }}
                    >
                        <View
                            className="rounded-full items-center justify-center"
                            style={{
                                width: '100%',
                                height: '100%',
                                backgroundColor:
                                    Theme.background.secondary,
                                borderWidth: 1,
                                borderColor: '#3E4654',
                                borderStyle: 'dashed',
                                overflow: 'hidden',
                            }}
                        >
                            <Image
                                source={{
                                    uri: displayImgUri,
                                }}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                }}
                                resizeMode="cover"
                            />
                        </View>
                        {activeEdit && (
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={handleGalleryPhoto}
                                className="absolute rounded-full items-center justify-center"
                                style={{
                                    width: 56,
                                    height: 56,
                                    right: 0,
                                    bottom: 0,
                                    backgroundColor:
                                        Theme.background.primary,
                                    borderWidth: 1,
                                    borderColor: '#3E4654',
                                    borderStyle: 'dashed',
                                    zIndex: 20,
                                }}
                            >
                                <Camera
                                    size={24}
                                    color={Theme.button.primary}
                                />
                            </TouchableOpacity>
                        )}
                    </View>
                    <View className="w-full mt-8">
                        <InputField
                            title="Name"
                            value={name}
                            setvalue={setName}
                            placeholder="Enter your name"
                            keyType="default"
                            Icon={PersonStanding}
                            edit={activeEdit}
                        />
                    </View>
                    <View className="w-full">
                        <InputField
                            title="Email"
                            value={email}
                            setvalue={setEmail}
                            placeholder="Enter your email"
                            keyType="email-address"
                            Icon={Mail}
                            edit={activeEdit}
                        />
                    </View>
                    <View className="w-full">
                        <InputField
                            title="City"
                            value={city}
                            setvalue={setCity}
                            placeholder="Enter your city"
                            keyType="default"
                            Icon={MapPin}
                            edit={activeEdit}
                        />
                    </View>
                    <View className="w-full">
                        <InputField
                            title="Phone Number"
                            value={number}
                            setvalue={setNumber}
                            placeholder="Enter your phone number"
                            keyType="phone-pad"
                            Icon={Phone}
                            edit={false}
                        />
                    </View>
                    <View className="w-full">
                        <InputField
                            title="Gender"
                            value={
                                data?.gender
                                    ? data.gender.charAt(0).toUpperCase() +
                                    data.gender.slice(1)
                                    : ''
                            }
                            setvalue={() => { }}
                            placeholder="Gender"
                            keyType="default"
                            Icon={UserRound}
                            edit={false}
                        />
                    </View>
                    <View className="w-full mt-8">
                        {!activeEdit ? (
                            <MainButton title="Edit Profile" actionFunc={handleEdit} Icon={Pencil} />
                        ) : (
                            <MainButton title="Save Changes" actionFunc={handleSave} Icon={Check} loader={saving} disabled={saving} />
                        )}
                    </View>
                    <View className="w-full mb-8">
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={handleLogout}
                            className="flex-row items-center justify-center gap-2 rounded-xl h-13"
                            style={{
                                backgroundColor: 'transparent',
                                borderWidth: 1,
                                borderColor: '#E5484D',
                            }}
                        >
                            <LogOut
                                size={20}
                                color="#E5484D"
                            />
                            <Text className="font-bold" style={{ color: '#E5484D' }}>
                                Logout
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </Wrapper>
    );
};

export default ProfileScreen;