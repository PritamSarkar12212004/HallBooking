import React, { useRef } from 'react';
import { Modal, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SignatureCanvas from 'react-native-signature-canvas';
import type { SignatureViewRef } from 'react-native-signature-canvas';
import { showMessage } from 'react-native-flash-message';
import { Check, Eraser, X } from 'lucide-react-native';

import { Theme } from '../../const/theme/Theme';
import { Text, TouchableOpacity, View } from '../../lib/style/withTailwind';
import { computeSignatureCanvasHeight } from '../../functions/booking/DeclarationFunction';

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
  body, html { width: 100%; height: 100%; background-color: #FFFFFF; overflow: hidden; }
  html, body { -webkit-user-select: none; user-select: none; }
  /* Finger se draw karte waqt page scroll/zoom na ho — sirf canvas par. */
  .m-signature-pad--body canvas { touch-action: none; }
`;

/**
 * Finger signature pad — `react-native-signature-canvas` (WebView canvas).
 *
 * Poora **full screen** khulta hai: sign karne me aasani ho, isliye header aur
 * button row chhod kar baaki saari jagah canvas le leta hai (window height se
 * live calculate hoti hai, isliye chhote/bade phone aur rotate par bhi theek
 * rehta hai).
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
    const insets = useSafeAreaInsets();
    const { height } = useWindowDimensions();

    const handleSave = () => padRef.current?.readSignature();
    const handleClear = () => padRef.current?.clearSignature();

    // Canvas ko bachi hui poori height do (WebView ko pixel dimensions chahiye
    // hoti hain) — calculation `DeclarationFunction` me testable hai.
    const canvasHeight = computeSignatureCanvasHeight({
      windowHeight: height,
      topInset: insets.top,
      bottomInset: insets.bottom,
    });

    return (
      <Modal
        visible={visible}
        animationType="slide"
        statusBarTranslucent
        presentationStyle="fullScreen"
        onRequestClose={onClose}
      >
        <View
          className="flex-1"
          style={{ backgroundColor: Theme.background.primary }}
        >
          {/* Header */}
          <View
            className="flex-row items-center justify-between"
            style={{
              paddingTop: insets.top + 10,
              paddingHorizontal: 20,
              paddingBottom: 12,
            }}
          >
            <View className="flex-1 pr-3">
              <Text className="text-white text-base font-semibold">{title}</Text>
              <Text className="text-[#8F8B91] text-xs mt-0.5">
                {subtitle ?? 'Sign anywhere on the screen, then tap Save.'}
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onClose}
              className="w-9 h-9 items-center justify-center rounded-lg"
              style={{ backgroundColor: Theme.background.secondary }}
            >
              <X size={18} color={Theme.text.secondary} />
            </TouchableOpacity>
          </View>

          {/* Signature area — bachi hui poori jagah */}
          <View
            className="mx-4 rounded-2xl overflow-hidden"
            style={{
              height: canvasHeight,
              backgroundColor: '#FFFFFF',
              borderWidth: 1,
              borderColor: Theme.border.primary,
            }}
          >
            <SignatureCanvas
              ref={padRef}
              style={{ flex: 1, backgroundColor: '#FFFFFF' }}
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
                  message: 'Signature is empty',
                  description: 'Please sign first, then tap Save.',
                  type: 'warning',
                })
              }
              onError={(error: Error) =>
                showMessage({
                  message: 'Signature Error',
                  description: error?.message || 'Signature pad could not load.',
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

          {/* Actions */}
          <View
            className="flex-row gap-3"
            style={{
              marginTop: 'auto',
              paddingHorizontal: 20,
              paddingTop: 12,
              paddingBottom: insets.bottom + 16,
            }}
          >
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
              className="flex-row items-center justify-center rounded-xl py-4"
              style={{ backgroundColor: Theme.button.primary, flex: 2, minWidth: 0 }}
            >
              <Check size={16} color="#000" />
              <Text className="ml-2 font-semibold" style={{ color: '#000' }}>
                Save Signature
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
};

SignaturePadModal.displayName = 'SignaturePadModal';

export default SignaturePadModal;
