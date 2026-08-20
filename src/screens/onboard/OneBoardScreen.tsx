import React from 'react';
import Wrapper from '../../layouts/wraper/Wraper';
import { Text, TouchableOpacity, View } from '../../lib/style/withTailwind';
import { Theme } from '../../const/theme/Theme';
import { route } from '../../const/routes/route';

const OneBoardScreen = ({ navigation }: any) => {
    const onpress = () => {
        navigation.navigate(route.login)
    }
    return (
        <Wrapper paddingHorizontal={0}>
            <View style={{ flex: 1 }}>
                <View
                    style={{
                        flex: 1,
                        width: '100%',
                    }}
                >

                </View>
                <View
                    className="w-full h-[45%] px-4  pt-10 flex items-center justify-between rounded-t-[40px]"
                    style={{
                        backgroundColor: Theme.background.secondary,
                        paddingBottom: 30
                    }}
                >
                    <View className="w-full">
                        {/* Title – larger, extra bold, tight tracking, and tight line height */}
                        <Text className="text-3xl font-extrabold text-white tracking-tight leading-tight mb-3">
                            Book Your Perfect Hall
                        </Text>
                        <Text className="text-base text-white/70 leading-relaxed pr-10">
                            From booking to event day, we handle the details so you can enjoy the moment.
                        </Text>
                    </View>

                    <View className="w-full flex flex-row items-center justify-between">
                        <View className="flex flex-row items-center justify-center gap-1">
                            <View className="h-3 rounded-[5px] w-11" style={{
                                backgroundColor: Theme.background.third
                            }}></View>
                            <View className="h-3 rounded-[5px] w-11" style={{
                                backgroundColor: Theme.button.primary
                            }}></View>
                        </View>
                        <TouchableOpacity activeOpacity={0.9} style={{
                            backgroundColor: Theme.button.primary
                        }}
                            onPress={onpress}
                            className="h-12 w-24 rounded-[25px] flex items-center justify-center"
                        >
                            <Text className="font-semibold">NEXT</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Wrapper>
    );
};

export default OneBoardScreen;