jest.mock('../src/services/Cloudinary/uploadImg', () => ({
  __esModule: true,
  default: jest.fn(async () => ({
    secure_url: 'https://cdn.test/id.jpg',
    public_id: 'id',
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
  FIXED_GOVERNMENT_ID_TYPES,
  OTHER_ID_FALLBACK_TYPE,
  buildApplicantDraft,
  buildApplicantStepPayload,
  getEmailError,
  getMobileError,
  getOtherIdError,
  isApplicantFormValid,
  isFixedGovernmentIdType,
  isValidEmail,
  isValidMobileNumber,
  isValidOtherIdName,
  resolveGovernmentIdPhotoUrl,
  sanitizeGovernmentIdNumber,
  sanitizeMobileNumber,
  sanitizeOtherIdName,
  uploadGovernmentIdPhoto,
} from '../src/functions/booking/ApplicantFormFunction';
import type { ApplicantFormValues } from '../src/functions/booking/ApplicantFormFunction';

const validValues: ApplicantFormValues = {
  applicantName: 'Amit Sharma',
  organization: 'Sharma Traders',
  mobileNumber: '9876543210',
  address: '12 MG Road, Kolkata',
  email: 'amit@example.com',
  selectedId: 'Aadhaar Card',
  otherIdName: '',
  photoUri: 'file:///id.jpg',
};

/** "Other ID" select kiya gaya form (fixed card ki jagah custom naam). */
const otherIdValues: ApplicantFormValues = {
  ...validValues,
  selectedId: 'Voter ID',
  otherIdName: 'Voter ID',
};

describe('sanitizeMobileNumber', () => {
  it('keeps digits only and caps the length at 10', () => {
    expect(sanitizeMobileNumber('98765-43210')).toBe('9876543210');
    expect(sanitizeMobileNumber('+91 98765 43210')).toBe('9198765432');
    expect(sanitizeMobileNumber('abc')).toBe('');
  });
});

describe('isValidMobileNumber / isValidEmail', () => {
  it('accepts only a 10 digit mobile number', () => {
    expect(isValidMobileNumber('9876543210')).toBe(true);
    expect(isValidMobileNumber('98765')).toBe(false);
    expect(isValidMobileNumber('')).toBe(false);
  });

  it('accepts a normal email (trimmed) and rejects a broken one', () => {
    expect(isValidEmail('amit@example.com')).toBe(true);
    expect(isValidEmail('  amit@example.com  ')).toBe(true);
    expect(isValidEmail('amit@example')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });
});

describe('getMobileError', () => {
  it('stays hidden until the field is touched', () => {
    expect(getMobileError('', false)).toBe('');
  });

  it('shows the right message for each failure', () => {
    expect(getMobileError('', true)).toBe('Mobile number is required');
    expect(getMobileError('98765', true)).toBe('Enter all 10 digits (5/10)');
    expect(getMobileError('9876543210', true)).toBe('');
  });
});

describe('getEmailError', () => {
  it('stays hidden until the field is touched', () => {
    expect(getEmailError('', false)).toBe('');
  });

  it('never complains when the optional email is left empty', () => {
    expect(getEmailError('', true)).toBe('');
    expect(getEmailError('   ', true)).toBe('');
  });

  it('only flags a filled but invalid email', () => {
    expect(getEmailError('amit@example', true)).toBe(
      'Enter a valid email address (e.g. name@example.com)',
    );
    expect(getEmailError('amit@example.com', true)).toBe('');
  });
});

describe('sanitizeGovernmentIdNumber', () => {
  it('trims extra whitespace and caps the length at 30', () => {
    expect(sanitizeGovernmentIdNumber('  1234  5678  ')).toBe('1234 5678');
    expect(sanitizeGovernmentIdNumber('x'.repeat(40)).length).toBe(30);
    expect(sanitizeGovernmentIdNumber('')).toBe('');
  });
});

describe('government id types', () => {
  it('knows the fixed cards (backend enum ke saath match)', () => {
    expect(FIXED_GOVERNMENT_ID_TYPES).toContain('ID Card');
    expect(isFixedGovernmentIdType('Aadhaar Card')).toBe(true);
    expect(isFixedGovernmentIdType('ID Card')).toBe(true);
    expect(isFixedGovernmentIdType('Voter ID')).toBe(false);
    expect(isFixedGovernmentIdType('')).toBe(false);
  });
});

describe('sanitizeOtherIdName / isValidOtherIdName', () => {
  it('keeps supported characters, collapses spaces and caps at 30', () => {
    expect(sanitizeOtherIdName('  Voter   ID  ')).toBe('Voter ID');
    expect(sanitizeOtherIdName('Voter@ID#123')).toBe('VoterID123');
    expect(sanitizeOtherIdName('D.L./Pass-2026 & Co')).toBe('D.L./Pass-2026 & Co');
    expect(sanitizeOtherIdName('x'.repeat(40)).length).toBe(30);
  });

  it('needs at least 3 characters and at least one letter', () => {
    expect(isValidOtherIdName('Voter ID')).toBe(true);
    expect(isValidOtherIdName('  ID  ')).toBe(false);
    expect(isValidOtherIdName('123456')).toBe(false);
    expect(isValidOtherIdName('')).toBe(false);
  });
});

describe('getOtherIdError', () => {
  it('stays hidden until touched and when the optional field is empty', () => {
    expect(getOtherIdError('Voter ID', false)).toBe('');
    expect(getOtherIdError('', true)).toBe('');
    expect(getOtherIdError('   ', true)).toBe('');
  });

  it('explains what is wrong with a filled value', () => {
    expect(getOtherIdError('AB', true)).toBe('ID name must be at least 3 characters');
    expect(getOtherIdError('123456', true)).toBe(
      'ID name must contain letters (e.g. Voter ID)',
    );
    expect(getOtherIdError('Voter ID', true)).toBe('');
  });
});
describe('isApplicantFormValid', () => {
  it('accepts a fully filled form', () => {
    expect(isApplicantFormValid(validValues)).toBe(true);
  });

  it('still accepts the form when the optional email is empty', () => {
    expect(isApplicantFormValid({ ...validValues, email: '' })).toBe(true);
    expect(isApplicantFormValid({ ...validValues, email: '   ' })).toBe(true);
  });

  it('accepts a custom "Other ID" when its name is valid', () => {
    expect(isApplicantFormValid(otherIdValues)).toBe(true);
  });

  it('rejects a custom "Other ID" with an invalid name', () => {
    expect(isApplicantFormValid({ ...otherIdValues, otherIdName: 'AB' })).toBe(
      false,
    );
    expect(
      isApplicantFormValid({ ...otherIdValues, otherIdName: '123456' }),
    ).toBe(false);
  });

  it('rejects each missing or invalid piece', () => {
    expect(isApplicantFormValid({ ...validValues, applicantName: '  ' })).toBe(
      false,
    );
    expect(isApplicantFormValid({ ...validValues, mobileNumber: '98765' })).toBe(
      false,
    );
    expect(isApplicantFormValid({ ...validValues, email: 'nope' })).toBe(false);
    expect(isApplicantFormValid({ ...validValues, address: '' })).toBe(false);
    expect(isApplicantFormValid({ ...validValues, selectedId: null })).toBe(
      false,
    );
    expect(isApplicantFormValid({ ...validValues, photoUri: null })).toBe(false);
  });
});

describe('buildApplicantDraft / buildApplicantStepPayload', () => {
  it('maps the form into the draft applicant section', () => {
    expect(buildApplicantDraft(validValues, 'https://cdn.test/id.jpg')).toEqual({
      name: 'Amit Sharma',
      organization: 'Sharma Traders',
      mobile: '9876543210',
      address: '12 MG Road, Kolkata',
      email: 'amit@example.com',
      governmentIdType: 'Aadhaar Card',
      governmentIdName: '',
      governmentIdNumber: '',
      governmentIdPhoto: 'https://cdn.test/id.jpg',
    });
  });

  it('drops an unselected ID type from the draft', () => {
    expect(
      buildApplicantDraft({ ...validValues, selectedId: null }, '')
        .governmentIdType,
    ).toBeUndefined();
  });

  it('sends the custom "Other ID" as the catch-all type + name', () => {
    expect(
      buildApplicantDraft(otherIdValues, 'https://cdn.test/id.jpg'),
    ).toMatchObject({
      governmentIdType: OTHER_ID_FALLBACK_TYPE,
      governmentIdName: 'Voter ID',
    });
  });

  it('builds the Step2 navigation payload', () => {
    expect(
      buildApplicantStepPayload(validValues, 'https://cdn.test/id.jpg'),
    ).toEqual({
      applicantData: {
        applicantName: 'Amit Sharma',
        organization: 'Sharma Traders',
        mobileNumber: '9876543210',
        address: '12 MG Road, Kolkata',
        email: 'amit@example.com',
        governmentId: 'Aadhaar Card',
        governmentIdName: '',
        governmentIdNumber: '',
        governmentIdPhoto: 'https://cdn.test/id.jpg',
      },
      governmentIdPhoto: 'https://cdn.test/id.jpg',
    });
  });

  it('carries the typed "Other ID" name in the Step2 payload', () => {
    const payload = buildApplicantStepPayload(
      otherIdValues,
      'https://cdn.test/id.jpg',
    );

    expect(payload.applicantData.governmentId).toBe(OTHER_ID_FALLBACK_TYPE);
    expect(payload.applicantData.governmentIdName).toBe('Voter ID');
  });

  it('keeps the ID number optional in both payloads', () => {
    const withoutNumber = { ...validValues, governmentIdNumber: undefined };

    expect(buildApplicantDraft(withoutNumber, '').governmentIdNumber).toBe('');
    expect(
      buildApplicantStepPayload(withoutNumber, '').applicantData
        .governmentIdNumber,
    ).toBe('');
  });
});

describe('uploadGovernmentIdPhoto / resolveGovernmentIdPhotoUrl', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('compresses the local file before uploading it', async () => {
    const url = await uploadGovernmentIdPhoto('file:///id.jpg');

    expect(CompressorImage.compress).toHaveBeenCalledWith(
      'file:///id.jpg',
      expect.objectContaining({ maxWidth: 1200, quality: 0.5 }),
    );
    expect(uploadImage).toHaveBeenCalledWith('compressed-file:///id.jpg');
    expect(url).toBe('https://cdn.test/id.jpg');
  });

  it('returns an empty string when there is no photo', async () => {
    expect(await resolveGovernmentIdPhotoUrl(null)).toBe('');
    expect(uploadImage).not.toHaveBeenCalled();
  });

  it('reuses an already uploaded URL instead of uploading it again', async () => {
    const url = await resolveGovernmentIdPhotoUrl('https://cdn.test/old.jpg');

    expect(url).toBe('https://cdn.test/old.jpg');
    expect(uploadImage).not.toHaveBeenCalled();
    expect(CompressorImage.compress).not.toHaveBeenCalled();
  });

  it('uploads a local uri', async () => {
    expect(await resolveGovernmentIdPhotoUrl('file:///id.jpg')).toBe(
      'https://cdn.test/id.jpg',
    );
    expect(uploadImage).toHaveBeenCalledTimes(1);
  });
});