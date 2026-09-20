import React from 'react';
import { Linking } from 'react-native';
import {
    Building2,
    CreditCard,
    IdCard,
    Mail,
    MapPin,
    Phone,
    User,
} from 'lucide-react-native';

import { Image, Text, TouchableOpacity, View } from '../../../lib/style/withTailwind';
import { BookingDetailPalette as P } from '../../../const/theme/bookingDetailPalette';
import type { ApplicantInfo } from '../../../functions/booking/BookingDetailFunction';
import { DetailCard, DetailRow, SectionHeading, SectionStepHeader } from './DetailPrimitives';

interface Props {
    applicant: ApplicantInfo;
    onPreview: (uri?: string | null) => void;
}

const CircleAction = ({
    icon,
    label,
    onPress,
    tone = P.accent,
}: {
    icon: React.ReactNode;
    label: string;
    onPress: () => void;
    tone?: string;
}) => (
    <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        className="flex-row items-center justify-center rounded-xl px-3.5 py-2.5"
        style={{ backgroundColor: `${tone}22`, borderWidth: 1, borderColor: tone, gap: 6 }}
    >
        {icon}
        <Text className="text-xs font-bold" style={{ color: tone }}>
            {label}
        </Text>
    </TouchableOpacity>
);

/**
 * Section 2 — Applicant.
 *
 * Pehle sab rows ek hi card me the aur mobile/email par kuch kar nahi sakte the.
 * Ab upar avatar ke saath bada naam, aur mobile/email par direct Call / Mail.
 */
const ApplicantSection = ({ applicant, onPreview }: Props) => {
    const callApplicant = () => {
        if (applicant.mobile) Linking.openURL(`tel:${applicant.mobile}`);
    };

    const mailApplicant = () => {
        if (applicant.email) Linking.openURL(`mailto:${applicant.email}`);
    };

    return (
        <>
            <SectionStepHeader
                index={2}
                title="Applicant"
                subtitle="Contact, address aur ID proof"
            />

            {/* Identity header */}
            <View
                className="rounded-2xl p-4 mb-4 flex-row items-center"
                style={{
                    backgroundColor: P.surface,
                    borderWidth: 1,
                    borderColor: P.border,
                }}
            >
                <View
                    className="w-14 h-14 rounded-2xl items-center justify-center mr-3.5"
                    style={{ backgroundColor: P.accentSoft, borderWidth: 1, borderColor: P.accent }}
                >
                    <Text className="text-lg font-extrabold" style={{ color: P.accent }}>
                        {applicant.initials}
                    </Text>
                </View>

                <View className="flex-1">
                    <Text
                        className="text-lg font-extrabold"
                        style={{ color: P.textPrimary }}
                        numberOfLines={2}
                    >
                        {applicant.name}
                    </Text>
                    <View className="flex-row items-center mt-1" style={{ gap: 5 }}>
                        <Building2 size={12} color={P.textMuted} />
                        <Text className="text-xs" style={{ color: P.textSecondary }}>
                            {applicant.organization || 'Organization set nahi'}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Quick actions */}
            <View className="flex-row mb-4" style={{ gap: 10 }}>
                <CircleAction
                    icon={<Phone size={14} color={applicant.mobile ? P.success : P.textMuted} />}
                    label={applicant.mobile ? 'Call' : 'No number'}
                    tone={applicant.mobile ? P.success : P.textMuted}
                    onPress={callApplicant}
                />
                <CircleAction
                    icon={<Mail size={14} color={applicant.email ? P.info : P.textMuted} />}
                    label={applicant.email ? 'Email' : 'No email'}
                    tone={applicant.email ? P.info : P.textMuted}
                    onPress={mailApplicant}
                />
            </View>

            <SectionHeading
                icon={<User size={16} color={P.accent} />}
                title="Contact Details"
            />

            <DetailCard>
                <DetailRow
                    icon={<Phone size={14} color={P.textSecondary} />}
                    label="Mobile"
                    value={applicant.mobile}
                    onPress={applicant.mobile ? callApplicant : undefined}
                />
                <DetailRow
                    icon={<Mail size={14} color={P.textSecondary} />}
                    label="Email"
                    value={applicant.email}
                    onPress={applicant.email ? mailApplicant : undefined}
                />
                <DetailRow
                    icon={<Building2 size={14} color={P.textSecondary} />}
                    label="Organization"
                    value={applicant.organization}
                />
                <DetailRow
                    icon={<MapPin size={14} color={P.textSecondary} />}
                    label="Address"
                    value={applicant.address}
                    last
                />
            </DetailCard>

            <SectionHeading
                icon={<IdCard size={16} color={P.accent} />}
                title="ID Proof"
            />

            <DetailCard>
                {applicant.hasGovernmentId ? (
                    <>
                        <DetailRow
                            icon={<CreditCard size={14} color={P.textSecondary} />}
                            label="ID type"
                            value={applicant.governmentIdLabel}
                        />
                        <DetailRow
                            icon={<IdCard size={14} color={P.textSecondary} />}
                            label="ID number"
                            value={applicant.governmentIdNumber}
                            last={!applicant.governmentIdPhoto}
                        />

                        {applicant.governmentIdPhoto ? (
                            <TouchableOpacity
                                activeOpacity={0.9}
                                onPress={() => onPreview(applicant.governmentIdPhoto)}
                                className="rounded-xl overflow-hidden mt-1"
                                style={{ borderWidth: 1, borderColor: P.border }}
                            >
                                <Image
                                    source={{ uri: applicant.governmentIdPhoto }}
                                    style={{ width: '100%', height: 170 }}
                                    resizeMode="cover"
                                />
                                <Text
                                    className="text-[10px] text-center py-2"
                                    style={{ color: P.textMuted, backgroundColor: P.surfaceAlt }}
                                >
                                    Tap to view full screen
                                </Text>
                            </TouchableOpacity>
                        ) : (
                            <Text className="text-[11px] mt-1" style={{ color: P.textMuted }}>
                                ID ka photo attached nahi hai.
                            </Text>
                        )}
                    </>
                ) : (
                    <Text className="text-xs" style={{ color: P.textMuted }}>
                        Is booking me koi ID proof record nahi hua.
                    </Text>
                )}
            </DetailCard>
        </>
    );
};

export default ApplicantSection;
