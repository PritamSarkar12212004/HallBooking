import React, { useState, useCallback } from 'react';

import Wrapper from '../../../layouts/wraper/Wraper';
import SubHeader from '../../../components/header/SubHeader';
import InputField from '../../../components/input/InputField';
import MainButton from '../../../components/buttons/MainButton';
import GovernmentIdForm from '../../../components/Selector/GovernmentIdForm';

import {
    ScrollView,
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

const Step1ApplicantScreen = ({ navigation }: any) => {

    const [applicantName, setApplicantName] = useState('');
    const [organization, setOrganization] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [address, setAddress] = useState('');
    const [email, setEmail] = useState('');

    const [img, setImg] = useState<any>(null);

    const [selectedId, setSelectedId] =
        useState<any | null>(null);

    // Camera
    const handleCapturePhoto = useCallback(async () => {

        const photo = await capturePhoto();

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

    // Remove
    const handleRemovePhoto = useCallback(() => {
        setImg(null);
    }, []);

    const handleNext = useCallback(() => {

        const applicantData = {
            applicantName,
            organization,
            mobileNumber,
            address,
            email,

            governmentId: selectedId,

            governmentIdPhoto: img?.uri ?? null,
        };

        console.log(
            'Applicant Data:',
            applicantData
        );

        navigation.navigate('Step2', {
            applicantData,
        });

    }, [
        applicantName,
        organization,
        mobileNumber,
        address,
        email,
        selectedId,
        img,
        navigation,
    ]);

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

                <InputField
                    title="Organization / Company (if any)"
                    value={organization}
                    setvalue={setOrganization}
                    placeholder="Enter organization or company name"
                    keyType="default"
                    Icon={Building2}
                />

                <InputField
                    title="Mobile Number *"
                    value={mobileNumber}
                    setvalue={setMobileNumber}
                    placeholder="Enter mobile number"
                    keyType="phone-pad"
                    Icon={Phone}
                />

                <InputField
                    title="Address *"
                    value={address}
                    setvalue={setAddress}
                    placeholder="Enter address"
                    keyType="default"
                    Icon={Home}
                />

                <InputField
                    title="Email ID *"
                    value={email}
                    setvalue={setEmail}
                    placeholder="Enter email address"
                    keyType="email-address"
                    Icon={Mail}
                />

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

            <MainButton
                title="Next"
                actionFunc={handleNext}
            />

        </Wrapper>
    );
};

export default Step1ApplicantScreen;