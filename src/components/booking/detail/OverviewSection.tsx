import React from 'react';
import {
  Building2,
  Calendar,
  CalendarCheck,
  Clock,
  Gauge,
  Tag,
  Users,
  Wallet,
} from 'lucide-react-native';

import { View } from '../../../lib/style/withTailwind';
import { BookingDetailPalette as P } from '../../../const/theme/bookingDetailPalette';
import type { BookingOverview } from '../../../functions/booking/BookingDetailFunction';
import { money } from '../../../functions/booking/BookingDetailFunction';
import {
  DetailAccordion,
  DetailCard,
  DetailRow,
  InfoTile,
  SectionHeading,
} from './DetailPrimitives';

interface Props {
  overview: BookingOverview;
  /** Total units add kiye gaye (reading pending dekhne ke liye). */
  unitsCount: number;
  /** Koi unit adhoori hai (reading/rate missing) — pending banner upar hai. */
  hasUnitIssues: boolean;
  balanceAmount: number;
}

/**
 * Section 1 — Booking.
 *
 * Event/hall ki pehchaan upar hero me hamesha dikhti hai; yahan schedule ki
 * date + time tiles aur poori booking detail (tap karne par khulti hai).
 */
const OverviewSection = ({
  overview,
  unitsCount,
  hasUnitIssues,
  balanceAmount,
}: Props) => {
  return (
    <DetailAccordion
      index={1}
      title="Booking"
      subtitle="Schedule and full booking details"
      status={{ label: overview.status.label, tone: overview.status.tone }}
    >
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
              ? `${unitsCount} units · reading/rate pending`
              : `${unitsCount} units · all set`
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
    </DetailAccordion>
  );
};

export default OverviewSection;
