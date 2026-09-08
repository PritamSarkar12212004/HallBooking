import React, { ReactNode } from "react";
import { Theme } from "../../../const/theme/Theme";
import { Text, View } from "../../../lib/style/withTailwind";

export const AuthTopFrame = React.memo(({ title, dis }: {
    title: string;
    dis: string
}) => {
    return <View className="w-full">
        <Text className="text-white text-2xl font-bold leading-tight">
            {title}
        </Text>
        <Text className="text-white/60 text-base mt-3 leading-relaxed">
            {dis}
        </Text>
    </View>
}
)
export const MainFrame = React.memo(({ title, isFocused, dis, input }: {
    title: string;
    isFocused: boolean;
    dis: string;
    input: ReactNode;
}) => {
    return <View className="w-full mt-8 gap-2">
        <Text className="text-white/80 text-sm font-medium">
            {title}
        </Text>
        <View
            className="w-full flex-row items-center rounded-xl px-4"
            style={{
                backgroundColor: Theme.background.secondary,
                borderWidth: 1.5,
                borderColor: isFocused ? '#ffffff' : 'transparent',
                height: 56,
            }}
        >
            <Text className="text-white text-base font-semibold mr-3">
                +91
            </Text>
            <View
                style={{
                    width: 1,
                    height: 22,
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    marginRight: 12,
                }}
            />
            {input}
        </View>

        <Text className="text-white/40 text-xs mt-1">
            {dis}
        </Text>
    </View>
}
)

