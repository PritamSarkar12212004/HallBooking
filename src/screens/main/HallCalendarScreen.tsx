import React from 'react';
import Wrapper from '../../layouts/wraper/Wraper';
import MainDerder from '../../components/header/MainDerder';

const HallCalendarScreen = ({ navigation }: any) => {
    return (
        <Wrapper safeBottom>
            <MainDerder navigation={navigation} title="Halls" />
        </Wrapper>
    );
};

export default HallCalendarScreen;