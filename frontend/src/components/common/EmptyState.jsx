import PropTypes from 'prop-types';

const EmptyState = ({
    icon: Icon,
    title,
    description,
    action,
    actionText,
    className = ''
}) => {
    return (
        <div className={`text-center py-16 px-4 ${className}`}>
            {Icon && (
                <div className="flex justify-center mb-6">
                    <Icon className="w-24 h-24 text-gray-300" strokeWidth={1} />
                </div>
            )}
            <h3 className="text-2xl font-bold text-gray-800 mb-3">{title}</h3>
            {description && (
                <p className="text-gray-600 mb-6 max-w-md mx-auto">{description}</p>
            )}
            {action && actionText && (
                <div className="mt-6">
                    {action}
                </div>
            )}
        </div>
    );
};

EmptyState.propTypes = {
    icon: PropTypes.elementType,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    action: PropTypes.node,
    actionText: PropTypes.string,
    className: PropTypes.string,
};

export default EmptyState;
