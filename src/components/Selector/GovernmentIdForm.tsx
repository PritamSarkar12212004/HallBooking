import React from 'react';
import {
    Camera,
    Check,
    CreditCard,
    FileText,
    IdCard,
    UserRound,
} from 'lucide-react-native';

import { Theme } from '../../const/theme/Theme';
import {
    Text,
    TouchableOpacity,
    View,
} from '../../lib/style/withTailwind';

type GovernmentIdType =
    | 'Aadhaar Card'
    | 'PAN Card'
    | 'Driving Licence'
    | 'Passport';

type GovernmentIdFormProps = {
    selectedId: GovernmentIdType | null;
    onSelectId: (id: GovernmentIdType) => void;
    onCapturePhoto: () => void;
};

const idOptions: {
    label: GovernmentIdType;
    icon: React.ElementType;
}[] = [
        {
            label: 'Aadhaar Card',
            icon: IdCard,
        },
        {
            label: 'PAN Card',
            icon: CreditCard,
        },
        {
            label: 'Driving Licence',
            icon: FileText,
        },
        {
            label: 'Passport',
            icon: UserRound,
        },
    ];

const GovernmentIdForm = ({
    selectedId,
    onSelectId,
    onCapturePhoto,
}: GovernmentIdFormProps) => {
    return (
        <View className="mb-6">

            {/* Header */}
            <Text className="text-white text-base font-semibold mb-3">
                Government ID Proof *
            </Text>

            <Text className="text-[#8F8B91] text-xs mb-3">
                Select any one valid government ID
            </Text>

            {/* ID Options */}
            <View className="gap-2">

                {idOptions.map(({ label, icon: Icon }) => {

                    const isSelected = selectedId === label;

                    return (
                        <TouchableOpacity
                            key={label}
                            activeOpacity={0.9}
                            onPress={() => onSelectId(label)}
                            className="flex-row items-center rounded-xl px-4 h-13"
                            style={{
                                backgroundColor:
                                    Theme.background.secondary,
                                borderWidth: 1,
                                borderColor: isSelected
                                    ? Theme.button.primary
                                    : '#4D5564',
                            }}
                        >

                            <Icon
                                size={20}
                                color={
                                    isSelected
                                        ? Theme.button.primary
                                        : '#8F8B91'
                                }
                            />

                            <Text
                                className="flex-1 ml-3 text-sm font-medium"
                                style={{
                                    color: isSelected
                                        ? '#FFFFFF'
                                        : '#8F8B91',
                                }}
                            >
                                {label}
                            </Text>

                            {isSelected && (
                                <View
                                    className="w-6 h-6 rounded-full items-center justify-center"
                                    style={{
                                        backgroundColor:
                                            Theme.button.primary,
                                    }}
                                >
                                    <Check
                                        size={14}
                                        color={
                                            Theme.background.primary
                                        }
                                    />
                                </View>
                            )}

                        </TouchableOpacity>
                    );
                })}

            </View>

            {/* Capture Photo */}
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={onCapturePhoto}
                className="flex-row items-center justify-center rounded-xl py-4 mt-4"
                style={{
                    backgroundColor: Theme.background.secondary,
                    borderWidth: 1,
                    borderColor: Theme.button.primary,
                }}
            >

                <Camera
                    size={20}
                    color={Theme.button.primary}
                />

                <Text
                    className="font-semibold ml-2"
                    style={{
                        color: Theme.button.primary,
                    }}
                >
                    Capture Photo
                </Text>

            </TouchableOpacity>

        </View>
    );
};

export default GovernmentIdForm;