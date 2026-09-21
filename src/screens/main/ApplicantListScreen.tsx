import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from '../../lib/style/withTailwind';
import { Linking, Platform } from 'react-native';
import { showMessage } from 'react-native-flash-message';
import { ArrowDownUp, PhoneOff, RefreshCw } from 'lucide-react-native';

import Wrapper from '../../layouts/wraper/Wraper';
import MainDerder from '../../components/header/MainDerder';
import MainSearchInput from '../../components/input/MainSearchInput';
import ApplicantListCard from '../../components/card/list/ApplicantListCard';
import ApplicantListSkeleton from '../../ui/Skeleton/ApplicantListSkeleton';
import { Theme } from '../../const/theme/Theme';
import { useAppSelector } from '../../hooks/redux/redux';
import useDebouncedValue from '../../hooks/useDebouncedValue';
import useListApplicants from '../../api/applicant/hooks/useListApplicants';
import { ApplicantSort } from '../../api/applicant/call/listApplicantsApi';
import { applicantListInterface } from '../../interface/api/applicantInterface';

const SORTS: { key: ApplicantSort; label: string }[] = [
    { key: 'recent', label: 'Recent' },
    { key: 'oldest', label: 'Oldest' },
    { key: 'name', label: 'Name (A-Z)' },
    { key: 'bookings', label: 'Most Bookings' },
];

const ApplicantListScreen = ({ navigation }: any) => {
    const user = useAppSelector((state) => state.user.user);
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState<ApplicantSort>('recent');
    const [refreshing, setRefreshing] = useState(false);

    // Server-side search: only fire the request once typing settles.
    const debouncedSearch = useDebouncedValue(search, 400);

    const {
        applicants,
        pagination,
        isLoading,
        isError,
        error,
        refetch,
        hasMore,
        loadMore,
        isLoadingMore,
    } = useListApplicants(user?.token, debouncedSearch, sort);

    // Pehla load (koi cached page nahi) → poori screen par skeleton.
    // Uske baad jab bhi search ya filter (sort) change hota hai to sirf list
    // area skeleton dikhta hai — search bar aur filter tabs screen par rehte
    // hain, isliye user ko lagta hai ki sirf list reload ho rahi hai.
    const hasLoadedOnce = useRef(false);
    useEffect(() => {
        if (!isLoading && !isError && Boolean(pagination)) {
            hasLoadedOnce.current = true;
        }
    }, [isLoading, isError, pagination]);

    // Search/filter change par naya cache entry banta hai aur kuch der ke liye
    // pagination undefined ho jata hai — header badge purana total dikhata
    // rahe taaki count 0 par flicker na kare.
    const lastTotalRef = useRef(0);
    useEffect(() => {
        if (pagination) {
            lastTotalRef.current = pagination.total;
        }
    }, [pagination]);

    const isFirstLoad = isLoading && !refreshing && !hasLoadedOnce.current;
    const isListLoading = isLoading && !refreshing && hasLoadedOnce.current;

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

    const onCall = useCallback((item: applicantListInterface) => {
        const number = (item.mobile || '').replace(/[^\d+]/g, '');
        if (!number) {
            showMessage({
                message: `${item.name} has no phone number on record`,
                type: 'warning',
            });
            return;
        }
        Linking.openURL(`tel:${number}`).catch(() => {
            showMessage({ message: 'Unable to open the dialer', type: 'danger' });
        });
    }, []);

    // Stable render callbacks — memoized cards ko unnecessary re-render se bachate hain.
    const keyExtractor = useCallback((item: any) => String(item?.id), []);

    const renderApplicant = useCallback(
        ({ item }: { item: any }) => (
            <ApplicantListCard
                item={item as applicantListInterface}
                callPress={onCall}
            />
        ),
        [onCall],
    );

    const errorMessage =
        (error as any)?.response?.data?.message ||
        'Could not load applicants. Please try again.';

    const listHeader = (
        <>
            <View className="flex-row items-center gap-1.5 mb-3" style={{ paddingHorizontal: 2 }}>
                <ArrowDownUp size={15} color={Theme.text.secondary} />
                <Text className="text-xs font-semibold" style={{ color: Theme.text.secondary }}>
                    Sort by
                </Text>
            </View>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mb-4"
                contentContainerStyle={{ gap: 8 }}
            >
                {SORTS.map((option) => {
                    const isActive = sort === option.key;
                    return (
                        <TouchableOpacity
                            key={option.key}
                            activeOpacity={0.8}
                            onPress={() => setSort(option.key)}
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
                                {option.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </>
    );

    const listFooter = applicants.length > 0 ? (
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

    const totalCount = pagination?.total ?? lastTotalRef.current;

    return (
        <Wrapper safeBottom>
            <MainDerder
                navigation={navigation}
                title="Applicants"
                right={
                    <View
                        className="flex-row items-center rounded-full px-3 py-1.5"
                        style={{ backgroundColor: Theme.background.secondary }}
                    >
                        <Text className="text-sm font-extrabold" style={{ color: Theme.button.primary }}>
                            {totalCount}
                        </Text>
                        <Text className="text-xs font-semibold ml-1.5" style={{ color: Theme.text.secondary }}>
                            {totalCount === 1 ? 'applicant' : 'applicants'}
                        </Text>
                    </View>
                }
            />

            {isFirstLoad ? (
                // Pehla load: poori screen skeleton (search + filter bhi hidden).
                <ApplicantListSkeleton />
            ) : (
                <>
                    {/* Search bar + filter tabs list ke bahar rehte hain, isliye
                        filter ya search change karne par bhi ye dikhte hain. */}
                    <View className="pt-2">
                        <MainSearchInput
                            placeholder="Search by name, phone"
                            value={search}
                            setvalue={setSearch}
                        />
                        {listHeader}
                    </View>

                    {isError && !refreshing ? (
                        <View className="flex-1 items-center justify-center px-8">
                            <PhoneOff size={34} color={Theme.text.tertiary} />
                            <Text
                                className="text-center text-sm mt-4"
                                style={{ color: Theme.text.secondary }}
                            >
                                {errorMessage}
                            </Text>
                            <TouchableOpacity
                                activeOpacity={0.85}
                                onPress={onRefresh}
                                className="flex-row items-center rounded-full px-5 py-3 mt-5"
                                style={{ backgroundColor: Theme.button.primary }}
                            >
                                <RefreshCw size={15} color="#000" />
                                <Text className="text-sm font-bold ml-2" style={{ color: '#000' }}>
                                    Retry
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ) : isListLoading ? (
                        // Filter/search badla: sirf list area skeleton, header same.
                        <ApplicantListSkeleton count={4} />
                    ) : (
                        <FlatList
                            data={applicants as applicantListInterface[]}
                            keyExtractor={keyExtractor}
                            renderItem={renderApplicant}
                            showsVerticalScrollIndicator={false}
                            // Windowing — lambe list par kam memory / smooth scroll.
                            initialNumToRender={6}
                            maxToRenderPerBatch={6}
                            windowSize={7}
                            removeClippedSubviews={Platform.OS === 'android'}
                            ListEmptyComponent={
                                <View className="items-center justify-center py-16 px-8">
                                    <Text
                                        className="text-center text-sm"
                                        style={{ color: Theme.text.secondary }}
                                    >
                                        {debouncedSearch
                                            ? `No applicants match "${debouncedSearch}".`
                                            : 'No applicants found yet.'}
                                    </Text>
                                </View>
                            }
                            contentContainerStyle={{ paddingBottom: 20 }}
                            onEndReached={onEndReached}
                            onEndReachedThreshold={0.4}
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
                </>
            )}
        </Wrapper>
    );
};

export default ApplicantListScreen;