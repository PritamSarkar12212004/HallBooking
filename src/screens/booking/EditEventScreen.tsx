import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { Phone, User, UsersRound } from 'lucide-react-native';
import { showMessage } from 'react-native-flash-message';

import Wrapper from '../../layouts/wraper/Wraper';
import SubHeader from '../../components/header/SubHeader';
import { ScrollView, Text, View } from '../../lib/style/withTailwind';
import MainButton from '../../components/buttons/MainButton';
import InputField from '../../components/input/InputField';
import MultiSelector from '../../components/Selector/MultiSelector';
import EvidencePhotoCard from '../../components/booking/EvidencePhotoCard';
import FullScreenImage from '../../components/ui/FullScreenImage';

import { Theme } from '../../const/theme/Theme';
import { useAppSelector } from '../../hooks/redux/redux';
import useGetBookingById from '../../api/booking/hooks/useGetBookingById';
import useUpdateBookingSection from '../../api/booking/hooks/useUpdateBookingSection';
import {
  BOOKING_FOR_OPTIONS,
  BOOKING_FOR_SELF,
  getBookingForMobileError,
  getBookingForNameError,
  isBookingForOther,
  resolveEventEvidenceUrl,
  sanitizeBookingForMobile,
  sanitizeBookingForName,
  sanitizeBookingForRelation,
} from '../../functions/booking/EventFormFunction';
import {
  BookingForFields,
  bookingForFieldsFromBooking,
  buildBookingForPayload,
  hasBookingForChanges,
  isBookingForDraftValid,
} from '../../functions/booking/EditEventFunction';
import { capturePhoto, pickFromGallery } from '../../module/ImagePickerModule';
import useBusyLock from '../../hooks/busy/useBusyLock';

/**
 * Update Event — booking kis ke liye hai (\"Myself\" / \"Someone Else\") aur us
 * person ki details + optional event photo yahan se update hoti hain.
 *
 * Sirf booking-for fields bhejte hain, isliye event ke baaki fields (type,
 * requirements, quantities) chhue bina rehte hain. Kuch change na ho to Save
 * disable rehta hai.
 */
const EditEventScreen = ({ navigation, route }: any) => {
  const bookingId = route.params?.id;
  const user = useAppSelector((state) => state.user.user);
  const queryClient = useQueryClient();

  const { isLoading, booking } = useGetBookingById({
    id: bookingId,
    token: user?.token,
  });
  const { updateSectionAsync } = useUpdateBookingSection();

  // Backend par jo saved hai — change detection isi se hoti hai.
  const saved = useMemo(
    () => bookingForFieldsFromBooking(booking?.event),
    [booking?.event],
  );

  const [bookingFor, setBookingFor] = useState<string[]>([BOOKING_FOR_SELF]);
  const [bookingForName, setBookingForName] = useState('');
  const [bookingForRelation, setBookingForRelation] = useState('');
  const [bookingForMobile, setBookingForMobile] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  // Upload ke dauraan navigation lock — adhoora upload chhoot na jaaye.
  useBusyLock(uploadingPhoto, 'Uploading photo…');
  const [touched, setTouched] = useState(false);
  const [mobileTouched, setMobileTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [prefilled, setPrefilled] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  /* ------------------------------ prefill ------------------------------ */

  useEffect(() => {
    if (!booking?.event || prefilled) return;

    const initial = bookingForFieldsFromBooking(booking.event);

    setBookingFor([initial.bookingFor]);
    setBookingForName(initial.bookingForName);
    setBookingForRelation(initial.bookingForRelation);
    setBookingForMobile(initial.bookingForMobile);
    setPhotoUri(initial.bookingForPhoto || null);
    setPrefilled(true);
  }, [booking, prefilled]);

  /* ------------------------------- values ------------------------------- */

  const forWhom = bookingFor[0] ?? '';
  const someoneElse = isBookingForOther(forWhom);

  const draft: BookingForFields = {
    bookingFor: forWhom,
    bookingForName,
    bookingForRelation,
    bookingForMobile,
    bookingForPhoto: photoUri ?? '',
  };

  const hasChanges = prefilled && hasBookingForChanges(saved, draft);
  const nameError = getBookingForNameError(
    bookingForName,
    touched,
    someoneElse,
  );
  const mobileError = someoneElse
    ? getBookingForMobileError(bookingForMobile, mobileTouched)
    : '';
  const formValid = isBookingForDraftValid(draft);
  const canSave = hasChanges && formValid && !uploadingPhoto;

  /* ------------------------------ handlers ------------------------------ */

  const selectBookingFor = (value: string) => {
    setTouched(true);
    setBookingFor([value]);

    // \"Myself\" par kisi aur ki details rakhi hi nahi jaatin.
    if (!isBookingForOther(value)) {
      setBookingForName('');
      setBookingForRelation('');
      setBookingForMobile('');
      setPhotoUri(null);
    }
  };

  const applyPhoto = async (uri: string) => {
    setPhotoUri(uri);
    setUploadingPhoto(true);

    try {
      // Compress (react-native-compressor) + Cloudinary upload.
      const url = await resolveEventEvidenceUrl(uri);
      setPhotoUri(url || null);
    } catch (error: any) {
      console.log('Event photo upload failed', error);
      setPhotoUri(null);
      showMessage({
        message: 'Upload Failed',
        description: 'Could not upload the photo. Please try again.',
        type: 'danger',
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const capturePhotoNow = async () => {
    const photo = await capturePhoto({ cameraType: 'back' });

    if (photo?.uri) {
      await applyPhoto(photo.uri as string);
    }
  };

  const pickPhotoNow = async () => {
    const photo = await pickFromGallery();

    if (photo?.uri) {
      await applyPhoto(photo.uri as string);
    }
  };

  const handleSave = async () => {
    if (saving) return;

    setTouched(true);

    if (!formValid) {
      setMobileTouched(true);
      showMessage({
        message: 'Check the Details',
        description:
          'Enter the name of the person, and a valid 10-digit contact number (or leave it empty).',
        type: 'warning',
      });
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

    const payload = buildBookingForPayload(saved, draft);

    if (Object.keys(payload).length === 0) {
      showMessage({
        message: 'Nothing to Update',
        description: 'No changes to save.',
        type: 'info',
      });
      return;
    }

    setSaving(true);
    try {
      await updateSectionAsync({
        id: bookingId,
        section: 'event',
        token: user.token,
        data: payload,
      });

      queryClient.invalidateQueries({ queryKey: ['booking', bookingId] });
      showMessage({
        message: 'Event Updated',
        description: 'Booking details saved successfully.',
        type: 'success',
      });
      navigation.goBack();
    } catch (error: any) {
      showMessage({
        message: 'Update Failed',
        description:
          error?.response?.data?.message ||
          error?.message ||
          'Please try again.',
        type: 'danger',
      });
    } finally {
      setSaving(false);
    }
  };

  /* -------------------------------- views -------------------------------- */

  if (isLoading) {
    return (
      <Wrapper safeBottom>
        <SubHeader navigation={navigation} title="Update Event" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={Theme.button.primary} />
        </View>
      </Wrapper>
    );
  }

  if (!booking) {
    return (
      <Wrapper safeBottom>
        <SubHeader navigation={navigation} title="Update Event" />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center" style={{ color: Theme.text.secondary }}>
            Could not load booking. Please go back.
          </Text>
        </View>
      </Wrapper>
    );
  }

  return (
    <Wrapper safeBottom>
      <SubHeader navigation={navigation} title="Update Event" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <View className="mt-2">
          <MultiSelector
            title="Booking For"
            list={BOOKING_FOR_OPTIONS}
            value={bookingFor}
            actionFunc={selectBookingFor}
            selection="Single select"
            Icon={User}
          />

          {someoneElse ? (
            <View className="mb-2">
              <InputField
                title="Name of the Person *"
                value={bookingForName}
                setvalue={(text: string) =>
                  setBookingForName(sanitizeBookingForName(text))
                }
                placeholder="Enter the person's name"
                keyType="default"
                Icon={User}
                bordered
              />
              {/* Reserved error slot keeps layout stable (no UI jump) */}
              <View style={{ minHeight: 16, justifyContent: 'center' }}>
                {nameError ? (
                  <Text className="text-xs" style={{ color: '#FF6B6B' }}>
                    {nameError}
                  </Text>
                ) : null}
              </View>

              <InputField
                title="Relation (optional)"
                value={bookingForRelation}
                setvalue={(text: string) =>
                  setBookingForRelation(sanitizeBookingForRelation(text))
                }
                placeholder="e.g. Brother, Friend, Colleague"
                keyType="default"
                Icon={UsersRound}
                bordered
              />

              <InputField
                title="Contact Number (optional)"
                value={bookingForMobile}
                setvalue={(text: string) => {
                  setMobileTouched(true);
                  setBookingForMobile(sanitizeBookingForMobile(text));
                }}
                placeholder="10-digit mobile number"
                keyType="numeric"
                Icon={Phone}
                bordered
              />
              {/* 10-digit validation — khaali theek, bhara ho to poora number */}
              <View style={{ minHeight: 16, justifyContent: 'center' }}>
                {mobileError ? (
                  <Text className="text-xs" style={{ color: '#FF6B6B' }}>
                    {mobileError}
                  </Text>
                ) : null}
              </View>

              <EvidencePhotoCard
                title="Event Photo (optional)"
                hint="Optional — attach an invite, event photo or any proof."
                readyText="Event photo ready"
                photoUri={photoUri}
                uploading={uploadingPhoto}
                onCapture={capturePhotoNow}
                onPickFromGallery={pickPhotoNow}
                onRemove={() => setPhotoUri(null)}
                onPressPhoto={() => setPreviewUri(photoUri)}
              />
            </View>
          ) : null}
        </View>
      </ScrollView>

      <MainButton
        title="Save"
        actionFunc={handleSave}
        loader={saving}
        disabled={!canSave}
      />

      {/* Photo full screen preview (tap par) */}
      <FullScreenImage
        uri={previewUri}
        visible={!!previewUri}
        onClose={() => setPreviewUri(null)}
      />
    </Wrapper>
  );
};

export default EditEventScreen;
