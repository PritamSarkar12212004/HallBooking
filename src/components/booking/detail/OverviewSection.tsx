import React from 'react';
import {
  Building2,
  Calendar,
  CalendarCheck,
  Clock,
  Gauge,
  Tag,
  User,
  Users,
  Wallet,
} from 'lucide-react-native';

import {
  Image,
  Text,
  TouchableOpacity,
  View,
} from '../../../lib/style/withTailwind';
import { BookingDetailPalette as P } from '../../../const/theme/bookingDetailPalette';
import type { BookingOverview } from '../../../functions/booking/BookingDetailFunction';
import { money } from '../../../functions/booking/BookingDetailFunction';
import {
  DetailBadge,
  DetailCard,
  DetailRow,
  InfoTile,
  SectionHeading,
  SectionStepHeader,
} from './DetailPrimitives';

interface Props {
  overview: BookingOverview;
  /** Total units add kiye gaye (reading pending dekhne ke liye). */
  unitsCount: number;
  /** Koi unit adhoori hai (reading/rate missing) — pending banner upar hai. */
  hasUnitIssues: boolean;
  balanceAmount: number;
  onPreview: (uri?: string | null) => void;
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1469&auto=format&fit=crop';

/**
 * Section 1 — Booking.
 *
 * Event name, hall ka naam, aur start/end **date + time** sabse pehle, saaf
 * tiles me — pehle yahi sab list me mix ho jaata tha.
 */
const OverviewSection = ({
  overview,
  unitsCount,
  hasUnitIssues,
  balanceAmount,
  onPreview,
}: Props) => {
  return (
    <>
      <SectionStepHeader
        index={1}
        title="Booking"
        subtitle="Event, hall aur schedule ki poori detail"
        status={{ label: overview.status.label, tone: overview.status.tone }}
      />

      <View className="rounded-3xl overflow-hidden mb-5">
        <Image
          source={{ uri: overview.eventImage || FALLBACK_IMAGE }}
          className="w-full"
          style={{ aspectRatio: 3 / 2 }}
          resizeMode="cover"
        />

        <View
          className="absolute top-3 left-3 flex-row items-center"
          style={{ gap: 6 }}
        >
          <DetailBadge
            label={overview.status.label}
            tone={overview.status.tone}
          />
          <DetailBadge
            label={overview.paymentStatus.label}
            tone={overview.paymentStatus.tone}
            solid={false}
          />
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => onPreview(overview.eventImage || FALLBACK_IMAGE)}
          className="absolute bottom-3 left-3 flex-row items-center px-3 py-1.5 rounded-full"
          style={{ backgroundColor: 'rgba(0,0,0,0.55)', gap: 6 }}
        >
          <Tag size={11} color="#FFFFFF" />
          <Text className="text-[11px] font-bold text-white">
            #{overview.bookingNumber}
          </Text>
        </TouchableOpacity>

        <View
          className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full"
          style={{
            backgroundColor: P.accentSoft,
            borderWidth: 1,
            borderColor: P.accent,
          }}
        >
          <Text className="text-[11px] font-bold" style={{ color: P.accent }}>
            {overview.eventType}
          </Text>
        </View>
      </View>

      {/* Title + hall */}
      <Text
        className="text-2xl font-extrabold leading-8"
        style={{ color: P.textPrimary }}
      >
        {overview.eventName}
      </Text>

      <View className="flex-row items-center mt-2 mb-1.5" style={{ gap: 6 }}>
        <Building2 size={14} color={P.accent} />
        <Text className="text-sm font-bold" style={{ color: P.accent }}>
          {overview.hallName}
        </Text>
        {overview.hallCapacity > 0 ? (
          <Text className="text-xs" style={{ color: P.textMuted }}>
            · capacity {overview.hallCapacity}
          </Text>
        ) : null}
      </View>

      <View className="flex-row items-center mb-5" style={{ gap: 6 }}>
        <User size={13} color={P.textSecondary} />
        <Text className="text-xs" style={{ color: P.textSecondary }}>
          Booked by {overview.bookedBy}
          {overview.createdAt ? ` · ${overview.createdAt}` : ''}
        </Text>
      </View>

      <SectionHeading
        icon={<Calendar size={16} color={P.accent} />}
        title="Schedule"
      />

      <View className="flex-row mb-2.5" style={{ gap: 10 }}>
        <InfoTile
          icon={<CalendarCheck size={12} color={P.accent} />}
          label="START DATE"
          value={overview.schedule.dateLine.split(' → ')[0] || '—'}
          style={{ flex: 1 }}
        />
        <InfoTile
          icon={<Clock size={12} color={P.accent} />}
          label="START TIME"
          value={
            overview.schedule.startTime
              ? overview.schedule.timeLine.split(' → ')[0]
              : '—'
          }
          style={{ flex: 1 }}
        />
      </View>

      <View className="flex-row mb-3" style={{ gap: 10 }}>
        <InfoTile
          icon={<Calendar size={12} color={P.accent} />}
          label="END DATE"
          value={overview.schedule.dateLine.split(' → ').slice(-1)[0] || '—'}
          style={{ flex: 1 }}
        />
        <InfoTile
          icon={<Clock size={12} color={P.accent} />}
          label="END TIME"
          value={
            overview.schedule.endTime
              ? overview.schedule.timeLine.split(' → ').slice(-1)[0]
              : '—'
          }
          style={{ flex: 1 }}
        />
      </View>

      <DetailCard>
        <DetailRow
          icon={<Clock size={14} color={P.textSecondary} />}
          label="Duration"
          value={overview.schedule.durationLine}
        />
        <DetailRow
          icon={<Building2 size={14} color={P.textSecondary} />}
          label="Hall"
          value={
            overview.hallCapacity > 0
              ? `${overview.hallName} (${overview.hallCapacity} guests)`
              : overview.hallName
          }
        />
        <DetailRow
          icon={<Tag size={14} color={P.textSecondary} />}
          label="Event type"
          value={overview.eventType}
        />
        <DetailRow
          icon={<Users size={14} color={P.textSecondary} />}
          label="Expected attendance"
          value={
            overview.expectedAttendance > 0
              ? `${overview.expectedAttendance} guests`
              : '—'
          }
        />
        <DetailRow
          icon={<Wallet size={14} color={P.textSecondary} />}
          label="Balance due"
          value={money(balanceAmount)}
          valueColor={balanceAmount > 0 ? P.warning : P.success}
          bold
        />
        <DetailRow
          icon={<Gauge size={14} color={P.textSecondary} />}
          label="Units added"
          value={
            unitsCount === 0
              ? 'No units'
              : hasUnitIssues
              ? `${unitsCount} units · reading pending`
              : `${unitsCount} units · sab set`
          }
          valueColor={
            unitsCount === 0
              ? P.textSecondary
              : hasUnitIssues
              ? P.warning
              : P.success
          }
          last
        />
      </DetailCard>
    </>
  );
};

export default OverviewSection;
