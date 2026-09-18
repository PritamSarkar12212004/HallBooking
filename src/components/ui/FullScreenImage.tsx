import React from 'react';
import {
    Image,
    Modal,
    Pressable,
    Text,
    TouchableOpacity,
    View,
} from '../../lib/style/withTailwind';
import { X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface FullScreenImageProps {
    uri?: string | null;
    visible: boolean;
    onClose: () => void;
    /** Optional caption neeche dikhane ke liye (e.g. bank holder name). */
    caption?: string | null;
}

const FullScreenImage = ({
    uri,
    visible,
    onClose,
    caption,
}: FullScreenImageProps) => {
    const insets = useSafeAreaInsets();

    if (!visible || !uri) {
        return null;
    }

    return (
        <Modal
            visible
            transparent={false}
            animationType="fade"
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <View className="flex-1" style={{ backgroundColor: '#000000' }}>
                <Pressable
                    className="flex-1 items-center justify-center"
                    onPress={onClose}
                >
                    <Image
                        source={{ uri }}
                        className="w-full h-full"
                        resizeMode="contain"
                    />
                </Pressable>

                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={onClose}
                    className="absolute right-5 w-10 h-10 rounded-full items-center justify-center"
                    style={{
                        top: insets.top + 12,
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    }}
                >
                    <X size={20} color="#FFFFFF" />
                </TouchableOpacity>

                {caption ? (
                    <View
                        className="absolute left-0 right-0 items-center px-6"
                        style={{ bottom: insets.bottom + 28 }}
                    >
                        <Text
                            className="text-sm font-semibold text-center"
                            style={{ color: '#FFFFFF' }}
                        >
                            {caption}
                        </Text>
                    </View>
                ) : null}
            </View>
        </Modal>
    );
};

export default FullScreenImage;
