import React from "react";
import { Theme } from "../../const/theme/Theme";
import { Text, TouchableOpacity, View } from "../../lib/style/withTailwind";
import { Users, Check } from "lucide-react-native";

type MultiSelectorProps = {
    list: string[];
    value: string[];
    actionFunc: (staff: string) => void;
};

const MultiSelector = ({
    list,
    value,
    actionFunc,
}: MultiSelectorProps) => {
    return (
        <View className="mb-6">
            <View className="flex-row items-center gap-2 mb-3">
                <Users size={18} color={Theme.button.primary} />
                <Text className="text-white font-semibold">
                    Allocate Team
                </Text>

                <Text className="text-[#8F8B91] text-xs">
                    (Multiple select)
                </Text>
            </View>

            <View className="flex-row flex-wrap gap-2">
                {list.map((staff) => {
                    const isSelected = value.includes(staff);
                    return (
                        <RenderItem
                            key={staff}
                            staff={staff}
                            isSelected={isSelected}
                            actionFunc={actionFunc}
                        />
                    );
                })}
            </View>
        </View>
    );
};

export default MultiSelector;


type RenderItemProps = {
    staff: string;
    actionFunc: (staff: string) => void;
    isSelected: boolean;
};

const RenderItem = React.memo(
    ({ staff, actionFunc, isSelected }: RenderItemProps) => {
        return (
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => actionFunc(staff)}
                className="flex-row items-center gap-2 px-4 py-2.5 rounded-full border"
                style={{
                    backgroundColor: isSelected
                        ? Theme.button.primary
                        : "transparent",
                    borderColor: isSelected
                        ? Theme.button.primary
                        : "#4D5564",
                }}
            >
                {isSelected && (
                    <Check
                        size={14}
                        color={Theme.background.primary}
                    />
                )}

                <Text
                    className="text-sm font-medium"
                    style={{
                        color: isSelected
                            ? Theme.background.primary
                            : "#8F8B91",
                    }}
                >
                    {staff}
                </Text>
            </TouchableOpacity>
        );
    }
);