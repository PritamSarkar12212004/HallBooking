import React, { useState, useCallback, useMemo } from 'react';
import { FlatList, TouchableOpacity, RefreshControl, ScrollView, ActivityIndicator } from '../../lib/style/withTailwind';
import { Text, View } from '../../lib/style/withTailwind';
import { Plus, ListFilter, X, AlertTriangle, RotateCcw } from 'lucide-react-native';

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
import { getApiErrorMessage } from '../../functions/formate/ApiErrorFormate';
import { resetToLogin } from '../../navigations/navigationRef';

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
    const { bookings, isLoading, isError, error, refetch, hasMore, loadMore, isLoadingMore } =
        useListBookings(user?.token);
    const typedBookings = useMemo(
        () => (bookings as bookingListInterface[]) ?? [],
        [bookings],
    );

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

    const onEndReached = useCallback(() => {
        if (hasMore && !isLoadingMore && !isLoading) {
            loadMore();
        }
    }, [hasMore, isLoadingMore, isLoading, loadMore]);

    const listFooter = typedBookings.length > 0 ? (
        <View className="flex-row items-center justify-center pt-6" style={{ gap: 8 }}>
            {isLoadingMore ? (
                <>
                    <ActivityIndicator size="small" color={Theme.button.primary} />
                    <Text className="text-sm font-semibold" style={{ color: Theme.text.secondary }}>
                        Loading more…
                    </Text>
                </>
            ) : hasMore ? (
                <Text className="text-xs" style={{ color: Theme.text.secondary }}>
                    Scroll down to load more
                </Text>
            ) : (
                <Text className="text-xs" style={{ color: Theme.text.secondary }}>
                    You're all caught up
                </Text>
            )}
        </View>
    ) : undefined;

    const filteredBookings = useMemo(() => {
        const query = search.trim().toLowerCase();
        let list = typedBookings;
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
                (b) =>
                    b.status === 'Ended' ||
                    (b.paymentStatus === 'Paid' && (b.balanceAmount || 0) <= 0),
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

    // Error par "No bookings found yet" dikhana galat tha — user ko lagta tha ki
    // booking hi nahi hai. Ab saaf reason + action dikhta hai.
    const renderStatusState = (
        title: string,
        message: string,
        actionLabel: string,
        onPress: () => void,
    ) => (
        <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor={Theme.button.primary}
                    colors={[Theme.button.primary]}
                    progressBackgroundColor={Theme.background.secondary}
                />
            }
        >
            <View className="items-center justify-center py-16 px-8">
                <View
                    className="w-14 h-14 rounded-full items-center justify-center mb-4"
                    style={{ backgroundColor: 'rgba(255,107,107,0.12)' }}
                >
                    <AlertTriangle size={26} color="#FF6B6B" />
                </View>

                <Text className="text-sm font-semibold mb-1" style={{ color: Theme.text.primary }}>
                    {title}
                </Text>

                <Text className="text-center text-xs mb-5" style={{ color: Theme.text.secondary }}>
                    {message}
                </Text>

                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={onPress}
                    className="flex-row items-center justify-center rounded-full px-5 py-3"
                    style={{ backgroundColor: Theme.button.primary, gap: 8 }}
                >
                    <RotateCcw size={16} color="#000" />
                    <Text className="text-sm font-bold" style={{ color: '#000' }}>
                        {actionLabel}
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );

    // Token hi na ho to query disable rehti hai (koi request nahi) — user ko
    // khali list ke bajaye saaf login prompt milna chahiye.
    const sessionMissing = !user?.token;

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
            ) : isError && typedBookings.length === 0 ? (
                renderStatusState(
                    'Bookings load nahi ho paayi',
                    getApiErrorMessage(
                        error,
                        'Network error. Please check your connection.',
                    ),
                    'Try Again',
                    onRefresh,
                )
            ) : sessionMissing ? (
                renderStatusState(
                    'Session missing',
                    'Aapka login session nahi mila. Please login again.',
                    'Go to Login',
                    () => resetToLogin(),
                )
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
                                placeholder="Search by name, event"
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
                    onEndReached={onEndReached}
                    ListFooterComponent={listFooter}
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