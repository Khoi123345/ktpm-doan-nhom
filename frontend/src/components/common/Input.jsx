import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const Input = React.forwardRef(({
    label,
    type = 'text',
    error,
    className = '',
    id,
    ...props
}, ref) => {
    const inputId = id || props.name || Math.random().toString(36).substr(2, 9);
    const [showPassword, setShowPassword] = useState(false);

    const isPasswordField = type === 'password';
    const inputType = isPasswordField && showPassword ? 'text' : type;

    return (
        <div className="w-full">
            {label && (
                <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
            )}
            <div className="relative">
                <input
                    ref={ref}
                    id={inputId}
                    type={inputType}
                    className={`
              block w-full px-4 py-2 rounded-lg border border-gray-300 shadow-sm 
              focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all sm:text-sm
              disabled:bg-gray-100 disabled:cursor-not-allowed
              ${error ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500' : ''}
              ${isPasswordField ? 'pr-10' : ''}
              ${className}
            `}
                    {...props}
                />
                {isPasswordField && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                        tabIndex={-1}
                    >
                        {showPassword ? (
                            <FiEyeOff className="h-5 w-5" aria-hidden="true" />
                        ) : (
                            <FiEye className="h-5 w-5" aria-hidden="true" />
                        )}
                    </button>
                )}
            </div>
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
