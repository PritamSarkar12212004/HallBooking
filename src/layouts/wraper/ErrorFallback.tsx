import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { getErrorMessage } from 'react-error-boundary';

interface ErrorFallbackProps {
    error: unknown;
    resetErrorBoundary: () => void;
}

const ErrorFallback = ({
    error,
    resetErrorBoundary,
}: ErrorFallbackProps) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                Something went wrong 😕
            </Text>

            <Text style={styles.message}>
                {getErrorMessage(error)}
            </Text>

            <TouchableOpacity
                activeOpacity={0.8}
                style={styles.button}
                onPress={resetErrorBoundary}
            >
                <Text style={styles.buttonText}>
                    Try Again
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        backgroundColor: '#fff',
    },

    title: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 12,
        textAlign: 'center',
    },

    message: {
        fontSize: 14,
        lineHeight: 21,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
    },

    button: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: '#000',
    },

    buttonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
});

export default ErrorFallback;
