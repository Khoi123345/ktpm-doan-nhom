import React from 'react';
import PropTypes from 'prop-types';

const ErrorState = ({ message, onRetry }) => {
    return (
        <div className="flex flex-col items-center justify-center py-16">
            <div className="text-red-500 mb-4">
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <p className="text-red-600 text-lg font-semibold mb-2">Đã xảy ra lỗi</p>
            <p className="text-gray-600 mb-4">{message}</p>
            {onRetry && (
                <button onClick={onRetry} className="btn-primary">
                    Thử lại
                </button>
            )}
        </div>
    );
};

ErrorState.propTypes = {
    message: PropTypes.string.isRequired,
    onRetry: PropTypes.func,
};

export default ErrorState;
