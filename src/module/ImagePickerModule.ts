import {
    launchCamera,
    launchImageLibrary,
    ImagePickerResponse,
} from 'react-native-image-picker';
import {
    Alert,
    PermissionsAndroid,
    Platform,
} from 'react-native';

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
        Alert.alert(
            'Camera Error',
            result.errorMessage || result.errorCode || 'Could not open the camera.',
        );
        return null;
    }

    const photo = result.assets?.[0];

    if (!photo?.uri) {
        return null;
    }

    return photo;
};

// Android requires an explicit runtime grant for CAMERA (since it is
// declared in the manifest). Without it launchCamera silently fails.
const requestCameraPermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') {
        return true;
    }
    try {
        const alreadyGranted = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.CAMERA,
        );
        if (alreadyGranted) {
            return true;
        }
        const result = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA,
            {
                title: 'Camera Permission',
                message: 'HallBooking needs camera access to capture photos and signatures.',
                buttonPositive: 'Allow',
                buttonNegative: 'Deny',
            },
        );
        return result === PermissionsAndroid.RESULTS.GRANTED;
    } catch (e) {
        console.log('Camera permission error:', e);
        return false;
    }
};

export const capturePhoto = async ({ cameraType }: { cameraType: "back" | "front" }): Promise<any | null> => {

    const granted = await requestCameraPermission();
    if (!granted) {
        Alert.alert(
            'Permission Denied',
            'Camera permission is required to capture photos. Please enable it in app settings.',
        );
        return null;
    }

    try {
        const result = await launchCamera({
            mediaType: 'photo',
            cameraType: cameraType ?? 'back',
            quality: 0.8,
            saveToPhotos: false,
        });

        return handleImageResult(result);
    } catch (e: any) {
        console.log('launchCamera exception:', e);
        Alert.alert(
            'Camera Error',
            e?.message || 'Could not open the camera. Please try again.',
        );
        return null;
    }
};

export const pickFromGallery = async (): Promise<any | null> => {

    const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 1,
    });

    return handleImageResult(result);
};