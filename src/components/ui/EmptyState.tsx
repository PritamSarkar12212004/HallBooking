import React from 'react';
import { View, Text } from '../../lib/style/withTailwind';
import { Inbox } from 'lucide-react-native';

interface EmptyStateProps {
    title: string;
    message?: string;
}

const EmptyState = ({ title, message }: EmptyStateProps) => {
    return (
        <View className="items-center justify-center py-12 px-6">
            <View className="w-16 h-16 rounded-full items-center justify-center mb-4" style={{ backgroundColor: '#29282A' }}>
                <Inbox size={28} color="#8F8B91" />
            </View>
            <Text className="text-white text-base font-semibold text-center">{title}</Text>
            {message && (
                <Text className="text-[#8F8B91] text-sm text-center mt-2">{message}</Text>
            )}
        </View>
    );
};

export default EmptyState;