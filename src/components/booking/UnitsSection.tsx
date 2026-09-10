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
    Gauge,
    IndianRupee,
    Plus,
    Trash2,
} from 'lucide-react-native';

export interface UnitRow {
    id: string;
    label: string;
    quantity: string;
    perUnit: string;
    paid: boolean;
}

export const DEFAULT_UNIT_LABELS = ['Water', 'Light', 'AC', 'Generator'];

let unitIdCounter = 0;

export const newUnitRow = (
    label = '',
    quantity = '',
    perUnit = '',
    paid = false,
): UnitRow => ({
    id: `unit-${Date.now()}-${unitIdCounter++}`,
    label,
    quantity,
    perUnit,
    paid,
});

export const createDefaultUnitRows = (): UnitRow[] =>
    DEFAULT_UNIT_LABELS.map((label) => newUnitRow(label));

const digitsOnly = (text: string) => text.replace(/[^0-9]/g, '');

const num = (v: string) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
};

export const unitRowAmount = (row: UnitRow) =>
    num(row.quantity) * num(row.perUnit);

export const computeUnitsTotal = (rows: UnitRow[]) =>
    rows.reduce((sum, row) => sum + unitRowAmount(row), 0);

/** Total of units that are marked as paid. */
export const computeUnitsPaidTotal = (rows: UnitRow[]) =>
    rows.reduce((sum, row) => sum + (row.paid ? unitRowAmount(row) : 0), 0);

export const unitRowsToPayload = (rows: UnitRow[]) =>
    rows
        .filter((r) => r.label.trim().length > 0)
        .map((r) => {
            const quantity = num(r.quantity);
            const perUnit = num(r.perUnit);
            return {
                label: r.label.trim(),
                quantity,
                perUnit,
                amount: quantity * perUnit,
                paid: r.paid,
            };
        });

interface UnitsSectionProps {
    rows: UnitRow[];
    setRows: React.Dispatch<React.SetStateAction<UnitRow[]>>;
    /** Show a per-unit "Paid" checkbox (used on the payment / update screens). */
    showPaid?: boolean;
}

const UnitsSection = ({ rows, setRows, showPaid = false }: UnitsSectionProps) => {
    const updateRow = (
        id: string,
        key: 'label' | 'quantity' | 'perUnit',
        value: string,
    ) => {
        setRows((prev) =>
            prev.map((row) =>
                row.id === id
                    ? {
                          ...row,
                          [key]: key === 'label' ? value : digitsOnly(value),
                      }
                    : row,
            ),
        );
    };

    const addRow = () => {
        setRows((prev) => [...prev, newUnitRow()]);
    };

    const removeRow = (id: string) => {
        setRows((prev) => prev.filter((row) => row.id !== id));
    };

    const togglePaid = (id: string) => {
        setRows((prev) =>
            prev.map((row) =>
                row.id === id ? { ...row, paid: !row.paid } : row,
            ),
        );
    };

    const total = computeUnitsTotal(rows);
    const paidTotal = computeUnitsPaidTotal(rows);

    return (
        <>
            <View className="flex-row items-center gap-2 mb-3">
                <Gauge size={20} color={Theme.button.primary} />
                <Text className="text-white text-base font-semibold">
                    Units
                </Text>
            </View>
            <View
                className="rounded-2xl  mb-5"
            >
                {rows.map((row) => {
                    const amount = unitRowAmount(row);
                    return (
                        <View
                            key={row.id}
                            className="mb-3 rounded-xl p-3"
                            style={{ backgroundColor: Theme.background.third }}
                        >
                            <View className="flex-row items-center gap-2">
                                <TextInput
                                    className="flex-1 py-2.5 px-3 rounded-xl text-white"
                                    style={{
                                        backgroundColor:
                                            Theme.background.secondary,
                                    }}
                                    placeholder="Unit title"
                                    placeholderTextColor="#8F8B91"
                                    value={row.label}
                                    onChangeText={(t) =>
                                        updateRow(row.id, 'label', t)
                                    }
                                />
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={() => removeRow(row.id)}
                                    className="w-10 h-10 items-center justify-center rounded-xl"
                                    style={{ backgroundColor: '#3A2020' }}
                                >
                                    <Trash2 size={16} color="#FF6B6B" />
                                </TouchableOpacity>
                            </View>

                            <View className="flex-row items-center gap-2 mt-2.5">
                                <View
                                    className="flex-1 rounded-xl px-3"
                                    style={{
                                        backgroundColor:
                                            Theme.background.secondary,
                                    }}
                                >
                                    <Text
                                        className="text-[10px] mt-1"
                                        style={{ color: Theme.text.secondary }}
                                    >
                                        UNITS
                                    </Text>
                                    <TextInput
                                        className="py-1.5 text-white"
                                        placeholder="0"
                                        placeholderTextColor="#8F8B91"
                                        keyboardType="numeric"
                                        value={row.quantity}
                                        onChangeText={(t) =>
                                            updateRow(row.id, 'quantity', t)
                                        }
                                    />
                                </View>
                                <View
                                    className="flex-1 flex-row items-center rounded-xl px-3"
                                    style={{
                                        backgroundColor:
                                            Theme.background.secondary,
                                    }}
                                >
                                    <View className="flex-1">
                                        <Text
                                            className="text-[10px] mt-1"
                                            style={{ color: Theme.text.secondary }}
                                        >
                                            PER UNIT
                                        </Text>
                                        <View className="flex-row items-center">
                                            <IndianRupee
                                                size={12}
                                                color="#8F8B91"
                                            />
                                            <TextInput
                                                className="flex-1 py-1.5 px-1 text-white"
                                                placeholder="0"
                                                placeholderTextColor="#8F8B91"
                                                keyboardType="numeric"
                                                value={row.perUnit}
                                                onChangeText={(t) =>
                                                    updateRow(
                                                        row.id,
                                                        'perUnit',
                                                        t,
                                                    )
                                                }
                                            />
                                        </View>
                                    </View>
                                </View>
                            </View>

                            <View className="flex-row items-center justify-between mt-2.5 pt-2.5"
                                style={{
                                    borderTopWidth: 1,
                                    borderTopColor: Theme.background.secondary,
                                }}
                            >
                                <View className="flex-row items-center">
                                    {showPaid && (
                                        <TouchableOpacity
                                            activeOpacity={0.8}
                                            onPress={() => togglePaid(row.id)}
                                            className="flex-row items-center mr-3"
                                        >
                                            <View
                                                className="w-5 h-5 rounded-md items-center justify-center"
                                                style={{
                                                    backgroundColor: row.paid
                                                        ? '#22C55E'
                                                        : 'transparent',
                                                    borderWidth: row.paid ? 0 : 1.5,
                                                    borderColor: '#667085',
                                                }}
                                            >
                                                {row.paid && (
                                                    <Check size={13} color="#000" />
                                                )}
                                            </View>
                                            <Text
                                                className="text-xs ml-1.5"
                                                style={{
                                                    color: row.paid
                                                        ? '#22C55E'
                                                        : Theme.text.secondary,
                                                }}
                                            >
                                                Paid
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                    <Text
                                        className="text-xs"
                                        style={{ color: Theme.text.secondary }}
                                    >
                                        Amount
                                    </Text>
                                </View>
                                <Text
                                    className="text-sm font-bold"
                                    style={{ color: Theme.text.primary }}
                                >
                                    ₹{amount.toLocaleString()}
                                </Text>
                            </View>
                        </View>
                    );
                })}

                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={addRow}
                    className="flex-row items-center justify-center rounded-xl py-3"
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
                        Add Unit
                    </Text>
                </TouchableOpacity>

                <View
                    className="flex-row items-center justify-between mt-4 pt-3"
                    style={{ borderTopWidth: 1, borderTopColor: '#2A2A30' }}
                >
                    <Text className="text-sm font-semibold text-white">
                        Units Total
                    </Text>
                    <Text
                        className="text-lg font-bold"
                        style={{ color: Theme.button.primary }}
                    >
                        ₹{total.toLocaleString()}
                    </Text>
                </View>
                {showPaid && (
                    <View className="flex-row items-center justify-between mt-2">
                        <Text
                            className="text-sm"
                            style={{ color: Theme.text.secondary }}
                        >
                            Units Paid
                        </Text>
                        <Text className="text-base font-bold" style={{ color: '#22C55E' }}>
                            ₹{paidTotal.toLocaleString()}
                        </Text>
                    </View>
                )}
            </View>
        </>
    );
};

export default UnitsSection;
