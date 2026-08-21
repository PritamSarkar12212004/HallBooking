import React from 'react';
import Wrapper from '../../layouts/wraper/Wraper';
import MainDerder from '../../components/header/MainDerder';
import { ScrollView } from '../../lib/style/withTailwind';

const ProfileScreen = ({ navigation }: any) => {
    return (
        <Wrapper safeBottom>
            <MainDerder navigation={navigation} title="Profile" />

            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">

            </ScrollView>
        </Wrapper>
    );
};

export default ProfileScreen;