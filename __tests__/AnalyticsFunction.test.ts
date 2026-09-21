import {
  ANALYTICS_SECTIONS,
  PERIOD_OPTIONS,
  buildCustomerCards,
  buildDocumentCards,
  buildFinanceCards,
  buildOverviewCards,
  buildReportCards,
  buildStaffCards,
  buildVenueCards,
  changePct,
  collectionPct,
  comparisonRows,
  documentDate,
  documentTypeOptions,
  eventTypeRows,
  filterDocuments,
  formatPeriodRange,
  hallUtilizationRows,
  maxSeriesValue,
  modeRows,
  money,
  sharePct,
  sortDocumentsByDate,
  statusTone,
  toChartData,
  venueRows,
} from '../src/functions/ceo/AnalyticsFunction';

const overview = {
  totalEvents: 12,
  upcomingEvents: 5,
  ongoingEvents: 2,
  completedEvents: 3,
  cancelledEvents: 1,
  todayEvents: 2,
  totalBilled: 250000,
  totalCollected: 150000,
  pendingPayments: 100000,
  refunds: 5000,
  securityDeposits: 20000,
  securityDepositsHeld: 15000,
  deductions: 2000,
  netRevenue: 147000,
};

describe('money / counts', () => {
  it('formats Indian grouping', () => {
    expect(money(123456)).toBe('₹1,23,456');
    expect(money(0)).toBe('₹0');
    expect(money(null)).toBe('₹0');
  });
});

describe('sharePct / changePct / collectionPct', () => {
  it('computes share of a total', () => {
    expect(sharePct(25, 100)).toBe(25);
    expect(sharePct(1, 3)).toBe(33.3);
    expect(sharePct(50, 0)).toBe(0);
  });

  it('computes change and guards a zero base', () => {
    expect(changePct(150, 100)).toBe(50);
    expect(changePct(50, 100)).toBe(-50);
    expect(changePct(10, 0)).toBe(100);
    expect(changePct(0, 0)).toBe(0);
  });

  it('caps collection percentage at 100', () => {
    expect(collectionPct(50, 200)).toBe(25);
    expect(collectionPct(300, 200)).toBe(100);
    expect(collectionPct(10, 0)).toBe(0);
  });
});

describe('formatPeriodRange', () => {
  it('renders a single date when from === to', () => {
    expect(
      formatPeriodRange({
        key: 'today',
        label: 'Today',
        from: '2026-09-21T00:00:00.000Z',
        to: '2026-09-21T23:59:59.999Z',
        days: 1,
      }),
    ).toContain('2026');
  });

  it('stays empty without a period', () => {
    expect(formatPeriodRange(undefined)).toBe('');
    expect(formatPeriodRange({ key: 'all', label: '', from: '', to: '', days: 0 })).toBe('');
  });
});

describe('chart helpers', () => {
  it('coerces series values and never goes below zero', () => {
    expect(toChartData([{ label: 'A', value: 5 }, { label: 'B', value: -3 }])).toEqual([
      { label: 'A', value: 5 },
      { label: 'B', value: 0 },
    ]);
    expect(toChartData(undefined)).toEqual([]);
  });

  it('never returns a zero max', () => {
    expect(maxSeriesValue([])).toBe(1);
    expect(maxSeriesValue([{ value: 0 }], 4)).toBe(4);
    expect(maxSeriesValue([{ value: 9 }])).toBe(9);
  });
});

describe('statusTone', () => {
  it('maps booking statuses to tones', () => {
    expect(statusTone('Cancelled')).toBe('red');
    expect(statusTone('Ended')).toBe('violet');
    expect(statusTone('Confirmed')).toBe('green');
    expect(statusTone('Pending')).toBe('gold');
    expect(statusTone('')).toBe('blue');
  });
});

describe('overview cards', () => {
  it('covers every metric the CEO asked for', () => {
    const cards = buildOverviewCards(overview);
    const keys = cards.map((card) => card.key);
    expect(keys).toEqual([
      'totalEvents',
      'upcomingEvents',
      'completedEvents',
      'cancelledEvents',
      'todayEvents',
      'totalBilled',
      'totalCollected',
      'pendingPayments',
      'refunds',
      'securityDeposits',
      'netRevenue',
    ]);
    expect(cards.find((card) => card.key === 'totalEvents')?.value).toBe('12');
    expect(cards.find((card) => card.key === 'totalCollected')?.value).toBe('₹1,50,000');
  });

  it('is empty without data', () => {
    expect(buildOverviewCards(undefined)).toEqual([]);
  });
});

describe('finance cards', () => {
  const finance = {
    totalCollection: 100000,
    cashCollection: 40000,
    upiCollection: 45000,
    chequeCollection: 10000,
    neftCollection: 5000,
    onlineCollection: 50000,
    modeSplit: [
      { mode: 'UPI', amount: 45000, count: 3 },
      { mode: 'Cash', amount: 40000, count: 2 },
      { mode: 'Cheque', amount: 10000, count: 1 },
      { mode: 'NEFT/RTGS', amount: 5000, count: 1 },
    ],
    pendingPayments: 20000,
    securityDepositCollected: 30000,
    securityDepositReturned: 10000,
    securityDepositsHeld: 18000,
    deductions: 2000,
    additionalCharges: 7000,
    billedTotal: 120000,
    eventWiseRevenue: [],
    paymentHistory: [],
  };

  it('splits collection by mode with shares', () => {
    const cash = buildFinanceCards(finance).find((card) => card.key === 'cashCollection');
    expect(cash?.value).toBe('₹40,000');
    expect(cash?.hint).toBe('40% of collection');
  });

  it('sorts mode bars by amount and computes share', () => {
    const rows = modeRows(finance);
    expect(rows.map((row) => row.label)).toEqual(['UPI', 'Cash', 'Cheque', 'NEFT/RTGS']);
    expect(rows[0].sharePct).toBe(45);
    expect(rows[0].hint).toBe('3 payments');
  });

  it('handles a missing mode split', () => {
    expect(modeRows(undefined)).toEqual([]);
  });
});

describe('venue cards and hall rows', () => {
  it('summarises availability', () => {
    const cards = buildVenueCards({
      totalHalls: 3,
      activeHalls: 2,
      occupiedToday: 1,
      availableToday: 1,
      todayBookings: 2,
      upcomingBookings: 4,
      halls: [],
    });
    expect(cards.find((card) => card.key === 'totalHalls')?.hint).toBe('2 active');
    expect(cards.find((card) => card.key === 'availableToday')?.value).toBe('1');
  });

  it('uses utilization (not revenue share) for the hall bar', () => {
    const rows = hallUtilizationRows({
      totalHalls: 1,
      activeHalls: 1,
      occupiedToday: 1,
      availableToday: 0,
      todayBookings: 1,
      upcomingBookings: 0,
      halls: [
        {
          hallId: 'h1',
          hallName: 'Grand Hall',
          capacity: 500,
          bookings: 4,
          billed: 400000,
          revenue: 250000,
          bookedDays: 6,
          utilizationPct: 30,
          occupiedToday: true,
          todayBookings: 1,
          upcomingBookings: 0,
        },
      ],
    });
    expect(rows[0].sharePct).toBe(30);
    expect(rows[0].tone).toBe('green');
    expect(rows[0].hint).toBe('4 bookings · 6 days booked');
  });
});

describe('customer / staff / report cards', () => {
  it('summarises customers', () => {
    const cards = buildCustomerCards({
      totalCustomers: 10,
      newCustomers: 4,
      repeatCustomers: 6,
      pendingCustomers: 3,
      pendingAmount: 50000,
      topCustomers: [],
      pendingList: [],
    });
    expect(cards.map((card) => card.value)).toEqual(['10', '4', '6', '3', '₹50,000']);
  });

  it('picks the top collector', () => {
    const cards = buildStaffCards({
      totalStaff: 2,
      staff: [
        {
          userId: 'u1',
          name: 'Amit',
          role: 'STAFF',
          bookingsHandled: 2,
          bookingsCreated: 1,
          collected: 10000,
          pending: 0,
          lastActivityAt: null,
        },
        {
          userId: 'u2',
          name: 'Ravi',
          role: 'OFFICE',
          bookingsHandled: 5,
          bookingsCreated: 3,
          collected: 40000,
          pending: 5000,
          lastActivityAt: null,
        },
      ],
      assignments: [],
    });
    expect(cards.find((card) => card.key === 'topCollector')?.value).toBe('Ravi');
    expect(cards.find((card) => card.key === 'collected')?.value).toBe('₹50,000');
  });

  it('summarises reports', () => {
    const cards = buildReportCards({
      daily: [],
      weekly: [],
      monthly: [],
      byVenue: [],
      byEventType: [],
      bookingsByEventType: [],
      cancellationRate: 8.5,
      pendingReport: { count: 2, amount: 30000 },
      depositReport: { collected: 0, returned: 0, deducted: 2000, held: 15000, rows: [] },
      profitLoss: {
        billed: 0,
        collected: 0,
        pending: 0,
        refunds: 0,
        deductions: 0,
        netPosition: 98000,
      },
      monthlyComparison: [],
    });
    expect(cards.find((card) => card.key === 'cancellationRate')?.value).toBe('8.5%');
    expect(cards.find((card) => card.key === 'pending')?.hint).toBe('2 bookings with dues');
    expect(cards.find((card) => card.key === 'netPosition')?.value).toBe('₹98,000');
  });
});

describe('report rows', () => {
  it('computes venue share', () => {
    const rows = venueRows({
      daily: [],
      weekly: [],
      monthly: [],
      byVenue: [
        { label: 'Grand Hall', value: 75000 },
        { label: 'Lawn', value: 25000 },
      ],
      byEventType: [],
      bookingsByEventType: [],
      cancellationRate: 0,
      pendingReport: { count: 0, amount: 0 },
      depositReport: { collected: 0, returned: 0, deducted: 0, held: 0, rows: [] },
      profitLoss: {
        billed: 0,
        collected: 0,
        pending: 0,
        refunds: 0,
        deductions: 0,
        netPosition: 0,
      },
      monthlyComparison: [],
    });
    expect(rows[0].sharePct).toBe(75);
    expect(rows[1].valueText).toBe('₹25,000');
  });

  it('computes event type rows with counts', () => {
    const rows = eventTypeRows({
      daily: [],
      weekly: [],
      monthly: [],
      byVenue: [],
      byEventType: [{ label: 'Wedding', value: 60000, count: 3 }],
      bookingsByEventType: [],
      cancellationRate: 0,
      pendingReport: { count: 0, amount: 0 },
      depositReport: { collected: 0, returned: 0, deducted: 0, held: 0, rows: [] },
      profitLoss: {
        billed: 0,
        collected: 0,
        pending: 0,
        refunds: 0,
        deductions: 0,
        netPosition: 0,
      },
      monthlyComparison: [],
    });
    expect(rows[0].hint).toBe('3 events');
    expect(rows[0].sharePct).toBe(100);
  });

  it('marks month-over-month change', () => {
    const rows = comparisonRows({
      daily: [],
      weekly: [],
      monthly: [],
      byVenue: [],
      byEventType: [],
      bookingsByEventType: [],
      cancellationRate: 0,
      pendingReport: { count: 0, amount: 0 },
      depositReport: { collected: 0, returned: 0, deducted: 0, held: 0, rows: [] },
      profitLoss: {
        billed: 0,
        collected: 0,
        pending: 0,
        refunds: 0,
        deductions: 0,
        netPosition: 0,
      },
      monthlyComparison: [
        { label: 'Sep', value: 120000, bookings: 4, previousValue: 80000, previousBookings: 3 },
      ],
    });
    expect(rows[0].delta).toBe(50);
    expect(rows[0].tone).toBe('green');
    expect(rows[0].previousText).toBe('₹80,000');
  });
});

describe('documents', () => {
  const documents = {
    total: 3,
    byType: [
      { key: 'paymentProof', label: 'Payment proofs', value: 2 },
      { key: 'meterStart', label: 'Meter readings', value: 1 },
    ],
    rows: [
      {
        id: 'a',
        bookingId: 'b1',
        bookingNumber: 'BK-1',
        customerName: 'Ramesh',
        mobile: '9800000001',
        eventName: 'Wedding',
        hallName: 'Grand Hall',
        type: 'paymentProof',
        label: 'Payment Proof – Cash',
        url: 'https://cdn/x.jpg',
        addedAt: '2026-09-20T10:00:00.000Z',
      },
      {
        id: 'b',
        bookingId: 'b2',
        bookingNumber: 'BK-2',
        customerName: 'Sita',
        mobile: '9800000002',
        eventName: 'Birthday',
        hallName: 'Lawn',
        type: 'meterStart',
        label: 'Meter Reading – Light',
        url: 'https://cdn/y.jpg',
        addedAt: '2026-09-19T10:00:00.000Z',
      },
    ],
  };

  it('builds summary cards from the type counts', () => {
    const cards = buildDocumentCards(documents);
    expect(cards.map((card) => card.value)).toEqual(['3', '2', '1', '0', '0']);
  });

  it('keeps only types that exist', () => {
    expect(documentTypeOptions(documents).map((option) => option.key)).toEqual([
      'paymentProof',
      'meterStart',
    ]);
    expect(documentTypeOptions(undefined)).toEqual([]);
  });

  it('filters by type and search text', () => {
    expect(filterDocuments(documents.rows, { type: 'meterStart' })).toHaveLength(1);
    expect(filterDocuments(documents.rows, { type: 'all' })).toHaveLength(2);
    expect(filterDocuments(documents.rows, { search: 'ramesh' })).toHaveLength(1);
    expect(filterDocuments(documents.rows, { search: 'bk-2' })).toHaveLength(1);
    expect(filterDocuments(documents.rows, { search: 'nothing' })).toHaveLength(0);
    expect(filterDocuments(undefined)).toEqual([]);
  });

  it('sorts newest first and formats the date', () => {
    expect(sortDocumentsByDate(documents.rows).map((row) => row.id)).toEqual(['a', 'b']);
    expect(documentDate('2026-09-20T10:00:00.000Z')).toContain('Sep');
    expect(documentDate('')).toBe('');
  });
});

describe('static options', () => {
  it('exposes all CEO sections (documents included)', () => {
    expect(ANALYTICS_SECTIONS.map((section) => section.key)).toEqual([
      'overview',
      'finance',
      'events',
      'venue',
      'customers',
      'staff',
      'documents',
      'reports',
    ]);
  });

  it('exposes the period options', () => {
    expect(PERIOD_OPTIONS.map((option) => option.key)).toEqual([
      'today',
      'week',
      'month',
      'quarter',
      'year',
      'all',
    ]);
  });
});
