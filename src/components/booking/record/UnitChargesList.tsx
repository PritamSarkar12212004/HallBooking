import React from 'react';
import { Camera, Gauge, TriangleAlert } from 'lucide-react-native';

import { Image, Text, TouchableOpacity, View } from '../../../lib/style/withTailwind';
import type { UnitLine } from '../../../functions/booking/PaymentRecordFunction';
import { money } from '../../../functions/booking/PaymentRecordFunction';
import {
    RecordCard,
    RecordColors,
    RecordPill,
    RecordSectionTitle,
} from './RecordPrimitives';

interface Props {
    units: UnitLine[];
    /** Kitna bill bana. */
    billed: number;
    /** Kitna paid hua. */
    paid: number;
    /** Meter photo tap karne par full screen. */
    onViewPhoto: (uri: string) => void;
}

/**
 * Section 3 — Units.
 *
 * Sab units ek saath: rate, reading, bana hua amount aur paid status; saath me
 * units ka total billed vs paid. Meter photo ho to thumbnail se full screen
 * dekh sakte hain.
 */
const UnitChargesList = ({ units, billed, paid, onViewPhoto }: Props) => {
    if (units.length === 0) {
        return (
            <>
                <RecordSectionTitle
                    icon={<Gauge size={16} color={RecordColors.accent} />}
                    title="UNITS"
                />
                <RecordCard>
                    <Text className="text-xs" style={{ color: RecordColors.textMuted }}>
                        No units added in this booking.
                    </Text>
                </RecordCard>
            </>
        );
    }

    return (
        <>
            <RecordSectionTitle
                icon={<Gauge size={16} color={RecordColors.accent} />}
                title="UNITS"
                right={
                    <Text className="text-[10px] font-bold" style={{ color: RecordColors.textMuted }}>
                        {units.length} unit{units.length === 1 ? '' : 's'}
                    </Text>
                }
            />

            <RecordCard>
                {/* Units total */}
                <View className="flex-row">
                    <View className="flex-1">
                        <Text
                            className="text-[10px] font-bold mb-1"
                            style={{ color: RecordColors.textMuted }}
                        >
                            BILLED
                        </Text>
                        <Text
                            className="text-lg font-extrabold"
                            style={{ color: RecordColors.text }}
                        >
                            {money(billed)}
                        </Text>
                    </View>
                    <View className="flex-1">
                        <Text
                            className="text-[10px] font-bold mb-1"
                            style={{ color: RecordColors.textMuted }}
                        >
                            PAID
                        </Text>
                        <Text
                            className="text-lg font-extrabold"
                            style={{ color: RecordColors.success }}
                        >
                            {money(paid)}
                        </Text>
                    </View>
                </View>

                <View
                    className="pt-3 mt-3"
                    style={{ borderTopWidth: 1, borderTopColor: RecordColors.divider }}
                >
                    {units.map((unit, index) => {
                        const pending = !unit.hasRate || !unit.hasReading;

                        return (
                            <View
                                key={`${unit.label}-${index}`}
                                className={index === units.length - 1 ? '' : 'mb-4'}
                            >
                                <View className="flex-row items-center justify-between">
                                    <Text
                                        className="text-sm flex-1 pr-2 font-semibold"
                                        style={{ color: RecordColors.text }}
                                        numberOfLines={1}
                                    >
                                        {unit.label}
                                    </Text>
                                    <Text
                                        className="text-sm font-bold"
                                        style={{ color: RecordColors.text }}
                                    >
                                        {unit.amount > 0 ? money(unit.amount) : '—'}
                                    </Text>
                                </View>

                                <View className="flex-row items-center justify-between mt-1.5">
                                    <Text
                                        className="text-[11px] flex-1 pr-2"
                                        style={{ color: RecordColors.textMuted }}
                                    >
                                        {unit.hasRate
                                            ? `${money(unit.perUnit)}/unit`
                                            : 'Rate not set'}
                                        {unit.quantity > 0
                                            ? ` · ${unit.quantity.toLocaleString('en-IN')} units`
                                            : ''}
                                        {` · reading ${
                                            unit.hasReading
                                                ? unit.currentUnit.toLocaleString('en-IN')
                                                : 'pending'
                                        }`}
                                    </Text>

                                    {unit.paid ? (
                                        <RecordPill
                                            label="Paid"
                                            color={RecordColors.success}
                                            soft
                                        />
                                    ) : pending ? (
                                        <RecordPill
                                            label={
                                                !unit.hasRate
                                                    ? 'Rate pending'
                                                    : 'Reading pending'
                                            }
                                            color={RecordColors.warning}
                                            soft
                                            icon={
                                                <TriangleAlert
                                                    size={10}
                                                    color={RecordColors.warning}
                                                />
                                            }
                                        />
                                    ) : (
                                        <RecordPill
                                            label="Unpaid"
                                            color={RecordColors.textMuted}
                                            soft
                                        />
                                    )}
                                </View>

                                {/* Meter photos — current (booking) + closing
                                    (event end). Dono tap → full screen. */}
                                {unit.meterPhoto ? (
                                    <TouchableOpacity
                                        activeOpacity={0.9}
                                        onPress={() => onViewPhoto(unit.meterPhoto)}
                                        className="flex-row items-center mt-2.5"
                                        style={{ gap: 10 }}
                                    >
                                        <Image
                                            source={{ uri: unit.meterPhoto }}
                                            style={{ width: 48, height: 48, borderRadius: 10 }}
                                            resizeMode="cover"
                                        />
                                        <View className="flex-1">
                                            <View
                                                className="flex-row items-center"
                                                style={{ gap: 5 }}
                                            >
                                                <Camera
                                                    size={12}
                                                    color={RecordColors.accent}
                                                />
                                                <Text
                                                    className="text-[11px] font-bold"
                                                    style={{ color: RecordColors.accent }}
                                                >
                                                    Current unit photo
                                                </Text>
                                            </View>
                                            <Text
                                                className="text-[10px] mt-0.5"
                                                style={{ color: RecordColors.textMuted }}
                                            >
                                                Booking time · tap to view full screen
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                ) : null}

                                {unit.closingPhoto ? (
                                    <TouchableOpacity
                                        activeOpacity={0.9}
                                        onPress={() => onViewPhoto(unit.closingPhoto)}
                                        className="flex-row items-center mt-2"
                                        style={{ gap: 10 }}
                                    >
                                        <Image
                                            source={{ uri: unit.closingPhoto }}
                                            style={{ width: 48, height: 48, borderRadius: 10 }}
                                            resizeMode="cover"
                                        />
                                        <View className="flex-1">
                                            <View
                                                className="flex-row items-center"
                                                style={{ gap: 5 }}
                                            >
                                                <Camera
                                                    size={12}
                                                    color={RecordColors.success}
                                                />
                                                <Text
                                                    className="text-[11px] font-bold"
                                                    style={{ color: RecordColors.success }}
                                                >
                                                    Closing unit photo
                                                </Text>
                                            </View>
                                            <Text
                                                className="text-[10px] mt-0.5"
                                                style={{ color: RecordColors.textMuted }}
                                            >
                                                Event end · tap to view full screen
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                ) : null}
                            </View>
                        );
                    })}
                </View>
            </RecordCard>
        </>
    );
};

export default UnitChargesList;
