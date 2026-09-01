import React, { useState, useCallback, useMemo } from 'react';

import Wrapper from '../../../layouts/wraper/Wraper';
import SubHeader from '../../../components/header/SubHeader';
import InputField from '../../../components/input/InputField';
import GovernmentIdForm from '../../../components/Selector/GovernmentIdForm';

import {
    ScrollView,
    Text,
    View,
} from '../../../lib/style/withTailwind';

import {
    Building2,
    Home,
    Mail,
    Phone,
    User,
} from 'lucide-react-native';

import {
    capturePhoto,
    pickFromGallery,
} from '../../../module/ImagePickerModule';
import { BookingStepRoute } from '../../../const/routes/route';
import MainButton from '../../../components/buttons/MainButton';
import { Divider } from 'react-native-paper';
import uploadImage from '../../../services/Cloudinary/uploadImg';
import {
    getDraft,
    updateDraft,
} from '../../../manager/draftBookingStore';
import { showMessage } from 'react-native-flash-message';

const Step1ApplicantScreen = ({ navigation, route }: any) => {
    const bookingId = route?.params?.bookingId as string | undefined;
    // Prefill from the local draft (if the user is coming back).
    const draftApplicant = getDraft()?.applicant;
    const [applicantName, setApplicantName] = useState(draftApplicant?.name ?? '');
    const [organization, setOrganization] = useState(draftApplicant?.organization ?? '');
    const [mobileNumber, setMobileNumber] = useState(draftApplicant?.mobile ?? '');
    const [address, setAddress] = useState(draftApplicant?.address ?? '');
    const [email, setEmail] = useState(draftApplicant?.email ?? '');

    const [loader, setloader] = useState<boolean>(false)
    const [mobileTouched, setMobileTouched] = useState(false);
    const [emailTouched, setEmailTouched] = useState(false);
    const [img, setImg] = useState<any>(
        draftApplicant?.governmentIdPhoto
            ? { uri: draftApplicant.governmentIdPhoto }
            : null,
    );
    const [selectedId, setSelectedId] =
        useState<any | null>(draftApplicant?.governmentIdType ?? null);

    // Mobile: allow digits only, capped at 10.
    const handleMobileChange = useCallback((text: string) => {
        setMobileNumber(text.replace(/[^0-9]/g, '').slice(0, 10));
    }, []);

    const handleEmailChange = useCallback((text: string) => {
        setEmail(text.trim());
    }, []);

    const mobileValid = /^\d{10}$/.test(mobileNumber);
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());

    const mobileError =
        mobileTouched && !mobileValid
            ? mobileNumber.length === 0
                ? 'Mobile number is required'
                : mobileNumber.length < 10
                    ? `Enter all 10 digits (${mobileNumber.length}/10)`
                    : 'Enter a valid 10-digit mobile number'
            : '';

    const emailError =
        emailTouched && !emailValid
            ? email.trim().length === 0
                ? 'Email is required'
                : 'Enter a valid email address (e.g. name@example.com)'
            : '';

    // Form is valid only when every required field passes validation.
    const formValid = useMemo(
        () =>
            applicantName.trim().length > 0 &&
            mobileValid &&
            emailValid &&
            address.trim().length > 0 &&
            !!selectedId &&
            !!img?.uri,
        [applicantName, mobileValid, emailValid, address, selectedId, img],
    );

    const handleCapturePhoto = useCallback(async () => {

        const photo = await capturePhoto({ cameraType: "back" });

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

    const handleRemovePhoto = useCallback(() => {
        setImg(null);
    }, []);

    const handleNext = useCallback(async () => {
        if (loader) {
            return;
        }

        if (!formValid) {
            setMobileTouched(true);
            setEmailTouched(true);
            showMessage({
                message: 'Complete Required Fields',
                description: 'Please fill all required fields with valid details.',
                type: 'warning',
            });
            return;
        }

        // DRAFT SYSTEM: save the applicant section locally — no API call.
        // Government ID photo is uploaded to Cloudinary now so the final
        // create has a URL ready.
        setloader(true)
        try {
            let governmentIdPhoto = '';
            if (img?.uri) {
                const uploaded = await uploadImage(img.uri);
                governmentIdPhoto = uploaded.secure_url;
            }

            updateDraft('applicant', {
                name: applicantName,
                organization,
                mobile: mobileNumber,
                address,
                email,
                governmentIdType: selectedId ?? undefined,
                governmentIdPhoto,
            });

            navigation.navigate(BookingStepRoute.Step2Event, {
                applicantData: {
                    applicantName,
                    organization,
                    mobileNumber,
                    address,
                    email,
                    governmentId: selectedId,
                    governmentIdPhoto,
                },
                bookingId,
            });
        } catch (error: any) {
            showMessage({
                message: 'Upload Failed',
                description:
                    error?.response?.data?.message ||
                    error?.message ||
                    'Please try again.',
                type: 'danger',
                duration: 3000,
            });
        } finally {
            setloader(false)
        }

    }, [
        loader,
        formValid,
        applicantName,
        organization,
        mobileNumber,
        address,
        email,
        selectedId,
        img,
        navigation,
        bookingId,
    ])

    return (
        <Wrapper safeBottom>

            <SubHeader
                navigation={navigation}
                title="Applicant Information"
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                className="flex-1"
            >

                <InputField
                    title="Name of Applicant *"
                    value={applicantName}
                    setvalue={setApplicantName}
                    placeholder="Enter applicant name"
                    keyType="default"
                    Icon={User}
                />
                <View className="mb-2">
                    <Divider />
                </View>
                <InputField
                    title="Organization / Company (if any)"
                    value={organization}
                    setvalue={setOrganization}
                    placeholder="Enter organization or company name"
                    keyType="default"
                    Icon={Building2}
                />
                <View className="mb-2">
                    <Divider />
                </View>
                <InputField
                    title="Mobile Number *"
                    value={mobileNumber}
                    setvalue={handleMobileChange}
                    placeholder="Enter 10-digit mobile number"
                    keyType="phone-pad"
                    Icon={Phone}
                />
                {/* Reserved error slot keeps layout stable (no UI jump) */}
                <View style={{ minHeight: 16, justifyContent: 'center' }}>
                    {mobileError ? (
                        <Text className="text-xs" style={{ color: '#FF6B6B' }}>
                            {mobileError}
                        </Text>
                    ) : null}
                </View>
                <View className="mb-2">
                    <Divider />
                </View>
                <InputField
                    title="Address *"
                    value={address}
                    setvalue={setAddress}
                    placeholder="Enter address"
                    keyType="default"
                    Icon={Home}
                />
                <View className="mb-2">
                    <Divider />
                </View>
                <InputField
                    title="Email ID *"
                    value={email}
                    setvalue={handleEmailChange}
                    placeholder="Enter email address"
                    keyType="email-address"
                    Icon={Mail}
                />
                {/* Reserved error slot keeps layout stable (no UI jump) */}
                <View style={{ minHeight: 16, justifyContent: 'center' }}>
                    {emailError ? (
                        <Text className="text-xs" style={{ color: '#FF6B6B' }}>
                            {emailError}
                        </Text>
                    ) : null}
                </View>
                <View className="mb-3">
                    <Divider />
                </View>
                <GovernmentIdForm
                    selectedId={selectedId}
                    onSelectId={setSelectedId}

                    photo={img}

                    onCapturePhoto={
                        handleCapturePhoto
                    }

                    onSelectPhoto={
                        handleGalleryPhoto
                    }

                    onRemovePhoto={
                        handleRemovePhoto
                    }
                />

            </ScrollView>
            <MainButton title="Next" actionFunc={handleNext} loader={loader} disabled={!formValid} />
        </Wrapper>
    );
};

export default Step1ApplicantScreen;