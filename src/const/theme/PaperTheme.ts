import {
    MD3LightTheme,
    MD3Theme,
} from 'react-native-paper';

export const PaperTheme: MD3Theme = {
    ...MD3LightTheme,

    colors: {
        ...MD3LightTheme.colors,

        primary: '#2563EB',
        onPrimary: '#FFFFFF',

        primaryContainer: '#DBEAFE',
        onPrimaryContainer: '#1E3A8A',

        secondary: '#64748B',
        secondaryContainer: '#E2E8F0',

        background: '#F8FAFC',
        surface: '#FFFFFF',

        surfaceVariant: '#E2E8F0',

        error: '#DC2626',
        errorContainer: '#FEE2E2',

        outline: '#CBD5E1',
    },

    roundness: 12,
};