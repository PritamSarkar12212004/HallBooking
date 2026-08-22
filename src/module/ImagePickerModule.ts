import {
    launchCamera,
    launchImageLibrary,
    ImagePickerResponse,
} from 'react-native-image-picker';

const handleImageResult = (
    result: ImagePickerResponse
): any | null => {

    if (result.didCancel) {
        return null;
    }

    if (result.errorCode) {
        console.log(
            'Image Picker Error:',
            result.errorCode,
            result.errorMessage
        );
        return null;
    }

    const photo = result.assets?.[0];

    if (!photo?.uri) {
        return null;
    }

    return photo;
};

export const capturePhoto = async ({ cameraType }: { cameraType: "back" | "back" | "front" }): Promise<any | null> => {

    const result = await launchCamera({
        mediaType: 'photo',
        cameraType: cameraType ? cameraType : 'back',
        quality: 0.8,
        saveToPhotos: false,
    });

    return handleImageResult(result);
};

export const pickFromGallery = async (): Promise<any | null> => {

    const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 1,
    });

    return handleImageResult(result);
};