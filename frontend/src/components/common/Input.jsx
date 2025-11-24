import React from 'react';
import PropTypes from 'prop-types';

const Input = React.forwardRef(({
    label,
    type = 'text',
    error,
    className = '',
    id,
    ...props
}, ref) => {
    const inputId = id || props.name || Math.random().toString(36).substr(2, 9);

    return (
        <div className="w-full">
            {label && (
                <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
            )}
            <input
                ref={ref}
                id={inputId}
                type={type}
                className={`
          block w-full rounded-md border-gray-300 shadow-sm 
          focus:border-primary-500 focus:ring-primary-500 sm:text-sm
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${error ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500' : ''}
          ${className}
        `}
                {...props}
            />
            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

Input.propTypes = {
    label: PropTypes.string,
    type: PropTypes.string,
    error: PropTypes.string,
    className: PropTypes.string,
    id: PropTypes.string,
    name: PropTypes.string,
};

export default Input;
