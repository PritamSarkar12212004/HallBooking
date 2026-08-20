import { createMMKV } from 'react-native-mmkv';
import env from '../const/env/env';

export const mmkv = createMMKV({
    id: env.mmkv.id,
    encryptionKey: env.mmkv.encryptionKey,
});