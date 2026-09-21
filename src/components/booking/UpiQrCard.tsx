import React from 'react';
import { QrCode } from 'lucide-react-native';
import { Image } from '../../lib/style/withTailwind';

import { Theme } from '../../const/theme/Theme';
import { Text, TouchableOpacity, View } from '../../lib/style/withTailwind';

type UpiQrCardProps = {
  /** CEO ne upload kiya QR (null = abhi set nahi hua). */
  qrUrl: string | null;
  /** Account holder ka naam (QR ke saath dikhta hai). */
  bankHolderName: string | null;
  /** Customer ko dena hai — QR ke neeche dikhta hai. */
  amount?: number;
  /** QR tap karne par full screen preview. */
  onViewQr: (uri: string) => void;
};

/**
 * Hall ka UPI QR + bank holder name.
 *
 * QR CEO upload karta hai (Profile → QR Code) aur backend se aata hai — jab tak
 * upload na ho, yahan "UPI QR set nahi hua" ka note dikhta hai. Ye component
 * sirf UI hai; data `useHallQr` hook se aata hai.
 */
const UpiQrCard = ({
  qrUrl,
  bankHolderName,
  amount = 0,
  onViewQr,
}: UpiQrCardProps) => (
  <>
    <View className="flex-row items-center gap-2 mb-1">
      <QrCode size={20} color={Theme.button.primary} />
      <Text className="text-white text-base font-semibold">
        Scan to Pay (UPI)
      </Text>
    </View>

    <Text className="text-[#8F8B91] text-xs mb-4">
      Ask the customer to scan this QR with any UPI app (Google Pay, PhonePe, Paytm).
    </Text>

    {!qrUrl ? (
      <View
        className="rounded-2xl p-4 mb-6"
        style={{
          backgroundColor: Theme.background.secondary,
          borderWidth: 1,
          borderColor: '#7F5F1D',
        }}
      >
        <Text className="text-sm font-semibold mb-1" style={{ color: '#F59E0B' }}>
          UPI QR not set up
        </Text>
        <Text className="text-[#8F8B91] text-xs">
          The CEO needs to upload the hall UPI QR + bank holder name from
          Profile → QR Code; the scannable QR will then appear here.
        </Text>
      </View>
    ) : (
      <View
        className="rounded-2xl p-4 items-center mb-6"
        style={{ backgroundColor: Theme.background.secondary }}
      >
        <View className="flex-row items-center justify-between w-full mb-3">
          <Text className="text-xs" style={{ color: Theme.text.secondary }}>
            Bank Holder
          </Text>
          <Text
            className="text-sm font-semibold text-white flex-1 text-right ml-3"
            numberOfLines={1}
          >
            {bankHolderName ?? '—'}
          </Text>
        </View>

        <View
          className="items-center justify-center p-3 rounded-2xl"
          style={{ backgroundColor: '#FFFFFF' }}
        >
          {/* Tap QR → full screen preview */}
          <TouchableOpacity activeOpacity={0.9} onPress={() => onViewQr(qrUrl)}>
            <Image
              source={{ uri: qrUrl }}
              style={{ width: 220, height: 220 }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        <Text className="text-[10px] mt-2" style={{ color: Theme.text.tertiary }}>
          Tap QR to view full screen
        </Text>

        {amount > 0 && (
          <Text
            className="text-sm mt-2 font-semibold"
            style={{ color: Theme.button.primary }}
          >
            Amount: ₹{amount.toLocaleString()}
          </Text>
        )}

        <Text className="text-[#8F8B91] text-xs mt-1 text-center">
          Scan the QR with any UPI app, then add the payment proof below.
        </Text>
      </View>
    )}
  </>
);

export default UpiQrCard;
