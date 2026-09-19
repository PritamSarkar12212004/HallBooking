jest.mock('../src/services/Cloudinary/uploadImg', () => ({
  __esModule: true,
  default: jest.fn(async () => ({
    secure_url: 'https://cdn.test/evidence.jpg',
    public_id: 'evidence',
  })),
}));

jest.mock('react-native-compressor', () => ({
  Image: {
    compress: jest.fn(async (uri: string) => `compressed-${uri}`),
  },
}));

import { Image as CompressorImage } from 'react-native-compressor';

import uploadImage from '../src/services/Cloudinary/uploadImg';
import {
  EVENT_TYPE_FOR_ME,
  EVENT_TYPE_OTHER,
  EXTRA_EVENT_TYPE_OPTIONS,
  buildEventSection,
  buildRequirementQuantities,
  getOtherEventNameError,
  getRequirementQuantityError,
  isEventFormValid,
  isOtherEventType,
  isValidOtherEventName,
  isValidRequirementQuantity,
  mergeUniqueOptions,
  parseRequirementQuantity,
  resolveEventEvidenceUrl,
  sanitizeOtherEventName,
  sanitizeRequirementQuantity,
  uploadEventEvidencePhoto,
} from '../src/functions/booking/EventFormFunction';
import type { EventFormValues } from '../src/functions/booking/EventFormFunction';

const validValues: EventFormValues = {
  expectedAttendance: '250',
  selectedEventType: ['Wedding'],
  otherEventName: '',
  requirements: ['Stage', 'Chairs'],
  requirementQuantities: { Stage: '1', Chairs: '150' },
};

describe('event type options', () => {
  it('ships "For Me" and "Other" as client-side extras', () => {
    expect(EXTRA_EVENT_TYPE_OPTIONS).toEqual([EVENT_TYPE_FOR_ME, EVENT_TYPE_OTHER]);
  });

  it('merges backend + custom options with a case-insensitive dedupe', () => {
    expect(
      mergeUniqueOptions(['Wedding', 'Birthday Party'], ['other', 'Wedding', ' ']),
    ).toEqual(['Wedding', 'Birthday Party', 'other']);
  });

  it('detects the "Other" selection', () => {
    expect(isOtherEventType([EVENT_TYPE_OTHER])).toBe(true);
    expect(isOtherEventType(['Wedding'])).toBe(false);
    expect(isOtherEventType([])).toBe(false);
  });
});

describe('sanitizeOtherEventName / isValidOtherEventName', () => {
  it('keeps supported characters and caps the length at 40', () => {
    expect(sanitizeOtherEventName('Baby  Shower')).toBe('Baby Shower');
    expect(sanitizeOtherEventName('x'.repeat(60)).length).toBe(40);
  });

  it('needs 3-40 characters with at least one letter', () => {
    expect(isValidOtherEventName('Baby Shower')).toBe(true);
    expect(isValidOtherEventName('AB')).toBe(false);
    expect(isValidOtherEventName('123')).toBe(false);
    expect(isValidOtherEventName('')).toBe(false);
  });
});
describe('getOtherEventNameError', () => {
  it('shows nothing until touched or when "Other" is not selected', () => {
    expect(getOtherEventNameError('', false, true)).toBe('');
    expect(getOtherEventNameError('', true, false)).toBe('');
  });

  it('asks for a name when "Other" is selected and empty', () => {
    expect(getOtherEventNameError('', true, true)).toBe(
      'Please enter the event type name',
    );
  });

  it('flags a too short / letterless name only', () => {
    expect(getOtherEventNameError('AB', true, true)).toContain('3-40');
    expect(getOtherEventNameError('Baby Shower', true, true)).toBe('');
  });
});

describe('requirement quantities', () => {
  it('sanitizes to digits, strips leading zeros and parses numbers', () => {
    expect(sanitizeRequirementQuantity('12a3')).toBe('123');
    expect(sanitizeRequirementQuantity('007')).toBe('7');
    expect(sanitizeRequirementQuantity('')).toBe('');
    expect(parseRequirementQuantity('150')).toBe(150);
    expect(parseRequirementQuantity('')).toBe(0);
  });

  it('treats zero (and empty) as missing, positive as valid', () => {
    expect(isValidRequirementQuantity('1')).toBe(true);
    expect(isValidRequirementQuantity('0')).toBe(false);
    expect(isValidRequirementQuantity('')).toBe(false);
  });

  it('only complains after a Next attempt', () => {
    expect(getRequirementQuantityError('', false)).toBe('');
    expect(getRequirementQuantityError('', true)).toBe('Enter quantity');
    expect(getRequirementQuantityError('2', true)).toBe('');
  });

  it('builds the backend payload for every selected requirement', () => {
    expect(
      buildRequirementQuantities(['Stage', 'Chairs', 'Tables'], {
        Stage: '1',
        Chairs: '150',
      }),
    ).toEqual([
      { label: 'Stage', quantity: 1 },
      { label: 'Chairs', quantity: 150 },
      { label: 'Tables', quantity: 0 },
    ]);
  });
});
describe('isEventFormValid', () => {
  it('accepts a fully filled form', () => {
    expect(isEventFormValid(validValues)).toBe(true);
  });

  it('requires attendance, event type and quantities', () => {
    expect(isEventFormValid({ ...validValues, expectedAttendance: '' })).toBe(false);
    expect(isEventFormValid({ ...validValues, expectedAttendance: '0' })).toBe(false);
    expect(isEventFormValid({ ...validValues, selectedEventType: [] })).toBe(false);
    expect(
      isEventFormValid({
        ...validValues,
        requirementQuantities: { Stage: '1' },
      }),
    ).toBe(false);
  });

  it('accepts any quantity when nothing is selected', () => {
    expect(
      isEventFormValid({
        ...validValues,
        requirements: [],
        requirementQuantities: {},
      }),
    ).toBe(true);
  });

  it('demands a valid name for "Other"', () => {
    const other = { ...validValues, selectedEventType: [EVENT_TYPE_OTHER] };

    expect(isEventFormValid({ ...other, otherEventName: '' })).toBe(false);
    expect(isEventFormValid({ ...other, otherEventName: 'Baby Shower' })).toBe(true);
  });
});

describe('buildEventSection', () => {
  it('maps the form into the draft event section', () => {
    expect(buildEventSection(validValues)).toEqual({
      expectedAttendance: 250,
      type: 'Wedding',
      customType: '',
      requirements: ['Stage', 'Chairs'],
      requirementQuantities: [
        { label: 'Stage', quantity: 1 },
        { label: 'Chairs', quantity: 150 },
      ],
    });
  });

  it('sends "Other" as the type plus a readable customType', () => {
    expect(
      buildEventSection({
        ...validValues,
        selectedEventType: [EVENT_TYPE_OTHER],
        otherEventName: 'Baby  Shower ',
      }),
    ).toMatchObject({ type: EVENT_TYPE_OTHER, customType: 'Baby Shower' });
  });
});

describe('evidence photo upload', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('compresses before uploading to Cloudinary', async () => {
    const url = await uploadEventEvidencePhoto('file:///evidence.jpg');

    expect(CompressorImage.compress).toHaveBeenCalledWith(
      'file:///evidence.jpg',
      expect.objectContaining({ maxWidth: 1200, quality: 0.5 }),
    );
    expect(uploadImage).toHaveBeenCalledWith('compressed-file:///evidence.jpg');
    expect(url).toBe('https://cdn.test/evidence.jpg');
  });

  it('returns an empty string when no photo is attached', async () => {
    expect(await resolveEventEvidenceUrl(null)).toBe('');
    expect(uploadImage).not.toHaveBeenCalled();
  });

  it('reuses an already uploaded URL', async () => {
    expect(await resolveEventEvidenceUrl('https://cdn.test/old.jpg')).toBe(
      'https://cdn.test/old.jpg',
    );
    expect(uploadImage).not.toHaveBeenCalled();
  });

  it('uploads a local uri', async () => {
    expect(await resolveEventEvidenceUrl('file:///evidence.jpg')).toBe(
      'https://cdn.test/evidence.jpg',
    );
    expect(uploadImage).toHaveBeenCalledTimes(1);
  });
});