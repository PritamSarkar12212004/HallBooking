import React from 'react';
import { Image } from 'react-native';
import {
  CreditCard,
  History,
  ReceiptText,
} from 'lucide-react-native';

import { Text, TouchableOpacity, View } from '../../lib/style/withTailwind';
import { Theme } from '../../const/theme/Theme';
import InputField from '../input/InputField';
import MultiSelector from '../Selector/MultiSelector';
import PaymentProofSection from './PaymentProofSection';
import { getPaymentProofHint } from '../../functions/booking/PaymentFunction';

interface Props {
  modes: string[];
  mode: string[];
  onSelectMode: (mode: string) => void;
  /** Hall ka UPI QR (CEO upload karta hai) — UPI select karne par dikhta hai. */
  qrUrl: string | null;
  bankHolderName: string | null;
  /** QR ke saath dikhne wala amount (balance). */
  amountDue: number;
  onViewQr: (uri: string) => void;
  /** Cheque / UPI / NEFT me reference number zaroori. */
  requiresTransaction: boolean;
  transactionNumber: string;
  setTransactionNumber: (value: string) => void;
  /**
   * Proof **zaroori** hai? (non-cash mode, aur abhi koi proof nahi.) Picker
   * Cash me bhi dikhta hai — wahan proof OPTIONAL evidence (cash receipt) hai.
   */
  proofRequired: boolean;
  /**
   * Purani payment ka proof — HISTORY reference. Isse sirf dekh sakte hain
   * (tap → full screen); naya picker isse prefill nahi karta, taaki har nayi
   * payment apna fresh proof le paaye.
   */
  previousProofUri: string | null;
  /** Nayi payment ka proof (naya chuna gaya image). */
  photoUri: string | null;
  onCapturePhoto: () => void;
  onPickPhoto: () => void;
  onRemovePhoto: () => void;
  /** Photo (naya ya purana) tap karne par full screen preview. */
  onViewProof: () => void;
}

/**
 * Update Finance ka payment hissa — mode of payment, UPI QR, transaction
 * number aur payment proof.
 *
 * Screen isse **sirf tab mount** karti hai jab Customer Paid ya Security
 * Deposit me kuch add/change hua ho — warna ye hissa UI par aata hi nahi.
 *
 * Proof picker hamesha dikhta hai (`PaymentProofSection` — wahi component jo
 * booking flow ke payment step me use hota hai): non-cash me zaroori, Cash me
 * optional cash-receipt. Ye **payment ka proof** hai, unit ka meter photo nahi
 * — wo Units section ke "METER PHOTO" picker se lagta hai.
 *
 * Purani payment ka proof (`previousProofUri`) alag "PREVIOUS PAYMENT PROOF"
 * card me sirf read-only dikhta hai — naye proof ko prefill/replace nahi karta.
 */
const FinancePaymentSection = ({
  modes,
  mode,
  onSelectMode,
  qrUrl,
  bankHolderName,
  amountDue,
  onViewQr,
  requiresTransaction,
  transactionNumber,
  setTransactionNumber,
  proofRequired,
  previousProofUri,
  photoUri,
  onCapturePhoto,
  onPickPhoto,
  onRemovePhoto,
  onViewProof,
}: Props) => {
  return (
    <>
      <MultiSelector
        title="Mode of Payment"
        list={modes}
        value={mode}
        actionFunc={onSelectMode}
        selection="Single select"
        Icon={CreditCard}
      />

      {/* UPI: hall QR uploaded by the CEO — scan to pay */}
      {mode[0] === 'UPI' && qrUrl && (
        <View
          className="rounded-2xl p-4 items-center mb-4 mt-3"
          style={{ backgroundColor: Theme.background.secondary }}
        >
          <Text className="text-white text-base font-semibold mb-1">
            Scan to Pay (UPI)
          </Text>
          <Text className="text-[#8F8B91] text-xs mb-3">
            {bankHolderName ? `Bank Holder: ${bankHolderName}` : ''}
          </Text>
          {/* Tap QR → full screen preview */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => qrUrl && onViewQr(qrUrl)}
          >
            <Image
              source={{ uri: qrUrl }}
              style={{ width: 200, height: 200, borderRadius: 12 }}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text
            className="text-[10px] mt-2"
            style={{ color: Theme.text.tertiary }}
          >
            Tap QR to view full screen
          </Text>
          <Text
            className="text-sm mt-3 font-semibold"
            style={{ color: Theme.button.primary }}
          >
            Amount: ₹{(amountDue || 0).toLocaleString()}
          </Text>
          <Text className="text-[#8F8B91] text-xs mt-1 text-center">
            Scan the QR with any UPI app, then add the payment proof below.
          </Text>
        </View>
      )}

      {requiresTransaction && (
        <View className="mb-2 mt-3">
          <InputField
            title={
              mode[0] === 'Cheque'
                ? 'Cheque Number *'
                : 'Transaction / Reference Number *'
            }
            value={transactionNumber}
            setvalue={setTransactionNumber}
            placeholder={
              mode[0] === 'Cheque'
                ? 'Enter cheque number'
                : 'Enter transaction/reference number'
            }
            keyType="default"
            Icon={ReceiptText}
          />
        </View>
      )}

      <View className="mt-3">
        {/* Nayi payment ka proof picker — hamesha fresh shuru hota hai. */}
        <PaymentProofSection
          photoUri={photoUri}
          hint={getPaymentProofHint(mode[0])}
          required={proofRequired}
          onCapture={onCapturePhoto}
          onPickFromGallery={onPickPhoto}
          onRemove={onRemovePhoto}
          onView={onViewProof}
        />

        {/* Purani payment ka proof — sirf reference (tap → full screen).
            Naye proof ke saath replace NAHI hota, iski apni history hai. */}
        {previousProofUri ? (
          <View
            className="rounded-xl p-3 mt-2"
            style={{
              backgroundColor: Theme.background.secondary,
              borderWidth: 1,
              borderColor: Theme.border.primary,
            }}
          >
            <View className="flex-row items-center mb-2" style={{ gap: 6 }}>
              <History size={13} color={Theme.text.secondary} />
              <Text
                className="text-[11px] font-bold"
                style={{ color: Theme.text.secondary }}
              >
                PREVIOUS PAYMENT PROOF
              </Text>
              <Text
                className="text-[10px] flex-1 text-right"
                style={{ color: Theme.text.tertiary }}
                numberOfLines={1}
              >
                From the last payment — read only
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={onViewProof}
            >
              <Image
                source={{ uri: previousProofUri }}
                style={{ width: '100%', height: 120, borderRadius: 8 }}
                resizeMode="cover"
              />
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    </>
  );
};

export default FinancePaymentSection;
