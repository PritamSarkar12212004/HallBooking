jest.mock('../src/services/Cloudinary/uploadImg', () => ({
  __esModule: true,
  default: jest.fn(async () => ({
    secure_url: 'https://cdn.test/meter.jpg',
    public_id: 'meter',
  })),
}));

jest.mock('react-native-compressor', () => ({
  Image: {
    compress: jest.fn(async (uri: string) => `compressed-${uri}`),
  },
}));

import {
  DEFAULT_UNIT_LABELS,
  addUnitRow,
  createDefaultUnitRows,
  createEmptyUnitRow,
  draftItemsToUnitRows,
  hasMeterPhoto,
  newUnitRow,
  pruneUnitRowsForNext,
  num,
  removeUnitRow,
  sanitizeUnitNumber,
  setUnitRowPhoto,
  toggleUnitRowIncludeNow,
  updateUnitRowField,
} from '../src/functions/booking/UnitsFunction';

describe('pruneUnitRowsForNext', () => {
  const row = (over: Partial<import('../src/functions/booking/UnitsFunction').UnitRow>) => ({
    ...newUnitRow('Light', '8'),
    ...over,
  });

  it('na title na rate wali khaali row hata deta hai', () => {
    const pruned = pruneUnitRowsForNext([
      createEmptyUnitRow(),
      row({ label: 'Water', perUnit: '10' }),
    ]);

    expect(pruned).toHaveLength(1);
    expect(pruned[0].label).toBe('Water');
  });

  it('title hai par rate nahi — wo bhi hatati hai', () => {
    const pruned = pruneUnitRowsForNext([row({ label: 'AC', perUnit: '' })]);

    expect(pruned).toHaveLength(0);
  });

  it('rate hai par title khaali — wo bhi hatati hai', () => {
    const pruned = pruneUnitRowsForNext([row({ label: '', perUnit: '5' })]);

    expect(pruned).toHaveLength(0);
  });

  it('toggle ON par reading khaali ho to row rakhta hai, bas toggle OFF kar deta hai', () => {
    const pruned = pruneUnitRowsForNext([
      row({ label: 'Water', perUnit: '10', currentUnit: '', includeNow: true }),
    ]);

    expect(pruned).toHaveLength(1);
    expect(pruned[0].includeNow).toBe(false);
  });

  it('valid rows (reading ke saath) waise hi rehti hain', () => {
    const valid = row({ label: 'Light', perUnit: '8', currentUnit: '120', includeNow: true });
    const pruned = pruneUnitRowsForNext([valid]);

    expect(pruned).toHaveLength(1);
    expect(pruned[0]).toMatchObject({ label: 'Light', currentUnit: '120', includeNow: true });
  });
});

describe('row factory', () => {
  it('ships default labels with reading toggle ON', () => {
    const rows = createDefaultUnitRows();

    expect(rows.map((row) => row.label)).toEqual(DEFAULT_UNIT_LABELS);
    expect(rows.every((row) => row.includeNow)).toBe(true);
  });

  it('creates a blank row with the toggle ON', () => {
    const row = createEmptyUnitRow();

    expect(row.label).toBe('');
    expect(row.includeNow).toBe(true);
    expect(row.meterPhotoUri).toBeNull();
    expect(row.meterPhotoUrl).toBeNull();
  });

  it('keeps reading + photo when built from saved data', () => {
    const row = newUnitRow('Light', '5', false, '120', {
      includeNow: true,
      meterPhotoUrl: 'https://cdn.test/meter.jpg',
    });

    expect(row.id).toMatch(/^unit-/);
    expect(row.meterPhotoUrl).toBe('https://cdn.test/meter.jpg');
    expect(row.meterPhotoUri).toBe('https://cdn.test/meter.jpg');
  });
});

describe('sanitizers', () => {
  it('keeps digits, strips leading zeros and caps at 5', () => {
    expect(sanitizeUnitNumber('12a3')).toBe('123');
    expect(sanitizeUnitNumber('007')).toBe('7');
    expect(sanitizeUnitNumber('1234567')).toBe('12345');
    expect(num('150')).toBe(150);
    expect(num('')).toBe(0);
  });
});

describe('row updates', () => {
  it('sanitizes numbers but keeps the label free text', () => {
    const rows = [newUnitRow('Light')];

    expect(updateUnitRowField(rows, rows[0].id, 'perUnit', '0a12')[0].perUnit).toBe(
      '12',
    );
    expect(
      updateUnitRowField(rows, rows[0].id, 'label', 'AC 2')[0].label,
    ).toBe('AC 2');
  });

  it('toggles the "add reading now" switch', () => {
    const rows = [newUnitRow('Light', '5')];

    const off = toggleUnitRowIncludeNow(rows, rows[0].id);
    expect(off[0].includeNow).toBe(false);

    expect(toggleUnitRowIncludeNow(off, rows[0].id)[0].includeNow).toBe(true);
  });

  it('sets and clears the meter photo', () => {
    const rows = [newUnitRow('Light', '5')];

    const withPhoto = setUnitRowPhoto(
      rows,
      rows[0].id,
      'file:///meter.jpg',
      null,
    );
    expect(hasMeterPhoto(withPhoto[0])).toBe(true);

    const uploaded = setUnitRowPhoto(
      withPhoto,
      rows[0].id,
      'file:///meter.jpg',
      'https://cdn.test/meter.jpg',
    );
    expect(uploaded[0].meterPhotoUrl).toBe('https://cdn.test/meter.jpg');

    expect(setUnitRowPhoto(uploaded, rows[0].id, null)[0].meterPhotoUri).toBeNull();
    expect(hasMeterPhoto(setUnitRowPhoto(uploaded, rows[0].id, null)[0])).toBe(
      false,
    );
  });

  it('adds and removes rows', () => {
    const rows = createDefaultUnitRows();

    expect(addUnitRow(rows)).toHaveLength(rows.length + 1);
    expect(removeUnitRow(rows, rows[0].id)).toHaveLength(rows.length - 1);
  });

  it('maps saved items back to rows (reading ke saath)', () => {
    const rows = draftItemsToUnitRows([
      { label: 'Light', perUnit: 5, currentUnit: 120 },
      { label: 'Water', perUnit: 3, currentUnit: 0 },
    ]);

    expect(rows[0].currentUnit).toBe('120');
    // Reading pehle se hai to input khula rehta hai
    expect(rows[0].includeNow).toBe(true);
    // Reading nahi hai to normally band
    expect(rows[1].includeNow).toBe(false);
  });

  it('focus mode me missing reading ka input khula aata hai', () => {
    const rows = draftItemsToUnitRows(
      [
        { label: 'Light', perUnit: 5, currentUnit: 0 },
        { label: 'AC', perUnit: 8, currentUnit: 40 },
      ],
      { openReadingInput: true },
    );

    expect(rows[0].includeNow).toBe(true);
    expect(rows[1].includeNow).toBe(true);
  });
});