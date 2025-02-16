import React from 'react';

export const Alert = ({ children, variant = 'error' }) => {
    const styles = {
        error: 'bg-red-100 text-red-700',
        warning: 'bg-yellow-100 text-yellow-700',
        success: 'bg-green-100 text-green-700',
    };
    return (
        <div className={`p-4 rounded ${styles[variant]}`}>
            {children}
        </div>
    );
};

export const AlertDescription = ({ children }) => <p>{children}</p>;
