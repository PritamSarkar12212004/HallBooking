import React from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';

import Wrapper from '../../../layouts/wraper/Wraper';
import SubHeader from '../../../components/header/SubHeader';
import InputField from '../../../components/input/InputField';
import MainButton from '../../../components/buttons/MainButton';
import MultiSelector from '../../../components/Selector/MultiSelector';
import RequirementQuantityList from '../../../components/booking/RequirementQuantityList';
import EvidencePhotoCard from '../../../components/booking/EvidencePhotoCard';

import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from '../../../lib/style/withTailwind';
import { Divider } from 'react-native-paper';
import {
  CalendarCheck,
  CalendarDays,
  Hash,
  Phone,
  Plus,
  User,
  UsersRound,
  X,
} from 'lucide-react-native';

import { BookingStepRoute } from '../../../const/routes/route';
import { Theme } from '../../../const/theme/Theme';
import EventDetailsSkeleton from '../../../ui/Skeleton/EventDetailsSkeleton';
import useEventForm from '../../../hooks/booking/useEventForm';


const Step2EventScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const bookingId = route?.params?.bookingId as string | undefined;

  const {
    loadingBooking,
    loadingMeta,
    metaError,
    eventTypeOptions,
    selectedEventType,
    selectEventType,
    customEventType,
    setCustomEventType,
    addCustomEventType,
    removeCustomEventType,
    extraEventTypes,
    isOtherSelected,
    otherEventName,
    changeOtherEventName,
    otherEventError,
    bookingForOptions,
    bookingFor,
    selectBookingFor,
    isBookingForSomeoneElse,
    bookingForName,
    changeBookingForName,
    bookingForRelation,
    changeBookingForRelation,
    bookingForMobile,
    changeBookingForMobile,
    bookingForNameError,
    bookingForPhotoUri,
    uploadingBookingForPhoto,
    captureBookingForPhoto,
    pickBookingForPhotoFromGallery,
    removeBookingForPhoto,
    bookingForMobileError,
    touchBookingForMobile,
    expectedAttendance,
    setExpectedAttendance,
    requirementOptions,
    selectedRequirements,
    toggleRequirement,
    quantityItems,
    changeRequirementQuantity,
    quantitiesTouched,
    customRequirement,
    setCustomRequirement,
    addCustomRequirement,
    removeCustomRequirement,
    extraRequirements,
    evidenceUri,
    uploadingEvidence,
    captureEvidence,
    pickEvidenceFromGallery,
    removeEvidence,
    formValid,
    loader,
    handleNext,
  } = useEventForm({
    bookingId,
    onNext: () => navigation.navigate(BookingStepRoute.Step3Schedule, { bookingId }),
  });
  return (
    <Wrapper safeBottom>
      <SubHeader navigation={navigation} title="Event Details" />

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {loadingMeta ? (
          <EventDetailsSkeleton />
        ) : (
          <>
            <InputField
              title="Expected Attendance *"
              value={expectedAttendance}
              setvalue={setExpectedAttendance}
              placeholder="Enter expected number of guests"
              keyType="numeric"
              Icon={UsersRound}
            />

            <MultiSelector
              title="Type of Event"
              list={eventTypeOptions}
              value={selectedEventType}
              actionFunc={selectEventType}
              selection="Single select"
              Icon={CalendarDays}
            />

            {/* "Other" select hone par naam — iske bina Next disabled rehta hai. */}
            {isOtherSelected && (
              <View className="mb-4">
                <InputField
                  title="Event Type Name *"
                  value={otherEventName}
                  setvalue={changeOtherEventName}
                  placeholder="Enter event type (e.g. Baby Shower)"
                  keyType="default"
                  Icon={Hash}
                  bordered
                />
                {/* Reserved error slot keeps layout stable (no UI jump) */}
                <View style={{ minHeight: 16, justifyContent: 'center' }}>
                  {otherEventError ? (
                    <Text className="text-xs" style={{ color: '#FF6B6B' }}>
                      {otherEventError}
                    </Text>
                  ) : null}
                </View>
              </View>
            )}

            <View className="flex-row items-center gap-2 mb-6">
              <View
                className="flex-1 flex-row items-center rounded-xl px-3"
                style={{ backgroundColor: Theme.background.secondary }}
              >
                <TextInput
                  className="flex-1 py-3 text-white"
                  placeholder="Add custom event type"
                  placeholderTextColor="#8F8B91"
                  value={customEventType}
                  onChangeText={setCustomEventType}
                />
              </View>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={addCustomEventType}
                className="w-11 h-11 rounded-xl items-center justify-center"
                style={{ backgroundColor: Theme.button.primary }}
              >
                <Plus size={20} color={Theme.background.primary} />
              </TouchableOpacity>
            </View>

            {/* Custom-created event types can be removed */}
            {extraEventTypes.length > 0 && (
              <View className="flex-row flex-wrap gap-2 mb-6">
                {extraEventTypes.map((name) => (
                  <TouchableOpacity
                    key={name}
                    activeOpacity={0.85}
                    onPress={() => removeCustomEventType(name)}
                    className="flex-row items-center gap-1 px-4 py-2.5 rounded-full border"
                    style={{
                      borderColor: Theme.button.primary,
                      backgroundColor: 'rgba(248,239,203,0.12)',
                    }}
                  >
                    <Text
                      className="text-sm font-medium"
                      style={{ color: Theme.text.primary }}
                    >
                      {name}
                    </Text>
                    <X size={14} color={Theme.button.primary} />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Booking kis ke liye hai — "Someone Else" par uska naam +
                optional event photo. */}
            <MultiSelector
              title="Booking For"
              list={bookingForOptions}
              value={bookingFor}
              actionFunc={selectBookingFor}
              selection="Single select"
              Icon={User}
            />

            {isBookingForSomeoneElse && (
              <View className="mb-2">
                <InputField
                  title="Name of the Person *"
                  value={bookingForName}
                  setvalue={changeBookingForName}
                  placeholder="Enter the person's name"
                  keyType="default"
                  Icon={User}
                  bordered
                />
                {/* Reserved error slot keeps layout stable (no UI jump) */}
                <View style={{ minHeight: 16, justifyContent: 'center' }}>
                  {bookingForNameError ? (
                    <Text className="text-xs" style={{ color: '#FF6B6B' }}>
                      {bookingForNameError}
                    </Text>
                  ) : null}
                </View>

                <InputField
                  title="Relation (optional)"
                  value={bookingForRelation}
                  setvalue={changeBookingForRelation}
                  placeholder="e.g. Brother, Friend, Colleague"
                  keyType="default"
                  Icon={UsersRound}
                  bordered
                />

                <InputField
                  title="Contact Number (optional)"
                  value={bookingForMobile}
                  setvalue={(text: string) => {
                    touchBookingForMobile();
                    changeBookingForMobile(text);
                  }}
                  placeholder="10-digit mobile number"
                  keyType="numeric"
                  Icon={Phone}
                  bordered
                />
                {/* 10-digit validation — khaali chhod sakte hain, par bhara ho to poora number */}
                <View style={{ minHeight: 16, justifyContent: 'center' }}>
                  {bookingForMobileError ? (
                    <Text className="text-xs" style={{ color: '#FF6B6B' }}>
                      {bookingForMobileError}
                    </Text>
                  ) : null}
                </View>

                <EvidencePhotoCard
                  title="Event Photo (optional)"
                  hint="Optional — attach an invite, event photo or any proof."
                  readyText="Event photo ready"
                  photoUri={bookingForPhotoUri}
                  uploading={uploadingBookingForPhoto}
                  onCapture={captureBookingForPhoto}
                  onPickFromGallery={pickBookingForPhotoFromGallery}
                  onRemove={removeBookingForPhoto}
                />
              </View>
            )}

            {isOtherSelected && (
              <EvidencePhotoCard
                photoUri={evidenceUri}
                uploading={uploadingEvidence}
                onCapture={captureEvidence}
                onPickFromGallery={pickEvidenceFromGallery}
                onRemove={removeEvidence}
              />
            )}

            <View className="mb-3">
              <Divider />
            </View>
            <MultiSelector
              title="Hall Requirements"
              list={requirementOptions}
              value={selectedRequirements}
              actionFunc={toggleRequirement}
              selection="Multiple select"
              Icon={CalendarCheck}
            />

            {/* Jo requirement select hoga, usi ka quantity input yahan aata hai. */}
            <RequirementQuantityList
              items={quantityItems}
              onChangeQuantity={changeRequirementQuantity}
              showErrors={quantitiesTouched}
            />

            {/* Add custom requirement */}
            <View className="flex-row items-center gap-2 mb-4">
              <View
                className="flex-1 flex-row items-center rounded-xl px-3"
                style={{ backgroundColor: Theme.background.secondary }}
              >
                <TextInput
                  className="flex-1 py-3 text-white"
                  placeholder="Add custom requirement"
                  placeholderTextColor="#8F8B91"
                  value={customRequirement}
                  onChangeText={setCustomRequirement}
                />
              </View>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={addCustomRequirement}
                className="w-11 h-11 rounded-xl items-center justify-center"
                style={{ backgroundColor: Theme.button.primary }}
              >
                <Plus size={20} color={Theme.background.primary} />
              </TouchableOpacity>
            </View>

            {extraRequirements.length > 0 && (
              <View className="flex-row flex-wrap gap-2 mb-4">
                {extraRequirements.map((name) => (
                  <TouchableOpacity
                    key={name}
                    activeOpacity={0.85}
                    onPress={() => removeCustomRequirement(name)}
                    className="flex-row items-center gap-1 px-4 py-2.5 rounded-full border"
                    style={{
                      borderColor: Theme.button.primary,
                      backgroundColor: 'rgba(248,239,203,0.12)',
                    }}
                  >
                    <Text
                      className="text-sm font-medium"
                      style={{ color: Theme.text.primary }}
                    >
                      {name}
                    </Text>
                    <X size={14} color={Theme.button.primary} />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {metaError && (
              <Text
                className="text-center text-sm mb-3"
                style={{ color: '#F87171' }}
              >
                Could not load options. Please restart the app or try again.
              </Text>
            )}
          </>
        )}
      </ScrollView>

      <MainButton
        title="Next"
        actionFunc={handleNext}
        loader={loader || loadingBooking || loadingMeta}
        disabled={!formValid}
      />
    </Wrapper>
  );
};

export default Step2EventScreen;