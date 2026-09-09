import React, { useCallback, useMemo, useState } from 'react';
import type { Asset } from 'react-native-image-picker';
import {
    ScrollView,
    View,
    Text,
    TouchableOpacity,
    Modal,
    Pressable,
} from '../../lib/style/withTailwind';
import { ActivityIndicator } from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
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
    ShieldCheck,
    ChevronRight,
    X,
} from 'lucide-react-native';
import Wrapper from '../../layouts/wraper/Wraper';
import MainDerder from '../../components/header/MainDerder';
import InputField from '../../components/input/InputField';
import MainButton from '../../components/buttons/MainButton';
import { AvatarEditor, ImageSourceSheet } from '../../components/profile/AvatarEditor';
import StatChip from '../../components/profile/StatChip';
import ProfileMenuItem from '../../components/profile/ProfileMenuItem';
import { Palette } from '../../components/profile/const/profilePalette';
import { pickFromGallery, capturePhoto } from '../../module/ImagePickerModule';
import { route as appRoute } from '../../const/routes/route';
import { useAppDispatch, useAppSelector } from '../../hooks/redux/redux';
import { clearUser, updateUser } from '../../store/slices/userSlice';
import { removeStorage, writeStorage } from '../../manager/storage/storageManager';
import token from '../../const/token/token';
import useUpdateProfile from '../../api/auth/hooks/auth/useUpdateProfile';
import uploadImage from '../../services/Cloudinary/uploadImg';
import { showMessage } from 'react-native-flash-message';

const ProfileScreen = ({ navigation }: any) => {
    const data = useAppSelector((state) => state.user.user);
    const dispatch = useAppDispatch();

    const [activeEdit, setActiveEdit] = useState<boolean>(false);
    const [name, setName] = useState<string | any>(data?.name);
    const [email, setEmail] = useState<string | any>(data?.email);
    const [city, setCity] = useState<string | any>(data?.city);
    const [number] = useState<string | any>(data?.phone);
    const [saving, setSaving] = useState<boolean>(false);
    const [img, setImg] = useState<Asset | null | any>(data?.photo);
    const [sheetOpen, setSheetOpen] = useState<boolean>(false);
    const [confirmLogout, setConfirmLogout] = useState<boolean>(false);

    const { updateProfileAsync } = useUpdateProfile();
    const displayImgUri = typeof img === 'string' ? img : img?.uri ?? data?.photo;

    const stats = useMemo(() => ({
        phone: number || '—',
        role: data?.gender ? data.gender.charAt(0).toUpperCase() + data.gender.slice(1) : '—',
        email: email || '—',
    }), [number, data?.gender, email]);

    const handleEdit = useCallback(() => setActiveEdit((p) => !p), []);

    const handleSave = useCallback(async () => {
        if (saving) return;
        if (!name?.trim()) {
            showMessage({ message: 'Name required', description: 'Please enter your name.', type: 'warning' });
            return;
        }
        if (email && !/\S+@\S+\.\S+/.test(email)) {
            showMessage({ message: 'Invalid email', description: 'Please enter a valid email address.', type: 'warning' });
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
            writeStorage({
                key: token.isAuthData,
                data: {
                    _id: data?._id,
                    phone: data?.phone,
                    photo: photoUrl,
                    name: updated.name,
                    gender: data?.gender,
                    email: updated.email,
                    city: updated.city,
                },
            });
            showMessage({ message: 'Profile Updated', description: 'Your profile has been saved successfully.', type: 'success' });
            setActiveEdit(false);
        } catch (error: any) {
            showMessage({
                message: 'Update Failed',
                description: error?.response?.data?.message || error?.message || 'Please try again.',
                type: 'danger',
                duration: 3000,
            });
        } finally {
            setSaving(false);
        }
    }, [saving, name, email, city, img, data, updateProfileAsync, dispatch]);

    const handleGalleryPhoto = useCallback(async () => {
        const photo = await pickFromGallery();
        if (photo) setImg(photo);
        setSheetOpen(false);
    }, []);

    const handleCameraPhoto = useCallback(async () => {
        const photo = await capturePhoto({ cameraType: 'front' });
        if (photo) setImg(photo);
        setSheetOpen(false);
    }, []);

    const openSheet = useCallback(() => setSheetOpen(true), []);
    const closeSheet = useCallback(() => setSheetOpen(false), []);

    const handleLogout = useCallback(() => {
        dispatch(clearUser());
        removeStorage({ key: token.isAuth });
        removeStorage({ key: token.isAuthData });
        navigation.reset({ index: 0, routes: [{ name: appRoute.login }] });
    }, [dispatch, navigation]);

    return (
        <Wrapper safeBottom>
            <MainDerder navigation={navigation} title="Profile" />
            <ScrollView showsVerticalScrollIndicator={false} className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
                {/* ─── Header card ─── */}
                <LinearGradient
                    colors={['#232733', '#191C23']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ borderRadius: 24, padding: 20 }}
                >
                    <View className="items-center">
                        <AvatarEditor source={displayImgUri} editable={activeEdit} onEdit={openSheet} />
                        <Text className="text-white text-2xl font-black mt-4 tracking-tight">{data?.name || 'User'}</Text>
                        <View
                            className="mt-2 px-3 py-1 rounded-full"
                            style={{ backgroundColor: Palette.surfaceLight, borderWidth: 1, borderColor: Palette.border }}
                        >
                            <View className="flex-row items-center">
                                <ShieldCheck size={12} color={Palette.gold} />
                                <Text className="text-[11px] font-semibold ml-1.5" style={{ color: Palette.textSecondary }}>
                                    {data?.email || 'Team Member'}
                                </Text>
                            </View>
                        </View>
                    </View>
                    <View className="flex-row mt-6">
                        <StatChip icon={Phone} label="Phone" value={stats.phone} color={Palette.green} soft={Palette.greenSoft} />
                        <StatChip icon={UserRound} label="Gender" value={stats.role} color={Palette.blue} soft={Palette.blueSoft} />
                    </View>
                </LinearGradient>

                {/* ─── Edit form card ─── */}
                <View
                    className="mt-5 rounded-3xl p-5"
                    style={{ backgroundColor: Palette.surface, borderWidth: 1, borderColor: Palette.border }}
                >
                    <View className="flex-row items-center justify-between mb-4">
                        <Text className="text-white text-lg font-bold tracking-tight">
                            {activeEdit ? 'Edit Details' : 'Your Details'}
                        </Text>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={handleEdit}
                            className="px-3 py-1.5 rounded-full"
                            style={{ backgroundColor: Palette.surfaceLight, borderWidth: 1, borderColor: Palette.border }}
                        >
                            <View className="flex-row items-center">
                                {activeEdit ? <X size={13} color={Palette.textSecondary} /> : <Pencil size={13} color={Palette.textSecondary} />}
                                <Text className="text-xs font-semibold ml-1" style={{ color: Palette.textSecondary }}>
                                    {activeEdit ? 'Cancel' : 'Edit'}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View className="w-full">
                        <InputField title="Name" value={name} setvalue={setName} placeholder="Enter your name" keyType="default" Icon={PersonStanding} edit={activeEdit} />
                    </View>
                    <View className="w-full">
                        <InputField title="Email" value={email} setvalue={setEmail} placeholder="Enter your email" keyType="email-address" Icon={Mail} edit={activeEdit} />
                    </View>
                    <View className="w-full">
                        <InputField title="City" value={city} setvalue={setCity} placeholder="Enter your city" keyType="default" Icon={MapPin} edit={activeEdit} />
                    </View>
                    <View className="w-full">
                        <InputField title="Phone Number" value={number} setvalue={() => { }} placeholder="Enter your phone number" keyType="phone-pad" Icon={Phone} edit={false} />
                    </View>
                    <View className="w-full">
                        <InputField title="Gender" value={stats.role} setvalue={() => { }} placeholder="Gender" keyType="default" Icon={UserRound} edit={false} />
                    </View>

                    <View className="w-full mt-4">
                        {!activeEdit ? (
                            <MainButton title="Edit Profile" actionFunc={handleEdit} Icon={Pencil} />
                        ) : (
                            <MainButton title="Save Changes" actionFunc={handleSave} Icon={Check} loader={saving} disabled={saving} />
                        )}
                    </View>
                </View>

                {/* ─── Menu card ─── */}
                <View
                    className="mt-5 rounded-3xl overflow-hidden"
                    style={{ backgroundColor: Palette.surface, borderWidth: 1, borderColor: Palette.border }}
                >
                    <ProfileMenuItem icon={UserRound} label="Account" right="View / edit" />
                    <ProfileMenuItem icon={ShieldCheck} label="Privacy & Security" right="Manage" />
                    <ProfileMenuItem
                        icon={LogOut}
                        label="Logout"
                        destructive
                        onPress={() => setConfirmLogout(true)}
                    />
                </View>
            </ScrollView>

            {/* Image source sheet */}
            <ImageSourceSheet visible={sheetOpen} onCamera={handleCameraPhoto} onGallery={handleGalleryPhoto} onClose={closeSheet} />

            {/* Logout confirm modal */}
            <Modal visible={confirmLogout} transparent animationType="fade">
                <View className="flex-1 items-center justify-center">
                    <Pressable className="absolute inset-0 bg-black/70" onPress={() => setConfirmLogout(false)} />
                    <View
                        className="w-[85%] rounded-3xl p-6"
                        style={{ backgroundColor: Palette.surface, borderWidth: 1, borderColor: Palette.border }}
                    >
                        <View className="w-12 h-12 rounded-2xl items-center justify-center self-center" style={{ backgroundColor: Palette.redSoft }}>
                            <LogOut size={22} color={Palette.red} />
                        </View>
                        <Text className="text-white text-lg font-bold text-center mt-4">Logout?</Text>
                        <Text className="text-[#9CA3AF] text-sm text-center mt-1.5">
                            You'll need to verify your number again to sign back in.
                        </Text>
                        <View className="flex-row gap-3 mt-6">
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={() => setConfirmLogout(false)}
                                className="flex-1 h-12 rounded-xl items-center justify-center"
                                style={{ backgroundColor: Palette.surfaceLight, borderWidth: 1, borderColor: Palette.border }}
                            >
                                <Text className="font-semibold" style={{ color: Palette.textSecondary }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={handleLogout}
                                className="flex-1 h-12 rounded-xl items-center justify-center"
                                style={{ backgroundColor: Palette.red }}
                            >
                                <Text className="font-semibold" style={{ color: '#fff' }}>Logout</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </Wrapper>
    );
};

export default ProfileScreen;
