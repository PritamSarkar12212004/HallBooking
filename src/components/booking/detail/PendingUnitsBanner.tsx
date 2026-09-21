import React from 'react';
import { TriangleAlert } from 'lucide-react-native';

import { Text, TouchableOpacity, View } from '../../../lib/style/withTailwind';
import { BookingDetailPalette as P } from '../../../const/theme/bookingDetailPalette';
import type { UnitIssue } from '../../../functions/booking/BookingDetailFunction';

interface Props {
    issues: UnitIssue[];
    /** CEO ke view me action nahi hota (sirf info) — isliye optional. */
    onFixUnits?: () => void;
}

/**
 * Screen ke sabse upar wala warning — unit add hai par current reading/rate
 * nahi.
 *
 * Ek hi screen par saara detail hai, isliye ye banner upar rakha hai taake
 * user ko scroll kiye bina hi pata chal jaaye ki kya karna bacha hai aur
 * Finalize Event kyun locked hai.
 */
const PendingUnitsBanner = ({ issues, onFixUnits }: Props) => {
    if (issues.length === 0) return null;

    return (
        <View
            className="rounded-2xl p-4"
            style={{
                backgroundColor: P.warningSoft,
                borderWidth: 1,
                borderColor: P.warning,
            }}
        >
            <View className="flex-row items-center mb-2" style={{ gap: 8 }}>
                <TriangleAlert size={16} color={P.warning} />
                <Text className="text-sm font-bold" style={{ color: P.warning }}>
                    {issues.length === 1
                        ? '1 unit is incomplete'
                        : `${issues.length} units are incomplete`}
                </Text>
            </View>

            {issues.map(issue => (
                <Text
                    key={`${issue.kind}-${issue.label}`}
                    className="text-xs leading-5"
                    style={{ color: P.textSecondary }}
                >
                    • {issue.message}
                </Text>
            ))}

            <Text className="text-[11px] mt-2" style={{ color: P.textMuted }}>
                Finalize Event stays locked until this is fixed.
            </Text>

            {onFixUnits ? (
                <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={onFixUnits}
                    className="mt-3 rounded-xl py-3 items-center"
                    style={{ backgroundColor: P.warning }}
                >
                    <Text className="text-sm font-bold" style={{ color: '#0B0B0F' }}>
                        Add Current Unit
                    </Text>
                </TouchableOpacity>
            ) : null}
        </View>
    );
};

export default PendingUnitsBanner;
