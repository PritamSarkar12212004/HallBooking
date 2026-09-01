import React, { useState, useCallback, useMemo } from 'react';
import { FlatList, TouchableOpacity, RefreshControl, ScrollView } from '../../lib/style/withTailwind';
import { Text, View } from '../../lib/style/withTailwind';
import { Plus, ListFilter, X } from 'lucide-react-native';

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

type FilterKey = 'All' | 'Ongoing' | 'Paid' | 'Due' | 'Done' | 'Cancelled';

const FILTERS: { key: FilterKey; label: string }[] = [
    { key: 'All', label: 'All' },
    { key: 'Ongoing', label: 'Ongoing' },
    { key: 'Paid', label: 'Paid' },
    { key: 'Due', label: 'Due' },
    { key: 'Done', label: 'Done' },
    { key: 'Cancelled', label: 'Cancelled' },
];

const BookingListScreen = ({ navigation }: any) => {
    const user = useAppSelector((state) => state.user.user);
    const [search, setSearch] = useState('');
    const [activeFilter, setActiveFilter] = useState<FilterKey>('All');
    const [refreshing, setRefreshing] = useState(false);
    const { bookings, isLoading, refetch } = useListBookings(user?.token);
    const typedBookings: bookingListInterface[] = (bookings as bookingListInterface[]) ?? [];

    const navigateDetiles = useCallback((id: string) => {
        navigation.navigate(MainRoute.BookingDetail, { id });
    }, [navigation]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await refetch();
        } finally {
            setRefreshing(false);
        }
    }, [refetch]);

    // Best-performance filtering: memoized so it only recomputes when the
    // search term, active chip, or data actually changes (no per-keypress).
    const filteredBookings = useMemo(() => {
        const query = search.trim().toLowerCase();
        let list = typedBookings;

        // Status chip filter
        if (activeFilter === 'Ongoing') {
            list = list.filter((b) => b.status !== 'Cancelled');
        } else if (activeFilter === 'Paid') {
            list = list.filter(
                (b) => b.paymentStatus === 'Paid' && (b.balanceAmount || 0) <= 0,
            );
        } else if (activeFilter === 'Due') {
            list = list.filter((b) => (b.balanceAmount || 0) > 0);
        } else if (activeFilter === 'Done') {
            list = list.filter(
                (b) => b.paymentStatus === 'Paid' && (b.balanceAmount || 0) <= 0,
            );
        } else if (activeFilter === 'Cancelled') {
            list = list.filter((b) => b.status === 'Cancelled');
        }

        // Text search across applicant, event, hall, booking id, taken by
        if (query) {
            list = list.filter((b) =>
                [b.eventName, b.applicantName, b.hallName, b.eventType, b.takenBy, b.id]
                    .some((val) => String(val || '').toLowerCase().includes(query)),
            );
        }

        return list;
    }, [typedBookings, search, activeFilter]);

    const listHeader = (
        <>
            <View
                className="flex-row items-center gap-1.5 mb-3"
                style={{ paddingHorizontal: 2 }}
            >
                <ListFilter size={15} color={Theme.text.secondary} />
                <Text className="text-xs font-semibold" style={{ color: Theme.text.secondary }}>
                    Status
                </Text>
            </View>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mb-4"
                contentContainerStyle={{ gap: 8 }}
            >
                {FILTERS.map((f) => {
                    const isActive = activeFilter === f.key;
                    return (
                        <TouchableOpacity
                            key={f.key}
                            activeOpacity={0.8}
                            onPress={() => setActiveFilter(f.key)}
                            className="px-4 py-2 rounded-full"
                            style={{
                                backgroundColor: isActive
                                    ? Theme.button.primary
                                    : Theme.background.secondary,
                                borderWidth: 1,
                                borderColor: isActive
                                    ? Theme.button.primary
                                    : Theme.background.third,
                            }}
                        >
                            <Text
                                className="text-xs font-bold"
                                style={{ color: isActive ? '#000' : Theme.text.secondary }}
                            >
                                {f.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
                {activeFilter !== 'All' && (
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => setActiveFilter('All')}
                        className="px-3 py-2 rounded-full items-center justify-center"
                        style={{ backgroundColor: '#3A2020' }}
                    >
                        <X size={14} color="#FF6B6B" />
                    </TouchableOpacity>
                )}
            </ScrollView>
        </>
    );

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
                <FlatList
                    data={filteredBookings}
                    keyExtractor={(item: any) => item.id}
                    renderItem={({ item }) => (
                        <BookingListCard item={item as bookingListInterface} actionPress={navigateDetiles} />
                    )}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={
                        <View className=" pt-2">
                            <MainSearchInput
                                placeholder="Search by name, event, hall, or booking ID..."
                                value={search}
                                setvalue={setSearch}
                            />
                            {listHeader}
                        </View>
                    }
                    ListEmptyComponent={
                        <View className="items-center justify-center py-16 px-8">
                            <Text className="text-center text-sm" style={{ color: Theme.text.secondary }}>
                                {search || activeFilter !== 'All'
                                    ? 'No bookings match your search or filter.'
                                    : 'No bookings found yet.'}
                            </Text>
                        </View>
                    }
                    contentContainerStyle={{ paddingBottom: 20 }}
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
            )}
        </Wrapper>
    );
};

export default BookingListScreen;