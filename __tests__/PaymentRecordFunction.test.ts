import {
    getPaymentRecordAnalytics,
    isTrackableField,
    relativeDaysLabel,
} from '../src/functions/booking/PaymentRecordFunction';

const now = new Date();
const daysAgo = (days: number) =>
    new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();

/** Revision ka snapshot — backend har finance update par ye save karta hai. */
const buildSnapshot = (overrides: any = {}) => ({
    totalAmount: 40000,
    advancePaid: 25000,
    balanceAmount: 15000,
    securityDeposit: 10000,
    mode: 'Cash',
    charges: [
        { label: 'Hall Rent', amount: 30000, paid: 20000 },
        { label: 'Decoration', amount: 10000, paid: 5000 },
    ],
    units: [
        {
            label: 'Water',
            perUnit: 10,
            quantity: 0,
            currentUnit: 0,
            amount: 0,
            paid: false,
        },
        {
            label: 'Light',
            perUnit: 8,
            quantity: 100,
            currentUnit: 0,
            amount: 800,
            paid: false,
        },
    ],
    unitsTotal: 800,
    unitsPaid: 0,
    ...overrides,
});

/** Booking fixture — financial + payments + financeHistory. */
const buildBooking = (overrides: any = {}) => ({
    paymentStatus: 'Partial',
    financial: {
        charges: [
            { label: 'Hall Rent', amount: 30000, paid: 20000 },
            { label: 'Decoration', amount: 10000, paid: 5000 },
        ],
        units: [
            { label: 'Water', perUnit: 10, quantity: 0, currentUnit: 0 },
            { label: 'Light', perUnit: 8, quantity: 100, currentUnit: 0 },
        ],
        totalAmount: 40000,
        advancePaid: 25000,
        balanceAmount: 15000,
        securityDeposit: 10000,
    },
    payments: [
        { amount: 20000, mode: 'Cash', transactionId: '', receivedAt: daysAgo(10), proof: '' },
        { amount: 5000, mode: 'UPI', transactionId: 'TXN123', receivedAt: daysAgo(3), proof: 'https://x/p.png' },
    ],
    financeHistory: [
        {
            editedByName: 'Aniket',
            editedByMobile: '9800000001',
            editedAt: daysAgo(9),
            balanceAfter: 20000,
            changes: [{ field: 'totalAmount', from: 35000, to: 40000 }],
            snapshot: buildSnapshot({ totalAmount: 40000, advancePaid: 20000, balanceAfter: 20000 }),
        },
        {
            editedByName: 'Aniket',
            editedByMobile: '9800000001',
            editedAt: daysAgo(3),
            balanceAfter: 15000,
            changes: [
                { field: 'advancePaid', from: 20000, to: 25000 },
                { field: 'securityDeposit', from: 0, to: 10000 },
            ],
            snapshot: buildSnapshot(),
        },
        {
            editedByName: 'Priya',
            editedByMobile: '9800000002',
            editedAt: daysAgo(1),
            balanceAfter: 15000,
            changes: [{ field: 'totalAmount', from: 40000, to: 38000 }],
            snapshot: buildSnapshot({ totalAmount: 38000 }),
        },
    ],
    ...overrides,
});

describe('isTrackableField', () => {
    it('balance aur security deposit ko diff me track nahi karta', () => {
        expect(isTrackableField('totalAmount')).toBe(true);
        expect(isTrackableField('advancePaid')).toBe(true);
        expect(isTrackableField('balanceAmount')).toBe(false);
        expect(isTrackableField('securityDeposit')).toBe(false);
    });
});

describe('getPaymentRecordAnalytics — totals', () => {
    it('financial se headline numbers uthata hai', () => {
        const a = getPaymentRecordAnalytics(buildBooking());

        expect(a.totalAmount).toBe(40000);
        expect(a.paidAmount).toBe(25000);
        expect(a.balanceAmount).toBe(15000);
        expect(a.securityDeposit).toBe(10000);
        expect(a.progress).toBe(63); // 25000/40000 = 62.5 -> 63
        expect(a.paymentStatus).toBe('Partial');
        expect(a.statusTone).toBe('warning');
    });

    it('totals missing ho to charges se derive karta hai', () => {
        const booking = buildBooking();
        booking.financial = {
            ...booking.financial,
            totalAmount: 0,
            advancePaid: 0,
            balanceAmount: 0,
        };
        const a = getPaymentRecordAnalytics(booking);

        expect(a.totalAmount).toBe(40000); // 30000 + 10000
        expect(a.paidAmount).toBe(25000); // 20000 + 5000
        expect(a.balanceAmount).toBe(15000);
    });

    it('Paid booking par success tone aur 100% progress', () => {
        const booking = buildBooking();
        booking.paymentStatus = 'Paid';
        booking.financial.advancePaid = 40000;
        booking.financial.balanceAmount = 0;
        const a = getPaymentRecordAnalytics(booking);

        expect(a.progress).toBe(100);
        expect(a.statusTone).toBe('success');
        expect(a.balanceAmount).toBe(0);
    });
});

describe('getPaymentRecordAnalytics — payments', () => {
    it('entries ko date se sort karke running total deta hai', () => {
        const a = getPaymentRecordAnalytics(buildBooking());

        expect(a.entries).toHaveLength(2);
        expect(a.entries[0].amount).toBe(20000);
        expect(a.entries[0].runningTotal).toBe(20000);
        expect(a.entries[1].amount).toBe(5000);
        expect(a.entries[1].runningTotal).toBe(25000);
        expect(a.entries[1].transactionId).toBe('TXN123');
        expect(a.entries[1].proof).toBe('https://x/p.png');
        expect(a.receivedTotal).toBe(25000);
    });

    it('timestamp ko readable date + time banata hai (ISO ko todta nahi)', () => {
        const iso = '2026-09-12T18:40:00.000Z';
        const booking = buildBooking({
            payments: [{ amount: 5000, mode: 'UPI', receivedAt: iso }],
        });
        const a = getPaymentRecordAnalytics(booking);

        const expectedDate = new Date(iso).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
        const expectedTime = new Date(iso).toLocaleTimeString('en-IN', {
            hour: 'numeric',
            minute: '2-digit',
        });

        expect(a.entries[0].dateLabel).toBe(expectedDate);
        expect(a.entries[0].timeLabel).toBe(expectedTime);
        expect(a.entries[0].timeLabel).not.toContain('T');
        expect(a.entries[0].timeLabel).not.toContain('-');
    });

    it('koi payment na ho to entries khaali aur total 0', () => {
        const a = getPaymentRecordAnalytics(buildBooking({ payments: [] }));

        expect(a.entries).toEqual([]);
        expect(a.receivedTotal).toBe(0);
    });

    it('last payment ke din count karta hai', () => {
        const a = getPaymentRecordAnalytics(buildBooking());

        expect(a.daysSinceLastPayment).toBe(3);
        expect(relativeDaysLabel(a.daysSinceLastPayment)).toBe('3 days ago');
    });
});

describe('getPaymentRecordAnalytics — finance revisions', () => {
    it('naye update pehle, field diff + net impact ke saath', () => {
        const a = getPaymentRecordAnalytics(buildBooking());

        expect(a.revisions).toHaveLength(3);
        expect(a.revisions[0].editedByName).toBe('Priya');
        expect(a.revisions[0].totalDiff).toBe(-2000);
        expect(a.revisions[0].netChange).toBe(-2000);
        expect(a.revisions[0].direction).toBe('down');
    });

    it('deposit/balance wale changes ko list se hata deta hai', () => {
        const a = getPaymentRecordAnalytics(buildBooking());
        const aniketLatest = a.revisions[1];

        expect(aniketLatest.changes).toHaveLength(1);
        expect(aniketLatest.changes[0].field).toBe('advancePaid');
        expect(aniketLatest.changes[0].label).toBe('Paid Amount');
        expect(aniketLatest.paidDiff).toBe(5000);
        expect(aniketLatest.direction).toBe('up');
    });

    it('Actual Amount section me requirement aur paid ka from → to aata hai', () => {
        const a = getPaymentRecordAnalytics(buildBooking());
        const revision = a.revisions[1]; // advancePaid 20000 -> 25000

        expect(revision.amount.required.changed).toBe(false);
        expect(revision.amount.required.to).toBe(40000);

        expect(revision.amount.paid.changed).toBe(true);
        expect(revision.amount.paid.from).toBe(20000);
        expect(revision.amount.paid.to).toBe(25000);
        expect(revision.amount.paid.diff).toBe(5000);

        expect(revision.amount.balanceAfter).toBe(15000);
    });

    it('snapshot se units ka billed / paid per revision nikalta hai', () => {
        const a = getPaymentRecordAnalytics(buildBooking());
        const revision = a.revisions[0];

        expect(revision.unitsSection.available).toBe(true);
        expect(revision.unitsSection.totalBilled).toBe(800);
        expect(revision.unitsSection.totalPaid).toBe(0);
        expect(revision.unitsSection.units).toHaveLength(2);
        expect(revision.unitsSection.units[0]).toMatchObject({
            label: 'Water',
            perUnit: 10,
            hasRate: true,
            hasReading: false,
            paid: false,
        });
        expect(revision.unitsSection.units[1]).toMatchObject({
            label: 'Light',
            quantity: 100,
            amount: 800,
        });
    });

    it('snapshot ke bina (purana update) units section ko unavailable batata hai', () => {
        const booking = buildBooking();
        delete (booking.financeHistory[0] as any).snapshot;
        const a = getPaymentRecordAnalytics(booking);
        const revision = a.revisions[2]; // sabse purana entry

        expect(revision.unitsSection.available).toBe(false);
        expect(revision.unitsSection.units).toEqual([]);
        // Snapshot na ho to amount change ke "to" value se dikhate hain.
        expect(revision.amount.required.to).toBe(40000);
        expect(revision.amount.required.from).toBe(35000);
    });

    it('flags se pata chalta hai kya badla (units / heads / deposit / details)', () => {
        const booking = buildBooking();
        (booking.financeHistory[0] as any).changes = [
            { field: 'totalAmount', from: 35000, to: 40000 },
            { field: 'unitsChanged', from: 0, to: 1 },
            { field: 'chargesChanged', from: 0, to: 1 },
            { field: 'securityDeposit', from: 0, to: 10000 },
            { field: 'paymentDetailsUpdated', from: 0, to: 1 },
        ];
        const a = getPaymentRecordAnalytics(booking);
        const revision = a.revisions[2];

        expect(revision.flags).toEqual({
            unitsChanged: true,
            chargesChanged: true,
            depositChanged: true,
            paymentDetailsUpdated: true,
        });

        // Deposit bhi dikhta hai (refundable hai isliye net impact me nahi).
        expect(revision.amount.hasDeposit).toBe(true);
        expect(revision.amount.deposit.to).toBe(10000);
        expect(revision.amount.deposit.diff).toBe(10000);
        expect(revision.netChange).toBe(5000);

        // Heads snapshot (sirf jab charges badle hon).
        expect(revision.amount.charges).toHaveLength(2);
        expect(revision.amount.charges[1]).toMatchObject({
            label: 'Decoration',
            amount: 10000,
            paid: 5000,
            due: 5000,
        });
    });

    it('snapshot ka mode of payment revision ke saath aata hai', () => {
        const booking = buildBooking();
        // revisions newest-first sort hote hain, isliye sabse naya (index 2) update.
        booking.financeHistory[2].snapshot = buildSnapshot({ mode: 'UPI' });
        const a = getPaymentRecordAnalytics(booking);

        expect(a.revisions[0].mode).toBe('UPI');
    });

    it('snapshot na ho to mode khaali rehta hai', () => {
        const booking = buildBooking();
        delete booking.financeHistory[2].snapshot;
        const a = getPaymentRecordAnalytics(booking);

        expect(a.revisions[0].mode).toBe('');
    });
});

describe('getPaymentRecordAnalytics — breakdown', () => {
    it('charges ka paid/due/pct nikalta hai', () => {
        const a = getPaymentRecordAnalytics(buildBooking());

        expect(a.charges[0]).toMatchObject({
            label: 'Hall Rent',
            amount: 30000,
            paid: 20000,
            due: 10000,
            paidPct: 67,
        });
        expect(a.charges[1]).toMatchObject({ label: 'Decoration', due: 5000, paidPct: 50 });
    });

    it('units ka rate/reading status deta hai', () => {
        const a = getPaymentRecordAnalytics(buildBooking());

        expect(a.units[0]).toMatchObject({ label: 'Water', hasRate: true, hasReading: false });
    });

    it('booking khaali ho to bhi crash nahi karta', () => {
        const a = getPaymentRecordAnalytics(undefined);

        expect(a.totalAmount).toBe(0);
        expect(a.entries).toEqual([]);
        expect(a.revisions).toEqual([]);
        expect(a.charges).toEqual([]);
        expect(a.progress).toBe(0);
    });
});

describe('relativeDaysLabel', () => {
    it('human friendly labels deta hai', () => {
        expect(relativeDaysLabel(null)).toBe('');
        expect(relativeDaysLabel(0)).toBe('today');
        expect(relativeDaysLabel(1)).toBe('yesterday');
        expect(relativeDaysLabel(12)).toBe('12 days ago');
    });
});
