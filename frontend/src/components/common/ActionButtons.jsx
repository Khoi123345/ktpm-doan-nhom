import React from 'react';
import PropTypes from 'prop-types';
import { FiEdit, FiTrash2, FiEye } from 'react-icons/fi';

const ActionButtons = ({ onEdit, onDelete, onView, editTitle = 'Chỉnh sửa', deleteTitle = 'Xóa', viewTitle = 'Xem chi tiết' }) => {
    return (
        <div className="flex gap-2">
            {onView && (
                <button
                    onClick={onView}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title={viewTitle}
                >
                    <FiEye />
                </button>
            )}
            {onEdit && (
                <button
                    onClick={onEdit}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title={editTitle}
                >
                    <FiEdit />
                </button>
            )}
            {onDelete && (
                <button
                    onClick={onDelete}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title={deleteTitle}
                >
                    <FiTrash2 />
                </button>
            )}
        </div>
    );
};

ActionButtons.propTypes = {
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
    onView: PropTypes.func,
    editTitle: PropTypes.string,
    deleteTitle: PropTypes.string,
    viewTitle: PropTypes.string,
};

export default ActionButtons;
