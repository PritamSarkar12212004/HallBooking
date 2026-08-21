import React, { useState, useCallback } from 'react';

import Wrapper from '../../../layouts/wraper/Wraper';
import SubHeader from '../../../components/header/SubHeader';
import InputField from '../../../components/input/InputField';
import MainButton from '../../../components/buttons/MainButton';

import { ScrollView } from '../../../lib/style/withTailwind';
import { Building2, Home, Mail, Phone } from 'lucide-react-native';
import { User } from 'lucide-react-native/icons';
import GovernmentIdForm from '../../../components/Selector/GovernmentIdForm';


const Step1ApplicantScreen = ({ navigation }: any) => {

    const [applicantName, setApplicantName] = useState('');
    const [organization, setOrganization] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [email, setEmail] = useState('');
    const [selectedId, setSelectedId] =
        useState<any | null>(null);

    const handleCapturePhoto = () => {
        console.log('Open Camera');
    };
    const handleNext = useCallback(() => {
        const applicantData = {
            applicantName,
            organization,
            mobileNumber,
            email,
        };

        console.log('Applicant Data:', applicantData);

        navigation.navigate('Step2');
    }, [
        applicantName,
        organization,
        mobileNumber,
        email,
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
                    title="Organization / Company (if any) *"
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
                    value={mobileNumber}
                    setvalue={setMobileNumber}
                    placeholder="Enter Address"
                    keyType="phone-pad"
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
                    onCapturePhoto={handleCapturePhoto}
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