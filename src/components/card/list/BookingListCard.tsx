import React from 'react';
import { Image, Text, TouchableOpacity, View } from '../../../lib/style/withTailwind';
import { Theme } from '../../../const/theme/Theme';
import { bookingListInterface } from '../../../interface/api/bookintInterface';
import { Calendar, Clock, User, IndianRupee, ChevronRight } from 'lucide-react-native';
import { formatDate, formatTime } from '../../../functions/formate/DateTimeFormate';

interface Props {
    item: bookingListInterface;
    actionPress: any
}

const BookingListCard = React.memo(({ item, actionPress }: Props) => {
    const isPending = (item.balanceAmount || 0) > 0;
    const statusColor = isPending ? '#F59E0B' : '#22C55E';

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => actionPress(item.id)}
            className="rounded-xl overflow-hidden mb-3"
            style={{
                backgroundColor: Theme.background.secondary,
                borderWidth: 1,
                borderColor: Theme.background.third,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 6,
                elevation: 1,
            }}
        >
            <View>
                <Image
                    source={{ uri: item.eventImage }}
                    className="w-full"
                    style={{ aspectRatio: 2 / 1, backgroundColor: Theme.background.third }}
                    resizeMode="cover"
                />

                <View
                    className="absolute top-2 right-2 flex-row items-center px-2 py-0.5 rounded-full"
                    style={{
                        backgroundColor: '#FFFFFF',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.15,
                        shadowRadius: 2,
                        elevation: 2,
                    }}
                >
                    <View
                        style={{
                            width: 5,
                            height: 5,
                            borderRadius: 2.5,
                            backgroundColor: statusColor,
                            marginRight: 4,
                        }}
                    />
                    <Text className="text-[10px] font-bold" style={{ color: '#1F2937' }}>
                        {isPending ? 'Balance Due' : 'Paid'}
                    </Text>
                </View>
            </View>

            <View className="p-3">
                <Text
                    className="text-sm font-bold mb-2"
                    style={{ color: Theme.text.primary }}
                    numberOfLines={1}
                >
                    {item.eventName}
                </Text>

                {/* Booking taken by */}
                <View className="flex-row items-center mb-1.5">
                    <View
                        className="items-center justify-center rounded-full mr-1.5"
                        style={{ width: 16, height: 16, backgroundColor: Theme.primary }}
                    >
                        <User size={9} color="#FFFFFF" />
                    </View>
                    <Text
                        className="text-xs font-medium"
                        style={{ color: Theme.text.secondary }}
                        numberOfLines={1}
                    >
                        {item.takenBy}
                    </Text>
                </View>

                {/* Date + start & end time */}
                <View className="flex-row items-center mb-2.5">
                    <View
                        className="items-center justify-center rounded-full mr-1.5"
                        style={{ width: 16, height: 16, backgroundColor: Theme.primary }}
                    >
                        <Calendar size={9} color="#FFFFFF" />
                    </View>
                    <Text
                        className="text-xs font-medium mr-2.5"
                        style={{ color: Theme.text.secondary }}
                    >
                        {formatDate(item.startDate)}
                    </Text>

                    <View
                        className="items-center justify-center rounded-full mr-1.5"
                        style={{ width: 16, height: 16, backgroundColor: Theme.primary }}
                    >
                        <Clock size={9} color="#FFFFFF" />
                    </View>
                    <Text
                        className="text-xs font-medium"
                        style={{ color: Theme.text.secondary }}
                    >
                        {formatTime(item.startTime)}
                        {item.endTime ? ` - ${formatTime(item.endTime)}` : ''}
                    </Text>
                </View>

                {/* Amounts */}
                <View className="flex-row" style={{ gap: 8 }}>
                    <View
                        className="flex-1 rounded-lg px-2.5 py-2"
                        style={{ backgroundColor: Theme.background.third }}
                    >
                        <View className="flex-row items-center mb-1">
                            <View
                                className="items-center justify-center rounded-full mr-1"
                                style={{ width: 15, height: 15, backgroundColor: Theme.text.secondary }}
                            >
                                <IndianRupee size={8} color="#FFFFFF" />
                            </View>
                            <Text
                                className="text-[10px] font-semibold"
                                style={{ color: Theme.text.secondary }}
                            >
                                Total
                            </Text>
                        </View>
                        <Text
                            className="text-sm font-extrabold"
                            style={{ color: Theme.text.primary }}
                        >
                            ₹{(item.totalAmount || 0).toLocaleString()}
                        </Text>
                    </View>

                    <View
                        className="flex-1 rounded-lg px-2.5 py-2"
                        style={{ backgroundColor: `${statusColor}15` }}
                    >
                        <View className="flex-row items-center mb-1">
                            <View
                                className="items-center justify-center rounded-full mr-1"
                                style={{ width: 15, height: 15, backgroundColor: statusColor }}
                            >
                                <IndianRupee size={8} color="#FFFFFF" />
                            </View>
                            <Text
                                className="text-[10px] font-semibold"
                                style={{ color: statusColor }}
                            >
                                Balance
                            </Text>
                        </View>
                        <View className="flex-row items-center justify-between">
                            <Text
                                className="text-sm font-extrabold"
                                style={{ color: statusColor }}
                            >
                                ₹{(item.balanceAmount || 0).toLocaleString()}
                            </Text>
                            <ChevronRight size={13} color={statusColor} />
                        </View>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
});

export default BookingListCard;