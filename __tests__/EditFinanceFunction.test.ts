import {
    buildChargesKey,
    buildFinanceSnapshot,
    buildPaymentSnapshot,
    buildUnitsKey,
    collectPaidValues,
    hasFinanceChanges,
    isMeterPhotoUrl,
    needsPaymentDetails,
    paymentSnapshotKey,
} from '../src/functions/booking/EditFinanceFunction';

describe('collectPaidValues', () => {
    it('non-zero paid values leta hai aur sort karta hai', () => {
        expect(
            collectPaidValues([
                { paid: 5000 },
                { paid: 0 },
                { paid: 2000 },
            ]),
        ).toEqual([2000, 5000]);
    });

    it('zero / missing paid rows hata deta hai', () => {
        expect(collectPaidValues([{}, { paid: undefined }, { paid: 0 }])).toEqual(
            [],
        );
    });

    it('null / undefined par khaali list', () => {
        expect(collectPaidValues(null)).toEqual([]);
        expect(collectPaidValues(undefined)).toEqual([]);
    });
});

describe('buildPaymentSnapshot', () => {
    it('paid values + security deposit ek shape me', () => {
        expect(buildPaymentSnapshot([{ paid: 1000 }, { paid: 0 }], 5000)).toEqual({
            paidValues: [1000],
            securityDeposit: 5000,
        });
    });

    it('string deposit ko number banata hai', () => {
        expect(buildPaymentSnapshot([], '2500').securityDeposit).toBe(2500);
        expect(buildPaymentSnapshot([], '').securityDeposit).toBe(0);
        expect(buildPaymentSnapshot([], null).securityDeposit).toBe(0);
    });
});

describe('needsPaymentDetails (mode of payment ka gate)', () => {
    // Saved booking: Hall Rent 20000 (paid 10000), Decoration 5000 (paid 0),
    // deposit 10000.
    const original = buildPaymentSnapshot(
        [{ paid: 10000 }, { paid: 0 }],
        10000,
    );

    it('kuch change na ho to false (section chhupa)', () => {
        expect(
            needsPaymentDetails(
                original,
                buildPaymentSnapshot([{ paid: 10000 }, { paid: 0 }], 10000),
            ),
        ).toBe(false);
    });

    it('Actual Amount me naya custom charge (paid 0) add karne par false', () => {
        // Naya head add hua (amount ke saath) par uska paid 0 hai.
        expect(
            needsPaymentDetails(
                original,
                buildPaymentSnapshot(
                    [{ paid: 10000 }, { paid: 0 }, { paid: 0 }],
                    10000,
                ),
            ),
        ).toBe(false);
    });

    it('Actual Amount ke amounts kam karne par false', () => {
        // Amount kam hua, paid waisa hi — snapshot me amount aata hi nahi.
        expect(
            needsPaymentDetails(
                original,
                buildPaymentSnapshot([{ paid: 10000 }, { paid: 0 }], 10000),
            ),
        ).toBe(false);
    });

    it('charge head ka naam badalne par false', () => {
        expect(
            needsPaymentDetails(
                buildPaymentSnapshot([{ paid: 5000 }], 0),
                buildPaymentSnapshot([{ paid: 5000 }], 0),
            ),
        ).toBe(false);
    });

    it('sirf unit reading / rate update karne par false', () => {
        // Units is logic me aate hi nahi.
        expect(needsPaymentDetails(original, original)).toBe(false);
    });

    it('Customer Paid me paisa add karne par true', () => {
        expect(
            needsPaymentDetails(
                original,
                buildPaymentSnapshot([{ paid: 15000 }, { paid: 0 }], 10000),
            ),
        ).toBe(true);
    });

    it('Customer Paid me naya custom head ka payment record karne par true', () => {
        expect(
            needsPaymentDetails(
                original,
                buildPaymentSnapshot(
                    [{ paid: 10000 }, { paid: 0 }, { paid: 3000 }],
                    10000,
                ),
            ),
        ).toBe(true);
    });

    it('paid row (jisme paisa tha) hatane par true', () => {
        expect(
            needsPaymentDetails(
                buildPaymentSnapshot([{ paid: 10000 }, { paid: 5000 }], 0),
                buildPaymentSnapshot([{ paid: 10000 }], 0),
            ),
        ).toBe(true);
    });

    it('bina paisa wali row hatane par false', () => {
        expect(
            needsPaymentDetails(
                original,
                buildPaymentSnapshot([{ paid: 10000 }], 10000),
            ),
        ).toBe(false);
    });

    it('row order badalne par false', () => {
        expect(
            needsPaymentDetails(
                buildPaymentSnapshot([{ paid: 500 }, { paid: 1000 }], 0),
                buildPaymentSnapshot([{ paid: 1000 }, { paid: 500 }], 0),
            ),
        ).toBe(false);
    });

    it('paid amount ek head se dusre me shift karne par true', () => {
        expect(
            needsPaymentDetails(
                buildPaymentSnapshot([{ paid: 5000 }, { paid: 5000 }], 0),
                buildPaymentSnapshot([{ paid: 10000 }, { paid: 0 }], 0),
            ),
        ).toBe(true);
    });

    it('security deposit add / change karne par true', () => {
        expect(
            needsPaymentDetails(
                original,
                buildPaymentSnapshot([{ paid: 10000 }, { paid: 0 }], 15000),
            ),
        ).toBe(true);

        expect(
            needsPaymentDetails(
                buildPaymentSnapshot([], 0),
                buildPaymentSnapshot([], 5000),
            ),
        ).toBe(true);
    });

    it('original na ho (booking load nahi hui) to false', () => {
        expect(needsPaymentDetails(null, original)).toBe(false);
        expect(needsPaymentDetails(undefined, original)).toBe(false);
    });
});

describe('paymentSnapshotKey', () => {
    it('same data par same key, alag data par alag key', () => {
        const a = buildPaymentSnapshot([{ paid: 1 }], 100);
        const b = buildPaymentSnapshot([{ paid: 1 }], 100);
        const c = buildPaymentSnapshot([{ paid: 1 }], 101);
        const d = buildPaymentSnapshot([{ paid: 2 }], 100);

        expect(paymentSnapshotKey(a)).toBe(paymentSnapshotKey(b));
        expect(paymentSnapshotKey(a)).not.toBe(paymentSnapshotKey(c));
        expect(paymentSnapshotKey(a)).not.toBe(paymentSnapshotKey(d));
    });
});

describe('buildChargesKey / buildUnitsKey', () => {
    it('charges me order matter nahi karta aur khaali label ignore hota hai', () => {
        const a = buildChargesKey([{ label: 'A', amount: 1 }, { label: 'B' }]);
        const b = buildChargesKey([{ label: 'B' }, { label: 'A', amount: 1 }]);
        const c = buildChargesKey([
            { label: '   ' },
            { label: 'A', amount: 1 },
            { label: 'B' },
        ]);

        expect(a).toBe(b);
        expect(a).toBe(c);
    });

    it('units me reading / rate / photo ka farak key badal deta hai', () => {
        const base = [{ label: 'Water', perUnit: 10, currentUnit: 0 }];

        expect(buildUnitsKey(base)).toBe(buildUnitsKey([...base]));
        expect(buildUnitsKey(base)).not.toBe(
            buildUnitsKey([{ label: 'Water', perUnit: 10, currentUnit: 5 }]),
        );
        expect(buildUnitsKey(base)).not.toBe(
            buildUnitsKey([{ label: 'Water', perUnit: 12, currentUnit: 0 }]),
        );
        expect(buildUnitsKey(base)).not.toBe(
            buildUnitsKey([
                { label: 'Water', perUnit: 10, currentUnit: 0, meterPhoto: 'x' },
            ]),
        );
    });

    it('khaali units rows ignore hoti hain', () => {
        expect(buildUnitsKey([{ label: '' }, { label: '  ' }])).toBe('');
        expect(buildUnitsKey(null)).toBe('');
    });
});

describe('hasFinanceChanges (Save button ka gate)', () => {
    const original = buildFinanceSnapshot(
        [{ label: 'Hall Rent', amount: 20000, paid: 10000 }],
        [{ label: 'Water', perUnit: 10, currentUnit: 0 }],
        10000,
    );

    it('kuch change na ho to false (Save disabled)', () => {
        expect(
            hasFinanceChanges(
                original,
                buildFinanceSnapshot(
                    [{ label: 'Hall Rent', amount: 20000, paid: 10000 }],
                    [{ label: 'Water', perUnit: 10, currentUnit: 0 }],
                    10000,
                ),
            ),
        ).toBe(false);
    });

    it('actual amount add / kam karne par true', () => {
        expect(
            hasFinanceChanges(
                original,
                buildFinanceSnapshot(
                    [{ label: 'Hall Rent', amount: 15000, paid: 10000 }],
                    [{ label: 'Water', perUnit: 10, currentUnit: 0 }],
                    10000,
                ),
            ),
        ).toBe(true);

        expect(
            hasFinanceChanges(
                original,
                buildFinanceSnapshot(
                    [
                        { label: 'Hall Rent', amount: 20000, paid: 10000 },
                        { label: 'Sound', amount: 3000 },
                    ],
                    [{ label: 'Water', perUnit: 10, currentUnit: 0 }],
                    10000,
                ),
            ),
        ).toBe(true);
    });

    it('customer paid ya deposit badalne par true', () => {
        expect(
            hasFinanceChanges(
                original,
                buildFinanceSnapshot(
                    [{ label: 'Hall Rent', amount: 20000, paid: 15000 }],
                    [{ label: 'Water', perUnit: 10, currentUnit: 0 }],
                    10000,
                ),
            ),
        ).toBe(true);

        expect(
            hasFinanceChanges(
                original,
                buildFinanceSnapshot(
                    [{ label: 'Hall Rent', amount: 20000, paid: 10000 }],
                    [{ label: 'Water', perUnit: 10, currentUnit: 0 }],
                    15000,
                ),
            ),
        ).toBe(true);
    });

    it('unit reading / rate / naya unit add karne par true', () => {
        expect(
            hasFinanceChanges(
                original,
                buildFinanceSnapshot(
                    [{ label: 'Hall Rent', amount: 20000, paid: 10000 }],
                    [{ label: 'Water', perUnit: 10, currentUnit: 25 }],
                    10000,
                ),
            ),
        ).toBe(true);

        expect(
            hasFinanceChanges(
                original,
                buildFinanceSnapshot(
                    [{ label: 'Hall Rent', amount: 20000, paid: 10000 }],
                    [
                        { label: 'Water', perUnit: 10, currentUnit: 0 },
                        { label: 'Light', perUnit: 8 },
                    ],
                    10000,
                ),
            ),
        ).toBe(true);
    });

    it('bina label wala khaali unit row change nahi maana jaata', () => {
        expect(
            hasFinanceChanges(
                original,
                buildFinanceSnapshot(
                    [{ label: 'Hall Rent', amount: 20000, paid: 10000 }],
                    [
                        { label: 'Water', perUnit: 10, currentUnit: 0 },
                        { label: '' },
                    ],
                    10000,
                ),
            ),
        ).toBe(false);
    });

    it('original na ho (booking load nahi hui) to false', () => {
        expect(hasFinanceChanges(null, original)).toBe(false);
        expect(hasFinanceChanges(undefined, original)).toBe(false);
    });
});

describe('isMeterPhotoUrl', () => {
    const savedUnits = [{ label: 'Light', meterPhoto: 'https://x/meter.png' }];
    const rowUrls = ['https://x/new-meter.png', null];

    it('saved unit ka meter photo pehchanta hai', () => {
        expect(isMeterPhotoUrl('https://x/meter.png', savedUnits, rowUrls)).toBe(
            true,
        );
    });

    it('naye capture kiye meter photo (row) ko bhi pehchanta hai', () => {
        expect(
            isMeterPhotoUrl('https://x/new-meter.png', savedUnits, rowUrls),
        ).toBe(true);
    });

    it('payment receipt ko meter photo nahi samajhta', () => {
        expect(isMeterPhotoUrl('https://x/receipt.png', savedUnits, rowUrls)).toBe(
            false,
        );
    });

    it('khaali / missing values par false', () => {
        expect(isMeterPhotoUrl('', savedUnits, rowUrls)).toBe(false);
        expect(isMeterPhotoUrl(null, savedUnits, rowUrls)).toBe(false);
        expect(isMeterPhotoUrl(undefined, undefined, undefined)).toBe(false);
        expect(isMeterPhotoUrl('https://x/receipt.png', [], [])).toBe(false);
    });
});
