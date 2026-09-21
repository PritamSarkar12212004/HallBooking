import React from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';

import Wrapper from '../../../layouts/wraper/Wraper';
import SubHeader from '../../../components/header/SubHeader';
import { ScrollView, Text, View } from '../../../lib/style/withTailwind';
import MainButton from '../../../components/buttons/MainButton';
import UnitsSection from '../../../components/booking/UnitsSection';

import { BookingStepRoute } from '../../../const/routes/route';
import useUnitsForm from '../../../hooks/booking/useUnitsForm';

/**
 * Units (Step5) — sirf UI.
 *
 * Rate set karna, "abhi reading daalni hai?" toggle, reading + optional meter
 * photo (compress + upload) aur validation sab `useUnitsForm`
 * (src/hooks/booking/useUnitsForm.ts) aur uske rules `UnitsFunction.ts` me hai.
 */
const Step5UnitsScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const bookingId = route?.params?.bookingId as string | undefined;

  const {
    rows,
    setRows,
    uploadingRowId,
    captureRowPhoto,
    pickRowPhoto,
    removeRowPhoto,
    invalidRow,
    formValid,
    handleNext,
  } = useUnitsForm({
    onNext: () =>
      navigation.navigate(BookingStepRoute.Step5Requirements, { bookingId }),
  });

  return (
    <Wrapper safeBottom>
      <SubHeader navigation={navigation} title="Units" />

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <UnitsSection
          rows={rows}
          setRows={setRows}
          onCapturePhoto={captureRowPhoto}
          onPickPhoto={pickRowPhoto}
          onRemovePhoto={removeRowPhoto}
          uploadingRowId={uploadingRowId}
        />

        {/* Kya missing hai — staff ko turant pata chale */}
        {invalidRow && (
          <View
            className="rounded-xl px-3 py-2 mb-3"
            style={{ backgroundColor: '#3A2020' }}
          >
            <Text className="text-xs" style={{ color: '#FF6B6B' }}>
              {`Enter the ${
                invalidRow.perUnit.trim().length === 0
                  ? 'per-unit rate'
                  : 'current reading'
              } for "${invalidRow.label.trim() || 'Unit'}".`}
            </Text>
          </View>
        )}
      </ScrollView>

      <MainButton
        title="Next"
        actionFunc={handleNext}
        disabled={!formValid}
      />
    </Wrapper>
  );
};

export default Step5UnitsScreen;