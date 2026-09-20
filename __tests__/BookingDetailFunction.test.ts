import {
    getApplicantInfo,
    getBookingOverview,
    getEventInfo,
    getFinalizeBlocker,
    getFinalizeChecklist,
    getFinanceSummary,
    getGovernmentIdLabel,
    getInitials,
    getStatusMeta,
    getUnitIssues,
    money,
} from '../src/functions/booking/BookingDetailFunction';

const bookingWithUnits = (units: any[], extra: any = {}) => ({
    status: 'Confirmed',
    bookingNumber: 'BK-1',
    event: { name: 'Wedding', type: 'Wedding' },
    schedule: {
        startDate: '2026-09-12T00:00:00.000Z',
        endDate: '2026-09-12T00:00:00.000Z',
        startTime: '18:00',
        endTime: '23:00',
    },
    financial: { charges: [], units },
    ...extra,
});

describe('formatting helpers', () => {
    it('money Indian grouping me ₹ deta hai', () => {
        expect(money(123456)).toBe('₹1,23,456');
        expect(money(0)).toBe('₹0');
        expect(money(undefined)).toBe('₹0');
    });
});

describe('getStatusMeta', () => {
    it('status ko label + tone me map karta hai', () => {
        expect(getStatusMeta('Confirmed')).toEqual({
            label: 'Confirmed',
            tone: 'success',
            locked: false,
        });
        expect(getStatusMeta('Ended')).toEqual({
            label: 'Event Ended',
            tone: 'info',
            locked: true,
        });
        expect(getStatusMeta('Cancelled').tone).toBe('danger');
        expect(getStatusMeta(undefined).label).toBe('Draft');
    });
});

describe('getBookingOverview', () => {
    it('hall name, event name aur schedule ko saaf nikalti hai', () => {
        const overview = getBookingOverview({
            bookingNumber: 'BK-9',
            status: 'Confirmed',
            hall: { name: 'Grand Hall', capacity: 500 },
            event: { name: 'Reception', type: 'Other', customType: 'Sangeet' },
            schedule: {
                startDate: '2026-09-12T00:00:00.000Z',
                endDate: '2026-09-14T00:00:00.000Z',
                startTime: '18:00',
                endTime: '23:00',
            },
            applicant: { name: 'Rina Das' },
        });

        expect(overview.hallName).toBe('Grand Hall');
        expect(overview.eventName).toBe('Reception');
        // customType ko priority milti hai
        expect(overview.eventType).toBe('Sangeet');
        expect(overview.schedule.dayCount).toBe(3);
        expect(overview.schedule.timeLine).toBe('6:00 PM → 11:00 PM');
        expect(overview.isEnded).toBe(false);
    });

    it('hall missing par fallback deta hai', () => {
        const overview = getBookingOverview({ schedule: {} });
        expect(overview.hallName).toBe('Hall assigned nahi');
        expect(overview.eventName).toBe('Event');
    });

    it('overnight time window ko 24h add karke count karta hai', () => {
        const overview = getBookingOverview({
            schedule: {
                startDate: '2026-09-12T00:00:00.000Z',
                endDate: '2026-09-12T00:00:00.000Z',
                startTime: '22:00',
                endTime: '02:00',
            },
        });
        expect(overview.schedule.durationLine).toBe('1 day · 4h window');
    });
});

describe('getInitials / government id', () => {
    it('do word naam se initials banata hai', () => {
        expect(getInitials('Rina Das')).toBe('RD');
        expect(getInitials('Rina')).toBe('RI');
        expect(getInitials('')).toBe('?');
    });

    it('custom "Other" id ka naam use karta hai', () => {
        expect(getGovernmentIdLabel({ type: 'Other', name: 'Voter Card' })).toBe('Voter Card');
        expect(getGovernmentIdLabel({ type: 'Aadhaar', name: 'Voter Card' })).toBe('Aadhaar');
        expect(getGovernmentIdLabel(null)).toBe('');
    });

    it('applicant info me initials + ID status aata hai', () => {
        const info = getApplicantInfo({
            name: 'Rina Das',
            mobile: '9999999999',
            governmentId: { type: 'Aadhaar', number: '1234', photo: 'https://cdn/x.png' },
        });

        expect(info.initials).toBe('RD');
        expect(info.hasGovernmentId).toBe(true);
        expect(info.governmentIdLabel).toBe('Aadhaar');
        expect(info.governmentIdPhoto).toBe('https://cdn/x.png');
    });
});

describe('getEventInfo', () => {
    it('quantities aur plain requirements ko merge karta hai bina duplicate', () => {
        const info = getEventInfo({
            event: {
                hallRequirements: ['Chairs', 'Stage'],
                requirementQuantities: [{ label: 'Chairs', quantity: 100 }],
                timeSlots: ['Morning'],
            },
            arrangements: { decorator: { name: 'Flora' }, kitchenRequired: true },
        });

        expect(info.requirements).toEqual([
            { label: 'Chairs', quantity: 100 },
            { label: 'Stage', quantity: 0 },
        ]);
        expect(info.timeSlots).toEqual(['Morning']);
        expect(info.arrangements.decorator?.name).toBe('Flora');
        expect(info.arrangements.kitchenRequired).toBe(true);
        expect(info.hasAnything).toBe(true);
    });

    it('kuch bhi na ho to hasAnything false', () => {
        expect(getEventInfo({}).hasAnything).toBe(false);
    });
});

describe('getFinanceSummary', () => {
    it('totals server cache se leta hai, warna charges se calculate karta hai', () => {
        const summary = getFinanceSummary({
            charges: [
                { label: 'Rent', amount: 5000, paid: 2000 },
                { label: 'Light', amount: 1000, paid: 1000 },
            ],
        });

        expect(summary.chargesTotal).toBe(6000);
        expect(summary.paidAmount).toBe(3000);
        expect(summary.totalAmount).toBe(6000);
        expect(summary.balanceAmount).toBe(3000);
        expect(summary.charges[0].paidPct).toBe(40);
    });

    it('unit ki reading 0 ho to readingMissing true', () => {
        const summary = getFinanceSummary({
            units: [
                { label: 'Light', perUnit: 10, currentUnit: 0 },
                { label: 'Water', perUnit: 5, currentUnit: 120, quantity: 30, amount: 150 },
            ],
        });

        expect(summary.units[0].readingMissing).toBe(true);
        expect(summary.units[1].readingMissing).toBe(false);
        expect(summary.units[1].amount).toBe(150);
        expect(summary.hasUnits).toBe(true);
    });
});

describe('getUnitIssues (finalize gate)', () => {
    it('reading missing unit ko issue batata hai', () => {
        const issues = getUnitIssues([
            {
                label: 'Light',
                perUnit: 10,
                currentUnit: 0,
                quantity: 0,
                amount: 0,
                paid: false,
                meterPhoto: '',
                readingMissing: true,
            },
        ]);

        expect(issues).toEqual([
            {
                label: 'Light',
                kind: 'reading',
                message: '"Light" ki current unit (reading) add karein.',
            },
        ]);
    });

    it('rate missing ho to rate issue pehle aata hai', () => {
        const issues = getUnitIssues([
            {
                label: 'AC',
                perUnit: 0,
                currentUnit: 0,
                quantity: 0,
                amount: 0,
                paid: false,
                meterPhoto: '',
                readingMissing: true,
            },
        ]);

        expect(issues[0].kind).toBe('rate');
    });

    it('sab set ho to koi issue nahi', () => {
        expect(
            getUnitIssues([
                {
                    label: 'Light',
                    perUnit: 10,
                    currentUnit: 100,
                    quantity: 0,
                    amount: 0,
                    paid: false,
                    meterPhoto: '',
                    readingMissing: false,
                },
            ]),
        ).toEqual([]);
    });
});

describe('getFinalizeChecklist + getFinalizeBlocker', () => {
    it('unit reading missing ho to swipe block hota hai', () => {
        const booking = bookingWithUnits([
            { label: 'Light', perUnit: 10, currentUnit: 0 },
        ]);

        const blocker = getFinalizeBlocker(booking);
        expect(blocker).toBe('"Light" ki current unit (reading) add karein.');

        const units = getFinalizeChecklist(booking).find((item) => item.key === 'units');
        expect(units?.ok).toBe(false);
        expect(units?.blocking).toBe(true);
    });

    it('reading add hone par swipe enabled ho jaata hai', () => {
        const booking = bookingWithUnits([
            { label: 'Light', perUnit: 10, currentUnit: 120 },
        ]);

        expect(getFinalizeBlocker(booking)).toBeNull();
    });

    it('units hi na ho to block nahi hota', () => {
        expect(getFinalizeBlocker({ status: 'Confirmed', financial: {} })).toBeNull();
    });

    it('Ended booking me finalize hamesha locked rehta hai', () => {
        const booking = bookingWithUnits([], { status: 'Ended' });
        expect(getFinalizeBlocker(booking)).toContain('already ended');
    });

    it('checklist me payment/deposit/signature status bhi aata hai', () => {
        const booking = bookingWithUnits([{ label: 'Light', perUnit: 10, currentUnit: 5 }], {
            financial: {
                charges: [{ label: 'Rent', amount: 5000, paid: 5000 }],
                units: [{ label: 'Light', perUnit: 10, currentUnit: 5 }],
                securityDeposit: 2000,
            },
            signatures: {
                applicantPhoto: 'https://cdn/a.png',
                managerPhoto: 'https://cdn/m.png',
            },
        });

        const checklist = getFinalizeChecklist(booking);
        const byKey = (key: string) => checklist.find((item) => item.key === key);

        expect(byKey('units')?.ok).toBe(true);
        expect(byKey('payment')?.ok).toBe(true);
        expect(byKey('deposit')?.ok).toBe(false);
        expect(byKey('deposit')?.hint).toContain('₹2,000');
        expect(byKey('signatures')?.ok).toBe(true);
    });
});
