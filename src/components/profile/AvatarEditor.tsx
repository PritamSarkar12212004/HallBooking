import React from 'react';
import { Image, View, Text, TouchableOpacity, Pressable } from '../../lib/style/withTailwind';
import { Camera, Pencil } from 'lucide-react-native';
import { Theme } from '../../const/theme/Theme';
import { Palette } from './const/profilePalette';

export type ImageSource = { uri: string } | string | null | undefined;

interface AvatarEditorProps {
    source: ImageSource;
    editable?: boolean;
    onEdit: () => void;
    onRemove?: () => void;
}

/**
 * Large avatar preview with an edit (camera) overlay.
 * Memoized: re-renders only when source / editable change.
 */
const AvatarEditor = React.memo(({ source, editable = false, onEdit }: AvatarEditorProps) => {
    const displayUri =
        typeof source === 'string' ? source : (source as { uri?: string } | null)?.uri ?? '';

    return (
        <View className="relative items-center justify-center">
            <View
                className="items-center justify-center rounded-full overflow-hidden"
                style={{
                    width: 132,
                    height: 132,
                    backgroundColor: Palette.surfaceLight,
                    borderWidth: 3,
                    borderColor: Palette.primary,
                }}
            >
                {displayUri ? (
                    <Image source={{ uri: displayUri }} className="w-full h-full" resizeMode="cover" />
                ) : (
                    <View className="items-center justify-center">
                        <Text className="text-5xl font-black" style={{ color: Palette.primary }}>
                            {(source as string)?.slice(0, 1)?.toUpperCase() || '👤'}
                        </Text>
                    </View>
                )}
            </View>

            {editable && (
                <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={onEdit}
                    className="absolute rounded-full items-center justify-center"
                    style={{
                        width: 44,
                        height: 44,
                        bottom: 0,
                        right: 0,
                        backgroundColor: Theme.button.primary,
                    }}
                >
                    <Camera size={20} color="#000" />
                </TouchableOpacity>
            )}
        </View>
    );
});

/**
 * Action sheet for choosing camera vs gallery.
 */
interface ImageSourceSheetProps {
    visible: boolean;
    onCamera: () => void;
    onGallery: () => void;
    onClose: () => void;
}

const ImageSourceSheet = ({ visible = false, onCamera, onGallery, onClose }: ImageSourceSheetProps) => {
    if (!visible) return null;
    return (
        <View className="absolute inset-0 z-50">
            <Pressable className="flex-1 bg-black/60" onPress={onClose} />
            <View
                className="rounded-t-3xl p-6 pb-8"
                style={{ backgroundColor: Palette.surface }}
            >
                <View className="w-10 h-1 rounded-full self-center mb-5" style={{ backgroundColor: Palette.border }} />
                <Text className="text-lg font-bold" style={{ color: Palette.textPrimary }}>Change Profile Photo</Text>
                <Text className="text-xs mt-1 mb-5" style={{ color: Palette.textMuted }}>Choose how you'd like to update your photo.</Text>
                <View className="flex-row gap-3">
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={onCamera}
                        className="flex-1 items-center py-4 rounded-2xl"
                        style={{ backgroundColor: Palette.surfaceLight }}
                    >
                        <Camera size={24} color={Palette.primary} />
                        <Text className="mt-2 text-sm font-semibold" style={{ color: Palette.textPrimary }}>Camera</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={onGallery}
                        className="flex-1 items-center py-4 rounded-2xl"
                        style={{ backgroundColor: Palette.surfaceLight }}
                    >
                        <Pencil size={24} color={Palette.primary} />
                        <Text className="mt-2 text-sm font-semibold" style={{ color: Palette.textPrimary }}>Gallery</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

AvatarEditor.displayName = 'AvatarEditor';
ImageSourceSheet.displayName = 'ImageSourceSheet';
export { AvatarEditor, ImageSourceSheet };