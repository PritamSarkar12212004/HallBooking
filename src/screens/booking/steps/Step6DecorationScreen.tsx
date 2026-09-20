import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { FileSignature } from 'lucide-react-native';

import Wrapper from '../../../layouts/wraper/Wraper';
import SubHeader from '../../../components/header/SubHeader';
import { ScrollView, Text, View } from '../../../lib/style/withTailwind';

import MainButton from '../../../components/buttons/MainButton';
import SignatureCard from '../../../components/booking/SignatureCard';
import SignaturePadModal from '../../../components/booking/SignaturePadModal';

import { Theme } from '../../../const/theme/Theme';
import { BookingStepRoute } from '../../../const/routes/route';
import { DECLARATION_TERM } from '../../../functions/booking/DeclarationFunction';
import useDeclarationForm from '../../../hooks/booking/useDeclarationForm';

/**
 * Declaration (Step6) — sirf UI.
 *
 * Applicant + Manager dono ab **finger signature** lete hain (pehle camera se
 * photo li jaati thi). Sign pad `SignaturePadModal` me khulta hai aur canvas
 * PNG data URL deta hai; compress (react-native-compressor) + Cloudinary upload
 * + booking create/update sab `useDeclarationForm`
 * (src/hooks/booking/useDeclarationForm.ts) me hai, rules
 * `DeclarationFunction.ts` me.
 */
const Step6DecorationScreen = () => {
    const navigation = useNavigation<any>();

    const {
        applicantSignature,
        managerSignature,
        activePad,
        activePadTitle,
        openApplicantPad,
        openManagerPad,
        closePad,
        saveSignature,
        clearSignature,
        formValid,
        loader,
        handleNext,
    } = useDeclarationForm({
        onNext: ({ bookingId, bookingNumber }) =>
            navigation.replace(BookingStepRoute.BookingSuccess, {
                bookingId,
                bookingNumber,
            }),
    });

    return (
        <Wrapper safeBottom>
            <SubHeader navigation={navigation} title="Declaration" />

            <ScrollView
                showsVerticalScrollIndicator={false}
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 20 }}
            >
                <Text className="text-[#B8B5BA] text-sm leading-5 mb-6">
                    {DECLARATION_TERM}
                </Text>

                <View className="flex-row items-center gap-2 mb-1">
                    <FileSignature size={20} color={Theme.button.primary} />
                    <Text className="text-white text-base font-semibold">
                        Signatures
                    </Text>
                </View>
                <Text className="text-[#8F8B91] text-xs mb-4">
                    Dono signature finger se lein — card par tap karte hi sign pad
                    full screen me khulega (aasani se sign karne ke liye), phir
                    Done dabakar booking save karein.
                </Text>

                <SignatureCard
                    label="Applicant"
                    signature={applicantSignature}
                    onSign={openApplicantPad}
                    onClear={() => clearSignature('applicant')}
                    helper="Applicant apni ungli se sign karein"
                />

                <SignatureCard
                    label="Manager"
                    signature={managerSignature}
                    onSign={openManagerPad}
                    onClear={() => clearSignature('manager')}
                    helper="Manager (staff) apni ungli se sign karein"
                />
            </ScrollView>

            <MainButton
                title="Done"
                actionFunc={handleNext}
                loader={loader}
                disabled={!formValid}
            />

            {/* Khula hone par hi mount — har baar fresh (clean) canvas milta hai. */}
            {activePad !== null && (
                <SignaturePadModal
                    visible
                    title={activePadTitle}
                    onClose={closePad}
                    onSave={saveSignature}
                />
            )}
        </Wrapper>
    );
};

export default Step6DecorationScreen;
