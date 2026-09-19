import React from 'react';

import Wrapper from '../../../layouts/wraper/Wraper';
import SubHeader from '../../../components/header/SubHeader';
import InputField from '../../../components/input/InputField';
import GovernmentIdForm from '../../../components/Selector/GovernmentIdForm';

import { ScrollView, Text, View } from '../../../lib/style/withTailwind';

import { Building2, Home, Mail, Phone, User } from 'lucide-react-native';

import { BookingStepRoute } from '../../../const/routes/route';
import MainButton from '../../../components/buttons/MainButton';
import { Divider } from 'react-native-paper';
import useApplicantForm from '../../../hooks/booking/useApplicantForm';

const Step1ApplicantScreen = ({ navigation, route }: any) => {
  const bookingId = route?.params?.bookingId as string | undefined;
  const {
    applicantName,
    setApplicantName,
    organization,
    setOrganization,
    mobileNumber,
    handleMobileChange,
    address,
    setAddress,
    email,
    handleEmailChange,
    selectedId,
    setSelectedId,
    otherIdName,
    handleOtherIdNameChange,
    otherIdError,
    photo,
    handleCapturePhoto,
    handleGalleryPhoto,
    handleRemovePhoto,
    mobileError,
    emailError,
    formValid,
    loader,
    handleNext,
  } = useApplicantForm({
    onSubmit: ({ applicantData }) =>
      navigation.navigate(BookingStepRoute.Step2Event, {
        applicantData,
        bookingId,
      }),
  });
  return (
    <Wrapper safeBottom>
      <SubHeader navigation={navigation} title="Applicant Information" />

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
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
          title="Email ID"
          value={email}
          setvalue={handleEmailChange}
          placeholder="Enter email address (optional)"
          keyType="email-address"
          Icon={Mail}
        />
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
          otherIdName={otherIdName}
          onChangeOtherIdName={handleOtherIdNameChange}
          otherIdError={otherIdError}
          photo={photo}
          onCapturePhoto={handleCapturePhoto}
          onSelectPhoto={handleGalleryPhoto}
          onRemovePhoto={handleRemovePhoto}
        />
      </ScrollView>
      <MainButton
        title="Next"
        actionFunc={handleNext}
        loader={loader}
        disabled={!formValid}
      />
    </Wrapper>
  );
};

export default Step1ApplicantScreen;
