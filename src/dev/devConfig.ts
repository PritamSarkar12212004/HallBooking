import {
    readStorage,
    writeStorage,
} from '../manager/storage/storageManager';

export const DEV_TOOLS_KEY = 'DEV_DEVTOOLS_ENABLED';

export interface DevConfig {
    // Master switch. Set to false to fully disable ALL dev tools — even in dev
    // builds. In production/release, __DEV__ is false so this is always off.
    ENABLED: boolean;
    // Default state for the auto-fill tool when nothing is saved yet.
    DEFAULT_AUTOFILL_ENABLED: boolean;
}

export const devConfig: DevConfig = {
    ENABLED: __DEV__,
    DEFAULT_AUTOFILL_ENABLED: true,
};

// Reads the runtime on/off state (falls back to devConfig default).
export const isDevToolsEnabled = (): boolean => {
    if (!devConfig.ENABLED) return false;
    const stored = readStorage({ key: DEV_TOOLS_KEY });
    if (stored === null) return devConfig.DEFAULT_AUTOFILL_ENABLED;
    return stored === 'true';
};

// Persists the runtime on/off state via MMKV.
export const setDevToolsEnabled = (enabled: boolean): void => {
    writeStorage({ key: DEV_TOOLS_KEY, data: enabled ? 'true' : 'false' });
};