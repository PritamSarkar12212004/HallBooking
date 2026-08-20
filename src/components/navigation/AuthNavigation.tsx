import React from 'react'
import { TouchableOpacity, View } from '../../lib/style/withTailwind';
import { ArrowLeft } from 'lucide-react-native';
import { Theme } from '../../const/theme/Theme';

const AuthNavigation = ({ need = true, navigation }: { need: boolean; navigation: any }) => {
    return (
        <View className="w-full flex items-start">
            {
                need ? (
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.9}
                        style={{ backgroundColor: Theme.background.secondary }}
                        className="h-12 w-12 flex items-center justify-center rounded-full"
                    >
                        <ArrowLeft color={"white"} />
                    </TouchableOpacity>
                ) : (
                    <View className="h-12 w-12" />
                )
            }
        </View>
    )
}

export default AuthNavigation