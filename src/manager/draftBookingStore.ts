/**
 * Draft booking store — in-memory singleton.
 *
 * Nothing is created in the backend until the LAST step (Step6 "Done").
 * Every step writes its section data here; the final step merges everything
 * into one create call (followed by the section updates).
 */
export interface DraftBookingData {
    // Base (collected on the Halls screen)
    bookingType?: string;
    startDate?: string;
    endDate?: string;
    startTime?: string;
    endTime?: string;
    eventName?: string;
    bookedByStaff?: string;
    eventImage?: string;
    allocatedTeam?: string[];

    // Step1 — applicant
    applicant?: {
        name: string;
        organization: string;
        mobile: string;
        address: string;
        email: string;
        governmentIdType?: string;
        governmentIdPhoto?: string;
    };

    // Step2 — event
    event?: {
        expectedAttendance?: number;
        type?: string;
        requirements?: string[];
    };

    // Step3 — arrangements
    arrangements?: {
        decoratorName?: string;
        decoratorContact?: string;
        catererName?: string;
        catererContact?: string;
        kitchenRequired?: boolean;
    };

    // Step4 — terms
    termsAccepted?: boolean;

    // Step5 — payment
    payment?: {
        hallRent?: number;
        instrument?: number;
        securityDeposit?: number;
        totalAmount?: number;
        advancePaid?: number;
        finalPayment?: number;
        balanceAmount?: number;
        mode?: string;
        transactionNumber?: string;
        paymentProofPhoto?: string;
    };
}

let draft: DraftBookingData | null = null;

export const startDraft = (base: DraftBookingData): void => {
    draft = { ...base };
};

export const getDraft = (): DraftBookingData | null => draft;

export const updateDraft = (
    section: keyof DraftBookingData,
    data: unknown,
): void => {
    if (!draft) return;
    (draft as Record<string, unknown>)[section] = data;
};

export const clearDraft = (): void => {
    draft = null;
};
