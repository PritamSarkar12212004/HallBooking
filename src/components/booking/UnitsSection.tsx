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
    /** Meter reading (e.g. bijli ke meter ki current reading). Recorded only — excluded from payment calculations. */
    currentUnit: string;
    paid: boolean;
}

export const DEFAULT_UNIT_LABELS = ['Water', 'Light', 'AC', 'Generator'];

let unitIdCounter = 0;

export const newUnitRow = (
    label = '',
    perUnit = '',
    paid = false,
    currentUnit = '',
): UnitRow => ({
    id: `unit-${Date.now()}-${unitIdCounter++}`,
    label,
    // UI me quantity input nahi hai — har row ek unit ki tarah charge hoti hai.
    quantity: '1',
    perUnit,
    currentUnit,
    paid,
});

export const createDefaultUnitRows = (): UnitRow[] =>
    DEFAULT_UNIT_LABELS.map((label) => newUnitRow(label));

const digitsOnly = (text: string) => text.replace(/[^0-9]/g, '');

const num = (v: string) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
};

/** Row ka chargeable amount — sirf Per Unit rate (quantity UI me nahi hai, implicit 1). */
export const unitRowAmount = (row: UnitRow) => num(row.perUnit);

export const computeUnitsTotal = (rows: UnitRow[]) =>
    rows.reduce((sum, row) => sum + unitRowAmount(row), 0);

/** Total of units that are marked as paid. */
export const computeUnitsPaidTotal = (rows: UnitRow[]) =>
    rows.reduce((sum, row) => sum + (row.paid ? unitRowAmount(row) : 0), 0);

export const unitRowsToPayload = (rows: UnitRow[]) =>
    rows
        .filter((r) => r.label.trim().length > 0)
        .map((r) => {
            const perUnit = num(r.perUnit);
            return {
                label: r.label.trim(),
                // Quantity UI se hata diya — backend compat ke liye implicit 1 bhejte hain.
                quantity: 1,
                perUnit,
                amount: perUnit,
                // Current unit (meter reading) is stored but never charged.
                currentUnit: num(r.currentUnit),
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
        key: 'label' | 'perUnit' | 'currentUnit',
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

                            <View className="flex-row items-stretch gap-2 mt-2.5">
                                {/* Per Unit rate — chargeable */}
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
                                                updateRow(row.id, 'perUnit', t)
                                            }
                                        />
                                    </View>
                                </View>

                                {/* Current unit (meter reading) — recorded only, never charged */}
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
                                        CURRENT UNIT
                                    </Text>
                                    <TextInput
                                        className="py-1.5 text-white"
                                        placeholder="0"
                                        placeholderTextColor="#8F8B91"
                                        keyboardType="numeric"
                                        value={row.currentUnit}
                                        onChangeText={(t) =>
                                            updateRow(row.id, 'currentUnit', t)
                                        }
                                    />
                                </View>
                            </View>

                            {showPaid && (
                                <View
                                    className="flex-row items-center mt-2.5 pt-2.5"
                                    style={{
                                        borderTopWidth: 1,
                                        borderTopColor: Theme.background.secondary,
                                    }}
                                >
                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        onPress={() => togglePaid(row.id)}
                                        className="flex-row items-center"
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
                                </View>
                            )}
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

            </View>
        </>
    );
};

export default UnitsSection;