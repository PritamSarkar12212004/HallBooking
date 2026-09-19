import React from 'react';
import { Camera, ImagePlus, Trash2, UploadCloud } from 'lucide-react-native';
import { Image } from '../../lib/style/withTailwind';

import { Theme } from '../../const/theme/Theme';
import {
  Text,
  TouchableOpacity,
  View,
} from '../../lib/style/withTailwind';

type EvidencePhotoCardProps = {
  /** Local preview ya pehle se uploaded URL (null = kuch nahi). */
  photoUri: string | null;
  uploading: boolean;
  onCapture: () => void;
  onPickFromGallery: () => void;
  onRemove: () => void;
};

/**
 * Evidence / reference photo picker.
 *
 * Photo hook me compress (react-native-compressor) hokar upload hoti hai —
 * ye component sirf UI hai.
 */
const EvidencePhotoCard = ({
  photoUri,
  uploading,
  onCapture,
  onPickFromGallery,
  onRemove,
}: EvidencePhotoCardProps) => {
  return (
    <View className="mb-6">
      <Text className="text-white text-sm font-semibold mb-1">
        Evidence / Reference Photo
      </Text>
      <Text className="text-[#8F8B91] text-xs mb-3">
        Optional — event ka photo, invite ya koi bhi proof attach kar sakte hain.
      </Text>

      {photoUri ? (
        <View
          className="rounded-xl overflow-hidden"
          style={{
            backgroundColor: Theme.background.secondary,
            borderWidth: 1,
            borderColor: Theme.button.primary,
          }}
        >
          <Image
            source={{ uri: photoUri }}
            style={{ width: '100%', height: 170 }}
            resizeMode="cover"
          />

          <View className="flex-row items-center justify-between p-3">
            <Text className="text-xs" style={{ color: Theme.text.secondary }}>
              {uploading ? 'Uploading photo...' : 'Evidence photo ready'}
            </Text>

            <View className="flex-row gap-2">
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={onCapture}
                className="flex-row items-center px-3 py-2 rounded-lg"
                style={{ backgroundColor: Theme.background.third }}
              >
                <Camera size={15} color={Theme.button.primary} />
                <Text className="ml-1.5 text-xs font-semibold" style={{ color: Theme.text.primary }}>
                  Retake
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={onRemove}
                className="flex-row items-center px-3 py-2 rounded-lg"
                style={{ backgroundColor: '#3A2020' }}
              >
                <Trash2 size={15} color="#F87171" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        <View className="flex-row gap-3">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onCapture}
            className="flex-1 flex-row items-center justify-center py-4 rounded-xl"
            style={{ backgroundColor: Theme.background.secondary }}
          >
            {uploading ? (
              <UploadCloud size={16} color={Theme.button.primary} />
            ) : (
              <Camera size={16} color={Theme.button.primary} />
            )}
            <Text className="ml-2 text-sm font-semibold" style={{ color: Theme.text.primary }}>
              {uploading ? 'Uploading...' : 'Camera'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPickFromGallery}
            className="flex-1 flex-row items-center justify-center py-4 rounded-xl"
            style={{ backgroundColor: Theme.background.secondary }}
          >
            <ImagePlus size={16} color={Theme.button.primary} />
            <Text className="ml-2 text-sm font-semibold" style={{ color: Theme.text.primary }}>
              Gallery
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default EvidencePhotoCard;