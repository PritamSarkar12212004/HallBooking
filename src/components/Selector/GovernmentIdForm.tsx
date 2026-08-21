import React from 'react';
import {
    Camera,
    Check,
    CreditCard,
    FileText,
    IdCard,
    Image as ImageIcon,
    Trash2,
    UserRound,
} from 'lucide-react-native';

import { Image } from 'react-native';

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

    photo: any | null;
    onCapturePhoto: () => void;
    onSelectPhoto: () => void;
    onRemovePhoto: () => void;
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
    photo,
    onCapturePhoto,
    onSelectPhoto,
    onRemovePhoto,
}: GovernmentIdFormProps) => {

    return (
        <View className="mb-6">

            {/* Header */}
            <Text className="text-white text-base font-semibold mb-1">
                Government ID Proof *
            </Text>

            <Text className="text-[#8F8B91] text-xs mb-4">
                Select any one valid government ID
            </Text>

            {/* Government IDs */}
            <View className="gap-2">

                {idOptions.map(({ label, icon: Icon }) => {

                    const isSelected = selectedId === label;

                    return (
                        <TouchableOpacity
                            key={label}
                            activeOpacity={0.8}
                            onPress={() => onSelectId(label)}
                            className="flex-row items-center rounded-xl px-4"
                            style={{
                                minHeight: 54,
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

            {/* Photo */}
            <Text className="text-white text-sm font-semibold mt-5 mb-3">
                ID Photo *
            </Text>

            {photo?.uri ? (

                /* Preview */
                <View
                    className="rounded-xl overflow-hidden"
                    style={{
                        backgroundColor:
                            Theme.background.secondary,
                        borderWidth: 1,
                        borderColor: Theme.button.primary,
                    }}
                >

                    <Image
                        source={{ uri: photo.uri }}
                        style={{
                            width: '100%',
                            height: 190,
                        }}
                        resizeMode="cover"
                    />

                    <View className="flex-row gap-2 p-3">

                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={onCapturePhoto}
                            className="flex-1 flex-row items-center justify-center rounded-lg py-3"
                            style={{
                                backgroundColor:
                                    Theme.button.primary,
                            }}
                        >
                            <Camera
                                size={17}
                                color="#000"
                            />

                            <Text className="ml-2 font-semibold text-black">
                                Retake
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={onRemovePhoto}
                            className="flex-row items-center justify-center rounded-lg px-4 py-3"
                            style={{
                                backgroundColor: '#3A2020',
                            }}
                        >
                            <Trash2
                                size={17}
                                color="#FF6B6B"
                            />
                        </TouchableOpacity>

                    </View>

                </View>

            ) : (

                /* Camera / Gallery */
                <View className="flex-row gap-3">

                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={onCapturePhoto}
                        className="flex-1 items-center justify-center rounded-xl py-5"
                        style={{
                            backgroundColor:
                                Theme.background.secondary,
                            borderWidth: 1,
                            borderColor:
                                Theme.button.primary,
                        }}
                    >

                        <Camera
                            size={24}
                            color={Theme.button.primary}
                        />

                        <Text
                            className="font-semibold mt-2"
                            style={{
                                color: Theme.button.primary,
                            }}
                        >
                            Camera
                        </Text>

                    </TouchableOpacity>

                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={onSelectPhoto}
                        className="flex-1 items-center justify-center rounded-xl py-5"
                        style={{
                            backgroundColor:
                                Theme.background.secondary,
                            borderWidth: 1,
                            borderColor: '#4D5564',
                        }}
                    >

                        <ImageIcon
                            size={24}
                            color="#8F8B91"
                        />

                        <Text className="text-[#8F8B91] font-semibold mt-2">
                            Gallery
                        </Text>

                    </TouchableOpacity>

                </View>

            )}

        </View>
    );
};

export default GovernmentIdForm;