import {
  DEFAULT_CHARGE_LABELS,
  addChargeRow,
  applyAllPaid,
  areAllChargesPaid,
  chargeRowsToPayload,
  computeChargeTotals,
  createDefaultChargeRows,
  digitsOnly,
  itemsToChargeRows,
  newChargeRow,
  num,
  removeChargeRow,
  savedChargeRows,
  updateChargeRowField,
} from '../src/functions/booking/ChargeFunction';

describe('row factory', () => {
  it('ships the default amount heads', () => {
    const rows = createDefaultChargeRows();

    expect(rows.map((row) => row.label)).toEqual(DEFAULT_CHARGE_LABELS);
    expect(rows.every((row) => row.amount === '' && row.paid === '')).toBe(true);
  });

  it('gives every row a unique id', () => {
    const a = newChargeRow('Hall Rent');
    const b = newChargeRow('Hall Rent');

    expect(a.id).toMatch(/^charge-/);
    expect(a.id).not.toBe(b.id);
  });
});

describe('sanitizers', () => {
  it('keeps digits only and parses numbers safely', () => {
    expect(digitsOnly('1a2b3')).toBe('123');
    expect(num('150')).toBe(150);
    expect(num('')).toBe(0);
    expect(num('abc')).toBe(0);
    expect(num(null)).toBe(0);
    expect(num(undefined)).toBe(0);
  });
});

describe('row updates', () => {
  it('sanitizes numbers but keeps the label free text', () => {
    const rows = [newChargeRow('Rent')];

    expect(updateChargeRowField(rows, rows[0].id, 'paid', '1a2')[0].paid).toBe('12');
    expect(updateChargeRowField(rows, rows[0].id, 'label', 'Hall 2')[0].label).toBe(
      'Hall 2',
    );
  });

  it('adds and removes rows without touching the others', () => {
    const rows = [newChargeRow('Rent')];
    const withNew = addChargeRow(rows);

    expect(withNew).toHaveLength(2);
    expect(removeChargeRow(withNew, rows[0].id)).toHaveLength(1);
  });
});

describe('all paid toggle', () => {
  it('fills every paid amount and clears them again', () => {
    const rows = [newChargeRow('Rent', '5000', ''), newChargeRow('Light', '500', '')];

    expect(applyAllPaid(rows, true).map((row) => row.paid)).toEqual(['5000', '500']);
    expect(applyAllPaid(applyAllPaid(rows, true), false).map((row) => row.paid)).toEqual([
      '',
      '',
    ]);
  });

  it('is only true when every head is filled and fully paid', () => {
    expect(areAllChargesPaid([])).toBe(false);
    expect(areAllChargesPaid([newChargeRow('Rent', '5000', '1000')])).toBe(false);
    expect(areAllChargesPaid([newChargeRow('Rent', '5000', '')])).toBe(false);
    expect(areAllChargesPaid([newChargeRow('Rent', '', '0')])).toBe(false);
    expect(areAllChargesPaid([newChargeRow('Rent', '5000', '5000')])).toBe(true);
  });
});

describe('totals', () => {
  it('sums amount and paid, and keeps balance non-negative', () => {
    const rows = [
      newChargeRow('Rent', '5000', '2000'),
      newChargeRow('Light', '500', '300'),
    ];

    expect(computeChargeTotals(rows)).toEqual({
      totalAmount: 5500,
      totalPaid: 2300,
      balanceAmount: 3200,
    });
    expect(computeChargeTotals([])).toEqual({
      totalAmount: 0,
      totalPaid: 0,
      balanceAmount: 0,
    });
    // Extra paid ko balance me negative nahi dikhate.
    expect(computeChargeTotals([newChargeRow('Rent', '100', '500')]).balanceAmount).toBe(0);
  });
});

describe('draft / backend mapping', () => {
  it('drops untitled heads from the payload', () => {
    const rows = [newChargeRow('Rent', '5000', '2000'), newChargeRow('  ', '100', '')];

    expect(chargeRowsToPayload(rows)).toEqual([
      { label: 'Rent', amount: 5000, paid: 2000 },
    ]);
  });

  it('builds editable rows from saved items', () => {
    const rows = itemsToChargeRows([
      { label: 'Rent', amount: 5000, paid: 2000 },
      { label: 'Decoration', amount: 0, paid: 0 },
    ]);

    expect(rows.map((row) => [row.label, row.amount, row.paid])).toEqual([
      ['Rent', '5000', '2000'],
      ['Decoration', '', ''],
    ]);
  });

  it('returns null when nothing is saved', () => {
    expect(savedChargeRows([])).toBeNull();
    expect(savedChargeRows(undefined)).toBeNull();
    expect(savedChargeRows(null)).toBeNull();
    expect(savedChargeRows([{ label: 'Rent', amount: 1, paid: 0 }])).toHaveLength(1);
  });
});
