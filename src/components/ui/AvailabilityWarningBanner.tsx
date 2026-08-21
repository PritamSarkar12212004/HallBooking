import React from 'react';
import { View, Text } from '../../lib/style/withTailwind';
import { AlertTriangle } from 'lucide-react-native';

interface AvailabilityWarningBannerProps {
    message: string;
}

const AvailabilityWarningBanner = ({ message }: AvailabilityWarningBannerProps) => {
    return (
        <View
            className="flex-row items-center gap-3 px-4 py-3 rounded-xl mb-4"
            style={{ backgroundColor: '#FEE2E2', borderWidth: 1, borderColor: '#FCA5A5' }}
        >
            <AlertTriangle size={20} color="#DC2626" />
            <Text className="text-[#DC2626] text-sm font-medium flex-1">{message}</Text>
        </View>
    );
};

export default AvailabilityWarningBanner;