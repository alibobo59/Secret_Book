import React from "react";
import { PlusCircle } from "lucide-react";

/**
 * Reusable PageHeader component for admin dashboard pages
 *
 * @param {Object} props
 * @param {string} props.title - Page title
 * @param {Function} props.onAddNew - Function to call when add button is clicked
 * @param {string} props.addNewLabel - Label for the add button
 * @param {boolean} props.hideAddButton - Whether to hide the add button
 */
const PageHeader = ({
  title,
  onAddNew,
  addNewLabel = "Add New",
  hideAddButton = false,
}) => {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold">{title}</h2>
      {!hideAddButton && onAddNew && (
        <button
          className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md flex items-center"
          onClick={onAddNew}>
          <PlusCircle className="h-4 w-4 mr-2" />
          {addNewLabel}
        </button>
      )}
    </div>
  );
};

export default PageHeader;
