import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import FastImage from 'react-native-fast-image';
import { Phone, UserRound } from 'lucide-react-native';
import { Text, TouchableOpacity, View } from '../../../lib/style/withTailwind';
import { Theme } from '../../../const/theme/Theme';
import { applicantListInterface } from '../../../interface/api/applicantInterface';

const STATUS_COLORS: Record<string, string> = {
    Ongoing: '#4ADE80',
    Confirmed: '#4ADE80',
    Pending: '#FBBF24',
    Draft: '#8F8B91',
    Ended: '#60A5FA',
    Cancelled: '#FF6B6B',
};

const initialsOf = (name: string) =>
    (name || '')
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0))
        .join('')
        .toUpperCase();

/**
 * Single applicant row: photo, name and phone number are the primary
 * information; booking counts and the latest status give quick context.
 */
const ApplicantListCard = React.memo(({
    item,
    callPress,
}: {
    item: applicantListInterface;
    callPress: (item: applicantListInterface) => void;
}) => {
    const [imageFailed, setImageFailed] = useState(false);
    const showImage = Boolean(item.image) && !imageFailed;
    const initials = initialsOf(item.name);
    const statusColor = STATUS_COLORS[item.latestStatus] || Theme.text.tertiary;
    const hasPhone = Boolean(item.mobile);
    const secondaryLine = item.organization || item.latestEventName || 'Not provided';

    return (
        <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => callPress(item)}
            className="flex-row items-center rounded-2xl p-3 mb-3"
            style={{ backgroundColor: Theme.background.secondary }}
        >
            {/* Photo (falls back to initials when the applicant has none) */}
            <View
                className="items-center justify-center rounded-2xl overflow-hidden"
                style={{
                    width: 56,
                    height: 56,
                    backgroundColor: Theme.background.third,
                }}
            >
                {showImage ? (
                    <FastImage
                        source={{ uri: item.image }}
                        resizeMode={FastImage.resizeMode.cover}
                        onError={() => setImageFailed(true)}
                        style={StyleSheet.absoluteFill as any}
                    />
                ) : initials ? (
                    <Text className="text-lg font-extrabold" style={{ color: Theme.button.primary }}>
                        {initials}
                    </Text>
                ) : (
                    <UserRound size={24} color={Theme.text.tertiary} />
                )}
            </View>

            <View className="flex-1 ml-3">
                <View className="flex-row items-center justify-between">
                    <Text
                        className="flex-1 text-[15px] font-bold mr-2"
                        style={{ color: Theme.text.primary }}
                        numberOfLines={1}
                    >
                        {item.name}
                    </Text>
                    <View
                        className="px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: Theme.background.third }}
                    >
                        <Text
                            className="text-[10px] font-bold"
                            style={{ color: Theme.text.secondary }}
                        >
                            {item.totalBookings} {item.totalBookings === 1 ? 'booking' : 'bookings'}
                        </Text>
                    </View>
                </View>

                {/* Phone number */}
                <View className="flex-row items-center mt-1.5">
                    <Phone size={13} color={hasPhone ? Theme.button.primary : Theme.text.tertiary} />
                    <Text
                        className="text-[13px] font-semibold ml-1.5"
                        style={{ color: hasPhone ? Theme.text.primary : Theme.text.tertiary }}
                        numberOfLines={1}
                    >
                        {hasPhone ? item.mobile : 'No phone number'}
                    </Text>
                </View>

                <View className="flex-row items-center justify-between mt-1.5">
                    <Text
                        className="flex-1 text-[11px] mr-2"
                        style={{ color: Theme.text.tertiary }}
                        numberOfLines={1}
                    >
                        {secondaryLine}
                    </Text>
                    {item.latestStatus ? (
                        <View className="flex-row items-center">
                            <View
                                style={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: 3,
                                    backgroundColor: statusColor,
                                }}
                            />
                            <Text
                                className="text-[10px] font-semibold ml-1"
                                style={{ color: statusColor }}
                            >
                                {item.latestStatus}
                            </Text>
                        </View>
                    ) : null}
                </View>
            </View>
        </TouchableOpacity>
    );
});

export default ApplicantListCard;