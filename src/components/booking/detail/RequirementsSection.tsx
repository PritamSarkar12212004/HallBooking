import React from 'react';
import {
    ChefHat,
    ClipboardList,
    Clock,
    ImageIcon,
    Palette,
    Pencil,
    Sparkles,
    User,
    Utensils,
} from 'lucide-react-native';

import { Image, Text, TouchableOpacity, View } from '../../../lib/style/withTailwind';
import { BookingDetailPalette as P } from '../../../const/theme/bookingDetailPalette';
import type {
    EventInfo,
    RequirementItem,
} from '../../../functions/booking/BookingDetailFunction';
import {
    DetailAccordion,
    DetailCard,
    DetailRow,
    SectionHeading,
} from './DetailPrimitives';

interface Props {
    eventInfo: EventInfo;
    expectedAttendance: number;
    onPreview: (uri?: string | null) => void;
    /** "Update Event" — booking-for details edit karne ka entry point. */
    onEditEvent?: () => void;
    /** Ended booking me koi edit nahi (backend bhi reject karta hai). */
    editable?: boolean;
}

/** Ended bookings me edit nahi — button tabhi dikhta hai jab editable ho. */
const UpdateEventButton = ({ onPress }: { onPress: () => void }) => (
    <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        className="flex-row items-center justify-center rounded-xl py-3 mt-3"
        style={{ backgroundColor: P.accentSoft, borderWidth: 1, borderColor: P.border }}
    >
        <Pencil size={14} color={P.accent} />
        <Text className="text-xs font-bold ml-2" style={{ color: P.accent }}>
            Update Event
        </Text>
    </TouchableOpacity>
);

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
const RequirementsSection = ({
    eventInfo,
    expectedAttendance,
    onPreview,
    onEditEvent,
    editable = false,
}: Props) => {
    const { requirements, timeSlots, evidencePhoto, arrangements, bookingFor, hasAnything } =
        eventInfo;

    if (!hasAnything) {
        return (
            <DetailAccordion
                index={3}
                title="Requirements"
                subtitle="Hall setup, time slots and arrangements"
                status={{ label: 'None', tone: 'neutral' }}
            >
                <DetailCard>
                    <Text className="text-sm" style={{ color: P.textSecondary }}>
                        No hall requirements or arrangements were recorded.
                    </Text>
                    <Text className="text-[11px] mt-2" style={{ color: P.textMuted }}>
                        What you selected in the event step appears here.
                    </Text>
                </DetailCard>
                {editable && onEditEvent ? <UpdateEventButton onPress={onEditEvent} /> : null}
            </DetailAccordion>
        );
    }

    return (
        <DetailAccordion
            index={3}
            title="Requirements"
            subtitle="Hall setup, time slots and arrangements"
            status={
                requirements.length > 0
                    ? { label: `${requirements.length} items`, tone: 'info' }
                    : null
            }
        >
            {/* Booking kis ke liye hai — "Someone Else" par us person ki
                details + event photo. */}
            <SectionHeading
                icon={<User size={16} color={P.accent} />}
                title="Booking For"
                right={
                    bookingFor.isSomeoneElse ? (
                        <View
                            className="px-2 py-1 rounded-full"
                            style={{ backgroundColor: P.accentSoft }}
                        >
                            <Text className="text-[10px] font-bold" style={{ color: P.accent }}>
                                Someone Else
                            </Text>
                        </View>
                    ) : null
                }
            />
            <DetailCard>
                <DetailRow
                    icon={<User size={14} color={P.textSecondary} />}
                    label="Booking is for"
                    value={
                        bookingFor.isSomeoneElse
                            ? `${bookingFor.name || 'Someone else'}`
                            : bookingFor.forWhom || 'Not specified'
                    }
                    last={!bookingFor.isSomeoneElse}
                />
                {bookingFor.isSomeoneElse ? (
                    <>
                        <DetailRow label="Relation" value={bookingFor.relation} />
                        <DetailRow label="Contact number" value={bookingFor.mobile} last />
                    </>
                ) : null}
            </DetailCard>

            {/* Update ka option booking-for block ke saath hi — dhoondhna na pade. */}
            {editable && onEditEvent ? <UpdateEventButton onPress={onEditEvent} /> : null}

            {bookingFor.isSomeoneElse && bookingFor.photo ? (
                <>
                    <SectionHeading
                        icon={<ImageIcon size={16} color={P.accent} />}
                        title="Person / Event Photo"
                    />
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => onPreview(bookingFor.photo)}
                        className="rounded-2xl overflow-hidden mb-4"
                        style={{ borderWidth: 1, borderColor: P.border }}
                    >
                        <Image
                            source={{ uri: bookingFor.photo }}
                            style={{ width: '100%', height: 180 }}
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
                        No hall requirements selected.
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
        </DetailAccordion>
    );
};

export default RequirementsSection;
