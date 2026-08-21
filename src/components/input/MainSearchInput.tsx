import React from 'react'
import { TextInput, View } from '../../lib/style/withTailwind';
import { Theme } from '../../const/theme/Theme';
import { Search } from 'lucide-react-native';

const MainSearchInput = React.memo(({ placeholder, value, setvalue }: {
    placeholder: string;
    value: string
    setvalue: any;
}) => {
    return (
        <View
            className="flex-row items-center rounded-xl px-4 mb-4"
            style={{ backgroundColor: Theme.background.secondary }}
        >
            <Search size={18} color="#8F8B91" />
            <TextInput
                className="flex-1 py-3 px-3 text-white"
                placeholder={placeholder}
                placeholderTextColor="#8F8B91"
                value={value}
                onChangeText={setvalue}
            />
        </View>
    )
})

export default MainSearchInput