import type { CeoAnalytics } from '../../interface/api/ceoAnalyticsInterface';

/** Har CEO analytics panel ko yahi props milte hain. */
export interface AnalyticsPanelProps {
    analytics: CeoAnalytics;
    /** Booking Details kholne ke liye. */
    openBooking: (id: string) => void;
    /** Calendar screen kholne ke liye. */
    openCalendar: () => void;
}
