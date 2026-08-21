import React from 'react';
import { View, Text } from '../../lib/style/withTailwind';
import { Theme } from '../../const/theme/Theme';
import { History } from 'lucide-react-native';

interface ActivityLogItemProps {
    user: string;
    action: string;
    timestamp: string;
    isLast?: boolean;
}

const ActivityLogItem = ({ user, action, timestamp, isLast = false }: ActivityLogItemProps) => {
    return (
        <View className="flex-row">
            {/* Timeline line */}
            <View className="items-center mr-3">
                <View
                    className="w-8 h-8 rounded-full items-center justify-center"
                    style={{ backgroundColor: `${Theme.button.primary}20` }}
                >
                    <History size={14} color={Theme.button.primary} />
                </View>
                {!isLast && (
                    <View className="w-0.5 flex-1 my-1" style={{ backgroundColor: '#29282A' }} />
                )}
            </View>

            {/* Content */}
            <View className="flex-1 pb-4">
                <View className="flex-row items-center justify-between">
                    <Text className="text-white text-sm font-semibold">{user}</Text>
                    <Text className="text-[#8F8B91] text-xs">{timestamp}</Text>
                </View>
                <Text className="text-[#8F8B91] text-sm mt-1">{action}</Text>
            </View>
        </View>
    );
};

export default ActivityLogItem;