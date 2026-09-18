import React, { useCallback, useState } from 'react';
import { Image } from 'react-native';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from '../../lib/style/withTailwind';
import {
  Camera,
  ImageUp,
  Pencil,
  QrCode,
  RefreshCw,
  Upload,
  UserRound,
} from 'lucide-react-native';

import Wrapper from '../../layouts/wraper/Wraper';
import SubHeader from '../../components/header/SubHeader';
import MainButton from '../../components/buttons/MainButton';
import InputField from '../../components/input/InputField';
import { ImageSourceSheet } from '../../components/profile/AvatarEditor';
import { Palette } from '../../components/profile/const/profilePalette';
import FullScreenImage from '../../components/ui/FullScreenImage';
import PaymentQrSkeleton from '../../ui/Skeleton/PaymentQrSkeleton';
import { capturePhoto, pickFromGallery } from '../../module/ImagePickerModule';
import uploadImage from '../../services/Cloudinary/uploadImg';
import useHallQr from '../../hooks/qr/useHallQr';
import {
  normalizeBankHolderName,
  validateBankHolderName,
} from '../../functions/qr/paymentQrValidation';
import { showMessage } from 'react-native-flash-message';

/**
 * CEO only screen — Profile → QR Code.
 *
 * Shuru me QR backend par `null` hota hai — us waqt yahan QR upload karne ka
 * option + Bank Holder Name input (validation ke saath) dikhta hai. Save hote
 * hi ye form hat jaata hai aur sirf saved QR + account name rehta hai; wahi QR
 * `useHallQr` ke through app ke saare payment screens par lagta hai.
 *
 * Saved QR par "Edit" se yahi form pre-filled wapas khulta hai — naam badla ja
 * sakta hai ya nayi QR image chuni ja sakti hai (purana QR waise hi rakha ja
 * sakta hai, aur Cancel se edit chhod sakte hain).
 */
const ProfileQrScreen = ({ navigation }: any) => {
  const { bankHolderName, qrUrl, isConfigured, isLoading, refetch, saveQr } =
    useHallQr();

  const [name, setName] = useState<string>('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [photo, setPhoto] = useState<any>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  // Long press karne par is image ko full screen me kholte hain.
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  // Saved QR ke baad "Edit" se yahi form wapas khulta hai (name / QR badalne ke liye).
  const [editing, setEditing] = useState<boolean>(false);

  // Type karte hi live validation (khaali chhodne par error nahi dikhate).
  const handleNameChange = useCallback((value: string) => {
    setName(value);
    setNameError(value.trim() ? validateBankHolderName(value) : null);
  }, []);

  const openSheet = useCallback(() => setSheetOpen(true), []);
  const closeSheet = useCallback(() => setSheetOpen(false), []);

  // Edit: mojooda values form me pre-fill ho jaate hain (QR waisa hi reh sakta hai).
  const startEdit = useCallback(() => {
    setName(bankHolderName ?? '');
    setPhoto(null);
    setNameError(null);
    setPhotoError(null);
    setEditing(true);
  }, [bankHolderName]);

  const cancelEdit = useCallback(() => {
    setName('');
    setPhoto(null);
    setNameError(null);
    setPhotoError(null);
    setEditing(false);
  }, []);

  const handleGallery = useCallback(async () => {
    setSheetOpen(false);
    const picked = await pickFromGallery();
    if (picked?.uri) {
      setPhoto(picked);
      setPhotoError(null);
    }
  }, []);

  const handleCamera = useCallback(async () => {
    setSheetOpen(false);
    const shot = await capturePhoto({ cameraType: 'back' });
    if (shot?.uri) {
      setPhoto(shot);
      setPhotoError(null);
    }
  }, []);

  const handleSave = useCallback(async () => {
    if (saving) return;

    const nameErr = validateBankHolderName(name);
    if (nameErr) setNameError(nameErr);

    // Edit karte waqt purana QR hi rakha ja sakta hai — nayi image optional hai.
    const existingQr = qrUrl ?? null;
    const missingPhoto = !photo?.uri && !existingQr;
    if (missingPhoto) setPhotoError('Payment QR image is required.');
    if (nameErr || missingPhoto) return;

    setSaving(true);
    try {
      // Nayi image chuni ho to pehle Cloudinary par, warna mojooda QR hi rehta hai.
      let finalQrUrl: string = existingQr as string;
      if (photo?.uri) {
        const uploaded = await uploadImage(photo.uri);
        finalQrUrl = uploaded.secure_url;
      }

      await saveQr({
        bankHolderName: normalizeBankHolderName(name),
        qrUrl: finalQrUrl,
      });

      showMessage({
        message: 'Payment QR Saved',
        description: 'Yeh QR ab sabhi payment screens par use hoga.',
        type: 'success',
      });

      setName('');
      setPhoto(null);
      setNameError(null);
      setPhotoError(null);
      setEditing(false);
    } catch (error: any) {
      showMessage({
        message: 'Could not save QR',
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
  }, [name, photo, qrUrl, saveQr, saving]);

  const showLoader = isLoading && !isConfigured;

  // Jab tak valid Bank Holder Name + QR image dono na hon, Save button
  // disabled rehta hai (press karne par kuch nahi hota). Edit me mojooda QR
  // bhi count hota hai, isliye sirf naam badalna bhi allowed hai.
  const canSave =
    !saving && !!(photo?.uri || qrUrl) && !validateBankHolderName(name);

  return (
    <Wrapper safeBottom>
      <SubHeader
        navigation={navigation}
        title="Payment QR"
        comp={
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => refetch()}
            className="w-10 h-10 rounded-xl items-center justify-center"
            style={{ backgroundColor: Palette.surfaceLight }}
          >
            <RefreshCw size={17} color={Palette.primary} />
          </TouchableOpacity>
        }
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {showLoader ? (
          <PaymentQrSkeleton />
        ) : isConfigured && qrUrl && !editing ? (
          /* ── Saved QR — upload form hat jaata hai ─── */
          <View
            className="mt-5 rounded-3xl p-5 items-center"
            style={{
              backgroundColor: Palette.surface,
              borderWidth: 1,
              borderColor: Palette.border,
            }}
          >
            <View className="flex-row items-center w-full">
              <View
                className="w-10 h-10 rounded-xl items-center justify-center"
                style={{ backgroundColor: Palette.greenSoft }}
              >
                <QrCode size={18} color={Palette.green} />
              </View>
              <View className="flex-1 ml-3">
                <Text className="text-white text-base font-bold">
                  Payment QR
                </Text>
                <Text
                  className="text-xs mt-0.5"
                  style={{ color: Palette.textMuted }}
                >
                  Scan &amp; Pay — Google Pay, PhonePe, Paytm
                </Text>
              </View>

              {/* Edit: naam ya QR badalne ke liye form wapas khulta hai */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={startEdit}
                className="flex-row items-center px-3 py-1.5 rounded-full"
                style={{
                  backgroundColor: Palette.surfaceLight,
                  borderWidth: 1,
                  borderColor: Palette.border,
                }}
              >
                <Pencil size={13} color={Palette.textSecondary} />
                <Text
                  className="text-xs font-semibold ml-1"
                  style={{ color: Palette.textSecondary }}
                >
                  Edit
                </Text>
              </TouchableOpacity>
            </View>

            <View
              className="items-center justify-center mt-4 p-3 rounded-3xl"
              style={{ backgroundColor: '#FFFFFF' }}
            >
              {/* Long press → poori screen par QR */}
              <TouchableOpacity
                activeOpacity={0.9}
                delayLongPress={250}
                onLongPress={() => setPreviewUri(qrUrl)}
              >
                <Image
                  source={{ uri: qrUrl }}
                  style={{ width: 240, height: 240 }}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>

            <Text
              className="text-[10px] mt-2"
              style={{ color: Palette.textMuted }}
            >
              Long press to view full screen
            </Text>

            <View className="flex-row items-center mt-4">
              <UserRound size={16} color={Palette.green} />
              <Text
                className="text-sm font-semibold ml-2"
                style={{ color: Palette.textPrimary }}
              >
                {bankHolderName}
              </Text>
            </View>
          </View>
        ) : (
          <View>
            <View className="mt-5">
              <InputField
                title="Bank Holder Name"
                value={name}
                setvalue={handleNameChange}
                placeholder="e.g. Ramesh Kumar"
                keyType="default"
                Icon={UserRound}
                edit={!saving}
                bordered
              />
              {nameError ? (
                <Text
                  className="-mt-2 mb-1 text-xs"
                  style={{ color: Palette.red }}
                >
                  {nameError}
                </Text>
              ) : null}
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={openSheet}
              delayLongPress={250}
              onLongPress={() => setPreviewUri(photo?.uri ?? qrUrl ?? null)}
              disabled={saving}
              className="items-center justify-center rounded-3xl py-6 px-4"
              style={{
                backgroundColor: Palette.surface,
                borderWidth: 1,
                borderStyle: 'dashed',
                borderColor: photoError ? Palette.red : Palette.border,
              }}
            >
              {photo?.uri || (editing && qrUrl) ? (
                <View className="items-center">
                  <View
                    className="p-2 rounded-2xl"
                    style={{ backgroundColor: '#FFFFFF' }}
                  >
                    <Image
                      source={{ uri: photo?.uri ?? qrUrl ?? '' }}
                      style={{ width: 180, height: 180 }}
                      resizeMode="contain"
                    />
                  </View>
                  <View className="flex-row items-center mt-3">
                    <Camera size={14} color={Palette.textSecondary} />
                    <Text
                      className="text-xs ml-2"
                      style={{ color: Palette.textSecondary }}
                    >
                      Tap to change the QR image
                    </Text>
                  </View>
                </View>
              ) : (
                <View className="items-center">
                  <View
                    className="w-14 h-14 rounded-2xl items-center justify-center"
                    style={{ backgroundColor: Palette.surfaceLight }}
                  >
                    <ImageUp size={24} color={Palette.primary} />
                  </View>
                  <Text
                    className="text-sm font-semibold mt-3"
                    style={{ color: Palette.textPrimary }}
                  >
                    Upload QR Code
                  </Text>
                  <Text
                    className="text-xs mt-1"
                    style={{ color: Palette.textMuted }}
                  >
                    Gallery se choose karein ya camera se scan karein
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {photoError ? (
              <Text className="mt-2 text-xs" style={{ color: Palette.red }}>
                {photoError}
              </Text>
            ) : null}

            <View className="mt-6">
              <MainButton
                title="Save Payment QR"
                Icon={Upload}
                loader={saving}
                disabled={!canSave}
                actionFunc={handleSave}
              />

              {/* Edit mode se bahar nikalne ke liye */}
              {editing ? (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={cancelEdit}
                  disabled={saving}
                  className="items-center py-3"
                >
                  <Text
                    className="text-sm font-semibold"
                    style={{ color: Palette.textSecondary }}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        )}
      </ScrollView>

      <ImageSourceSheet
        visible={sheetOpen}
        onCamera={handleCamera}
        onGallery={handleGallery}
        onClose={closeSheet}
        title="Upload Payment QR"
        subtitle="QR image choose karein — gallery se ya camera se scan karke."
        cameraLabel="Scan / Camera"
        galleryLabel="Gallery"
      />

      {/* Long press preview — image par tap ya close button se band hota hai */}
      <FullScreenImage
        uri={previewUri}
        visible={!!previewUri}
        onClose={() => setPreviewUri(null)}
        caption={previewUri && previewUri === qrUrl ? bankHolderName : null}
      />
    </Wrapper>
  );
};

export default ProfileQrScreen;
