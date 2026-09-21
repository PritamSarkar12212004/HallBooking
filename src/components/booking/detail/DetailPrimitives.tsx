import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react-native';

import { Text, TouchableOpacity, View } from '../../../lib/style/withTailwind';
import {
    BookingDetailPalette as P,
    toneColors,
} from '../../../const/theme/bookingDetailPalette';
import type { StatusTone } from '../../../functions/booking/BookingDetailFunction';

/** Dark rounded card — detail sections ka basic block. */
export const DetailCard = ({
    children,
    style,
}: {
    children: React.ReactNode;
    style?: any;
}) => (
    <View
        className="rounded-2xl p-4 mb-4"
        style={[
            {
                backgroundColor: P.surface,
                borderWidth: 1,
                borderColor: P.border,
            },
            style,
        ]}
    >
        {children}
    </View>
);

/**
 * Collapsible section — pehle saara detail ek hi scroll me khula tha, isliye
 * screen bhari hui lagti thi. Ab har section band rehta hai aur header tap
 * karne par khulta hai; header par title + status pill hamesha dikhte hain,
 * isliye bina kholne bhi poora context mil jaata hai.
 *
 * `alwaysOpen` wale section par chevron nahi hota aur wo band nahi hota —
 * Finalize jaisa action section hamesha bada (khula) rehta hai.
 */
export const DetailAccordion = ({
    index,
    title,
    subtitle,
    status,
    children,
    defaultOpen = false,
    alwaysOpen = false,
}: {
    index: number;
    title: string;
    subtitle?: string;
    status?: { label: string; tone?: StatusTone } | null;
    children: React.ReactNode;
    defaultOpen?: boolean;
    alwaysOpen?: boolean;
}) => {
    const [open, setOpen] = React.useState(defaultOpen || alwaysOpen);
    const expanded = alwaysOpen || open;

    const header = (
        <>
            <View
                className="w-7 h-7 rounded-lg items-center justify-center"
                style={{
                    backgroundColor: P.accentSoft,
                    borderWidth: 1,
                    borderColor: P.accent,
                }}
            >
                <Text className="text-xs font-extrabold" style={{ color: P.accent }}>
                    {index}
                </Text>
            </View>

            <View className="flex-1">
                <Text
                    className="text-base font-extrabold"
                    style={{ color: P.textPrimary }}
                    numberOfLines={1}
                >
                    {title}
                </Text>
                {subtitle ? (
                    <Text className="text-[11px] mt-0.5" style={{ color: P.textMuted }}>
                        {subtitle}
                    </Text>
                ) : null}
            </View>

            {status ? (
                <DetailBadge label={status.label} tone={status.tone} solid={false} />
            ) : null}

            {alwaysOpen ? null : expanded ? (
                <ChevronUp size={18} color={P.accent} />
            ) : (
                <ChevronDown size={18} color={P.textSecondary} />
            )}
        </>
    );

    return (
        <View className="pt-4">
            <View
                className="absolute left-0 right-0 top-0"
                style={{ height: 1, backgroundColor: P.divider }}
            />

            {alwaysOpen ? (
                <View className="flex-row items-center" style={{ gap: 10 }}>
                    {header}
                </View>
            ) : (
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setOpen(prev => !prev)}
                    className="flex-row items-center"
                    style={{ gap: 10 }}
                >
                    {header}
                </TouchableOpacity>
            )}

            {expanded ? <View className="mt-4">{children}</View> : null}
        </View>
    );
};

/** Section ka chhota heading (icon + title + optional right). */
export const SectionHeading = ({
    icon,
    title,
    right,
}: {
    icon?: React.ReactNode;
    title: string;
    right?: React.ReactNode;
}) => (
    <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center" style={{ gap: 8 }}>
            {icon}
            <Text className="text-base font-extrabold" style={{ color: P.textPrimary }}>
                {title}
            </Text>
        </View>
        {right}
    </View>
);

/** Label-value line, label left aur value right (wraps up to 2 lines). */
export const DetailRow = ({
    icon,
    label,
    value,
    valueColor,
    bold = false,
    last = false,
    onPress,
}: {
    icon?: React.ReactNode;
    label: string;
    value?: string | number;
    valueColor?: string;
    bold?: boolean;
    last?: boolean;
    onPress?: () => void;
}) => {
    const body = (
        <View className={`flex-row items-start justify-between ${last ? '' : 'mb-3'}`}>
            <View className="flex-row items-center flex-1 pr-3">
                {icon ? <View className="mr-2.5">{icon}</View> : null}
                <Text className="text-sm flex-1" style={{ color: P.textSecondary }}>
                    {label}
                </Text>
            </View>

            <Text
                className={`text-sm ${bold ? 'font-bold' : 'font-semibold'}`}
                style={{ color: valueColor || P.textPrimary, maxWidth: '58%' }}
                numberOfLines={2}
            >
                {value === '' || value === undefined || value === null ? '—' : value}
            </Text>
        </View>
    );

    if (!onPress) return body;

    return (
        <TouchableOpacity activeOpacity={0.75} onPress={onPress}>
            {body}
        </TouchableOpacity>
    );
};

/** Chhota colored pill (status, payment status, count). */
export const DetailBadge = ({
    label,
    tone = 'neutral',
    icon,
    solid = true,
}: {
    label: string;
    tone?: StatusTone;
    icon?: React.ReactNode;
    solid?: boolean;
}) => {
    const { color, soft } = toneColors(tone);

    return (
        <View
            className="flex-row items-center px-2.5 py-1.5 rounded-full"
            style={{
                backgroundColor: solid ? color : soft,
                borderWidth: solid ? 0 : 1,
                borderColor: solid ? 'transparent' : color,
                gap: 5,
            }}
        >
            {icon}
            <Text
                className="text-[11px] font-bold"
                style={{ color: solid ? '#0B0B0F' : color }}
            >
                {label}
            </Text>
        </View>
    );
};

/** Info tile — bade number/wording ke liye (dates, time, capacity). */
export const InfoTile = ({
    icon,
    label,
    value,
    accent = false,
    style,
}: {
    icon?: React.ReactNode;
    label: string;
    value: string;
    accent?: boolean;
    style?: any;
}) => (
    <View
        className="rounded-xl px-3 py-3"
        style={[
            { backgroundColor: P.surfaceAlt, borderWidth: 1, borderColor: P.border },
            style,
        ]}
    >
        <View className="flex-row items-center mb-1.5" style={{ gap: 6 }}>
            {icon}
            <Text className="text-[10px] font-bold tracking-wide" style={{ color: P.textMuted }}>
                {label}
            </Text>
        </View>
        <Text
            className="text-sm font-bold"
            style={{ color: accent ? P.accent : P.textPrimary }}
            numberOfLines={2}
        >
            {value}
        </Text>
    </View>
);

/** Empty/short line — "kuch nahi hai" batane ke liye. */
export const EmptyLine = ({ text }: { text: string }) => (
    <Text className="text-xs" style={{ color: P.textMuted }}>
        {text}
    </Text>
);

export { P as DetailPalette };
