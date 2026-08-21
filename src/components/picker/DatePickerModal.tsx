import React from 'react';
import {
  Modal,
  Text,
  TouchableOpacity,
  View,
} from '../../lib/style/withTailwind';
import { BlurView } from '@react-native-community/blur';

import { Theme } from '../../const/theme/Theme';
import {
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react-native';
import MainButton from '../buttons/MainButton';

type DatePickerModalProps = {
  visible: boolean;
  title?: string;
  selectedDay: number | null;
  monthName: string;
  daysInMonth?: number;
  minDay?: number;
  startDay?: number | null;
  endDay?: number | null;
  onClose: () => void;
  onSelectDay: (day: number) => void;
  onConfirm: () => void;
  onPreviousMonth?: () => void;
  onNextMonth?: () => void;
};

const DatePickerModal = ({
  visible,
  title = 'Select Date',
  selectedDay,
  monthName,
  daysInMonth = 31,
  minDay,
  startDay,
  endDay,
  onClose,
  onSelectDay,
  onConfirm,
  onPreviousMonth,
  onNextMonth,
}: DatePickerModalProps) => {

  const days = Array.from(
    { length: daysInMonth },
    (_, i) => i + 1
  );

  const isInRange = (day: number) => {
    if (startDay == null || endDay == null) return false;
    const min = Math.min(startDay, endDay);
    const max = Math.max(startDay, endDay);
    return day > min && day < max;
  };

  const isDisabled = (day: number) => {
    if (minDay == null) return false;
    return day < minDay;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      allowSwipeDismissal
    >
      <View className="flex-1 justify-end">

        {/* Blur backdrop */}
        <BlurView
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          blurType="dark"
          blurAmount={10}
          reducedTransparencyFallbackColor="#000000"
        />

        <View
          className="rounded-t-3xl p-5"
          style={{
            backgroundColor: Theme.background.secondary,
          }}
        >

          {/* Header */}
          <View className="flex-row items-center justify-between mb-4">

            <Text className="text-white text-lg font-bold">
              {title}
            </Text>

            <TouchableOpacity
              onPress={onClose}
              className="w-8 h-8 rounded-full items-center justify-center"
              style={{
                backgroundColor: '#29282A',
              }}
            >
              <X
                size={16}
                color="#8F8B91"
              />
            </TouchableOpacity>

          </View>

          {/* Month navigation */}
          <View className="flex-row items-center justify-between mb-4">

            <TouchableOpacity
              onPress={onPreviousMonth}
              disabled={!onPreviousMonth}
              className="w-8 h-8 rounded-lg items-center justify-center"
              style={{
                backgroundColor: '#29282A',
                opacity: onPreviousMonth ? 1 : 0.5,
              }}
            >
              <ChevronLeft
                size={18}
                color="#8F8B91"
              />
            </TouchableOpacity>

            <Text className="text-white font-bold">
              {monthName}
            </Text>

            <TouchableOpacity
              onPress={onNextMonth}
              disabled={!onNextMonth}
              className="w-8 h-8 rounded-lg items-center justify-center"
              style={{
                backgroundColor: '#29282A',
                opacity: onNextMonth ? 1 : 0.5,
              }}
            >
              <ChevronRight
                size={18}
                color="#8F8B91"
              />
            </TouchableOpacity>

          </View>

          {/* Weekdays */}
          <View className="flex-row mb-2">

            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(
              (day, index) => (
                <View
                  key={index}
                  className="flex-1 items-center"
                >
                  <Text className="text-[#8F8B91] text-xs font-semibold">
                    {day}
                  </Text>
                </View>
              )
            )}

          </View>

          {/* Days */}
          <View className="flex-row flex-wrap">

            {days.map((day) => {

              const isSelected =
                selectedDay === day;

              const disabled = isDisabled(day);

              const inRange = isInRange(day);

              const isStart =
                startDay != null && startDay === day;

              const isEnd =
                endDay != null && endDay === day;

              const isRangeEdge = isStart || isEnd;

              return (
                <TouchableOpacity
                  key={day}
                  onPress={() =>
                    !disabled && onSelectDay(day)
                  }
                  disabled={disabled}
                  className="w-[14.28%] items-center py-2"
                >

                  <View
                    className="w-9 h-9 rounded-full items-center justify-center"
                    style={{
                      backgroundColor:
                        isSelected
                          ? Theme.button.primary
                          : inRange
                            ? `${Theme.button.primary}40`
                            : isRangeEdge
                              ? `${Theme.button.primary}80`
                              : 'transparent',
                      opacity: disabled ? 0.3 : 1,
                    }}
                  >

                    <Text
                      className="text-sm font-medium"
                      style={{
                        color:
                          isSelected || inRange || isRangeEdge
                            ? Theme.background.primary
                            : '#FFFFFF',
                      }}
                    >
                      {day}
                    </Text>

                  </View>

                </TouchableOpacity>
              );
            })}

          </View>
          <MainButton disabled={!selectedDay} title="Confirm Date" actionFunc={onConfirm} />
        </View>
      </View>
    </Modal>
  );
};

export default DatePickerModal;