import React from 'react';
import { ActivityIndicator, Modal } from 'react-native';

import { View } from '../../lib/style/withTailwind';
import { Theme } from '../../const/theme/Theme';
import { useIsBusyLocked } from '../../hooks/busy/useBusyLock';

/**
 * Global busy lock modal.
 *
 * Jab bhi koi save/upload/booking-create chal raha ho (yaani kisi screen ka
 * loader on ho) tab ye **full screen** modal aata hai — poori screen dim ho
 * jaati hai, sirf ek spinner dikhta hai, saare tap isi modal me chale jaate
 * hain aur Android ka hardware back bhi kuch nahi karta. Isse loader ke beech
 * galti se back/tab change karne par data aadha-adhoora save nahi hota.
 *
 * App me ek hi jagah render hota hai (App.tsx) — sab screens ke liye.
 * Jaan-boojh kar koi text nahi (sirf activity indicator).
 */
const BusyLockModal = () => {
  const busy = useIsBusyLocked();

  return (
    <Modal
      visible={busy}
      transparent
      animationType="fade"
      statusBarTranslucent
      // Hardware back ko swallow karta hai — loader ke beech nav lock.
      onRequestClose={() => {}}
    >
      {/* Poori screen ka full-screen backdrop — taps yahin khatam ho jaate hain */}
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: 'rgba(8,8,12,0.92)' }}
      >
        <ActivityIndicator size="large" color={Theme.button.primary} />
      </View>
    </Modal>
  );
};

export default BusyLockModal;
