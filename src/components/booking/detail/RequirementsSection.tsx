import React from 'react';
import {
    ChefHat,
    ClipboardList,
    Clock,
    ImageIcon,
    Palette,
    Sparkles,
    Utensils,
} from 'lucide-react-native';

import { Image, Text, TouchableOpacity, View } from '../../../lib/style/withTailwind';
import { BookingDetailPalette as P } from '../../../const/theme/bookingDetailPalette';
import type {
    EventInfo,
    RequirementItem,
} from '../../../functions/booking/BookingDetailFunction';
import { DetailCard, DetailRow, SectionHeading, SectionStepHeader } from './DetailPrimitives';

interface Props {
    eventInfo: EventInfo;
    expectedAttendance: number;
    onPreview: (uri?: string | null) => void;
}

const RequirementChip = ({ item }: { item: RequirementItem }) => (
    <View
        className="flex-row items-center rounded-xl px-3 py-2.5 mb-2"
        style={{
            backgroundColor: P.surfaceAlt,
            borderWidth: 1,
            borderColor: P.border,
        }}
    >
        <Sparkles size={13} color={P.accent} />
        <Text className="text-sm flex-1 ml-2" style={{ color: P.textPrimary }}>
            {item.label}
        </Text>
        <View
            className="px-2 py-1 rounded-full"
            style={{ backgroundColor: item.quantity > 0 ? P.accentSoft : P.surface }}
        >
            <Text
                className="text-[10px] font-bold"
                style={{ color: item.quantity > 0 ? P.accent : P.textMuted }}
            >
                {item.quantity > 0 ? `Qty ${item.quantity}` : '—'}
            </Text>
        </View>
    </View>
);

/**
 * Section 3 — Requirements.
 *
 * Hall setup (quantities ke saath), event ke time slots, aur decorator/caterer
 * arrangements — pehle ye info detail screen par dikhti hi nahi thi.
 */
const RequirementsSection = ({ eventInfo, expectedAttendance, onPreview }: Props) => {
    const { requirements, timeSlots, evidencePhoto, arrangements, hasAnything } = eventInfo;

    if (!hasAnything) {
        return (
            <>
                <SectionStepHeader
                    index={3}
                    title="Requirements"
                    subtitle="Hall setup, time slots aur arrangements"
                />

                <DetailCard>
                    <Text className="text-sm" style={{ color: P.textSecondary }}>
                        Is booking me hall requirements ya arrangements record nahi hue.
                    </Text>
                    <Text className="text-[11px] mt-2" style={{ color: P.textMuted }}>
                        Booking ke event step me jo select kiya tha, wo yahan dikhta hai.
                    </Text>
                </DetailCard>
            </>
        );
    }

    return (
        <>
            <SectionStepHeader
                index={3}
                title="Requirements"
                subtitle="Hall setup, time slots aur arrangements"
                status={
                    requirements.length > 0
                        ? { label: `${requirements.length} items`, tone: 'info' }
                        : null
                }
            />

            <SectionHeading
                icon={<ClipboardList size={16} color={P.accent} />}
                title="Hall Requirements"
                right={
                    <Text className="text-[11px] font-bold" style={{ color: P.textMuted }}>
                        {requirements.length} items
                    </Text>
                }
            />

            {requirements.length > 0 ? (
                <View className="mb-4">
                    {requirements.map((item) => (
                        <RequirementChip key={item.label} item={item} />
                    ))}
                </View>
            ) : (
                <DetailCard>
                    <Text className="text-xs" style={{ color: P.textMuted }}>
                        Koi hall requirement select nahi hui.
                    </Text>
                </DetailCard>
            )}

            {timeSlots.length > 0 ? (
                <>
                    <SectionHeading
                        icon={<Clock size={16} color={P.accent} />}
                        title="Event Time Slots"
                    />
                    <View className="flex-row flex-wrap mb-4" style={{ gap: 8 }}>
                        {timeSlots.map((slot) => (
                            <View
                                key={slot}
                                className="rounded-full px-3 py-1.5"
                                style={{
                                    backgroundColor: P.surfaceAlt,
                                    borderWidth: 1,
                                    borderColor: P.border,
                                }}
                            >
                                <Text className="text-xs font-semibold" style={{ color: P.textPrimary }}>
                                    {slot}
                                </Text>
                            </View>
                        ))}
                    </View>
                </>
            ) : null}

            <SectionHeading
                icon={<Utensils size={16} color={P.accent} />}
                title="Arrangements"
            />

            <DetailCard>
                {arrangements.decorator ? (
                    <>
                        <DetailRow
                            icon={<Palette size={14} color={P.textSecondary} />}
                            label="Decorator"
                            value={arrangements.decorator.name || '—'}
                        />
                        <DetailRow
                            label="Decorator contact"
                            value={arrangements.decorator.contact}
                        />
                        <DetailRow
                            icon={<Clock size={14} color={P.textSecondary} />}
                            label="Setup timing"
                            value={arrangements.decorator.timing}
                        />
                    </>
                ) : (
                    <DetailRow label="Decorator" value="" />
                )}

                {arrangements.caterer ? (
                    <>
                        <DetailRow
                            icon={<ChefHat size={14} color={P.textSecondary} />}
                            label="Caterer"
                            value={arrangements.caterer.name || '—'}
                        />
                        <DetailRow label="Caterer contact" value={arrangements.caterer.contact} />
                    </>
                ) : (
                    <DetailRow label="Caterer" value="" />
                )}

                <DetailRow
                    icon={<Utensils size={14} color={P.textSecondary} />}
                    label="Kitchen required"
                    value={arrangements.kitchenRequired ? 'Yes' : 'No'}
                    valueColor={arrangements.kitchenRequired ? P.success : P.textSecondary}
                />
                <DetailRow
                    label="Expected attendance"
                    value={expectedAttendance > 0 ? `${expectedAttendance} guests` : ''}
                    last
                />
            </DetailCard>

            {evidencePhoto ? (
                <>
                    <SectionHeading
                        icon={<ImageIcon size={16} color={P.accent} />}
                        title="Event Evidence Photo"
                    />
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => onPreview(evidencePhoto)}
                        className="rounded-2xl overflow-hidden mb-4"
                        style={{ borderWidth: 1, borderColor: P.border }}
                    >
                        <Image
                            source={{ uri: evidencePhoto }}
                            style={{ width: '100%', height: 190 }}
                            resizeMode="cover"
                        />
                        <Text
                            className="text-[10px] text-center py-2"
                            style={{ color: P.textMuted, backgroundColor: P.surfaceAlt }}
                        >
                            Tap to view full screen
                        </Text>
                    </TouchableOpacity>
                </>
            ) : null}
        </>
    );
};

export default RequirementsSection;
