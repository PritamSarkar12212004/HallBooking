import React from 'react';
import Wrapper from '../../layouts/wraper/Wraper';
import MainDerder from '../../components/header/MainDerder';

const HomeScreen = ({ navigation }: any) => {
    return (
        <Wrapper safeBottom>
            <MainDerder navigation={navigation} title="Home" />
        </Wrapper>
    );
};

export default HomeScreen;