import React from 'react'
import { Text, TouchableOpacity } from '../../lib/style/withTailwind';
import { Theme } from '../../const/theme/Theme';

const CamGalPickerButton = React.memo(({ actionFun, title, Icon }: {
    actionFun: () => void;
    title: string;
    Icon: any

}) => {
    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={actionFun}
            className="flex-1 items-center justify-center rounded-xl py-5"
            style={{
                backgroundColor:
                    Theme.background.secondary,
                borderWidth: 1,
                borderColor:
                    Theme.button.primary,
            }}
        >

            <Icon
                size={24}
                color={Theme.button.primary}
            />

            <Text
                className="font-semibold mt-2"
                style={{
                    color: Theme.button.primary,
                }}
            >
                {title}
            </Text>

        </TouchableOpacity>
    )
}
)
export default CamGalPickerButton