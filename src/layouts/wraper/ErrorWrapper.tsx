
import React from 'react';
import {
    ErrorBoundary,
    type FallbackProps,
} from 'react-error-boundary';

import ErrorFallback from './ErrorFallback';

interface ErrorWrapperProps {
    children: React.ReactNode;
}

const ErrorWrapper = ({ children }: ErrorWrapperProps) => {
    const handleError = (error: Error, info: React.ErrorInfo) => {
        console.error('Global Error Boundary:', error);
        console.error('Component Stack:', info.componentStack);
    };

    const handleReset = () => {
        console.log('Error boundary reset');
    };

    return (
        <ErrorBoundary
            FallbackComponent={ErrorFallback}
            onError={handleError}
            onReset={handleReset}
        >
            {children}
        </ErrorBoundary>
    );
};

export default ErrorWrapper;
