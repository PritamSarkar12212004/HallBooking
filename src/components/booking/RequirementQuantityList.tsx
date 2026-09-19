import React from 'react';
import { Minus, Plus } from 'lucide-react-native';

import { Theme } from '../../const/theme/Theme';
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from '../../lib/style/withTailwind';
import {
  MAX_REQUIREMENT_QUANTITY,
  getRequirementQuantityError,
  sanitizeRequirementQuantity,
} from '../../functions/booking/EventFormFunction';

export interface RequirementQuantityItem {
  label: string;
  value: string;
}

type RequirementQuantityListProps = {
  /** Sirf selected requirements — jo select karega usi ka quantity input. */
  items: RequirementQuantityItem[];
  onChangeQuantity: (label: string, text: string) => void;
  /** Next dabane ke baad missing quantities highlight hoti hain. */
  showErrors?: boolean;
};

/** Ek tap me ±1 — chhote numbers ke liye tez. */
const step = (value: string, delta: number): string => {
  const current = Number(sanitizeRequirementQuantity(value)) || 0;
  const next = Math.min(Math.max(current + delta, 0), MAX_REQUIREMENT_QUANTITY);

  return sanitizeRequirementQuantity(String(next));
};

const RequirementQuantityList = ({
  items,
  onChangeQuantity,
  showErrors = false,
}: RequirementQuantityListProps) => {
  if (items.length === 0) {
    return null;
  }

  return (
    <View className="mb-6">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-white text-sm font-semibold">
          Requirement Quantities *
        </Text>
        <Text className="text-[#8F8B91] text-xs">
          {items.length} selected
        </Text>
      </View>

      <View className="gap-2">
        {items.map(({ label, value }) => {
          const error = getRequirementQuantityError(value, showErrors);

          return (
            <View
              key={label}
              className="rounded-xl px-3 py-3"
              style={{
                backgroundColor: Theme.background.secondary,
                borderWidth: 1,
                borderColor: error ? '#7F1D1D' : Theme.border.primary,
              }}
            >
              <Text
                className="text-sm font-medium mb-2"
                style={{ color: Theme.text.primary }}
              >
                {label}
              </Text>

              <View className="flex-row items-center">
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => onChangeQuantity(label, step(value, -1))}
                  className="w-10 h-10 rounded-lg items-center justify-center"
                  style={{ backgroundColor: Theme.background.third }}
                >
                  <Minus size={16} color={Theme.text.primary} />
                </TouchableOpacity>

                <TextInput
                  className="flex-1 mx-3 py-2 text-center text-white text-base font-semibold rounded-lg"
                  style={{
                    backgroundColor: Theme.background.primary,
                    borderWidth: 1,
                    borderColor: Theme.border.primary,
                  }}
                  value={value}
                  onChangeText={(text) =>
                    onChangeQuantity(label, sanitizeRequirementQuantity(text))
                  }
                  placeholder="0"
                  placeholderTextColor="#8F8B91"
                  keyboardType="numeric"
                  maxLength={5}
                />

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => onChangeQuantity(label, step(value, 1))}
                  className="w-10 h-10 rounded-lg items-center justify-center"
                  style={{ backgroundColor: Theme.background.third }}
                >
                  <Plus size={16} color={Theme.text.primary} />
                </TouchableOpacity>
              </View>

              {error ? (
                <Text className="text-xs mt-2" style={{ color: '#FF6B6B' }}>
                  {error}
                </Text>
              ) : null}
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default RequirementQuantityList;