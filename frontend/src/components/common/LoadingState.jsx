import React from 'react';
import PropTypes from 'prop-types';
import Loader from './Loader';

const LoadingState = ({ message = 'Đang tải...' }) => {
    return (
        <div className="flex flex-col items-center justify-center py-16">
            <Loader size="lg" />
            <p className="mt-4 text-gray-600">{message}</p>
        </div>
    );
};

LoadingState.propTypes = {
    message: PropTypes.string,
};

export default LoadingState;
