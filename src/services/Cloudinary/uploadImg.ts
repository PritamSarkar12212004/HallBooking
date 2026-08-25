type CloudinaryResponse = {
    secure_url: string;
    public_id: string;
};

const CLOUD_NAME = 'dftt4ow6q';
const UPLOAD_PRESET = 'HallBooking-Unisol';

const uploadImage = async (imageUri: string): Promise<CloudinaryResponse> => {
    const formData = new FormData();

    formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: `profile-${Date.now()}.jpg`,
    } as any);

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