import React from 'react';
import { Image, Text, TouchableOpacity, View } from '../../../lib/style/withTailwind';
import { Theme } from '../../../const/theme/Theme';
import { bookingListInterface } from '../../../interface/api/bookintInterface';
import { Calendar, Clock, MapPin, User } from 'lucide-react-native';
import { formatDate, formatTime } from '../../../functions/formate/DateTimeFormate';

interface Props {
    item: bookingListInterface;
    actionPress: any
}

const BookingListCard = React.memo(({ item, actionPress }: Props) => {
    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => actionPress(item.id)}
            className="rounded-2xl overflow-hidden mb-4"
            style={{ backgroundColor: Theme.background.secondary }}
        >
            <Image
                source={{ uri: item.eventImage }}
                className="w-full"
                style={{ height: 160 }}
                resizeMode="cover"
            />

            <View className="p-4">
                <Text
                    className="text-lg font-semibold mb-1.5"
                    style={{ color: Theme.text.primary }}
                    numberOfLines={1}
                >
                    {item.eventName}
                </Text>

                <View className="flex-row items-center mb-3">
                    <MapPin size={14} color={Theme.text.secondary} />
                    <Text
                        className="ml-1.5 text-sm"
                        style={{ color: Theme.text.secondary }}
                        numberOfLines={1}
                    >
                        {item.hallName}
                    </Text>
                </View>

                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                        <Calendar size={14} color={Theme.text.secondary} />
                        <Text
                            className="ml-1.5 text-sm"
                            style={{ color: Theme.text.secondary }}
                        >
                            {formatDate(item.startDate)}
                        </Text>

                        <Clock
                            size={14}
                            color={Theme.text.secondary}
                            style={{ marginLeft: 12 }}
                        />
                        <Text
                            className="ml-1.5 text-sm"
                            style={{ color: Theme.text.secondary }}
                        >
                            {formatTime(item.startTime)}
                        </Text>
                    </View>

                    <View className="flex-row items-center">
                        <User size={14} color={Theme.text.secondary} />
                        <Text
                            className="ml-1.5 text-sm"
                            style={{ color: Theme.text.secondary }}
                            numberOfLines={1}
                        >
                            {item.takenBy}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
});

export default BookingListCard;