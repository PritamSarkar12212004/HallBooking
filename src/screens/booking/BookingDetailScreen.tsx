import React from 'react';
import { Pencil } from 'lucide-react-native';

import Wrapper from '../../layouts/wraper/Wraper';
import SubHeader from '../../components/header/SubHeader';
import { ScrollView, Text, TouchableOpacity, View } from '../../lib/style/withTailwind';
import FullScreenImage from '../../components/ui/FullScreenImage';
import BookingDetailSkeleton from '../../ui/Skeleton/BookingDetailSkeleton';
import PendingUnitsBanner from '../../components/booking/detail/PendingUnitsBanner';
import BookingHero from '../../components/booking/detail/BookingHero';
import OverviewSection from '../../components/booking/detail/OverviewSection';
import ApplicantSection from '../../components/booking/detail/ApplicantSection';
import RequirementsSection from '../../components/booking/detail/RequirementsSection';
import FinanceSection from '../../components/booking/detail/FinanceSection';
import FinalizeSection from '../../components/booking/detail/FinalizeSection';

import useGetBookingById from '../../api/booking/hooks/useGetBookingById';
import useBookingDetail from '../../hooks/booking/useBookingDetail';
import useIsCeo from '../../hooks/role/useIsCeo';
import { useAppSelector } from '../../hooks/redux/redux';
import { BookingDetailPalette as P } from '../../const/theme/bookingDetailPalette';

/**
 * Booking Details — ek hi screen par saara detail.
 *
 * Event/hall ki pehchaan (hero) hamesha dikhti hai; baaki detail 5 collapsible
 * sections me hai (numbered 1–5) jo tap karne par khulte hain — pehle sab kuch
 * khula rehta tha aur screen bhari hui lagti thi. Unit adhoori ho to upar
 * banner + Finalize section locked rehta hai.
 */
const BookingDetailScreen = ({ navigation, route }: any) => {
  const user = useAppSelector(state => state.user.user);
  const bookingId = route?.params?.id;
  // CEO ke paas sirf read-only view hai — Update (finance/event/units) ke saare
  // entry points usse chhupe rehte hain.
  const isCeo = useIsCeo();

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
    openEditEvent,
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
            Could not load booking details.
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
          !isCeo &&
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
          contentContainerStyle={{ paddingBottom: 28, gap: 14 }}
        >
          {/* Jo bacha hai — sabse upar, taake scroll kiye bina pata chale. */}
          {!overview.isEnded ? (
            <PendingUnitsBanner
              issues={unitIssues}
              // CEO ko sirf info dikhti hai — "Add Current Unit" action nahi.
              onFixUnits={isCeo ? undefined : openUnitFix}
            />
          ) : null}

          {/* Booking ki pehchaan hamesha khuli rehti hai. */}
          <BookingHero
            overview={overview}
            unitsCount={finance.units.length}
            hasUnitIssues={hasUnitIssues}
            balanceAmount={finance.balanceAmount}
            onPreview={openPreview}
          />

          <Text className="text-[11px]" style={{ color: P.textMuted }}>
            Tap a section to expand its details
          </Text>

          <OverviewSection
            overview={overview}
            unitsCount={finance.units.length}
            hasUnitIssues={hasUnitIssues}
            balanceAmount={finance.balanceAmount}
          />

          <ApplicantSection applicant={applicant} onPreview={openPreview} />

          <RequirementsSection
            eventInfo={eventInfo}
            expectedAttendance={overview.expectedAttendance}
            onPreview={openPreview}
            onEditEvent={openEditEvent}
            editable={!isCeo && !overview.isEnded}
          />

          <FinanceSection
            finance={finance}
            unitIssues={unitIssues}
            onFixUnits={isCeo ? undefined : openUnitFix}
            onPreview={openPreview}
          />

          <FinalizeSection
            checklist={checklist}
            finance={finance}
            finalizeBlocker={finalizeBlocker}
            isEnded={overview.isEnded}
            // CEO ke side par Swipe to Finalize Event nahi hota.
            onFinalize={isCeo ? undefined : openFinalize}
            onFixUnits={isCeo ? undefined : openUnitFix}
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
