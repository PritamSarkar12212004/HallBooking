import React, { useState } from 'react';
import Wrapper from '../../layouts/wraper/Wraper';
import MainDerder from '../../components/header/MainDerder';
import MainSearchInput from '../../components/input/MainSearchInput';

const BookingListScreen = ({ navigation }: any) => {
    const [search, setSearch] = useState('');

    return (
        <Wrapper safeBottom>
            <MainDerder navigation={navigation} title="Bookings" />
            <MainSearchInput
                placeholder="Search by name or booking ID..."
                value={search}
                setvalue={setSearch}
            />
        </Wrapper>
    );
};

export default BookingListScreen;