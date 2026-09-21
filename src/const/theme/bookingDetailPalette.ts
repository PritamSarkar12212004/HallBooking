/**
 * Booking Details ke sections ka palette.
 *
 * Background aur card colors app ke baaki screens wale hi hain (`Theme` se) —
 * pehle yahan alag (zyada dark) bg tha, isliye ye screen baaki app se alag
 * lagti thi.
 */
import { Theme } from './Theme';

export const BookingDetailPalette = {
    bg: Theme.background.primary,
    surface: Theme.background.secondary,
    surfaceAlt: '#2C2C33',
    raised: '#33333B',
    border: Theme.border.primary,
    divider: '#2A2A31',
    textPrimary: '#FFFFFF',
    textSecondary: '#9498A5',
    textMuted: '#6E7280',
    accent: '#8B5CF6',
    accentSoft: 'rgba(139,92,246,0.14)',
    success: '#22C55E',
    successSoft: 'rgba(34,197,94,0.12)',
    warning: '#F59E0B',
    warningSoft: 'rgba(245,158,11,0.12)',
    danger: '#EF4444',
    dangerSoft: 'rgba(239,68,68,0.12)',
    info: '#3B82F6',
    infoSoft: 'rgba(59,130,246,0.12)',
} as const;

/** Status tone → palette color (functions sirf tone dete hain). */
export const toneColors = (tone: 'success' | 'warning' | 'info' | 'danger' | 'neutral') => {
    switch (tone) {
        case 'success':
            return { color: BookingDetailPalette.success, soft: BookingDetailPalette.successSoft };
        case 'warning':
            return { color: BookingDetailPalette.warning, soft: BookingDetailPalette.warningSoft };
        case 'danger':
            return { color: BookingDetailPalette.danger, soft: BookingDetailPalette.dangerSoft };
        case 'info':
            return { color: BookingDetailPalette.info, soft: BookingDetailPalette.infoSoft };
        default:
            return { color: BookingDetailPalette.textSecondary, soft: BookingDetailPalette.surfaceAlt };
    }
};

export default BookingDetailPalette;
