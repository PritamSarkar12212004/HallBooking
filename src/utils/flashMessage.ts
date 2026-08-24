import { showMessage, hideMessage } from 'react-native-flash-message';

export const flashSuccess = (
    message: string,
    description?: string,
) => {
    showMessage({
        message,
        description,
        type: 'success',
        icon: 'success',
        floating: true,
        duration: 2500,
        animated: true,
    });
};

export const flashError = (
    message: string,
    description?: string,
) => {
    showMessage({
        message,
        description,
        type: 'danger',
        icon: 'danger',
        floating: true,
        duration: 3000,
        animated: true,
    });
};

export const flashWarning = (
    message: string,
    description?: string,
) => {
    showMessage({
        message,
        description,
        type: 'warning',
        icon: 'warning',
        floating: true,
        duration: 2500,
        animated: true,
    });
};

export const flashInfo = (
    message: string,
    description?: string,
) => {
    showMessage({
        message,
        description,
        type: 'info',
        icon: 'info',
        floating: true,
        duration: 2500,
        animated: true,
    });
};

export const hideFlash = () => {
    hideMessage();
};