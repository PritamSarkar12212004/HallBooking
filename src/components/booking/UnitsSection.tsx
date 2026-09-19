import React from 'react';
import {
  Camera,
  Gauge,
  ImagePlus,
  IndianRupee,
  Plus,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react-native';
import { Image } from '../../lib/style/withTailwind';

import { Theme } from '../../const/theme/Theme';
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from '../../lib/style/withTailwind';
import {
  addUnitRow,
  removeUnitRow,
  toggleUnitRowIncludeNow,
  updateUnitRowField,
} from '../../functions/booking/UnitsFunction';
import type { UnitRow } from '../../functions/booking/UnitsFunction';

/**
 * Purane imports ke liye wahi naam — actual logic `UnitsFunction.ts` me hai.
 */
export {
  DEFAULT_UNIT_LABELS,
  computeUnitsPaidTotal,
  computeUnitsTotal,
  createDefaultUnitRows,
  createEmptyUnitRow,
  draftItemsToUnitRows,
  hasMeterPhoto,
  isUnitRowValid,
  newUnitRow,
  resolveUnitMeterPhotoUrl,
  setUnitRowPhoto,
  unitRowAmount,
  unitRowsToPayload,
  uploadUnitMeterPhoto,
} from '../../functions/booking/UnitsFunction';
export type { UnitRow } from '../../functions/booking/UnitsFunction';

export interface UnitsSectionProps {
  rows: UnitRow[];
  setRows: React.Dispatch<React.SetStateAction<UnitRow[]>>;

  /* Meter photo (optional — na ho to photo section hide rehta hai) */
  onCapturePhoto?: (row: UnitRow) => void;
  onPickPhoto?: (row: UnitRow) => void;
  onRemovePhoto?: (row: UnitRow) => void;
  /** Jis row ki photo upload chal rahi hai. */
  uploadingRowId?: string | null;
}

/** Chhota pill switch — "abhi reading daal raha hoon?" ke liye. */
const IncludeNowToggle = ({
  value,
  onPress,
}: {
  value: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    activeOpacity={0.8}
    onPress={onPress}
    className="w-12 h-7 rounded-full justify-center px-1"
    style={{
      backgroundColor: value ? Theme.button.primary : Theme.background.third,
      alignItems: value ? 'flex-end' : 'flex-start',
    }}
  >
    <View
      className="w-5 h-5 rounded-full"
      style={{
        backgroundColor: value ? Theme.background.primary : '#8F8B91',
      }}
    />
  </TouchableOpacity>
);

const UnitsSection = ({
  rows,
  setRows,
  onCapturePhoto,
  onPickPhoto,
  onRemovePhoto,
  uploadingRowId = null,
}: UnitsSectionProps) => {
  const changeField = (id: string, field: 'label' | 'perUnit' | 'currentUnit', value: string) =>
    setRows((prev) => updateUnitRowField(prev, id, field, value));

  const toggleIncludeNow = (id: string) =>
    setRows((prev) => toggleUnitRowIncludeNow(prev, id));

  const addRow = () => setRows((prev) => addUnitRow(prev));

  const removeRow = (id: string) => setRows((prev) => removeUnitRow(prev, id));

  return (
    <>
      <View className="flex-row items-center gap-2 mb-1">
        <Gauge size={20} color={Theme.button.primary} />
        <Text className="text-white text-base font-semibold">Units</Text>
      </View>
      <Text className="text-[#8F8B91] text-xs mb-4">
        Per unit rate set karein. Reading abhi daalni ho to toggle ON karein,
        warna handover/update screen par add ho jaayegi.
      </Text>

      <View className="rounded-2xl mb-5">
        {rows.map((row) => (
          <View
            key={row.id}
            className="mb-3 rounded-xl p-3"
            style={{ backgroundColor: Theme.background.third }}
          >
            {/* Label + delete */}
            <View className="flex-row items-center gap-2">
              <TextInput
                className="flex-1 py-2.5 px-3 rounded-xl text-white"
                style={{ backgroundColor: Theme.background.secondary }}
                placeholder="Unit title (e.g. Light, Water)"
                placeholderTextColor="#8F8B91"
                value={row.label}
                onChangeText={(text) => changeField(row.id, 'label', text)}
              />
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => removeRow(row.id)}
                className="w-10 h-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: '#3A2020' }}
              >
                <Trash2 size={16} color="#FF6B6B" />
              </TouchableOpacity>
            </View>

            {/* Per Unit Rate — hamesha set karna hai */}
            <View
              className="rounded-xl px-3 py-2 mt-2.5"
              style={{ backgroundColor: Theme.background.secondary }}
            >
              <Text
                className="text-[10px] mb-1"
                style={{ color: Theme.text.secondary }}
              >
                RATE (PER UNIT) *
              </Text>
              <View className="flex-row items-center">
                <IndianRupee size={12} color="#8F8B91" />
                <TextInput
                  className="flex-1 py-1 px-1 text-white"
                  placeholder="0"
                  placeholderTextColor="#8F8B91"
                  keyboardType="numeric"
                  value={row.perUnit}
                  onChangeText={(text) => changeField(row.id, 'perUnit', text)}
                />
              </View>
            </View>
            {/* Toggle: abhi reading daalni hai ya baad me */}
            <View className="flex-row items-center justify-between mt-3">
              <View className="flex-1 pr-3">
                <Text className="text-white text-xs font-semibold">
                  Current reading abhi daalni hai?
                </Text>
                <Text className="text-[10px] mt-0.5" style={{ color: '#8F8B91' }}>
                  {row.includeNow
                    ? 'Reading + meter photo yahan add karein (photo optional)'
                    : 'Nahi — reading baad me update screen se add hogi'}
                </Text>
              </View>

              <IncludeNowToggle
                value={row.includeNow}
                onPress={() => toggleIncludeNow(row.id)}
              />
            </View>

            {row.includeNow && (
              <>
                {/* Current Meter Reading */}
                <View
                  className="rounded-xl px-3 py-2 mt-2.5"
                  style={{ backgroundColor: Theme.background.secondary }}
                >
                  <Text
                    className="text-[10px] mb-1"
                    style={{ color: Theme.text.secondary }}
                  >
                    CURRENT READING *
                  </Text>
                  <TextInput
                    className="py-1 text-white"
                    placeholder="0"
                    placeholderTextColor="#8F8B91"
                    keyboardType="numeric"
                    value={row.currentUnit}
                    onChangeText={(text) => changeField(row.id, 'currentUnit', text)}
                  />
                </View>
                {/* Meter photo — OPTIONAL (compress + upload) */}
                {(onCapturePhoto || onPickPhoto) && (
                  <View className="mt-2.5">
                    <View className="flex-row items-center justify-between mb-2">
                      <Text
                        className="text-[10px]"
                        style={{ color: Theme.text.secondary }}
                      >
                        METER PHOTO (OPTIONAL)
                      </Text>
                      {uploadingRowId === row.id && (
                        <Text
                          className="text-[10px]"
                          style={{ color: Theme.text.secondary }}
                        >
                          Uploading...
                        </Text>
                      )}
                    </View>

                    {row.meterPhotoUri ? (
                      <View
                        className="rounded-xl overflow-hidden"
                        style={{
                          backgroundColor: Theme.background.secondary,
                          borderWidth: 1,
                          borderColor: Theme.button.primary,
                        }}
                      >
                        <Image
                          source={{ uri: row.meterPhotoUri }}
                          style={{ width: '100%', height: 140 }}
                          resizeMode="cover"
                        />

                        <View className="flex-row items-center justify-end gap-2 p-2">
                          <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => onCapturePhoto?.(row)}
                            className="flex-row items-center px-3 py-2 rounded-lg"
                            style={{ backgroundColor: Theme.background.third }}
                          >
                            <Camera size={14} color={Theme.button.primary} />
                            <Text
                              className="ml-1.5 text-xs font-semibold"
                              style={{ color: Theme.text.primary }}
                            >
                              Retake
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => onRemovePhoto?.(row)}
                            className="flex-row items-center px-3 py-2 rounded-lg"
                            style={{ backgroundColor: '#3A2020' }}
                          >
                            <X size={14} color="#F87171" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <View className="flex-row gap-2">
                        {onCapturePhoto && (
                          <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => onCapturePhoto(row)}
                            className="flex-1 flex-row items-center justify-center py-3 rounded-xl"
                            style={{ backgroundColor: Theme.background.secondary }}
                          >
                            {uploadingRowId === row.id ? (
                              <UploadCloud size={15} color={Theme.button.primary} />
                            ) : (
                              <Camera size={15} color={Theme.button.primary} />
                            )}
                            <Text
                              className="ml-2 text-xs font-semibold"
                              style={{ color: Theme.text.primary }}
                            >
                              Camera
                            </Text>
                          </TouchableOpacity>
                        )}

                        {onPickPhoto && (
                          <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => onPickPhoto(row)}
                            className="flex-1 flex-row items-center justify-center py-3 rounded-xl"
                            style={{ backgroundColor: Theme.background.secondary }}
                          >
                            <ImagePlus size={15} color={Theme.button.primary} />
                            <Text
                              className="ml-2 text-xs font-semibold"
                              style={{ color: Theme.text.primary }}
                            >
                              Gallery
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                  </View>
                )}
              </>
            )}

            {/* Handover note */}
            <View className="mt-2 flex-row items-center gap-1.5">
              <View
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: '#F59E0B' }}
              />
              <Text className="text-[10px]" style={{ color: '#8F8B91' }}>
                Amount handover ke baad calculate hogi
              </Text>
            </View>
          </View>
        ))}

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={addRow}
          className="flex-row items-center justify-center rounded-xl py-3"
          style={{
            borderWidth: 1,
            borderColor: Theme.button.primary,
            borderStyle: 'dashed',
          }}
        >
          <Plus size={16} color={Theme.button.primary} />
          <Text
            className="ml-2 font-semibold text-sm"
            style={{ color: Theme.button.primary }}
          >
            Add Unit
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

export default UnitsSection;