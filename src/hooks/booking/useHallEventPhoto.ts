import { useCallback, useState } from 'react';

import { capturePhoto, pickFromGallery } from '../../module/ImagePickerModule';
import {
  processPhoto,
  removePhoto,
} from '../../functions/booking/HallCalenderFunction';

export interface UseHallEventPhotoOptions {
  /** Edit flow ke liye pehle se mojood local preview. */
  initialPhotoUri?: string | null;
  /** Edit flow ke liye pehle se upload ki hui Cloudinary URL. */
  initialImageUrl?: string | null;
}

/**
 * Event photo pick + upload ka reusable hook.
 *
 * Camera ya gallery se photo leta hai, Cloudinary par upload karta hai aur teeno
 * states return karta hai: `eventPhotoUri` (local preview), `eventImageUrl`
 * (uploaded URL, backend ko yahi jaata hai) aur `uploadingImage` (progress).
 *
 * `useHallCalendarForm` isi ko use karta hai; payment proof ya koi bhi doosri
 * photo screen bhi seedha ise use kar sakti hai.
 */
const useHallEventPhoto = ({
  initialPhotoUri = null,
  initialImageUrl = null,
}: UseHallEventPhotoOptions = {}) => {
  const [eventPhotoUri, setEventPhotoUri] = useState<string | null>(initialPhotoUri);
  const [eventImageUrl, setEventImageUrl] = useState<string | null>(initialImageUrl);
  const [uploadingImage, setUploadingImage] = useState(false);

  /** Camera se photo leta aur upload karta hai (default rear camera). */
  const captureEventPhoto = useCallback(
    async (cameraType: 'back' | 'front' = 'back') => {
      const photo = await capturePhoto({ cameraType });

      await processPhoto(photo, {
        setEventPhotoUri,
        setEventImageUrl,
        setUploadingImage,
      });
    },
    [],
  );

  /** Gallery se photo leta aur upload karta hai. */
  const pickEventPhoto = useCallback(async () => {
    const photo = await pickFromGallery();

    await processPhoto(photo, {
      setEventPhotoUri,
      setEventImageUrl,
      setUploadingImage,
    });
  }, []);

  /** Preview + uploaded URL dono clear. */
  const clearEventPhoto = useCallback(() => {
    removePhoto({ setEventPhotoUri, setEventImageUrl });
  }, []);

  return {
    /** Local preview URI (null jab photo na ho). */
    eventPhotoUri,
    /** Cloudinary URL — form valid tabhi hota hai jab ye set ho. */
    eventImageUrl,
    uploadingImage,
    captureEventPhoto,
    pickEventPhoto,
    clearEventPhoto,
  };
};

export default useHallEventPhoto;
