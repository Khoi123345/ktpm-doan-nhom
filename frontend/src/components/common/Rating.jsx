import React from 'react';
import PropTypes from 'prop-types';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

const Rating = ({ value, text, color = '#f8e825' }) => {
    return (
        <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((index) => (
                <span key={index} style={{ color }}>
                    {value >= index ? (
                        <FaStar />
                    ) : value >= index - 0.5 ? (
                        <FaStarHalfAlt />
                    ) : (
                        <FaRegStar />
                    )}
                </span>
            ))}
            {text && <span className="ml-2 text-sm text-gray-600">{text}</span>}
        </div>
    );
};

Rating.propTypes = {
    value: PropTypes.number.isRequired,
    text: PropTypes.string,
    color: PropTypes.string,
};

export default Rating;
