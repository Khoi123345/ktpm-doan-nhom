import React from 'react';
import PropTypes from 'prop-types';

const Card = ({ children, className = '', ...props }) => {
    return (
        <div
            className={`bg-white overflow-hidden shadow rounded-lg ${className}`}
            {...props}
        >
            <div className="px-4 py-5 sm:p-6">
                {children}
            </div>
        </div>
    );
};

Card.propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
};

export default Card;
