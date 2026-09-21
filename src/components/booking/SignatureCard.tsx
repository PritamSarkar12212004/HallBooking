import React from 'react';
import { Check, Fingerprint, PenLine, Trash2 } from 'lucide-react-native';
import { Image } from '../../lib/style/withTailwind';

import { Theme } from '../../const/theme/Theme';
import { Text, TouchableOpacity, View } from '../../lib/style/withTailwind';

type SignatureCardProps = {
  /** "Applicant" / "Manager" */
  label: string;
  /** Signature ka PNG data URL (null = abhi sign nahi hua). */
  signature: string | null;
  /** Card tap karne par sign pad khulta hai. */
  onSign: () => void;
  /** Signature dobara lena hai — clear. */
  onClear: () => void;
  helper?: string;
};

/**
 * Finger signature card — tap karne par `SignaturePadModal` khulta hai.
 *
 * Signature canvas ka PNG data URL white card me dikhta hai (jaisa kagaz par
 * sign lagta hai); sign ho chuka ho to "Signed" badge aur clear (🗑) button
 * bhi aata hai. Ye component sirf UI hai.
 */
const SignatureCard = ({
  label,
  signature,
  onSign,
  onClear,
  helper,
}: SignatureCardProps) => {
  const signed = Boolean(signature);

  return (
    <View className="mb-4">
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center gap-2">
          <Fingerprint size={16} color={Theme.button.primary} />
          <Text className="text-white text-sm font-semibold">{label}</Text>
        </View>

        {signed && (
          <View className="flex-row items-center gap-2">
            <View
              className="flex-row items-center gap-1 px-2 py-0.5 rounded-full"
              style={{ backgroundColor: 'rgba(34,197,94,0.15)' }}
            >
              <Check size={11} color="#22C55E" />
              <Text className="text-[10px] font-semibold" style={{ color: '#22C55E' }}>
                Signed
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onClear}
              className="w-8 h-8 items-center justify-center rounded-lg"
              style={{ backgroundColor: '#3A2020' }}
            >
              <Trash2 size={14} color="#F87171" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onSign}
        className="rounded-2xl overflow-hidden items-center justify-center"
        style={{
          height: 150,
          backgroundColor: '#FFFFFF',
          borderWidth: 1,
          borderColor: signed ? Theme.button.primary : Theme.background.third,
        }}
      >
        {signed ? (
          <Image
            source={{ uri: signature as string }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="contain"
          />
        ) : (
          <>
            <PenLine size={22} color="#6B7280" />
            <Text className="text-xs mt-2" style={{ color: '#6B7280' }}>
              Tap to sign with finger
            </Text>
          </>
        )}
      </TouchableOpacity>

      <Text className="text-[10px] mt-1.5" style={{ color: '#8F8B91' }}>
        {helper ?? (signed ? 'Tap to sign again' : 'Sign with your finger')}
      </Text>
    </View>
  );
};

export default SignatureCard;
