import React, { useCallback, useState } from 'react';
import type { Asset } from 'react-native-image-picker';

import Wrapper from '../../layouts/wraper/Wraper';
import MainDerder from '../../components/header/MainDerder';

import {
    Image,
    ScrollView,
    TouchableOpacity,
    View,
} from '../../lib/style/withTailwind';

import { Theme } from '../../const/theme/Theme';

import {
    Camera,
    Check,
    Pencil,
    PersonStanding,
    Phone,
} from 'lucide-react-native';

import InputField from '../../components/input/InputField';
import MainButton from '../../components/buttons/MainButton';
import { pickFromGallery } from '../../module/ImagePickerModule';

const DUMMY_IMG_URI =
    'https://img.magnific.com/free-photo/cheerful-indian-businessman-smiling-closeup-portrait-jobs-career-campaign_53876-129417.jpg?semt=ais_hybrid&w=740&q=80';

const ProfileScreen = ({ navigation }: any) => {
    const [activeEdit, setActiveEdit] = useState<boolean>(false);

    const [name, setName] = useState<string>('Pritam Sarkar');
    const [number, setNumber] = useState<string>('7796419792');
    const [loader, setLoader] = useState<boolean>(false)
    // pickFromGallery poora Asset object deta hai (uri, width, height, fileName, type...)
    const [img, setImg] = useState<Asset | null>(null);

    // Picked photo hai to uski uri, warna dummy fallback
    const displayImgUri = img?.uri ?? DUMMY_IMG_URI;

    const handleEdit = () => {
        setActiveEdit(prev => !prev);
    };

    const handleSave = useCallback(() => {
        setLoader(true)
        setTimeout(() => {
            setLoader(false)
            setActiveEdit(false);
        }, 2000);
    }, [])

    const handleGalleryPhoto = useCallback(async () => {
        const photo = await pickFromGallery();
        if (photo) {
            setImg(photo);
        }
    }, []);

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

                    <View className="w-full mt-4">
                        <InputField
                            title="Phone Number"
                            value={number}
                            setvalue={setNumber}
                            placeholder="Enter your phone number"
                            keyType="phone-pad"
                            Icon={Phone}
                            edit={activeEdit}
                        />
                    </View>

                    <View className="w-full mt-8">
                        {!activeEdit ? (
                            <MainButton title="Edit Profile" actionFunc={handleEdit} Icon={Pencil} />
                        ) : (
                            <MainButton title="Save Changes" actionFunc={handleSave} Icon={Check} loader={loader} />
                        )}
                    </View>
                </View>
            </ScrollView>
        </Wrapper>
    );
};

export default ProfileScreen;