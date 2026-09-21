import { useCallback, useState } from 'react';
import { showMessage } from 'react-native-flash-message';

import { capturePhoto, pickFromGallery } from '../../module/ImagePickerModule';
import useBusyLock from '../busy/useBusyLock';
import { getDraft, updateDraft } from '../../manager/draftBookingStore';
import {
  createDefaultUnitRows,
  draftItemsToUnitRows,
  isUnitRowValid,
  pruneUnitRowsForNext,
  resolveUnitMeterPhotoUrl,
  setUnitRowPhoto,
  unitRowsToPayload,
} from '../../functions/booking/UnitsFunction';
import type { UnitRow } from '../../functions/booking/UnitsFunction';

export interface UseUnitsFormOptions {
  /** Draft save hone ke baad navigation — screen handle karti hai. */
  onNext?: () => void;
}

/**
 * Units screen ka state + logic.
 *
 * Row updates pure helpers (`UnitsFunction`) se hote hain, isliye UI component
 * (`UnitsSection`) bas `setRows` call karta hai. Photo upload yahan hota hai:
 * compress (react-native-compressor) + Cloudinary — photo OPTIONAL hai.
 */
const useUnitsForm = ({ onNext }: UseUnitsFormOptions = {}) => {
  const [rows, setRows] = useState<UnitRow[]>(() => {
    const saved = getDraft()?.units;

    // Draft me pehle se units ho to wahi wapas (reading/photo ke saath).
    if (saved && saved.length > 0) {
      return draftItemsToUnitRows(saved);
    }

    return createDefaultUnitRows();
  });

  /** Jis row ki meter photo upload chal rahi hai. */
  const [uploadingRowId, setUploadingRowId] = useState<string | null>(null);
  // Meter photo upload ke dauraan navigation lock (back par upload adhoora na rahe).
  useBusyLock(uploadingRowId !== null, 'Uploading photo…');

  /** Meter photo: local preview turant, phir compress + Cloudinary upload. */
  const applyRowPhoto = useCallback(async (rowId: string, uri: string) => {
    setRows((prev) => setUnitRowPhoto(prev, rowId, uri));
    setUploadingRowId(rowId);

    try {
      const url = await resolveUnitMeterPhotoUrl(uri);
      setRows((prev) => setUnitRowPhoto(prev, rowId, uri, url || null));
    } catch (error: any) {
      console.log('Meter photo upload failed', error);
      setRows((prev) => setUnitRowPhoto(prev, rowId, null));
      showMessage({
        message: 'Upload Failed',
        description: 'Meter photo could not be uploaded. Please try again.',
        type: 'danger',
      });
    } finally {
      setUploadingRowId(null);
    }
  }, []);

  const captureRowPhoto = useCallback(
    async (row: UnitRow) => {
      const photo = await capturePhoto({ cameraType: 'back' });

      if (photo?.uri) {
        await applyRowPhoto(row.id, photo.uri as string);
      }
    },
    [applyRowPhoto],
  );

  const pickRowPhoto = useCallback(
    async (row: UnitRow) => {
      const photo = await pickFromGallery();

      if (photo?.uri) {
        await applyRowPhoto(row.id, photo.uri as string);
      }
    },
    [applyRowPhoto],
  );

  const removeRowPhoto = useCallback((row: UnitRow) => {
    setRows((prev) => setUnitRowPhoto(prev, row.id, null));
  }, []);

  /**
   * Validation: jo rows screen par hain (label ke saath) unme rate hona chahiye,
   * aur jisme "abhi reading" toggle ON hai usme reading bhi.
   */
  const usedRows = rows.filter((row) => row.label.trim().length > 0);
  const invalidRow = usedRows.find((row) => !isUnitRowValid(row));
  const formValid = !uploadingRowId && !invalidRow;

  const handleNext = useCallback(() => {
    if (!formValid) {
      showMessage({
        message: 'Complete Unit Details',
        description:
          'Enter the per-unit rate for every unit, and the reading for the units where you added one.',
        type: 'warning',
      });
      return;
    }

    // Khaali rows (na title, na rate) auto-remove; toggle ON par reading
    // khaali chhodi ho to row rakho par reading baad me add hogi.
    const pruned = pruneUnitRowsForNext(rows);

    // DRAFT SYSTEM: units local me save hote hain — payment section me merge
    // ho jaate hain jab booking submit hoti hai. Khaali rows draft me nahi
    // jaati aur UI state se bhi hata dete hain, taaki wapas aane par na dikhein.
    updateDraft('units', unitRowsToPayload(pruned));
    setRows(pruned);

    onNext?.();
  }, [formValid, rows, onNext]);

  return {
    rows,
    setRows,
    uploadingRowId,
    captureRowPhoto,
    pickRowPhoto,
    removeRowPhoto,
    /** Kaunsi row adhoori hai (UI hint ke liye). */
    invalidRow,
    usedRows,
    formValid,
    handleNext,
  };
};

export default useUnitsForm;