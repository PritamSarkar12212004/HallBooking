type CloudinaryResponse = {
    secure_url: string;
    public_id: string;
};

export interface UploadImageOptions {
    /** Cloudinary par file ka naam (default `profile-<timestamp>.jpg`). */
    fileName?: string;
    /** Local file ka mime type (default `image/jpeg`). */
    mimeType?: string;
}

const CLOUD_NAME = 'dftt4ow6q';
const UPLOAD_PRESET = 'HallBooking-Unisol';

/** `data:image/png;base64,...` — file path nahi, memory me hi image hai. */
const DATA_URI_REGEX = /^data:image\/[a-z+]+;base64,/i;

export const isDataUriImage = (value: string): boolean =>
    DATA_URI_REGEX.test(value);

/**
 * Image Cloudinary par upload karta hai.
 *
 * Do tarah ke input support hote hain:
 *  - local file URI (`file://…`, `content://…`) — camera / gallery photos
 *  - base64 data URI (`data:image/png;base64,…`) — jaise finger signature
 *    canvas ka output; Cloudinary ise `file` field me string ke roop me
 *    accept karta hai, isliye koi temp file banane ki zarurat nahi padti.
 */
const uploadImage = async (
    imageUri: string,
    options: UploadImageOptions = {}
): Promise<CloudinaryResponse> => {
    const {
        fileName = `profile-${Date.now()}.jpg`,
        mimeType = 'image/jpeg',
    } = options;

    const formData = new FormData();

    if (isDataUriImage(imageUri)) {
        // Data URI ke saath `{ uri, type, name }` object bhejne par React Native
        // use file ki tarah kholne ki koshish karta hai aur fail ho jaata hai —
        // isliye ise plain string ki tarah append karte hain.
        formData.append('file', imageUri);
    } else {
        formData.append('file', {
            uri: imageUri,
            type: mimeType,
            name: fileName,
        } as any);
    }

    formData.append('upload_preset', UPLOAD_PRESET);

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
            method: 'POST',
            body: formData,
        }
    );

    const data = await response.json();

    if (!response.ok) {
        console.log('Cloudinary Error:', data);

        throw new Error(
            data?.error?.message || 'Image upload failed'
        );
    }

    return {
        secure_url: data.secure_url,
        public_id: data.public_id,
    };
};

export default uploadImage;