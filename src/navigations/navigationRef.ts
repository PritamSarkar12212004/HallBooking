import { createNavigationContainerRef } from '@react-navigation/native';

import { route } from '../const/routes/route';

export const navigationRef = createNavigationContainerRef<any>();

export const resetToLogin = (): boolean => {
    if (!navigationRef.isReady()) {
        return false;
    }

    navigationRef.reset({
        index: 0,
        routes: [{ name: route.login }],
    });

    return true;
};

export default navigationRef;
