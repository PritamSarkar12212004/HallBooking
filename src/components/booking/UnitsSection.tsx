import React from 'react';
import {
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from '../../lib/style/withTailwind';
import { Theme } from '../../const/theme/Theme';
import {
    Gauge,
    IndianRupee,
    Info,
    Plus,
    Trash2,
} from 'lucide-react-native';

export interface UnitRow {
    id: string;
    label: string;
    /** Rate charged per unit (e.g. Rs 5 per unit of electricity). */
    perUnit: string;
    /**
     * Meter reading at the START of the booking (recorded for reference).
     * Actual units consumed = (closing reading at handover) - previousUnit.
     * Amount is calculated at handover time, not here.
     */
    currentUnit: string;
    /** Kept for data compatibility — always false, units paid at handover. */
    paid: boolean;
    /** @deprecated — kept only for backend payload compatibility. */
    quantity: string;
}

export const DEFAULT_UNIT_LABELS = ["Water", "Light", "AC", "Generator"];

let unitIdCounter = 0;

export const newUnitRow = (
    label = "",
    perUnit = "",
    paid = false,
    currentUnit = "",
): UnitRow => ({
    id: `unit-${Date.now()}-${unitIdCounter++}`,
    label,
    quantity: "0",
    perUnit,
    currentUnit,
    paid,
});

export const createDefaultUnitRows = (): UnitRow[] =>
    DEFAULT_UNIT_LABELS.map((label) => newUnitRow(label));

const digitsOnly = (text: string) => text.replace(/[^0-9]/g, "");

const num = (v: string) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
};

/**
 * Unit amount is UNKNOWN at booking time — it depends on the closing meter reading
 * captured at handover. Until handover, amount = 0.
 */
export const unitRowAmount = (_row: UnitRow) => 0;

export const computeUnitsTotal = (_rows: UnitRow[]) => 0;

/** Units are ALWAYS pending — amount is calculated at handover, not at booking time. */
export const computeUnitsPaidTotal = (_rows: UnitRow[]) => 0;

export const unitRowsToPayload = (rows: UnitRow[]) =>
    rows
        .filter((r) => r.label.trim().length > 0)
        .map((r) => ({
            label: r.label.trim(),
            // Quantity is 0 until handover determines the actual used units.
            quantity: 0,
            perUnit: num(r.perUnit),
            // amount = 0 until handover (closing reading captured then)
            amount: 0,
            currentUnit: num(r.currentUnit),
            paid: false,
        }));

interface UnitsSectionProps {
    rows: UnitRow[];
    setRows: React.Dispatch<React.SetStateAction<UnitRow[]>>;
}

const UnitsSection = ({ rows, setRows }: UnitsSectionProps) => {
    const updateRow = (
        id: string,
        key: "label" | "perUnit" | "currentUnit",
        value: string,
    ) => {
        setRows((prev) =>
            prev.map((row) =>
                row.id === id
                    ? { ...row, [key]: key === "label" ? value : digitsOnly(value) }
                    : row,
            ),
        );
    };

    const addRow = () => setRows((prev) => [...prev, newUnitRow()]);
    const removeRow = (id: string) => setRows((prev) => prev.filter((row) => row.id !== id));

    return (
        <>
            <View className="flex-row items-center gap-2 mb-2">
                <Gauge size={20} color={Theme.button.primary} />
                <Text className="text-white text-base font-semibold">Units</Text>
            </View>

            {/* Info note */}
            <View
                className="flex-row items-start gap-2 rounded-xl p-3 mb-4"
                style={{ backgroundColor: "rgba(139,92,246,0.1)", borderWidth: 1, borderColor: "rgba(139,92,246,0.25)" }}
            >
                <Info size={14} color="#A78BFA" style={{ marginTop: 1 }} />
                <Text className="text-xs flex-1 leading-5" style={{ color: "#A78BFA" }}>
                    Yahan sirf per unit rate aur current meter reading (booking ke start ki) record karein.
                    Actual amount handover ke time calculate hogi.
                </Text>
            </View>

            <View className="rounded-2xl mb-5">
                {rows.map((row) => (
                    <View
                        key={row.id}
                        className="mb-3 rounded-xl p-3"
                        style={{ backgroundColor: Theme.background.third }}
                    >
                        {/* Label + delete */}
                        <View className="flex-row items-center gap-2">
                            <TextInput
                                className="flex-1 py-2.5 px-3 rounded-xl text-white"
                                style={{ backgroundColor: Theme.background.secondary }}
                                placeholder="Unit title (e.g. Light, Water)"
                                placeholderTextColor="#8F8B91"
                                value={row.label}
                                onChangeText={(t) => updateRow(row.id, "label", t)}
                            />
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={() => removeRow(row.id)}
                                className="w-10 h-10 items-center justify-center rounded-xl"
                                style={{ backgroundColor: "#3A2020" }}
                            >
                                <Trash2 size={16} color="#FF6B6B" />
                            </TouchableOpacity>
                        </View>

                        <View className="flex-row items-stretch gap-2 mt-2.5">
                            {/* Per Unit Rate */}
                            <View
                                className="flex-1 rounded-xl px-3 py-2"
                                style={{ backgroundColor: Theme.background.secondary }}
                            >
                                <Text className="text-[10px] mb-1" style={{ color: Theme.text.secondary }}>
                                    RATE (PER UNIT)
                                </Text>
                                <View className="flex-row items-center">
                                    <IndianRupee size={12} color="#8F8B91" />
                                    <TextInput
                                        className="flex-1 py-1 px-1 text-white"
                                        placeholder="0"
                                        placeholderTextColor="#8F8B91"
                                        keyboardType="numeric"
                                        value={row.perUnit}
                                        onChangeText={(t) => updateRow(row.id, "perUnit", t)}
                                    />
                                </View>
                            </View>

                            {/* Current Meter Reading */}
                            <View
                                className="flex-1 rounded-xl px-3 py-2"
                                style={{ backgroundColor: Theme.background.secondary }}
                            >
                                <Text className="text-[10px] mb-1" style={{ color: Theme.text.secondary }}>
                                    CURRENT READING
                                </Text>
                                <TextInput
                                    className="py-1 text-white"
                                    placeholder="0"
                                    placeholderTextColor="#8F8B91"
                                    keyboardType="numeric"
                                    value={row.currentUnit}
                                    onChangeText={(t) => updateRow(row.id, "currentUnit", t)}
                                />
                            </View>
                        </View>

                        {/* Handover note */}
                        <View className="mt-2 flex-row items-center gap-1.5">
                            <View className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#F59E0B" }} />
                            <Text className="text-[10px]" style={{ color: "#8F8B91" }}>
                                Amount handover ke baad calculate hogi
                            </Text>
                        </View>
                    </View>
                ))}

                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={addRow}
                    className="flex-row items-center justify-center rounded-xl py-3"
                    style={{ borderWidth: 1, borderColor: Theme.button.primary, borderStyle: "dashed" }}
                >
                    <Plus size={16} color={Theme.button.primary} />
                    <Text className="ml-2 font-semibold text-sm" style={{ color: Theme.button.primary }}>
                        Add Unit
                    </Text>
                </TouchableOpacity>
            </View>
        </>
    );
};

export default UnitsSection;
