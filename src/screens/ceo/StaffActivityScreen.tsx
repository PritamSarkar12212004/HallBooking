import React from 'react';
import Wrapper from '../../layouts/wraper/Wraper';
import MainDerder from '../../components/header/MainDerder';

const StaffActivityScreen = ({ navigation }: any) => {
    return (
        <Wrapper safeBottom>
            <MainDerder navigation={navigation} title="Staff Activity" />
        </Wrapper>
    );
};

export default StaffActivityScreen;