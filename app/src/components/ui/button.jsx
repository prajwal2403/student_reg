import React from 'react';

export const Button = ({ children, onClick, variant = 'primary', className }) => {
    const baseStyle = 'px-4 py-2 font-medium rounded';
    const styles = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700',
        destructive: 'bg-red-600 text-white hover:bg-red-700',
    };
    return (
        <button onClick={onClick} className={`${baseStyle} ${styles[variant]} ${className}`}>
            {children}
        </button>
    );
};
