import React from 'react';
import {
    ChevronLeft,
    ChevronRight,
} from 'lucide-react-native';

import { ActivityIndicator } from 'react-native';

import {
    Text,
    TouchableOpacity,
    View,
} from '../../lib/style/withTailwind';

import { Theme } from '../../const/theme/Theme';

type NavigationButtonGroupProps = {
    onBack: () => void;
    onNext: () => void;

    nextTitle?: string;

    nextDisabled?: boolean;
    nextLoader?: boolean;

    backDisabled?: boolean;
};

const ButtonGroup = React.memo(({
    onBack,
    onNext,
    nextTitle = 'Next',
    nextDisabled = false,
    nextLoader = false,
    backDisabled = false,
}: NavigationButtonGroupProps) => {

    return (
        <View className="flex-row gap-3 mb-4 mt-2">
            <TouchableOpacity
                activeOpacity={0.85}
                disabled={backDisabled}
                onPress={onBack}
                className="flex-1 flex-row items-center justify-center gap-2 rounded-xl h-13"
                style={{
                    backgroundColor:
                        Theme.background.secondary,

                    borderWidth: 1,

                    borderColor:
                        '#4D5564',

                    opacity:
                        backDisabled ? 0.5 : 1,
                }}
            >

                <ChevronLeft
                    size={20}
                    color="#FFFFFF"
                />

                <Text className="font-bold text-white">
                    Back
                </Text>

            </TouchableOpacity>


            {/* NEXT */}
            <TouchableOpacity
                activeOpacity={0.85}
                disabled={nextDisabled || nextLoader}
                onPress={onNext}
                className="flex-1 flex-row items-center justify-center gap-2 rounded-xl h-13"
                style={{
                    backgroundColor:
                        Theme.button.primary,

                    opacity:
                        nextDisabled ? 0.5 : 1,
                }}
            >

                {nextLoader ? (

                    <ActivityIndicator
                        color="black"
                        size="small"
                    />

                ) : (

                    <>
                        <Text
                            className="font-bold"
                            style={{
                                color:
                                    Theme.background.primary,
                            }}
                        >
                            {nextTitle}
                        </Text>

                        <ChevronRight
                            size={20}
                            color={
                                Theme.background.primary
                            }
                        />
                    </>

                )}
            </TouchableOpacity>

        </View>
    );
})

export default ButtonGroup;