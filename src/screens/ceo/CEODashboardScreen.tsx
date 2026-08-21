import React from 'react';
import Wrapper from '../../layouts/wraper/Wraper';
import MainDerder from '../../components/header/MainDerder';

const CEODashboardScreen = ({ navigation }: any) => {
    return (
        <Wrapper safeBottom>
            <MainDerder navigation={navigation} title="Dashboard" />
        </Wrapper>
    );
};

export default CEODashboardScreen;