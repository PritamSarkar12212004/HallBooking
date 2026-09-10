import React from 'react';
import {
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from '../../lib/style/withTailwind';
import { Theme } from '../../const/theme/Theme';
import {
    Check,
    IndianRupee,
    ListChecks,
    Plus,
    ShieldCheck,
    Trash2,
    Wallet,
} from 'lucide-react-native';

export interface ChargeRow {
    id: string;
    label: string;
    amount: string;
    paid: string;
}

export const DEFAULT_CHARGE_LABELS = [
    'Hall Rent',
    'Instrument / Table',
    'Decoration',
    'Kitchen / Catering',
];

let rowIdCounter = 0;

export const newChargeRow = (
    label = '',
    amount = '',
    paid = '',
): ChargeRow => ({
    id: `charge-${Date.now()}-${rowIdCounter++}`,
    label,
    amount,
    paid,
});

export const createDefaultChargeRows = (): ChargeRow[] =>
    DEFAULT_CHARGE_LABELS.map((label) => newChargeRow(label));

const digitsOnly = (text: string) => text.replace(/[^0-9]/g, '');

export const num = (v: string) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
};

export const computeChargeTotals = (rows: ChargeRow[]) => {
    const totalAmount = rows.reduce((sum, r) => sum + num(r.amount), 0);
    const totalPaid = rows.reduce((sum, r) => sum + num(r.paid), 0);
    const balanceAmount = Math.max(0, totalAmount - totalPaid);
    return { totalAmount, totalPaid, balanceAmount };
};

export const chargeRowsToPayload = (rows: ChargeRow[]) =>
    rows
        .filter((r) => r.label.trim().length > 0)
        .map((r) => ({
            label: r.label.trim(),
            amount: num(r.amount),
            paid: num(r.paid),
        }));

interface FinanceChargesSectionProps {
    rows: ChargeRow[];
    setRows: React.Dispatch<React.SetStateAction<ChargeRow[]>>;
    securityDeposit: string;
    setSecurityDeposit: (value: string) => void;
    /** Extra amount added to the total (e.g. units total). */
    extraAmount?: number;
    /** Extra amount already paid (e.g. units marked paid). */
    extraPaid?: number;
    /** Whether every charge/unit is fully paid (drives the "All Paid" box). */
    allPaid?: boolean;
    /** Called when the "All Paid" box is toggled. */
    onToggleAllPaid?: () => void;
}

const FinanceChargesSection = ({
    rows,
    setRows,
    securityDeposit,
    setSecurityDeposit,
    extraAmount = 0,
    extraPaid = 0,
    allPaid = false,
    onToggleAllPaid,
}: FinanceChargesSectionProps) => {
    const updateRow = (
        id: string,
        key: 'label' | 'amount' | 'paid',
        value: string,
    ) => {
        setRows((prev) =>
            prev.map((row) =>
                row.id === id
                    ? {
                          ...row,
                          [key]:
                              key === 'label' ? value : digitsOnly(value),
                      }
                    : row,
            ),
        );
    };

    const addRow = () => {
        setRows((prev) => [...prev, newChargeRow()]);
    };

    const removeRow = (id: string) => {
        setRows((prev) => prev.filter((row) => row.id !== id));
    };

    const { totalAmount: chargesTotal, totalPaid: chargesPaid } =
        computeChargeTotals(rows);
    const totalAmount = chargesTotal + extraAmount;
    const totalPaid = chargesPaid + extraPaid;
    const balanceAmount = Math.max(0, totalAmount - totalPaid);

    return (
        <>
            {/* ── Section 1: Actual Amount ── */}
            <View className="flex-row items-center gap-2 mb-3">
                <ListChecks size={20} color={Theme.button.primary} />
                <Text className="text-white text-base font-semibold">
                    Actual Amount
                </Text>
            </View>
            <View
                className="rounded-2xl p-4 mb-5"
                style={{ backgroundColor: Theme.background.secondary }}
            >
                {rows.map((row) => (
                    <View key={row.id} className="mb-3">
                        <View className="flex-row items-center gap-2">
                            <TextInput
                                className="flex-1 py-3 px-3 rounded-xl text-white"
                                style={{
                                    backgroundColor: Theme.background.third,
                                }}
                                placeholder="Charge title"
                                placeholderTextColor="#8F8B91"
                                value={row.label}
                                onChangeText={(t) =>
                                    updateRow(row.id, 'label', t)
                                }
                            />
                            <View
                                className="flex-row items-center rounded-xl px-3"
                                style={{
                                    backgroundColor: Theme.background.third,
                                }}
                            >
                                <IndianRupee size={15} color="#8F8B91" />
                                <TextInput
                                    className="w-24 py-3 px-2 text-white"
                                    placeholder="0"
                                    placeholderTextColor="#8F8B91"
                                    keyboardType="numeric"
                                    value={row.amount}
                                    onChangeText={(t) =>
                                        updateRow(row.id, 'amount', t)
                                    }
                                />
                            </View>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={() => removeRow(row.id)}
                                className="w-10 h-11 items-center justify-center rounded-xl"
                                style={{ backgroundColor: '#3A2020' }}
                            >
                                <Trash2 size={16} color="#FF6B6B" />
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}

                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={addRow}
                    className="flex-row items-center justify-center rounded-xl py-3 mt-1"
                    style={{
                        borderWidth: 1,
                        borderColor: Theme.button.primary,
                        borderStyle: 'dashed',
                    }}
                >
                    <Plus size={16} color={Theme.button.primary} />
                    <Text
                        className="ml-2 font-semibold text-sm"
                        style={{ color: Theme.button.primary }}
                    >
                        Add More
                    </Text>
                </TouchableOpacity>

                <View
                    className="flex-row items-center justify-between mt-4 pt-3"
                    style={{ borderTopWidth: 1, borderTopColor: '#2A2A30' }}
                >
                    <View>
                        <Text className="text-sm font-semibold text-white">
                            Total Amount
                        </Text>
                        {extraAmount > 0 && (
                            <Text
                                className="text-[11px] mt-0.5"
                                style={{ color: Theme.text.secondary }}
                            >
                                includes ₹{extraAmount.toLocaleString()} units
                            </Text>
                        )}
                    </View>
                    <Text
                        className="text-lg font-bold"
                        style={{ color: Theme.button.primary }}
                    >
                        ₹{totalAmount.toLocaleString()}
                    </Text>
                </View>
            </View>

            {/* ── Section 2: Customer Paid ── */}
            <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center gap-2">
                    <Wallet size={20} color={Theme.button.primary} />
                    <Text className="text-white text-base font-semibold">
                        Customer Paid
                    </Text>
                </View>
                {onToggleAllPaid && (
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={onToggleAllPaid}
                        className="flex-row items-center px-3 py-1.5 rounded-full"
                        style={{
                            backgroundColor: allPaid
                                ? 'rgba(34,197,94,0.15)'
                                : Theme.background.secondary,
                            borderWidth: 1,
                            borderColor: allPaid ? '#22C55E' : '#3E4654',
                        }}
                    >
                        <View
                            className="w-4 h-4 rounded items-center justify-center"
                            style={{
                                backgroundColor: allPaid
                                    ? '#22C55E'
                                    : 'transparent',
                                borderWidth: allPaid ? 0 : 1.5,
                                borderColor: '#667085',
                            }}
                        >
                            {allPaid && <Check size={11} color="#000" />}
                        </View>
                        <Text
                            className="text-xs font-bold ml-1.5"
                            style={{
                                color: allPaid ? '#22C55E' : Theme.text.secondary,
                            }}
                        >
                            All Paid
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
            <View
                className="rounded-2xl p-4 mb-5"
                style={{ backgroundColor: Theme.background.secondary }}
            >
                {rows.length === 0 ? (
                    <Text
                        className="text-xs mb-3"
                        style={{ color: Theme.text.secondary }}
                    >
                        Add amount heads above to record payments.
                    </Text>
                ) : (
                    rows.map((row) => (
                        <View
                            key={row.id}
                            className="flex-row items-center justify-between mb-3"
                        >
                            <Text
                                className="flex-1 text-sm"
                                style={{ color: Theme.text.secondary }}
                                numberOfLines={1}
                            >
                                {row.label.trim() || 'Untitled'}
                                {num(row.amount) > 0
                                    ? ` (₹${num(row.amount).toLocaleString()})`
                                    : ''}
                            </Text>
                            <View
                                className="flex-row items-center rounded-xl px-3 ml-3"
                                style={{
                                    backgroundColor: Theme.background.third,
                                }}
                            >
                                <IndianRupee size={15} color="#8F8B91" />
                                <TextInput
                                    className="w-24 py-3 px-2 text-white"
                                    placeholder="Paid"
                                    placeholderTextColor="#8F8B91"
                                    keyboardType="numeric"
                                    value={row.paid}
                                    onChangeText={(t) =>
                                        updateRow(row.id, 'paid', t)
                                    }
                                />
                            </View>
                        </View>
                    ))
                )}

                <View
                    className="flex-row items-center justify-between mt-1 pt-3"
                    style={{ borderTopWidth: 1, borderTopColor: '#2A2A30' }}
                >
                    <Text
                        className="text-sm"
                        style={{ color: Theme.text.secondary }}
                    >
                        Total Paid
                    </Text>
                    <Text className="text-base font-bold" style={{ color: '#22C55E' }}>
                        ₹{totalPaid.toLocaleString()}
                    </Text>
                </View>
                <View className="flex-row items-center justify-between mt-2">
                    <Text
                        className="text-sm"
                        style={{ color: Theme.text.secondary }}
                    >
                        Balance
                    </Text>
                    <Text
                        className="text-base font-bold"
                        style={{
                            color: balanceAmount > 0 ? '#F59E0B' : '#22C55E',
                        }}
                    >
                        ₹{balanceAmount.toLocaleString()}
                    </Text>
                </View>
            </View>

            {/* ── Security Deposit (refundable, excluded from totals) ── */}
            <View className="flex-row items-center gap-2 mb-3">
                <ShieldCheck size={20} color={Theme.button.primary} />
                <Text className="text-white text-base font-semibold">
                    Security Deposit
                </Text>
            </View>
            <View
                className="rounded-2xl p-4 mb-6"
                style={{ backgroundColor: Theme.background.secondary }}
            >
                <View className="flex-row items-center justify-between">
                    <Text className="text-sm" style={{ color: Theme.text.secondary }}>
                        Amount
                    </Text>
                    <View
                        className="flex-row items-center rounded-xl px-3"
                        style={{ backgroundColor: Theme.background.third }}
                    >
                        <IndianRupee size={15} color="#8F8B91" />
                        <TextInput
                            className="w-28 py-3 px-2 text-white"
                            placeholder="0"
                            placeholderTextColor="#8F8B91"
                            keyboardType="numeric"
                            value={securityDeposit}
                            onChangeText={(t) =>
                                setSecurityDeposit(digitsOnly(t))
                            }
                        />
                    </View>
                </View>
                <Text
                    className="text-xs mt-2"
                    style={{ color: Theme.text.secondary }}
                >
                    Refundable — not included in the total or balance.
                </Text>
            </View>
        </>
    );
};

export default FinanceChargesSection;
