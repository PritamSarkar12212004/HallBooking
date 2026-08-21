import React from 'react';
import { View, Text } from '../../lib/style/withTailwind';
import { Theme } from '../../const/theme/Theme';

interface MultiStepFormHeaderProps {
    currentStep: number;
    totalSteps: number;
    title: string;
}

const MultiStepFormHeader = ({ currentStep, totalSteps, title }: MultiStepFormHeaderProps) => {
    const progress = (currentStep / totalSteps) * 100;

    return (
        <View className="mb-6">
            <View className="flex-row items-center justify-between mb-2">
                <Text className="text-white text-lg font-bold">{title}</Text>
                <Text className="text-[#8F8B91] text-sm">
                    Step {currentStep} of {totalSteps}
                </Text>
            </View>
            <View className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: Theme.background.third }}>
                <View
                    className="h-full rounded-full"
                    style={{ backgroundColor: Theme.button.primary, width: `${progress}%` }}
                />
            </View>
        </View>
    );
};

export default MultiStepFormHeader;