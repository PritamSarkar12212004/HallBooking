import React from 'react';

import { Text, View } from '../../../lib/style/withTailwind';
import { Theme } from '../../../const/theme/Theme';

/** Payment Record screen ke accents (app theme ke saath). */
export const RecordColors = {
    bg: Theme.background.primary,
    card: Theme.background.secondary,
    tile: '#2C2C33',
    raised: '#33333B',
    border: Theme.border.primary,
    divider: '#2A2A31',
    accent: Theme.button.primary,
    text: Theme.text.primary,
    textSecondary: Theme.text.secondary,
    textMuted: Theme.text.tertiary,
    success: '#22C55E',
    successSoft: 'rgba(34,197,94,0.14)',
    warning: '#F59E0B',
    warningSoft: 'rgba(245,158,11,0.14)',
    danger: '#EF4444',
    dangerSoft: 'rgba(239,68,68,0.14)',
    info: '#3B82F6',
    infoSoft: 'rgba(59,130,246,0.14)',
} as const;

export const toneColor = (tone: 'success' | 'warning' | 'danger' | 'info' | 'neutral') =>
    tone === 'success'
        ? RecordColors.success
        : tone === 'warning'
        ? RecordColors.warning
        : tone === 'danger'
        ? RecordColors.danger
        : tone === 'info'
        ? RecordColors.info
        : RecordColors.textSecondary;

/** Section ka heading (icon + title + optional right side). */
export const RecordSectionTitle = ({
    icon,
    title,
    right,
}: {
    icon?: React.ReactNode;
    title: string;
    right?: React.ReactNode;
}) => (
    <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center flex-1" style={{ gap: 8 }}>
            {icon}
            <Text
                className="text-xs font-bold"
                style={{ color: RecordColors.textSecondary }}
            >
                {title}
            </Text>
        </View>
        {right}
    </View>
);

/** Dark surface card. */
export const RecordCard = ({
    children,
    style,
}: {
    children: React.ReactNode;
    style?: any;
}) => (
    <View
        className="rounded-2xl p-4"
        style={[
            {
                backgroundColor: RecordColors.card,
                borderWidth: 1,
                borderColor: RecordColors.border,
            },
            style,
        ]}
    >
        {children}
    </View>
);

/** Chhota pill (status, mode, count). */
export const RecordPill = ({
    label,
    color = RecordColors.accent,
    soft = false,
    icon,
}: {
    label: string;
    color?: string;
    soft?: boolean;
    icon?: React.ReactNode;
}) => (
    <View
        className="flex-row items-center px-2.5 py-1 rounded-full"
        style={{
            backgroundColor: soft ? `${color}22` : color,
            borderWidth: soft ? 1 : 0,
            borderColor: soft ? color : 'transparent',
            gap: 5,
        }}
    >
        {icon}
        <Text
            className="text-[11px] font-bold"
            style={{ color: soft ? color : '#101014' }}
        >
            {label}
        </Text>
    </View>
);

/** Empty state line. */
export const RecordEmpty = ({ text }: { text: string }) => (
    <Text className="text-xs py-1" style={{ color: RecordColors.textMuted }}>
        {text}
    </Text>
);
