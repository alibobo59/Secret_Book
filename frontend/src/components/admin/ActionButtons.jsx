import React from "react";
import { Edit, Trash2 } from "lucide-react";

/**
 * Reusable ActionButtons component for admin dashboard tables
 *
 * @param {Object} props
 * @param {Function} props.onEdit - Function to call when edit button is clicked
 * @param {Function} props.onDelete - Function to call when delete button is clicked
 * @param {boolean} props.hideEdit - Whether to hide the edit button
 * @param {boolean} props.hideDelete - Whether to hide the delete button
 */
const ActionButtons = ({
  onEdit,
  onDelete,
  hideEdit = false,
  hideDelete = false,
}) => {
  return (
    <div className="flex space-x-2">
      {!hideEdit && (
        <button
          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
          onClick={onEdit}
          aria-label="Edit">
          <Edit className="h-5 w-5" />
        </button>
      )}
      {!hideDelete && (
        <button
          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
          onClick={onDelete}
          aria-label="Delete">
          <Trash2 className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

export default ActionButtons;
