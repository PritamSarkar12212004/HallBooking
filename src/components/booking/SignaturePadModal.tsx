import React, { useRef } from 'react';
import { Modal } from 'react-native';
import SignatureCanvas from 'react-native-signature-canvas';
import type { SignatureViewRef } from 'react-native-signature-canvas';
import { showMessage } from 'react-native-flash-message';
import { Check, Eraser, X } from 'lucide-react-native';

import { Theme } from '../../const/theme/Theme';
import { Text, TouchableOpacity, View } from '../../lib/style/withTailwind';

type SignaturePadModalProps = {
  visible: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  /** Save dabane par PNG data URL (`data:image/png;base64,…`). */
  onSave: (dataUrl: string) => void;
};

// Canvas ke andar wala default footer (Clear/Confirm) hide karte hain — neeche
// apne buttons hain, app ke theme me.
const WEB_STYLE = `
  .m-signature-pad { box-shadow: none; border: none; }
  .m-signature-pad--body { border: none; }
  .m-signature-pad--body canvas { border-radius: 0; }
  .m-signature-pad--footer { display: none; margin: 0; }
  body, html { width: 100%; height: 100%; background-color: #FFFFFF; }
`;

/**
 * Finger signature pad — `react-native-signature-canvas` (WebView canvas).
 *
 * Pattern: user draw karta hai, "Save" dabane par `readSignature()` chalta hai
 * aur canvas ka PNG data URL `onOK` me aata hai; khaali canvas par `onEmpty`
 * (warning). `autoClear` on hai kyunki signature hum apne paas PNG me rakh lete
 * hain.
 *
 * Isko sirf khula hone par render karein (screen `activePad` check karke mount
 * karti hai) — har baar naya clean canvas milta hai, WebView ka purana state
 * carry nahi hota.
 *
 * Ye component sirf UI hai; compress + upload `DeclarationFunction` karta hai.
 */
const SignaturePadModal = ({
  visible,
  title,
  subtitle,
  onClose,
  onSave,
}: SignaturePadModalProps) => {
    const padRef = useRef<SignatureViewRef | null>(null);

    const handleSave = () => padRef.current?.readSignature();
    const handleClear = () => padRef.current?.clearSignature();

    return (
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={onClose}
      >
        <View
          className="flex-1 justify-end"
          style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}
        >
          <View
            className="rounded-t-3xl p-5 pb-7"
            style={{ backgroundColor: Theme.background.primary }}
          >
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-white text-base font-semibold">{title}</Text>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={onClose}
                className="w-8 h-8 items-center justify-center rounded-lg"
                style={{ backgroundColor: Theme.background.secondary }}
              >
                <X size={16} color={Theme.text.secondary} />
              </TouchableOpacity>
            </View>

            <Text className="text-[#8F8B91] text-xs mb-4">
              {subtitle ??
                'Ungli se white area me sign karein, phir Save dabayein.'}
            </Text>

            {/* Fixed height — WebView ko naap chahiye hoti hai. */}
            <View
              className="rounded-2xl overflow-hidden"
              style={{ height: 270, backgroundColor: '#FFFFFF' }}
            >
              <SignatureCanvas
                ref={padRef}
                style={{ flex: 1 }}
                webStyle={WEB_STYLE}
                androidHardwareAccelerationDisabled={false}
                androidLayerType="hardware"
                autoClear={true}
                imageType="image/png"
                backgroundColor="#FFFFFF"
                penColor="#111111"
                minWidth={1}
                maxWidth={2.5}
                trimWhitespace={true}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={false}
                onOK={(signature: string) => onSave(signature)}
                onEmpty={() =>
                  showMessage({
                    message: 'Signature khali hai',
                    description: 'Pehle sign karein, phir Save dabayein.',
                    type: 'warning',
                  })
                }
                onError={(error: Error) =>
                  showMessage({
                    message: 'Signature Error',
                    description: error?.message || 'Signature pad load nahi hua.',
                    type: 'danger',
                  })
                }
                webviewProps={{
                  cacheEnabled: true,
                  scrollEnabled: false,
                  bounces: false,
                  overScrollMode: 'never',
                }}
              />
            </View>

            <View className="flex-row gap-3 mt-4">
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleClear}
                className="flex-1 flex-row items-center justify-center rounded-xl py-4"
                style={{
                  backgroundColor: Theme.background.secondary,
                  borderWidth: 1,
                  borderColor: Theme.border.primary,
                }}
              >
                <Eraser size={16} color={Theme.text.primary} />
                <Text className="ml-2 font-semibold text-white">Clear</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleSave}
                className="flex-1 flex-row items-center justify-center rounded-xl py-4"
                style={{ backgroundColor: Theme.button.primary }}
              >
                <Check size={16} color="#000" />
                <Text className="ml-2 font-semibold" style={{ color: '#000' }}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
};

SignaturePadModal.displayName = 'SignaturePadModal';

export default SignaturePadModal;
