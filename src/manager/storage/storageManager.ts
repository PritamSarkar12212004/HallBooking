import { mmkv } from '../../utils/mmkv';

export const readStorage = ({ key }: { key: string }) => {
    return mmkv.getString(key);
};

export const writeStorage = ({
    key,
    data,
}: {
    key: string;
    data: unknown;
}) => {
    if (typeof data === 'string') {
        mmkv.set(key, data);
    } else {
        mmkv.set(key, JSON.stringify(data));
    }
};

export const removeStorage = ({ key }: { key: string }) => {
    mmkv.remove(key);
};