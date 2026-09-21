/**
 * Analytics rows → list items.
 *
 * Ye UI layer hai (labels + date/time formatting), isliye components ke saath
 * rakha gaya hai — numbers aur rules `functions/ceo/AnalyticsFunction` me hain.
 */
import { formatDate, formatTime } from '../../functions/formate/DateTimeFormate';
import {
    money,
    statusTone,
} from '../../functions/ceo/AnalyticsFunction';
import type {
    AnalyticsEventRevenueRow,
    AnalyticsEventRow,
    AnalyticsPaymentRow,
    AnalyticsPendingRow,
    AnalyticsStaffAssignment,
} from '../../interface/api/ceoAnalyticsInterface';
import type { AnalyticsRowItem } from './AnalyticsRowList';

const timeRange = (start?: string, end?: string): string => {
    const from = formatTime(start ?? '');
    const to = formatTime(end ?? '');
    if (from && to && to !== from) return `${from} – ${to}`;
    return from;
};

export const eventItems = (
    rows: AnalyticsEventRow[],
    openBooking: (id: string) => void,
): AnalyticsRowItem[] =>
    rows.map((row) => ({
        key: row.id || row.bookingNumber,
        title: row.eventName,
        subtitle: [
            row.hallName,
            row.startDate ? formatDate(row.startDate) : '',
            timeRange(row.startTime, row.endTime),
        ]
            .filter(Boolean)
            .join(' · '),
        meta: [
            row.applicantName,
            row.applicantMobile,
            row.bookedFor && row.bookedFor !== 'Myself' ? `For ${row.bookedFor}` : '',
            row.bookedByStaff ? `By ${row.bookedByStaff}` : '',
        ]
            .filter(Boolean)
            .join(' · '),
        value: money(row.totalAmount),
        valueHint: `${money(row.collected)} paid · ${money(row.balance)} due`,
        badge: { label: row.status || '—', tone: statusTone(row.status) },
        onPress: row.id ? () => openBooking(row.id) : undefined,
    }));

export const eventRevenueItems = (
    rows: AnalyticsEventRevenueRow[],
    openBooking: (id: string) => void,
): AnalyticsRowItem[] =>
    rows.map((row) => ({
        key: row.id || row.bookingNumber,
        title: row.eventName,
        subtitle: [
            row.hallName,
            row.startDate ? formatDate(row.startDate) : '',
            row.applicantName,
        ]
            .filter(Boolean)
            .join(' · '),
        meta: `${row.eventType} · ${row.paymentStatus || row.status}`,
        value: money(row.totalAmount),
        valueHint: `${money(row.collected)} paid · ${money(row.balance)} due`,
        onPress: row.id ? () => openBooking(row.id) : undefined,
    }));

export const paymentItems = (
    rows: AnalyticsPaymentRow[],
    openBooking: (id: string) => void,
): AnalyticsRowItem[] =>
    rows.map((row) => ({
        key: row.id,
        title: row.eventName,
        subtitle: [
            row.mode || 'Payment',
            row.receivedAt ? formatDate(row.receivedAt) : '',
            row.transactionId ? `Ref ${row.transactionId}` : '',
        ]
            .filter(Boolean)
            .join(' · '),
        meta: [
            row.hallName,
            row.bookingNumber,
            row.receivedBy ? `Received by ${row.receivedBy}` : '',
            row.proof ? 'Proof attached' : '',
        ]
            .filter(Boolean)
            .join(' · '),
        value: money(row.amount),
        badge: row.proof ? { label: 'Proof', tone: 'green' as const } : undefined,
        onPress: row.bookingId ? () => openBooking(row.bookingId) : undefined,
    }));

export const pendingItems = (
    rows: AnalyticsPendingRow[],
    openBooking: (id: string) => void,
): AnalyticsRowItem[] =>
    rows.map((row) => ({
        key: `${row.bookingId}-${row.bookingNumber}`,
        title: row.customerName,
        subtitle: [row.eventName, row.hallName, row.startDate ? formatDate(row.startDate) : '']
            .filter(Boolean)
            .join(' · '),
        meta: [row.mobile, row.bookingNumber, row.status].filter(Boolean).join(' · '),
        value: money(row.balance),
        valueHint: 'due',
        badge: { label: 'Pending', tone: 'red' as const },
        onPress: row.bookingId ? () => openBooking(row.bookingId) : undefined,
    }));

export const assignmentItems = (
    rows: AnalyticsStaffAssignment[],
    openBooking: (id: string) => void,
): AnalyticsRowItem[] =>
    rows.map((row) => ({
        key: `${row.bookingId}-${row.bookingNumber}`,
        title: row.eventName,
        subtitle: [
            row.hallName,
            row.startDate ? formatDate(row.startDate) : '',
            row.staffName ? `Handled by ${row.staffName}` : '',
        ]
            .filter(Boolean)
            .join(' · '),
        meta: [row.bookingNumber, row.status].filter(Boolean).join(' · '),
        value: money(row.collected),
        valueHint: `of ${money(row.totalAmount)}`,
        badge: { label: row.status || '—', tone: statusTone(row.status) },
        onPress: row.bookingId ? () => openBooking(row.bookingId) : undefined,
    }));
