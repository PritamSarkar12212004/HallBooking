import React, { useState, useCallback } from 'react';
import { FlatList, TouchableOpacity, RefreshControl } from '../../lib/style/withTailwind';
import { Plus } from 'lucide-react-native';

import Wrapper from '../../layouts/wraper/Wraper';
import MainDerder from '../../components/header/MainDerder';
import MainSearchInput from '../../components/input/MainSearchInput';
import { Theme } from '../../const/theme/Theme';
import { MainRoute } from '../../const/routes/route';
import { useAppSelector } from '../../hooks/redux/redux';
import useListBookings from '../../api/booking/hooks/useListBookings';
import BookingListSkeleton from '../../ui/Skeleton/BookingListSkeleton';
import BookingListCard from '../../components/card/list/BookingListCard';
import { bookingListInterface } from '../../interface/api/bookintInterface';

const BookingListScreen = ({ navigation }: any) => {
    const user = useAppSelector((state) => state.user.user);
    const [search, setSearch] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    const { bookings, isLoading, refetch } = useListBookings(user?.token);

    const typedBookings: bookingListInterface[] = (bookings as bookingListInterface[]) ?? [];

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await refetch();
        } finally {
            setRefreshing(false);
        }
    }, [refetch]);

    return (
        <Wrapper safeBottom>
            <MainDerder
                navigation={navigation}
                title="Bookings"
                right={
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => navigation.navigate(MainRoute.HallCalendar)}
                        style={{
                            backgroundColor: Theme.button.primary,
                            width: 36,
                            height: 36,
                            borderRadius: 18,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Plus size={20} color="#000" />
                    </TouchableOpacity>
                }
            />

            {isLoading && !refreshing ? (
                <BookingListSkeleton />
            ) : (
                <>
                    <MainSearchInput
                        placeholder="Search by name or booking ID..."
                        value={search}
                        setvalue={setSearch}
                    />

                    <FlatList<bookingListInterface>
                        data={typedBookings}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => <BookingListCard item={item} />}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                tintColor={Theme.button.primary}
                                colors={[Theme.button.primary]}
                                progressBackgroundColor={Theme.background.secondary}
                            />
                        }
                    />
                </>
            )}
        </Wrapper>
    );
};

export default BookingListScreen;