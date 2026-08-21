import {
    MD3DarkTheme,
    MD3Theme,
} from 'react-native-paper';

export const PaperTheme: MD3Theme = {
    ...MD3DarkTheme,

    colors: {
        ...MD3DarkTheme.colors,

        primary: '#F8EFCB',
        onPrimary: '#1A1A1E',

        primaryContainer: '#3A3A40',
        onPrimaryContainer: '#F8EFCB',

        secondary: '#64748B',
        secondaryContainer: '#242428',

        background: '#1A1A1E',
        onBackground: '#FFFFFF',

        surface: '#242428',
        onSurface: '#FFFFFF',

        surfaceVariant: '#2E2E34',
        onSurfaceVariant: '#8F8B91',

        error: '#EF4444',
        errorContainer: '#3F1D1D',

        outline: '#4D5564',
    },

    roundness: 12,
};