
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import ErrorFallback from './ErrorFallback';

interface ErrorWrapperProps {
    children: React.ReactNode;
}

const ErrorWrapper = ({ children }: ErrorWrapperProps) => {
    // `error` react-error-boundary me `unknown` aata hai — pehle narrow karte hain.
    const handleError = (error: unknown, info: React.ErrorInfo) => {
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
