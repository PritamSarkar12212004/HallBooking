import React from 'react';
import { Gauge, IndianRupee, Lock } from 'lucide-react-native';
import { Image } from '../../lib/style/withTailwind';

import { Theme } from '../../const/theme/Theme';
import { Text, TouchableOpacity, View } from '../../lib/style/withTailwind';
import type { UnitRow } from '../../functions/booking/UnitsFunction';

type LockedUnitsListProps = {
  /** Units screen par set kiye gaye rows — yahan sirf dikhte hain. */
  rows: UnitRow[];
  /** Meter photo thumbnail tap karne par full screen preview. */
  onViewPhoto?: (uri: string) => void;
  /** Heading (default "Units (locked)"). */
  title?: string;
};

/**
 * Units ka read-only view — payment screen (Step5) par.
 *
 * Rate aur meter reading Units screen par set hote hain, isliye yahan koi input
 * nahi hai: sirf label, rate/unit, reading (ya "reading baad me" ka note) aur
 * optional meter photo dikhti hai. Ye component sirf UI hai.
 */
const LockedUnitsList = ({
  rows,
  onViewPhoto,
  title = 'Units (locked)',
}: LockedUnitsListProps) => (
  <>
    <View className="flex-row items-center gap-2 mb-1">
      <Gauge size={20} color={Theme.button.primary} />
      <Text className="text-white text-base font-semibold">{title}</Text>
      <View className="flex-row items-center gap-1 ml-1">
        <Lock size={12} color="#8F8B91" />
        <Text className="text-[10px]" style={{ color: '#8F8B91' }}>
          Locked
        </Text>
      </View>
    </View>
    <Text className="text-[#8F8B91] text-xs mb-3">
Rate and reading are set on the Units screen — this list is read-only.
    </Text>

    <View className="gap-2 mb-5">
      {rows.map((row) => (
        <View
          key={row.id}
          className="rounded-xl p-3"
          style={{ backgroundColor: Theme.background.third }}
        >
          <View className="flex-row items-center justify-between">
            <Text
              className="text-white text-sm font-semibold flex-1"
              numberOfLines={1}
            >
              {row.label}
            </Text>
            <View className="flex-row items-center">
              <IndianRupee size={12} color="#8F8B91" />
              <Text
                className="text-sm font-semibold ml-0.5"
                style={{ color: Theme.button.primary }}
              >
                {row.perUnit || 0}
              </Text>
              <Text className="text-[10px] ml-1" style={{ color: '#8F8B91' }}>
                /unit
              </Text>
            </View>
          </View>

          <View className="flex-row items-center gap-2 mt-2 flex-wrap">
            {row.includeNow && row.currentUnit.trim().length > 0 ? (
              <View
                className="px-2 py-1 rounded-lg"
                style={{ backgroundColor: Theme.background.secondary }}
              >
                <Text className="text-[10px]" style={{ color: Theme.text.secondary }}>
                  Reading: {row.currentUnit}
                </Text>
              </View>
            ) : (
              <View
                className="px-2 py-1 rounded-lg"
                style={{ backgroundColor: Theme.background.secondary }}
              >
                <Text className="text-[10px]" style={{ color: '#F59E0B' }}>
                  Reading to be updated later
                </Text>
              </View>
            )}

            {row.meterPhotoUri ? (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => onViewPhoto?.(row.meterPhotoUri as string)}
                className="flex-row items-center gap-1.5 px-2 py-1 rounded-lg"
                style={{ backgroundColor: Theme.background.secondary }}
              >
                <Image
                  source={{ uri: row.meterPhotoUri }}
                  style={{ width: 28, height: 28, borderRadius: 6 }}
                />
                <Text className="text-[10px]" style={{ color: Theme.text.primary }}>
                  Meter photo
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      ))}
    </View>
  </>
);

export default LockedUnitsList;
