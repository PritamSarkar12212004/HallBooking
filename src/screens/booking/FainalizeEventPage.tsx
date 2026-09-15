import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image } from 'react-native';

import Wrapper from '../../layouts/wraper/Wraper';
import SubHeader from '../../components/header/SubHeader';
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from '../../lib/style/withTailwind';
import InputField from '../../components/input/InputField';
import MultiSelector from '../../components/Selector/MultiSelector';
import CamGalPickerButton from '../../components/buttons/CamGalPickerButton';
import SwipeButton from '../../components/buttons/SwipeButton';

import { Theme } from '../../const/theme/Theme';
import {
  Banknote,
  CalendarDays,
  Camera,
  Check,
  CreditCard,
  GalleryHorizontal,
  Gauge,
  Lock,
  Phone,
  Plus,
  ReceiptText,
  ShieldCheck,
  Trash2,
  User,
  Wallet,
} from 'lucide-react-native';

import {
  launchCamera,
  launchImageLibrary,
  ImagePickerResponse,
} from 'react-native-image-picker';
import { showMessage } from 'react-native-flash-message';
import { useQueryClient } from '@tanstack/react-query';
import { useAppSelector } from '../../hooks/redux/redux';
import useGetBookingById from '../../api/booking/hooks/useGetBookingById';
import useUpdateBookingSection from '../../api/booking/hooks/useUpdateBookingSection';
import useGetBookingMeta from '../../api/booking/hooks/useGetBookingMeta';
import uploadImage from '../../services/Cloudinary/uploadImg';
import { formatDate } from '../../functions/formate/DateTimeFormate';
import { MainRoute, TabRoute } from '../../const/routes/route';

const paymentModes = ['Cash', 'UPI', 'Cheque', 'NEFT/RTGS'];

// Duller, darker card palette for the event-end settlement screen.
const FzDark = {
  bg: '#0E0E13',
  card: '#15151B',
  inner: '#1E1E26',
  border: '#2B2B33',
};

const num = (v: any) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const FainalizeEventPage = ({ navigation, route }: any) => {
  const bookingId = route.params?.bookingId;
  const user = useAppSelector(state => state.user.user);
  const { isLoading, booking } = useGetBookingById({
    id: bookingId,
    token: user?.token,
  });
  const upiInfo = useGetBookingMeta(user?.token).meta?.upi;

  const fin = booking?.financial ?? {};
  // Event pehle hi end ho chuka hai to is page se kuch bhi change nahi hone
  // dena — swipe (End Event) hata dete hain aur lock ka message dikhate hain.
  const isEnded = booking?.status === 'Ended';
  const charges = Array.isArray(fin.charges)
    ? (fin.charges as { label: string; amount?: number; paid?: number }[])
    : [];
  const savedUnits = Array.isArray(fin.units)
    ? (fin.units as {
        label: string;
        quantity?: number;
        perUnit?: number;
        currentUnit?: number;
        paid?: boolean;
      }[])
    : [];
  const lastPayment =
    booking?.payments && booking.payments.length > 0
      ? booking.payments[booking.payments.length - 1]
      : ({} as any);

  const chargesTotal = charges.reduce(
    (sum, c) => sum + (num(c.amount) || 0),
    0,
  );
  const alreadyPaid =
    num(fin.advancePaid) ||
    charges.reduce((sum, c) => sum + (num(c.paid) || 0), 0);
  const securityDeposit = num(fin.securityDeposit) || 0;

  // ---- Additional charges (added at event end) -----------------------
  const [extraChargeLabel, setExtraChargeLabel] = useState('');
  const [extraChargeAmount, setExtraChargeAmount] = useState('');
  const [extraCharges, setExtraCharges] = useState<
    { label: string; amount: number }[]
  >([]);
  const addExtraCharge = () => {
    const amt = num(extraChargeAmount);
    if (amt <= 0) return;
    const label =
      extraChargeLabel.trim() || `Additional ${extraCharges.length + 1}`;
    setExtraCharges(prev => [...prev, { label, amount: amt }]);
    setExtraChargeLabel('');
    setExtraChargeAmount('');
  };
  const removeExtraCharge = (index: number) =>
    setExtraCharges(prev => prev.filter((_, i) => i !== index));

  // ---- Closing (meter) readings entered at event end -----------------
  const [closings, setClosings] = useState<Record<number, string>>({});
  const setClosing = (index: number, value: string) =>
    setClosings(prev => ({ ...prev, [index]: value.replace(/[^0-9]/g, '') }));

  const unitsDerived = savedUnits.map((u, i) => {
    const perUnit = num(u.perUnit);
    const current = num(u.currentUnit);
    const closingText = (closings[i] ?? '').trim();
    const closing = closingText.length > 0 ? Number(closingText) : NaN;
    const used = closing >= current ? closing - current : 0;
    const amount = used * perUnit;
    return {
      index: i,
      label: u.label || `Unit ${i + 1}`,
      perUnit,
      current,
      closingText,
      closing,
      used,
      amount,
    };
  });
  const unitsAmount = unitsDerived.reduce((sum, u) => sum + u.amount, 0);
  // The amount typed in the input also counts live (and is added on
  // finalize even if the user forgets to press "Add Charge").
  const pendingExtraAmount = num(extraChargeAmount);
  const pendingExtraLabel =
    extraChargeLabel.trim() || `Additional ${extraCharges.length + 1}`;
  const extraChargesTotal =
    extraCharges.reduce((sum, x) => sum + num(x.amount), 0) +
    (pendingExtraAmount > 0 ? pendingExtraAmount : 0);
  const totalChargesAll = chargesTotal + extraChargesTotal;
  const newTotal = totalChargesAll + unitsAmount;
  const balanceDue = Math.max(0, newTotal - alreadyPaid);

  // ---- Final payment ------------------------------------------------
  const [paymentMode, setPaymentMode] = useState<string[]>([]);
  const [transactionNumber, setTransactionNumber] = useState('');
  const [photo, setPhoto] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);

  // ---- Security deposit return (Finalize Event) ----------------------
  const [depositReturned, setDepositReturned] = useState(false);
  const [depositDeductedText, setDepositDeductedText] = useState('');
  const [depositReason, setDepositReason] = useState('');

  const selectPaymentMode = (mode: string) =>
    setPaymentMode(prev => (prev[0] === mode ? [] : [mode]));

  // Payment amount is auto-calculated = full balance due (no manual input).
  const payingNum = balanceDue;

  // Prefill last known mode / transaction / proof.
  useEffect(() => {
    if (!booking) return;
    if (fin.mode) setPaymentMode([fin.mode]);
    if (lastPayment?.transactionId)
      setTransactionNumber(lastPayment.transactionId);
    if (lastPayment?.proof) setPhoto({ uri: lastPayment.proof });
    // Deposit return pre-fill (reopening an already finalized event).
    setDepositReturned(fin.securityDepositReturned === true);
    if (num(fin.securityDepositDeducted) > 0)
      setDepositDeductedText(
        String(Math.round(num(fin.securityDepositDeducted))),
      );
    if (fin.securityDepositReason)
      setDepositReason(String(fin.securityDepositReason));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booking]);

  const requiresTransaction =
    paymentMode[0] === 'UPI' ||
    paymentMode[0] === 'Cheque' ||
    paymentMode[0] === 'NEFT/RTGS';
  const requiresProof =
    paymentMode.length > 0 && paymentMode[0] !== 'Cash' && !photo?.uri;

  // ---- Validation ----------------------------------------------------
  const unitsValid = useMemo(() => {
    return unitsDerived.every(u => {
      if (u.perUnit <= 0 && u.current <= 0) return true; // nothing recorded
      if (u.closingText.length === 0) return false; // closing reading missing
      if (u.closing < u.current) return false; // closing below starting reading
      return true;
    });
  }, [unitsDerived]);

  const payingRequired = balanceDue > 0;
  const modeOk = !payingRequired || paymentMode.length > 0;
  const txOk =
    !payingRequired ||
    !requiresTransaction ||
    transactionNumber.trim().length > 0;
  const proofOk = !payingRequired || !requiresProof || !!photo?.uri;

  // ---- Security deposit return validation ----------------------------
  const depositDeductedRaw = num(depositDeductedText);
  const depositOverDeducted = depositDeductedRaw > securityDeposit;
  const depositDeductedNum = depositOverDeducted
    ? securityDeposit
    : depositDeductedRaw;
  const netRefund = Math.max(0, securityDeposit - depositDeductedNum);
  const depositValid =
    securityDeposit <= 0 ||
    !depositReturned ||
    (!depositOverDeducted &&
      (depositDeductedNum <= 0 || depositReason.trim().length > 0));

  const extraChargesValid = extraCharges.every(
    x => x.amount > 0 && x.label.trim().length > 0,
  );

  const formValid =
    unitsValid &&
    depositValid &&
    extraChargesValid &&
    modeOk &&
    txOk &&
    proofOk &&
    !saving &&
    (payingRequired || unitsDerived.some(u => u.used > 0));

  // Exact reason why the swipe is still locked.
  const requiredHint =
    !unitsValid
      ? 'Enter closing units for all recorded units.'
      : !extraChargesValid
      ? 'Fix the additional charge entries.'
      : !depositValid
      ? 'Complete the security deposit return details.'
      : payingRequired && !modeOk
      ? 'Select a payment mode.'
      : payingRequired && !txOk
      ? `Enter ${
          paymentMode[0] === 'Cheque'
            ? 'the cheque number'
            : 'the transaction/reference number'
        } — required for ${paymentMode[0]}.`
      : payingRequired && !proofOk
      ? `Attach the payment proof image — required for ${
          paymentMode[0] || 'UPI'
        }.`
      : 'Fill the required fields to enable finalize.';

  // ---- Photo helpers -------------------------------------------------
  const handleImageResult = (result: ImagePickerResponse) => {
    if (result.didCancel || result.errorCode) return;
    const selectedPhoto = result.assets?.[0];
    if (selectedPhoto?.uri) setPhoto(selectedPhoto);
  };

  const capturePhoto = async () => {
    const result = await launchCamera({
      mediaType: 'photo',
      cameraType: 'back',
      quality: 0.8,
      saveToPhotos: false,
    });
    handleImageResult(result);
  };

  const selectPhoto = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
      selectionLimit: 1,
    });
    handleImageResult(result);
  };

  const removePhoto = () => setPhoto(null);

  // ---- End Event -----------------------------------------------------
  const queryClient = useQueryClient();
  const { updateSectionAsync } = useUpdateBookingSection();

  const handleEndEvent = async () => {
    if (isEnded) {
      showMessage({
        message: 'Event Already Ended',
        description: 'This event has already been ended. No further changes are allowed.',
        type: 'warning',
      });
      return;
    }
    if (!formValid) {
      showMessage({
        message: 'Complete Required Fields',
        description:
          'Enter closing readings for all recorded units, check the security deposit return, then finish the payment details.',
        type: 'warning',
      });
      return;
    }
    if (!user?.token) {
      showMessage({
        message: 'Authentication Error',
        description: 'User token is missing.',
        type: 'danger',
      });
      return;
    }

    setSaving(true);
    try {
      let paymentProofPhoto = lastPayment?.proof ?? '';
      if (photo?.uri && !photo.uri.startsWith('http')) {
        const uploaded = await uploadImage(photo.uri);
        paymentProofPhoto = uploaded.secure_url;
      }

      // Distribute the final payment across charges first, then units.
      let remaining = payingNum;
      const finalExtras =
        pendingExtraAmount > 0
          ? [
              ...extraCharges,
              { label: pendingExtraLabel, amount: pendingExtraAmount },
            ]
          : extraCharges;
      const newCharges = charges
        .map(c => ({
          label: c.label,
          amount: num(c.amount),
          paid: num(c.paid),
        }))
        .concat(
          finalExtras.map(x => ({
            label: x.label,
            amount: num(x.amount),
            paid: 0,
          })),
        );
      for (const c of newCharges) {
        const capacity = Math.max(0, c.amount - c.paid);
        const add = Math.min(capacity, remaining);
        c.paid += add;
        remaining -= add;
        if (remaining <= 0) break;
      }
      // Keep units marked paid if they were already settled in an earlier
      // finalize (prevents reopening from un-marking/zeroing the payment).
      const unitsWerePaid = savedUnits.some(u => u.paid === true);
      const unitsPaidAll = remaining >= unitsAmount || unitsWerePaid;
      const newUnits = unitsDerived.map(u => ({
        label: u.label,
        quantity: u.used,
        perUnit: u.perUnit,
        currentUnit: u.current,
        amount: u.amount,
        paid: unitsPaidAll,
      }));

      await updateSectionAsync({
        id: bookingId,
        section: 'payment',
        token: user.token,
        data: {
          charges: newCharges,
          units: newUnits,
          // Security deposit return (amount stays untouched; flags
          // record whether/how much of it was returned).
          securityDeposit: securityDeposit > 0 ? securityDeposit : undefined,
          depositReturned: depositReturned || undefined,
          depositDeducted:
            depositReturned && depositDeductedNum > 0
              ? depositDeductedNum
              : undefined,
          depositReason:
            depositReturned && depositDeductedNum > 0
              ? depositReason.trim() || undefined
              : undefined,
          mode: payingNum > 0 ? paymentMode[0] ?? undefined : undefined,
          transactionNumber: requiresTransaction
            ? transactionNumber
            : undefined,
          paymentProofPhoto: paymentProofPhoto || undefined,
          finalize: true,
        },
      });

      queryClient.invalidateQueries({
        queryKey: ['booking', bookingId],
      });
      showMessage({
        message: 'Event Finalized',
        description: 'Units calculated, payment recorded, and event ended.',
        type: 'success',
      });
      navigation.reset({
        index: 0,
        routes: [
          {
            name: MainRoute.MainTabs,
            params: { screen: TabRoute.Bookings },
          },
        ],
      });
    } catch (error: any) {
      showMessage({
        message: 'Finalize Failed',
        description:
          error?.response?.data?.message ||
          error?.message ||
          'Please try again.',
        type: 'danger',
      });
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Wrapper safeBottom style={{ backgroundColor: FzDark.bg }}>
        <SubHeader navigation={navigation} title="Finalize Event" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={Theme.button.primary} />
        </View>
      </Wrapper>
    );
  }

  if (!booking) {
    return (
      <Wrapper safeBottom style={{ backgroundColor: FzDark.bg }}>
        <SubHeader navigation={navigation} title="Finalize Event" />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center" style={{ color: Theme.text.secondary }}>
            Could not load booking. Please go back.
          </Text>
        </View>
      </Wrapper>
    );
  }

  return (
    <Wrapper safeBottom style={{ backgroundColor: FzDark.bg }}>
      <SubHeader navigation={navigation} title="Finalize Event" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* ===== 1. Applicant + Event ========================== */}
        <View
          className="rounded-2xl p-4 mb-5"
          style={{ backgroundColor: '#15151B' }}
        >
          <Text
            className="text-lg font-extrabold"
            style={{ color: Theme.text.primary }}
          >
            {booking?.event?.name || 'Event'}
          </Text>
          {booking?.event?.type ? (
            <Text
              className="text-xs mb-3"
              style={{ color: Theme.button.primary }}
            >
              {booking.event.type}
            </Text>
          ) : null}
          <View className="mt-1">
            <InfoRow
              icon={<User size={15} color="#A0A0A8" />}
              label={booking?.applicant?.name || '—'}
              value={booking?.applicant?.mobile || ''}
              valueIcon={<Phone size={13} color="#A0A0A8" />}
            />
            {booking?.applicant?.organization ? (
              <InfoRow
                icon={<ShieldCheck size={15} color="#A0A0A8" />}
                label={booking.applicant.organization}
              />
            ) : null}
            {booking?.schedule?.startDate ? (
              <InfoRow
                icon={<CalendarDays size={15} color="#A0A0A8" />}
                label={formatDate(String(booking.schedule.startDate))}
                value={
                  booking.schedule.startTime
                    ? String(booking.schedule.startTime)
                    : ''
                }
              />
            ) : null}
          </View>
        </View>

        {/* ===== 2. Finance Summary (organized) ================ */}
        <View className="flex-row items-center gap-2 mb-3">
          <Wallet size={16} color={Theme.button.primary} />
          <Text
            className="text-base font-extrabold"
            style={{ color: Theme.text.primary }}
          >
            Finance Summary
          </Text>
        </View>
        <View
          className="rounded-2xl p-4 mb-5"
          style={{
            backgroundColor: '#15151B',
            borderWidth: 1,
            borderColor: '#2B2B33',
          }}
        >
          {charges.length === 0 ? (
            <Text
              className="text-sm mb-2"
              style={{ color: Theme.text.secondary }}
            >
              No fixed charges.
            </Text>
          ) : (
            charges.map((c, i) => {
              const amount = num(c.amount);
              const paid = Math.min(num(c.paid), amount);
              const pct = amount > 0 ? Math.round((paid / amount) * 100) : 0;
              return (
                <View key={`${c.label}-${i}`} className="mb-3.5">
                  <View className="flex-row items-center justify-between">
                    <Text
                      className="text-sm flex-1"
                      style={{ color: Theme.text.secondary }}
                    >
                      {c.label}
                    </Text>
                    <Text
                      className="text-sm font-semibold"
                      style={{ color: Theme.text.primary }}
                    >
                      ₹{amount.toLocaleString()}
                    </Text>
                  </View>
                  <View className="flex-row items-center justify-between mt-1.5">
                    <Text className="text-[11px]" style={{ color: '#A0A0A8' }}>
                      Paid ₹{paid.toLocaleString()}{' '}
                      <Text style={{ color: '#8F8B91' }}>({pct}%)</Text>
                    </Text>
                    <View
                      className="h-1.5 w-24 rounded-full overflow-hidden"
                      style={{ backgroundColor: '#1E1E26' }}
                    >
                      <View
                        className="h-full rounded-full"
                        style={{
                          width: `${pct}%`,
                          backgroundColor:
                            pct >= 100
                              ? '#22C55E'
                              : pct > 0
                              ? '#F59E0B'
                              : '#8F8B91',
                        }}
                      />
                    </View>
                  </View>
                </View>
              );
            })
          )}
          <View
            className="pt-3 mt-1"
            style={{ borderTopWidth: 1, borderTopColor: '#1E1E26' }}
          >
            <SummaryLine label="Charges Total" value={chargesTotal} bold />
            <SummaryLine label="Already Paid" value={alreadyPaid} />
            {securityDeposit > 0 ? (
              <SummaryLine
                label="Security Deposit (Refundable)"
                value={securityDeposit}
              />
            ) : null}
          </View>
        </View>

        {/* ===== 3. Units Settlement (main) ==================== */}
        <View className="flex-row items-center gap-2 mb-3">
          <Gauge size={16} color={Theme.button.primary} />
          <Text
            className="text-base font-extrabold"
            style={{ color: Theme.text.primary }}
          >
            Units Settlement
          </Text>
        </View>

        {savedUnits.length === 0 ? (
          <View
            className="rounded-2xl p-4 mb-5"
            style={{ backgroundColor: '#15151B' }}
          >
            <Text className="text-sm" style={{ color: Theme.text.secondary }}>
              No units recorded for this booking.
            </Text>
          </View>
        ) : (
          savedUnits.map((u, i) => {
            const d = unitsDerived[i];
            const closingEntered = d.closingText.length > 0;
            const closingError = closingEntered && d.closing < d.current;
            return (
              <View
                key={`${d.label}-${i}`}
                className="rounded-2xl p-4 mb-4"
                style={{
                  backgroundColor: '#15151B',
                  borderWidth: 1,
                  borderColor: closingError ? '#EF4444' : '#1E1E26',
                }}
              >
                <View className="flex-row items-center justify-between mb-3">
                  <Text
                    className="text-sm font-bold"
                    style={{ color: Theme.text.primary }}
                  >
                    {d.label}
                  </Text>
                  <View
                    className="px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: '#1E1E26' }}
                  >
                    <Text
                      className="text-xs font-semibold"
                      style={{ color: Theme.button.primary }}
                    >
                      ₹{d.perUnit.toLocaleString()}/unit
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center justify-between mb-1">
                  <Text
                    className="text-xs"
                    style={{ color: Theme.text.secondary }}
                  >
                    CURRENT UNIT (booking)
                  </Text>
                  <Text
                    className="text-sm font-semibold"
                    style={{ color: Theme.text.primary }}
                  >
                    {d.current.toLocaleString()}
                  </Text>
                </View>
                <View className="flex-row items-center justify-between mb-2.5">
                  <Text
                    className="text-xs"
                    style={{ color: Theme.text.secondary }}
                  >
                    CLOSING UNIT (event end)
                  </Text>
                  <TextInput
                    className="py-2 px-2.5 rounded-lg text-right"
                    style={{
                      backgroundColor: '#1E1E26',
                      color: '#FFFFFF',
                      borderWidth: 1,
                      borderColor: closingError ? '#EF4444' : 'transparent',
                      minWidth: 116,
                      minHeight: 52,
                      fontSize: 18,
                    }}
                    placeholder="0"
                    placeholderTextColor="#8F8B91"
                    keyboardType="numeric"
                    value={d.closingText}
                    onChangeText={t => setClosing(i, t)}
                  />
                </View>

                {u.quantity ? (
                  <Text
                    className="text-[10px] mt-0.5"
                    style={{ color: '#8F8B91' }}
                  >
                    Saved earlier: {num(u.quantity).toLocaleString()} units
                  </Text>
                ) : null}

                {closingError ? (
                  <Text
                    className="text-[11px] mb-2"
                    style={{ color: '#EF4444' }}
                  >
                    Closing reading can't be less than the starting reading.
                  </Text>
                ) : null}

                {closingEntered && !closingError ? (
                  <View
                    className="rounded-xl px-3 py-2.5 mt-1"
                    style={{ backgroundColor: '#1E1E26' }}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center flex-1">
                        <Check size={14} color="#22C55E" />
                        <Text
                          className="text-xs ml-1.5 flex-1"
                          numberOfLines={1}
                          style={{ color: Theme.text.secondary }}
                        >
                          Used:{' '}
                          <Text
                            className="font-bold"
                            style={{ color: Theme.text.primary }}
                          >
                            {d.used.toLocaleString()}
                          </Text>{' '}
                          units
                        </Text>
                      </View>
                      <Text
                        className="text-sm font-bold"
                        numberOfLines={1}
                        style={{
                          color: '#22C55E',
                          flexShrink: 0,
                        }}
                      >
                        ₹{d.amount.toLocaleString()}
                      </Text>
                    </View>
                    <Text
                      className="text-[10px] text-right mt-0.5"
                      numberOfLines={1}
                      style={{ color: '#8F8B91' }}
                    >
                      Closing {d.closing.toLocaleString()} − Current{' '}
                      {d.current.toLocaleString()} ={' '}
                      {d.used.toLocaleString()} × ₹{d.perUnit.toLocaleString()}{' '}
                      = ₹{d.amount.toLocaleString()}
                    </Text>
                  </View>
                ) : null}
                {d.amount > 0 ? (
                  <Text
                    className="text-[10px] mt-0.5"
                    style={{ color: '#22C55E' }}
                  >
                    ➜ Adds to Final Payment:{' '}
                    +₹{d.amount.toLocaleString()}
                  </Text>
                ) : null}
                {u.paid === true ? (
                  <Text
                    className="text-[10px] mt-1"
                    style={{ color: '#8F8B91' }}
                  >
                    ✓ Already paid earlier:{' '}
                    ₹{(num(u.quantity) * num(u.perUnit)).toLocaleString()}
                  </Text>
                ) : null}
              </View>
            );
          })
        )}

        <View
          className="rounded-2xl p-4 mb-5"
          style={{
            backgroundColor: '#15151B',
            borderWidth: 1,
            borderColor: '#2B2B33',
          }}
        >
          <SummaryLine label="Units Amount" value={unitsAmount} bold />
          {extraChargesTotal > 0 ? (
            <SummaryLine label="Additional Charges" value={extraChargesTotal} />
          ) : null}
          <View
            className="flex-row items-center justify-between pt-2.5 mt-1"
            style={{ borderTopWidth: 1, borderTopColor: '#1E1E26' }}
          >
            <Text
              className="text-sm flex-1"
              numberOfLines={2}
              style={{ color: Theme.text.secondary }}
            >
              New Total (charges + units + additional)
            </Text>
            <Text
              className="text-base font-bold"
              numberOfLines={1}
              style={{ color: Theme.button.primary, flexShrink: 0 }}
            >
              ₹{newTotal.toLocaleString()}
            </Text>
          </View>
          <View className="flex-row items-center justify-between pt-1">
            <Text
              className="text-sm flex-1"
              numberOfLines={1}
              style={{ color: Theme.text.secondary }}
            >
              Balance Due
            </Text>
            <Text
              className="text-base font-bold"
              numberOfLines={1}
              style={{ color: '#F59E0B', flexShrink: 0 }}
            >
              ₹{balanceDue.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* ===== 3a. Additional Charges ========================== */}
        <View
          className="rounded-2xl p-4 mb-5"
          style={{
            backgroundColor: '#15151B',
            borderWidth: 1,
            borderColor: '#2B2B33',
          }}
        >
          <View className="flex-row items-center gap-2 mb-1">
            <ReceiptText size={16} color={Theme.button.primary} />
            <Text
              className="text-sm font-bold"
              style={{ color: Theme.text.primary }}
            >
              Additional Charges
            </Text>
            {extraCharges.length > 0 || pendingExtraAmount > 0 ? (
              <Text
                className="text-xs font-semibold ml-1"
                style={{ color: Theme.button.primary }}
              >
                ({extraCharges.length + (pendingExtraAmount > 0 ? 1 : 0)})
              </Text>
            ) : null}
          </View>
          <Text className="text-xs mb-4" style={{ color: '#8F8B91' }}>
            Amount type karte hi total me LIVE judta hai — "Add Charge" se
            list me save hota hai.
          </Text>

          <InputField
            title="Charge Label (optional)"
            value={extraChargeLabel}
            setvalue={setExtraChargeLabel}
            placeholder="e.g., extra electricity"
            keyType="default"
            Icon={ReceiptText}
            bordered
          />
          <InputField
            title="Charge Amount (₹) (optional)"
            value={extraChargeAmount}
            setvalue={(v: string) =>
              setExtraChargeAmount(v.replace(/[^0-9]/g, ''))
            }
            placeholder="0"
            keyType="numeric"
            Icon={Banknote}
            bordered
          />
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={addExtraCharge}
            className="flex-row items-center justify-center rounded-xl py-3"
            style={{
              backgroundColor: Theme.button.primary,
            }}
          >
            <Plus size={18} color="#000" />
            <Text className="ml-2 font-bold" style={{ color: '#000' }}>
              Add Charge
            </Text>
          </TouchableOpacity>

          {extraCharges.length > 0 ? (
            <View className="mt-3">
              {extraCharges.map((x, i) => (
                <View
                  key={`${x.label}-${i}`}
                  className="flex-row items-center justify-between rounded-xl px-3 py-2.5 mt-2"
                  style={{
                    backgroundColor: '#1E1E26',
                    borderWidth: 1,
                    borderColor: '#2B2B33',
                  }}
                >
                  <View className="flex-row items-center flex-1 mr-2">
                    <Text
                      className="text-sm flex-1"
                      style={{ color: Theme.text.primary }}
                    >
                      {x.label}
                    </Text>
                    <Text
                      className="text-sm font-bold"
                      style={{ color: Theme.button.primary }}
                    >
                      ₹{num(x.amount).toLocaleString()}
                    </Text>
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => removeExtraCharge(i)}
                    className="rounded-lg p-2"
                    style={{ backgroundColor: '#3A2020' }}
                  >
                    <Trash2 size={15} color="#FF6B6B" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : null}

          {pendingExtraAmount > 0 ? (
            <View
              className="flex-row items-center justify-between rounded-xl px-3 py-2.5 mt-2"
              style={{
                backgroundColor: '#1E1E26',
                borderWidth: 1,
                borderStyle: 'dashed',
                borderColor: Theme.button.primary,
              }}
            >
              <View className="flex-row items-center flex-1 mr-2">
                <Text
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded mr-1.5"
                  style={{
                    backgroundColor: Theme.button.primary,
                    color: '#000',
                  }}
                >
                  PENDING
                </Text>
                <Text
                  className="text-sm flex-1"
                  style={{ color: Theme.text.primary }}
                >
                  {pendingExtraLabel}
                </Text>
                <Text
                  className="text-sm font-bold"
                  style={{ color: Theme.button.primary }}
                >
                  +₹{pendingExtraAmount.toLocaleString()}
                </Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setExtraChargeAmount('')}
                className="rounded-lg p-2"
                style={{ backgroundColor: '#3A2020' }}
              >
                <Trash2 size={15} color="#FF6B6B" />
              </TouchableOpacity>
            </View>
          ) : null}
        </View>

        {/* ===== 3b. Security Deposit Return ==================== */}
        {securityDeposit > 0 ? (
          <View
            className="rounded-2xl p-4 mb-5"
            style={{
              backgroundColor: '#15151B',
              borderWidth: 1,
              borderColor: '#2B2B33',
            }}
          >
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center gap-2">
                <ShieldCheck size={16} color={Theme.button.primary} />
                <Text
                  className="text-sm font-bold"
                  style={{ color: Theme.text.primary }}
                >
                  Security Deposit
                </Text>
              </View>
              <Text
                className="text-base font-bold"
                style={{ color: Theme.button.primary }}
              >
                ₹{securityDeposit.toLocaleString()}
              </Text>
            </View>
            <Text className="text-xs mb-3" style={{ color: '#8F8B91' }}>
              Deposit collected at booking — tick the return below.
            </Text>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setDepositReturned(!depositReturned)}
              className="flex-row items-center justify-between rounded-xl px-3 py-3"
              style={{
                backgroundColor: '#1E1E26',
                borderWidth: 1,
                borderColor: depositReturned ? '#22C55E' : '#1E1E26',
              }}
            >
              <View className="flex-row items-center flex-1">
                <View
                  className="rounded-md items-center justify-center mr-2"
                  style={{
                    width: 24,
                    height: 24,
                    borderWidth: 1,
                    borderColor: depositReturned ? '#22C55E' : '#8F8B91',
                    backgroundColor: depositReturned
                      ? '#22C55E'
                      : 'transparent',
                  }}
                >
                  {depositReturned ? <Check size={14} color="#052E13" /> : null}
                </View>
                <Text
                  className="text-sm flex-1"
                  style={{ color: Theme.text.primary }}
                >
                  Deposit returned (Wapas)
                </Text>
              </View>
              <Text
                className="text-xs font-bold"
                style={{
                  color: depositReturned ? '#22C55E' : '#8F8B91',
                  flexShrink: 0,
                }}
              >
                {depositReturned ? 'RETURNED' : 'NOT RETURNED'}
              </Text>
            </TouchableOpacity>

            {depositReturned ? (
              <View className="mt-3">
                <SummaryLine label="Original Deposit" value={securityDeposit} />
                <SummaryLine
                  label="Deducted (Reduced)"
                  value={depositDeductedNum}
                />
                <View
                  className="flex-row items-center justify-between pt-1"
                  style={{
                    borderTopWidth: 1,
                    borderTopColor: '#1E1E26',
                  }}
                >
                  <Text
                    className="text-sm"
                    style={{ color: Theme.text.secondary }}
                  >
                    Net Refund to Customer
                  </Text>
                  <Text
                    className="text-base font-bold"
                    style={{ color: '#22C55E' }}
                  >
                    ₹{netRefund.toLocaleString()}
                  </Text>
                </View>

                <View className="mt-4">
                  <InputField
                    title="Deducted Amount (₹)"
                    value={depositDeductedText}
                    setvalue={(v: string) =>
                      setDepositDeductedText(v.replace(/[^0-9]/g, ''))
                    }
                    placeholder="0 — full deposit returned"
                    keyType="numeric"
                    Icon={Banknote}
                    bordered
                  />
                  {depositOverDeducted ? (
                    <Text className="text-[11px]" style={{ color: '#EF4444' }}>
                      Can't be more than the deposit of ₹
                      {securityDeposit.toLocaleString()}.
                    </Text>
                  ) : null}
                </View>

                {depositDeductedNum > 0 ? (
                  <View className="mt-3">
                    <InputField
                      title="Reason for Deduction *"
                      value={depositReason}
                      setvalue={setDepositReason}
                      placeholder="e.g., damage, extra consumption…"
                      keyType="default"
                      Icon={ReceiptText}
                      bordered
                    />
                    {depositReason.trim().length === 0 ? (
                      <Text
                        className="text-[11px]"
                        style={{ color: '#EF4444' }}
                      >
                        Reason is required when any amount is deducted.
                      </Text>
                    ) : null}
                  </View>
                ) : null}
              </View>
            ) : null}
          </View>
        ) : null}

        {/* ===== 4. Final Payment ============================== */}
        <View className="flex-row items-center gap-2 mb-3">
          <Banknote size={16} color={Theme.button.primary} />
          <Text
            className="text-base font-extrabold"
            style={{ color: Theme.text.primary }}
          >
            Final Payment
          </Text>
        </View>

        <View
          className="rounded-2xl p-4 mb-5"
          style={{
            backgroundColor: '#15151B',
            borderWidth: 1,
            borderColor: '#2B2B33',
          }}
        >
          <View
            className="rounded-xl p-4 mb-3"
            style={{
              backgroundColor: '#1E1E26',
              borderWidth: 1,
              borderColor: balanceDue > 0 ? Theme.button.primary : '#22C55E',
            }}
          >
            <Text className="text-[11px]" style={{ color: '#8F8B91' }}>
              AMOUNT TO PAY (auto-calculated)
            </Text>
            <Text
              className="text-2xl font-extrabold mt-1"
              style={{
                color: balanceDue > 0 ? Theme.button.primary : '#22C55E',
              }}
            >
              ₹{balanceDue.toLocaleString()}
            </Text>
            {balanceDue <= 0 ? (
              <Text
                className="text-xs font-semibold mt-1"
                style={{ color: '#22C55E' }}
              >
                ✓ Fully settled — no payment needed.
              </Text>
            ) : null}
          </View>

          <View
            className="rounded-xl p-3 mt-3"
            style={{
              backgroundColor: '#1E1E26',
              borderWidth: 1,
              borderColor: '#2B2B33',
            }}
          >
            <Text
              className="text-xs font-bold mb-2"
              style={{ color: '#8F8B91' }}
            >
              CALCULATED AMOUNT
            </Text>
            <SummaryLine label="Charges" value={chargesTotal} />
            <SummaryLine label="Units (used × rate)" value={unitsAmount} />
            {extraChargesTotal > 0 ? (
              <SummaryLine
                label="Additional Charges"
                value={extraChargesTotal}
              />
            ) : null}
            <View
              className="flex-row items-center justify-between pt-1"
              style={{ borderTopWidth: 1, borderTopColor: '#1E1E26' }}
            >
              <Text
                className="text-sm flex-1"
                numberOfLines={1}
                style={{ color: Theme.text.secondary }}
              >
                New Total
              </Text>
              <Text
                className="text-base font-bold"
                numberOfLines={1}
                style={{ color: Theme.button.primary, flexShrink: 0 }}
              >
                ₹{newTotal.toLocaleString()}
              </Text>
            </View>
            <SummaryLine label="Already Paid" value={alreadyPaid} />
            <SummaryLine label="Balance Due" value={balanceDue} bold />
            <View
              className="flex-row items-center justify-between pt-0.5"
              style={{
                borderTopWidth: 1,
                borderTopColor: Theme.button.primary,
              }}
            >
              <Text
                className="text-sm flex-1"
                numberOfLines={1}
                style={{ color: Theme.text.secondary }}
              >
                Amount Paying (Auto)
              </Text>
              <Text
                className="text-base font-bold"
                numberOfLines={1}
                style={{ color: Theme.button.primary, flexShrink: 0 }}
              >
                ₹{payingNum.toLocaleString()}
              </Text>
            </View>
            </View>
          <View className="mt-4">
            <MultiSelector
              title="Mode of Payment"
              list={paymentModes}
              value={paymentMode}
              actionFunc={selectPaymentMode}
              selection="Single select"
              Icon={CreditCard}
            />
          </View>

          {paymentMode[0] === 'UPI' && upiInfo ? (
            <View
              className="rounded-2xl p-4 items-center mb-5"
              style={{ backgroundColor: '#1E1E26' }}
            >
              <Text
                className="text-white text-sm font-semibold mb-1"
                style={{ color: Theme.text.primary }}
              >
                Scan to Pay (UPI)
              </Text>
              <Text className="text-xs mb-3" style={{ color: '#8F8B91' }}>
                {upiInfo.name} • {upiInfo.id}
              </Text>
              <Image
                source={{ uri: upiInfo.qrUrl }}
                style={{ width: 180, height: 180, borderRadius: 12 }}
                resizeMode="contain"
              />
              <Text
                className="text-sm mt-3 font-semibold"
                style={{ color: Theme.button.primary }}
              >
                Amount: ₹{balanceDue.toLocaleString()}
              </Text>
              <Text
                className="text-xs mt-1 text-center"
                style={{ color: '#8F8B91' }}
              >
                Scan the QR with any UPI app, then attach the payment proof
                below.
              </Text>
            </View>
          ) : null}

          {requiresTransaction && (
            <View className="mb-5">
              <InputField
                title={
                  paymentMode[0] === 'Cheque'
                    ? 'Cheque Number *'
                    : 'Transaction / Reference Number *'
                }
                value={transactionNumber}
                setvalue={setTransactionNumber}
                placeholder={
                  paymentMode[0] === 'Cheque'
                    ? 'Enter cheque number'
                    : 'Enter transaction/reference number'
                }
                keyType="default"
                Icon={ReceiptText}
                bordered
              />
              {transactionNumber.trim().length === 0 ? (
                <Text
                  className="text-[11px]"
                  style={{ color: '#EF4444' }}
                >
                  * Required for {paymentMode[0]}.
                </Text>
              ) : null}
            </View>
          )}

          <Text
            className="text-white text-base font-semibold mb-1"
            style={{ color: Theme.text.primary }}
          >
            Payment Proof
          </Text>
          <Text className="text-xs mb-4" style={{ color: '#8F8B91' }}>
            {paymentMode[0] === 'Cash'
              ? 'Cash payment does not require a proof.'
              : 'Capture or select payment receipt'}
          </Text>
          {requiresProof &&
            (photo?.uri ? (
              <View
                className="rounded-xl overflow-hidden"
                style={{
                  backgroundColor: '#1E1E26',
                  borderWidth: 1,
                  borderColor: Theme.button.primary,
                }}
              >
                <Image
                  source={{ uri: photo.uri }}
                  style={{ width: '100%', height: 200 }}
                  resizeMode="cover"
                />
                <View className="flex-row gap-2 p-3">
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={capturePhoto}
                    className="flex-1 flex-row items-center justify-center rounded-lg py-3"
                    style={{ backgroundColor: Theme.button.primary }}
                  >
                    <Camera size={17} color="#000" />
                    <Text
                      className="ml-2 font-semibold"
                      style={{ color: '#000' }}
                    >
                      Retake
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={removePhoto}
                    className="flex-row items-center justify-center rounded-lg px-4 py-3"
                    style={{ backgroundColor: '#3A2020' }}
                  >
                    <Trash2 size={18} color="#FF6B6B" />
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View className="flex-row gap-3 mb-3">
                <CamGalPickerButton
                  title="Camera"
                  actionFun={capturePhoto}
                  Icon={Camera}
                />
                <CamGalPickerButton
                  title="Gallery"
                  actionFun={selectPhoto}
                  Icon={GalleryHorizontal}
                />
              </View>
            ))}
        {requiresProof && !photo?.uri ? (
            <Text className="text-[11px]" style={{ color: '#EF4444' }}>
              * Proof image required for {paymentMode[0]}.
            </Text>
          ) : null}
        </View>

        {isEnded ? (
          <View
            className="mt-2 mb-3 flex-row items-center rounded-2xl px-4 py-3.5"
            style={{
              backgroundColor: 'rgba(59,130,246,0.12)',
              borderWidth: 1,
              borderColor: '#3B82F6',
            }}
          >
            <Lock size={16} color="#3B82F6" />
            <Text
              className="text-xs font-semibold ml-2 flex-1"
              style={{ color: '#3B82F6' }}
            >
              Event already ended — no further changes are allowed.
            </Text>
          </View>
        ) : (
          <View className="mt-2 mb-3">
            {!formValid && !saving ? (
              <Text
                className="text-[11px] text-center mb-2"
                style={{ color: '#EF4444' }}
              >
                {requiredHint}
              </Text>
            ) : null}
            <SwipeButton
              label={
                saving
                  ? 'Saving…'
                  : formValid
                  ? 'Swipe to End Event'
                  : 'Fill required fields to swipe'
              }
              onComplete={handleEndEvent}
              disabled={!formValid || saving}
            />
          </View>
        )}
        </ScrollView>

      {saving ? (
        <View
          className="absolute top-0 bottom-0 left-0 right-0 items-center justify-center"
          style={{
            backgroundColor: 'rgba(8,8,12,0.9)',
            zIndex: 50,
          }}
        >
          <View
            className="rounded-3xl px-8 py-6 items-center"
            style={{
              backgroundColor: FzDark.card,
              borderWidth: 1,
              borderColor: FzDark.border,
            }}
          >
            <ActivityIndicator size="large" color={Theme.button.primary} />
            <Text
              className="text-sm font-bold mt-4"
              style={{ color: '#FFFFFF' }}
            >
              Finalizing event…
            </Text>
            <Text className="text-xs mt-1" style={{ color: '#A0A0A8' }}>
              Updating units, charges & payment
            </Text>
          </View>
        </View>
      ) : null}
    </Wrapper>
  );
};

export default FainalizeEventPage;
const InfoRow = ({
  icon,
  label,
  value,
  valueIcon,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  valueIcon?: React.ReactNode;
}) => (
  <View className="flex-row items-center justify-between py-1">
    <View className="flex-row items-center flex-1 mr-2">
      <View className="mr-2">{icon}</View>
      <Text className="text-sm flex-1" style={{ color: Theme.text.primary }}>
        {label}
      </Text>
    </View>
    {value ? (
      <View className="flex-row items-center">
        {valueIcon}
        <Text className="text-sm ml-1" style={{ color: Theme.text.secondary }}>
          {value}
        </Text>
      </View>
    ) : null}
  </View>
);

const SummaryLine = ({
  label,
  value,
  bold = false,
}: {
  label: string;
  value: number;
  bold?: boolean;
}) => (
  <View className="flex-row items-center justify-between py-1">
    <Text
      className="text-sm flex-1"
      numberOfLines={2}
      style={{ color: Theme.text.secondary }}
    >
      {label}
    </Text>
    <Text
      className={`${bold ? 'text-base font-bold' : 'text-sm font-semibold'}`}
      numberOfLines={1}
      style={{
        color: bold ? Theme.button.primary : Theme.text.primary,
        flexShrink: 0,
      }}
    >
      ₹{value.toLocaleString()}
    </Text>
  </View>
);
