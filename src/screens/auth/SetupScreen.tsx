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
import { capturePhoto, pickFromGallery } from '../../module/ImagePickerModule';

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

const genderOptions = ['Male', 'Female', 'Other'] as const;

const SetupScreen = ({ navigation }: any) => {
    const user = useAppSelector((state) => state.user.user);
    const dispatch = useAppDispatch();

    const [img, setImg] = useState<any | null>(null);
    const [name, setName] = useState(user?.name ?? '');
    const [email, setEmail] = useState(user?.email ?? '');
    const [city, setCity] = useState(user?.city ?? '');
    const [gender, setGender] = useState(user?.gender ?? '');
    const [loader, setLoader] = useState(false);

    const displayImgUri = img?.uri ?? user?.photo;

    const isValid = useMemo(() => name.trim().length > 0, [name]);
    const handleCapturePhoto = useCallback(async () => {
        const photo = await capturePhoto({ cameraType: 'front' });
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

    const handleSave = useCallback(() => {
        if (!isValid || loader) {
            return;
        }
        setLoader(true);
        dispatch(
            updateUser({
                name: name.trim(),
                email: email.trim(),
                city: city.trim(),
                gender,
                photo: displayImgUri ?? '',
            })
        );
        setTimeout(() => {
            setLoader(false);
            navigation.replace(appRoute.home);
        }, 900);
    }, [
        isValid,
        loader,
        name,
        email,
        city,
        gender,
        displayImgUri,
        navigation,
        dispatch,
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
                                borderColor: Theme.button.primary,
                                borderStyle: 'dashed',
                            }}
                        >
                            {displayImgUri ? (
                                <Image
                                    source={{ uri: displayImgUri }}
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
                                <Camera size={16} color={Theme.button.primary} />
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
                                <GalleryHorizontal size={16} color={Theme.button.primary} />
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
                        value={user?.phone ?? ''}
                        setvalue={() => { }}
                        placeholder="Phone number"
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
                                const isSelected = gender === option;
                                return (
                                    <TouchableOpacity
                                        key={option}
                                        activeOpacity={0.8}
                                        onPress={() =>
                                            setGender(option)
                                        }
                                        className="flex-1 flex-row items-center justify-center rounded-xl h-12 "
                                        style={{
                                            backgroundColor:
                                                Theme.background.secondary,
                                            borderWidth: 1,
                                            borderColor: isSelected
                                                ? Theme.button.primary
                                                : '#4D5564',
                                        }}
                                    >
                                        {isSelected && (
                                            <Check
                                                size={14}
                                                color={Theme.button.primary}
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
                                            {option}
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
                    disabled={!isValid}
                    loader={loader}
                    Icon={Check}
                />
                </KeyboardAvoidingView>
            </View>
        </Wrapper>
    );
};

export default SetupScreen;