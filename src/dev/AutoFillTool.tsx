import React, { useCallback, useRef, useState } from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import {
    Power,
    Wand2,
    X,
} from 'lucide-react-native';
import { Theme } from '../const/theme/Theme';
import {
    devConfig,
    isDevToolsEnabled,
    setDevToolsEnabled,
} from './devConfig';

/**
 * Sample values are cycled across found inputs so each field gets something
 * sensible-looking. Adjust freely — this is dev-only data.
 */
const SAMPLE_VALUES: string[] = [
    'John Doe',
    '9999999999',
    'john.doe@example.com',
    '12 Main Street, Mumbai',
    'TechCorp Pvt Ltd',
    '25',
    'Wedding',
    'Corporate Event',
    'Sound System',
    'Stage',
    'Auto-filled note',
];

// ── React fiber helpers (dev-only) ──────────────────────────────────────
// Finds the fiber object from a host instance. Works on both Paper and
// Fabric because we check the common internal property names.
const getFiber = (node: any): any => {
    if (!node) return null;
    if (node._internalFiberInstanceHandleDEV) return node._internalFiberInstanceHandleDEV;
    if (node._reactInternalInstance) return node._reactInternalInstance;
    const key = Object.keys(node).find((k) => k.startsWith('__reactFiber$'));
    return key ? node[key] : null;
};

const isHostTextInput = (fiber: any): boolean =>
    typeof fiber?.type === 'string' && fiber.type === 'TextInput';

const collectTextInputs = (fiber: any, out: any[] = []): any[] => {
    if (!fiber) return out;
    if (isHostTextInput(fiber)) out.push(fiber);
    if (fiber.child) collectTextInputs(fiber.child, out);
    if (fiber.sibling) collectTextInputs(fiber.sibling, out);
    return out;
};

interface AutoFillToolProps {
    children: React.ReactNode;
}

const AutoFillTool = ({ children }: AutoFillToolProps) => {
    const rootRef = useRef<any>(null);
    const [panelOpen, setPanelOpen] = useState(false);
    const [enabled, setEnabled] = useState<boolean>(isDevToolsEnabled());

    const runFill = useCallback(() => {
        setPanelOpen(false);

        const rootFiber = getFiber(rootRef.current);
        if (!rootFiber) return;

        const inputs = collectTextInputs(rootFiber);
        inputs.forEach((fiber, index) => {
            const instance = fiber?.stateNode;
            if (instance && typeof instance.setNativeProps === 'function') {
                instance.setNativeProps({
                    text: SAMPLE_VALUES[index % SAMPLE_VALUES.length],
                });
            }
        });
    }, []);

    const toggleEnabled = useCallback(() => {
        setEnabled((prev) => {
            const next = !prev;
            setDevToolsEnabled(next);
            if (!next) setPanelOpen(false);
            return next;
        });
    }, []);

    // Fully off in production, or if the master switch is disabled.
    if (!devConfig.ENABLED) {
        return <>{children}</>;
    }

    return (
        <View style={styles.root} ref={rootRef}>
            {children}

            {enabled && (
                <View style={styles.overlay} pointerEvents="box-none">
                    {panelOpen && (
                        <View style={styles.panel}>
                            <View style={styles.panelHeader}>
                                <Wand2 size={16} color={Theme.button.primary} />
                                <Text style={styles.panelTitle}>Dev Auto-fill</Text>
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={() => setPanelOpen(false)}
                                    style={styles.iconButton}
                                >
                                    <X size={16} color="#9CA3AF" />
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                activeOpacity={0.9}
                                onPress={runFill}
                                style={styles.actionBtn}
                            >
                                <Wand2 size={18} color="#000" />
                                <Text style={styles.actionText}>Fill current screen</Text>
                            </TouchableOpacity>

                            <View style={styles.row}>
                                <View>
                                    <Text style={styles.rowTitle}>Auto-fill</Text>
                                    <Text style={styles.rowSub}>Enable the floating tool</Text>
                                </View>
                                <TouchableOpacity
                                    activeOpacity={0.85}
                                    onPress={toggleEnabled}
                                    style={[
                                        styles.switch,
                                        enabled ? styles.switchOn : styles.switchOff,
                                    ]}
                                >
                                    <View
                                        style={[
                                            styles.switchKnob,
                                            enabled ? styles.knobOn : styles.knobOff,
                                        ]}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => setPanelOpen((p) => !p)}
                        style={styles.fab}
                    >
                        <Power size={22} color="#1A1A1E" />
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        paddingRight: 18,
        paddingBottom: 96,
    },
    fab: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: Theme.button.primary,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
        elevation: 8,
    },
    panel: {
        backgroundColor: '#1F2024',
        borderRadius: 16,
        padding: 16,
        marginBottom: 14,
        width: 260,
        borderWidth: 1,
        borderColor: '#2E2E34',
    },
    panelHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    panelTitle: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 15,
        marginLeft: 8,
        flex: 1,
    },
    iconButton: {
        padding: 4,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Theme.button.primary,
        borderRadius: 10,
        paddingVertical: 12,
        marginBottom: 12,
    },
    actionText: {
        color: '#000',
        fontWeight: '700',
        marginLeft: 8,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    rowTitle: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 14,
    },
    rowSub: {
        color: '#8F8B91',
        fontSize: 11,
        marginTop: 2,
    },
    switch: {
        width: 46,
        height: 26,
        borderRadius: 13,
        padding: 3,
        flexDirection: 'row',
    },
    switchOn: {
        backgroundColor: Theme.button.primary,
        justifyContent: 'flex-end',
    },
    switchOff: {
        backgroundColor: '#3A3A40',
        justifyContent: 'flex-start',
    },
    switchKnob: {
        width: 20,
        height: 20,
        borderRadius: 10,
    },
    knobOn: {
        backgroundColor: '#1A1A1E',
    },
    knobOff: {
        backgroundColor: '#8F8B91',
    },
});

export default AutoFillTool;