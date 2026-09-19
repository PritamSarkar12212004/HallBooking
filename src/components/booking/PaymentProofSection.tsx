import React from 'react';
import { Camera, ImagePlus, ReceiptText, Trash2 } from 'lucide-react-native';
import { Image } from '../../lib/style/withTailwind';

import { Theme } from '../../const/theme/Theme';
import { Text, TouchableOpacity, View } from '../../lib/style/withTailwind';

type PaymentProofSectionProps = {
  /** Chuni hui photo ka local preview (null = kuch nahi chuna). */
  photoUri: string | null;
  /** Mode ke hisaab se hint (Cash me optional, baaki me zaroori). */
  hint: string;
  /** Non-cash modes me proof zaroori hai — badge ke liye. */
  required?: boolean;
  onCapture: () => void;
  onPickFromGallery: () => void;
  onRemove: () => void;
  /** Photo tap karne par full screen preview. */
  onView: () => void;
};

/**
 * Payment proof (receipt / screenshot) picker.
 *
 * Picker hamesha dikhta hai: Cash me proof OPTIONAL evidence hai, UPI / Cheque /
 * NEFT me zaroori. Upload (compress + Cloudinary) hook me hota hai — ye
 * component sirf UI hai.
 */
const PaymentProofSection = ({
  photoUri,
  hint,
  required = false,
  onCapture,
  onPickFromGallery,
  onRemove,
  onView,
}: PaymentProofSectionProps) => (
  <View className="mb-6">
    <View className="flex-row items-center gap-2 mb-1">
      <ReceiptText size={20} color={Theme.button.primary} />
      <Text className="text-white text-base font-semibold">Payment Proof</Text>

      <View
        className="ml-1 px-2 py-0.5 rounded-full"
        style={{
          backgroundColor: required
            ? 'rgba(245,158,11,0.15)'
            : Theme.background.secondary,
        }}
      >
        <Text
          className="text-[10px] font-semibold"
          style={{ color: required ? '#F59E0B' : Theme.text.secondary }}
        >
          {required ? 'Required' : 'Optional'}
        </Text>
      </View>
    </View>

    <Text className="text-[#8F8B91] text-xs mb-4">{hint}</Text>

    {photoUri ? (
      <View
        className="rounded-xl overflow-hidden"
        style={{
          backgroundColor: Theme.background.secondary,
          borderWidth: 1,
          borderColor: Theme.button.primary,
        }}
      >
        <TouchableOpacity activeOpacity={0.9} onPress={onView}>
          <Image
            source={{ uri: photoUri }}
            style={{ width: '100%', height: 200 }}
            resizeMode="cover"
          />
        </TouchableOpacity>

        <View className="p-3 gap-2">
          <Text className="text-[10px]" style={{ color: Theme.text.secondary }}>
            Tap the photo to view it full screen
          </Text>

          <View className="flex-row gap-2">
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onCapture}
              className="flex-1 flex-row items-center justify-center py-3 rounded-lg"
              style={{ backgroundColor: Theme.background.third }}
            >
              <Camera size={15} color={Theme.button.primary} />
              <Text
                className="ml-1.5 text-xs font-semibold"
                style={{ color: Theme.text.primary }}
              >
                Retake
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onPickFromGallery}
              className="flex-1 flex-row items-center justify-center py-3 rounded-lg"
              style={{ backgroundColor: Theme.background.third }}
            >
              <ImagePlus size={15} color={Theme.button.primary} />
              <Text
                className="ml-1.5 text-xs font-semibold"
                style={{ color: Theme.text.primary }}
              >
                Gallery
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onRemove}
              className="flex-row items-center justify-center px-4 py-3 rounded-lg"
              style={{ backgroundColor: '#3A2020' }}
            >
              <Trash2 size={16} color="#F87171" />
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
          <Camera size={16} color={Theme.button.primary} />
          <Text className="ml-2 text-sm font-semibold" style={{ color: Theme.text.primary }}>
            Camera
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

export default PaymentProofSection;
