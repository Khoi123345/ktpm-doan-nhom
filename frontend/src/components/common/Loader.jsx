import React from 'react';
import PropTypes from 'prop-types';

const Loader = ({ size = 'md', className = '' }) => {
    const sizes = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12',
        xl: 'h-16 w-16',
    };

    return (
        <div className={`flex justify-center items-center ${className}`}>
            <div
                className={`${sizes[size]} animate-spin rounded-full border-4 border-gray-200 border-t-primary-600`}
                role="status"
            >
                <span className="sr-only">Loading...</span>
            </div>
        </div>
    );
};

Loader.propTypes = {
    size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
    className: PropTypes.string,
};

export default Loader;
