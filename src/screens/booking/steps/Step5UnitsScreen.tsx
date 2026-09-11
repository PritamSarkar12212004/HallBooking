import React, { useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';

import Wrapper from '../../../layouts/wraper/Wraper';
import SubHeader from '../../../components/header/SubHeader';
import { ScrollView } from '../../../lib/style/withTailwind';
import MainButton from '../../../components/buttons/MainButton';
import UnitsSection, {
    UnitRow,
    createDefaultUnitRows,
    newUnitRow,
    unitRowsToPayload,
} from '../../../components/booking/UnitsSection';

import { BookingStepRoute } from '../../../const/routes/route';
import { getDraft, updateDraft } from '../../../manager/draftBookingStore';

const Step5UnitsScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const bookingId = route?.params?.bookingId as string | undefined;

    const [rows, setRows] = useState<UnitRow[]>(() => {
        const d = getDraft()?.units;
        if (d && d.length > 0) {
            return d.map((u) =>
                newUnitRow(
                    u.label,
                    u.perUnit ? String(u.perUnit) : '',
                    false,
                    u.currentUnit ? String(u.currentUnit) : '',
                ),
            );
        }
        return createDefaultUnitRows();
    });

    const handleNext = () => {
        // DRAFT SYSTEM: units are stored locally and merged into the payment
        // section when the booking is submitted.
        updateDraft('units', unitRowsToPayload(rows));

        navigation.navigate(BookingStepRoute.Step5Requirements, {
            bookingId,
        });
    };

    return (
        <Wrapper safeBottom>
            <SubHeader navigation={navigation} title="Units" />
            <ScrollView
                showsVerticalScrollIndicator={false}
                className="flex-1"
            >
                <UnitsSection rows={rows} setRows={setRows} />
            </ScrollView>
            <MainButton title="Next" actionFunc={handleNext} />
        </Wrapper>
    );
};

export default Step5UnitsScreen;
