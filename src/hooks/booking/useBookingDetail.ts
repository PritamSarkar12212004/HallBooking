import { useCallback, useMemo, useState } from 'react';

import {
    getApplicantInfo,
    getBookingOverview,
    getEventInfo,
    getFinalizeBlocker,
    getFinalizeChecklist,
    getFinanceSummary,
    getUnitIssues,
} from '../../functions/booking/BookingDetailFunction';
import { BookingStepRoute, MainRoute } from '../../const/routes/route';

export interface UseBookingDetailOptions {
    booking: any;
    bookingId?: string;
    navigation: any;
}

/**
 * Booking Details (single screen) ka saara state + derived data.
 *
 * Poora detail ek hi scrollable screen par hai — koi page/pager state nahi.
 * Logic `BookingDetailFunction` me pure hai; yahan sirf derived data, preview
 * aur navigation actions hain, taake screen me sirf JSX rahe.
 */
const useBookingDetail = ({
    booking,
    bookingId,
    navigation,
}: UseBookingDetailOptions) => {
    /** Full screen image preview (event photo / meter photo / ID proof). */
    const [previewUri, setPreviewUri] = useState<string | null>(null);

    const overview = useMemo(() => getBookingOverview(booking), [booking]);
    const applicant = useMemo(() => getApplicantInfo(booking?.applicant), [booking]);
    const eventInfo = useMemo(() => getEventInfo(booking), [booking]);
    const finance = useMemo(
        () => getFinanceSummary(booking?.financial, booking?.financeHistory),
        [booking],
    );
    const unitIssues = useMemo(() => getUnitIssues(finance.units), [finance.units]);
    const checklist = useMemo(() => getFinalizeChecklist(booking), [booking]);

    /** Finalize swipe ka block reason — null matlab swipe enabled. */
    const finalizeBlocker = useMemo(() => getFinalizeBlocker(booking), [booking]);
    const canFinalize = finalizeBlocker === null;
    const hasUnitIssues = unitIssues.length > 0;

    // --- Actions ---------------------------------------------------------

    const openFinalize = useCallback(() => {
        navigation.navigate(MainRoute.NewBooking, {
            screen: BookingStepRoute.FainalizeEventPage,
            params: { bookingId },
        });
    }, [navigation, bookingId]);

    /**
     * Units ki reading/rate fix karne ke liye — Edit Finance units section.
     * `focus: 'units'` se wahan missing reading ka input khula milta hai.
     */
    const openUnitFix = useCallback(() => {
        navigation.navigate(MainRoute.EditFinance, {
            id: bookingId,
            focus: 'units',
        });
    }, [navigation, bookingId]);

    const openEditFinance = openUnitFix;

    const openPayments = useCallback(() => {
        navigation.navigate(MainRoute.PaymentTrackRecord, { id: bookingId });
    }, [navigation, bookingId]);

    const openPreview = useCallback((uri?: string | null) => {
        if (uri) setPreviewUri(uri);
    }, []);

    const closePreview = useCallback(() => setPreviewUri(null), []);

    return {
        // derived data
        overview,
        applicant,
        eventInfo,
        finance,
        unitIssues,
        hasUnitIssues,
        checklist,
        finalizeBlocker,
        canFinalize,
        // actions
        openFinalize,
        openUnitFix,
        openEditFinance,
        openPayments,
        // preview
        previewUri,
        openPreview,
        closePreview,
    };
};

export default useBookingDetail;
