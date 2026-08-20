import React from 'react'
import { ActivityIndicator, Text, TouchableOpacity } from '../../../lib/style/withTailwind';
import { Theme } from '../../../const/theme/Theme';

const AuthButton = React.memo(
    ({ isValid, handleContinue, loading, title }: {
        isValid: boolean;
        handleContinue: () => void;
        loading: boolean;
        title: string
    }) => {
        return (
            <TouchableOpacity
                disabled={!isValid}
                activeOpacity={0.9}
                onPress={handleContinue}
                className="w-full items-center justify-center rounded-xl"
                style={{
                    backgroundColor: isValid ? Theme.button.primary : Theme.background.secondary,
                    height: 54,
                }}
            >
                {
                    loading ? <ActivityIndicator color={"black"} size={"small"} /> : <Text
                        className="text-base font-bold"
                        style={{ color: isValid ? "black" : 'white' }}
                    >
                        {title}
                    </Text>
                }
            </TouchableOpacity>
        )
    }

)
export default AuthButton