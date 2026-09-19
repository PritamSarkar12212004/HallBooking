import { Image } from 'react-native-compressor';

/**
 * Image compression service (react-native-compressor).
 *
 * Cloudinary par upload karne se pehle photo yahan se guzarti hai, taaki 3-5 MB
 * ki camera photo chhoti (200-400 KB) ban jaaye — upload tez aur data kam.
 */

export interface ImageCompressionOptions {
  /** 'manual' = neeche diye maxWidth/maxHeight/quality use hote hain. */
  compressionMethod?: 'auto' | 'manual';
  /** Landscape image ki max width boundary. */
  maxWidth?: number;
  /** Portrait image ki max height boundary. */
  maxHeight?: number;
  /** JPEG quality (0-1). PNG par ignore hoti hai. */
  quality?: number;
}

/** Halls screen ke event photos ke liye tuned default options. */
export const IMAGE_COMPRESSION_OPTIONS: ImageCompressionOptions = {
  compressionMethod: 'manual',
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 0.5,
};

/**
 * Local image URI ko compress karke naya file path deta hai.
 *
 * Compression fail ho jaaye (ya uri khaali ho) to original uri hi return hoti
 * hai — upload sirf is wajah se fail nahi hona chahiye.
 */
export const compressImage = async (
  uri: string | null | undefined,
  options: ImageCompressionOptions = IMAGE_COMPRESSION_OPTIONS,
): Promise<string | null> => {
  if (!uri) return null;

  try {
    return await Image.compress(uri, options);
  } catch (error: any) {
    console.log('Image Compression Error:', error?.message || error);
    return uri;
  }
};

export default compressImage;
