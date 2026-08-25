import React, { useCallback, useMemo, useState } from 'react';

import Wrapper from '../../layouts/wraper/Wraper';
import AuthNavigation from '../../components/navigation/AuthNavigation';
import { AuthTopFrame } from '../../components/auth/frame/AuthFrame';
import InputField from '../../components/input/InputField';
import MainButton from '../../components/buttons/MainButton';
import { route as appRoute } from '../../const/routes/route';
import { Theme } from '../../const/theme/Theme';
import { useAppDispatch, useAppSelector } from '../../hooks/redux/redux';
import { updateUser } from '../../store/slices/userSlice';
import {
    capturePhoto,
    pickFromGallery,
} from '../../module/ImagePickerModule';

import {
    Camera,
    Check,
    GalleryHorizontal,
    Mail,
    MapPin,
    Phone,
    PersonStanding,
} from 'lucide-react-native';

import {
    Image,
    KeyboardAvoidingView,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from '../../lib/style/withTailwind';

import uploadImage from '../../services/Cloudinary/uploadImg';
import { showMessage } from 'react-native-flash-message';
import useCreateProfile from '../../api/auth/hooks/auth/useCreateProfile';
import { writeStorage } from '../../manager/storage/storageManager';
import token from '../../const/token/token';

const genderOptions = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' },
] as const;

const SetupScreen = ({ navigation, route }: any) => {

    const user = useAppSelector((state) => state.user.user);
    const dispatch = useAppDispatch();

    const phoneNumber =
        route?.params?.phonenumber ||
        user?.phone ||
        '';

    const [img, setImg] = useState<any | null>(null);

    const [name, setName] = useState(user?.name ?? '');
    const [email, setEmail] = useState(user?.email ?? '');
    const [city, setCity] = useState(user?.city ?? '');

    const [gender, setGender] = useState<
        'male' | 'female' | 'other' | ''
    >((user?.gender?.toLowerCase?.() as 'male' | 'female' | 'other') ?? '');

    const displayImgUri = img?.uri ?? user?.photo;

    const { createProfileAsync, isLoading } = useCreateProfile();

    const isValid = useMemo(() => {
        return (
            name.trim().length > 0 &&
            gender !== ''
        );
    }, [name, gender]);

    const handleCapturePhoto = useCallback(async () => {
        const photo = await capturePhoto({
            cameraType: 'front',
        });

        if (photo) {
            setImg(photo);
        }
    }, []);

    const handleGalleryPhoto = useCallback(async () => {
        const photo = await pickFromGallery();

        if (photo) {
            setImg(photo);
        }
    }, []);

    const handleSave = useCallback(async () => {
        if (!isValid || isLoading) {
            return;
        }

        if (!user?.token) {
            showMessage({
                message: 'Authentication Error',
                description: 'User token is missing.',
                type: 'danger',
            });

            return;
        }

        try {
            let photoUrl = user?.photo ?? '';
            if (img?.uri) {
                const uploaded = await uploadImage(img.uri);
                photoUrl = uploaded.secure_url;
            }
            const response = await createProfileAsync({
                name: name.trim(),
                email: email.trim(),
                city: city.trim(),
                gender: gender as 'male' | 'female' | 'other',
                photo: photoUrl,
                token: user.token,
            });
            dispatch(
                updateUser({
                    token: response?.token,
                    _id: response?.user._id,
                    phone: response?.user.phone,
                    photo: response?.user.photo,
                    name: response?.user.name,
                    gender: response?.user.gender,
                    email: response?.user.email,
                    city: response?.user.city,
                }),
            );
            writeStorage({ key: token.isAuth, data: true })
            writeStorage({
                key: token.isAuthData, data: {
                    _id: response?.user._id,
                    phone: response?.user.phone,
                    photo: response?.user.photo,
                    name: response?.user.name,
                    gender: response?.user.gender,
                    email: response?.user.email,
                    city: response?.user.city,
                }
            })
            navigation.reset({
                index: 0,
                routes: [
                    {
                        name: appRoute.home,
                    },
                ],
            });
        } catch (error: any) {
            showMessage({
                message: 'Profile Update Failed',
                description:
                    error?.response?.data?.message ||
                    error?.message ||
                    'Please try saving again.',
                type: 'danger',
                duration: 3000,
            });
        }
    }, [
        isValid,
        isLoading,
        user,
        img,
        name,
        email,
        city,
        gender,
        createProfileAsync,
        dispatch,
        navigation,
    ]);

    return (
        <Wrapper
            safeBottom
            paddingHorizontal={0}
            paddingTop={0}
        >
            <View className="flex-1 px-4">
                <AuthNavigation
                    need={true}
                    navigation={navigation}
                />
                <KeyboardAvoidingView
                    behavior="height"
                    className="flex-1"
                >
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        className="flex-1"
                        contentContainerStyle={{
                            paddingBottom: 16,
                        }}
                    >
                        <AuthTopFrame
                            title="Complete Your Profile"
                            dis="Add a few details to personalize your account and start booking halls."
                        />
                        <View className="w-full items-center mt-8">
                            <View
                                className="items-center justify-center rounded-full overflow-hidden"
                                style={{
                                    width: 124,
                                    height: 124,
                                    backgroundColor:
                                        Theme.background.secondary,
                                    borderWidth: 1.5,
                                    borderColor:
                                        Theme.button.primary,
                                    borderStyle: 'dashed',
                                }}
                            >
                                {displayImgUri ? (
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
                                ) : (
                                    <PersonStanding
                                        size={48}
                                        color="#8F8B91"
                                    />
                                )}
                            </View>
                            <View className="flex-row gap-2 mt-4">
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={handleCapturePhoto}
                                    className="flex-row items-center justify-center rounded-lg px-3 py-2"
                                    style={{
                                        backgroundColor:
                                            Theme.background.secondary,
                                        borderWidth: 1,
                                        borderColor: '#4D5564',
                                    }}
                                >
                                    <Camera
                                        size={16}
                                        color={Theme.button.primary}
                                    />
                                    <Text className="text-white/70 text-xs font-medium ml-1.5">
                                        Camera
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={handleGalleryPhoto}
                                    className="flex-row items-center justify-center rounded-lg px-3 py-2"
                                    style={{
                                        backgroundColor:
                                            Theme.background.secondary,
                                        borderWidth: 1,
                                        borderColor: '#4D5564',
                                    }}
                                >
                                    <GalleryHorizontal
                                        size={16}
                                        color={Theme.button.primary}
                                    />

                                    <Text className="text-white/70 text-xs font-medium ml-1.5">
                                        Gallery
                                    </Text>
                                </TouchableOpacity>

                            </View>
                        </View>
                        <InputField
                            title="Full Name *"
                            value={name}
                            setvalue={setName}
                            placeholder="Enter your full name"
                            keyType="default"
                            Icon={PersonStanding}
                        />
                        <InputField
                            title="Email ID"
                            value={email}
                            setvalue={setEmail}
                            placeholder="Enter your email address"
                            keyType="email-address"
                            Icon={Mail}
                        />
                        <InputField
                            title="City"
                            value={city}
                            setvalue={setCity}
                            placeholder="Enter your city"
                            keyType="default"
                            Icon={MapPin}
                        />

                        <InputField
                            title="Phone Number"
                            value={phoneNumber}
                            setvalue={() => { }}
                            placeholder={phoneNumber}
                            keyType="phone-pad"
                            Icon={Phone}
                            edit={false}
                        />
                        <View className="mb-4">
                            <Text className="text-[#8F8B91] text-sm font-medium mb-2">
                                Gender
                            </Text>

                            <View className="flex-row gap-3">

                                {genderOptions.map((option) => {

                                    const isSelected =
                                        gender === option.value;

                                    return (
                                        <TouchableOpacity
                                            key={option.value}
                                            activeOpacity={0.8}
                                            onPress={() =>
                                                setGender(
                                                    option.value,
                                                )
                                            }
                                            className="flex-1 flex-row items-center justify-center rounded-xl h-12"
                                            style={{
                                                backgroundColor:
                                                    Theme.background.secondary,
                                                borderWidth: 1,
                                                borderColor:
                                                    isSelected
                                                        ? Theme.button.primary
                                                        : '#4D5564',
                                            }}
                                        >

                                            {isSelected && (
                                                <Check
                                                    size={14}
                                                    color={
                                                        Theme.button.primary
                                                    }
                                                />
                                            )}

                                            <Text
                                                className="text-sm font-medium ml-1"
                                                style={{
                                                    color: isSelected
                                                        ? '#FFFFFF'
                                                        : '#8F8B91',
                                                }}
                                            >
                                                {option.label}
                                            </Text>

                                        </TouchableOpacity>
                                    );
                                })}

                            </View>
                        </View>

                    </ScrollView>

                    <MainButton
                        title="Save & Continue"
                        actionFunc={handleSave}
                        disabled={!isValid || isLoading}
                        loader={isLoading}
                        Icon={Check}
                    />

                </KeyboardAvoidingView>

            </View>
        </Wrapper>
    );
};

export default SetupScreen;