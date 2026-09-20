import React from 'react';
import { Pencil } from 'lucide-react-native';

import Wrapper from '../../layouts/wraper/Wraper';
import SubHeader from '../../components/header/SubHeader';
import { ScrollView, Text, TouchableOpacity, View } from '../../lib/style/withTailwind';
import FullScreenImage from '../../components/ui/FullScreenImage';
import BookingDetailSkeleton from '../../ui/Skeleton/BookingDetailSkeleton';
import PendingUnitsBanner from '../../components/booking/detail/PendingUnitsBanner';
import OverviewSection from '../../components/booking/detail/OverviewSection';
import ApplicantSection from '../../components/booking/detail/ApplicantSection';
import RequirementsSection from '../../components/booking/detail/RequirementsSection';
import FinanceSection from '../../components/booking/detail/FinanceSection';
import FinalizeSection from '../../components/booking/detail/FinalizeSection';

import useGetBookingById from '../../api/booking/hooks/useGetBookingById';
import useBookingDetail from '../../hooks/booking/useBookingDetail';
import { useAppSelector } from '../../hooks/redux/redux';
import { BookingDetailPalette as P } from '../../const/theme/bookingDetailPalette';

/**
 * Booking Details — ek hi screen par saara detail.
 *
 * Pehle ye 5 pages me bata hua tha (Next/Next), jo confusing lagta tha. Ab sab
 * sections ek scroll me neeche-neeche hain (numbered 1–5), aur swipe/Next ki
 * zarurat nahi. Unit adhoori ho to upar banner + Finalize section locked.
 */
const BookingDetailScreen = ({ navigation, route }: any) => {
  const user = useAppSelector(state => state.user.user);
  const bookingId = route?.params?.id;

  const { isLoading, isError, booking } = useGetBookingById({
    id: bookingId,
    token: user?.token,
  });

  const {
    overview,
    applicant,
    eventInfo,
    finance,
    unitIssues,
    hasUnitIssues,
    checklist,
    finalizeBlocker,
    openFinalize,
    openUnitFix,
    openEditFinance,
    openPayments,
    previewUri,
    openPreview,
    closePreview,
  } = useBookingDetail({ booking, bookingId, navigation });

  if (isError || (!isLoading && !booking)) {
    return (
      <Wrapper safeBottom style={{ backgroundColor: P.bg }}>
        <SubHeader navigation={navigation} title="Booking Details" />
        <View className="flex-1 items-center justify-center ">
          <Text
            className="text-center text-sm mb-2"
            style={{ color: P.textSecondary }}
          >
            Booking details load nahi ho paayi.
          </Text>
          <Text className="text-sm font-semibold" style={{ color: P.accent }}>
            Please go back and try again.
          </Text>
        </View>
      </Wrapper>
    );
  }

  return (
    <Wrapper safeBottom style={{ backgroundColor: P.bg }}>
      <SubHeader
        navigation={navigation}
        title="Booking Details"
        comp={
          !isLoading &&
          !overview.isEnded && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={openEditFinance}
              className="w-10 h-10 rounded-xl items-center justify-center"
              style={{ backgroundColor: P.surfaceAlt }}
            >
              <Pencil size={18} color="#FFFFFF" />
            </TouchableOpacity>
          )
        }
      />

      {isLoading ? (
        <BookingDetailSkeleton />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1"
          style={{ backgroundColor: P.bg }}
          contentContainerStyle={{ paddingBottom: 28 }}
        >
          {/* Jo bacha hai — sabse upar, taake scroll kiye bina pata chale. */}
          {!overview.isEnded ? (
            <PendingUnitsBanner issues={unitIssues} onFixUnits={openUnitFix} />
          ) : null}

          <OverviewSection
            overview={overview}
            unitsCount={finance.units.length}
            hasUnitIssues={hasUnitIssues}
            balanceAmount={finance.balanceAmount}
            onPreview={openPreview}
          />

          <ApplicantSection applicant={applicant} onPreview={openPreview} />

          <RequirementsSection
            eventInfo={eventInfo}
            expectedAttendance={overview.expectedAttendance}
            onPreview={openPreview}
          />

          <FinanceSection
            finance={finance}
            unitIssues={unitIssues}
            onFixUnits={openUnitFix}
            onPreview={openPreview}
          />

          <FinalizeSection
            checklist={checklist}
            finance={finance}
            finalizeBlocker={finalizeBlocker}
            isEnded={overview.isEnded}
            onFinalize={openFinalize}
            onFixUnits={openUnitFix}
            onPayments={openPayments}
          />
        </ScrollView>
      )}

      <FullScreenImage
        uri={previewUri}
        visible={!!previewUri}
        onClose={closePreview}
      />
    </Wrapper>
  );
};

export default BookingDetailScreen;
