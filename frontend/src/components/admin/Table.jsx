import React from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

/**
 * Reusable Table component for admin dashboard
 *
 * @param {Object} props
 * @param {Array} props.columns - Array of column definitions with {id, label, sortable, width}
 * @param {Array} props.data - Array of data objects to display
 * @param {string} props.sortField - Current sort field
 * @param {string} props.sortDirection - Current sort direction ('asc' or 'desc')
 * @param {Function} props.onSort - Function to call when a sortable column is clicked
 * @param {Function} props.renderRow - Function to render each row
 */
const Table = ({
  columns,
  data,
  sortField,
  sortDirection,
  onSort,
  renderRow,
}) => {
  return (
    <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            {columns.map((column) => (
              <th
                key={column.id}
                scope="col"
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${
                  column.sortable ? "cursor-pointer" : ""
                }`}
                style={column.width ? { width: column.width } : {}}
                onClick={() => column.sortable && onSort && onSort(column.id)}>
                <div className="flex items-center">
                  {column.label}
                  {column.sortable &&
                    sortField === column.id &&
                    (sortDirection === "asc" ? (
                      <ChevronUp className="h-4 w-4 ml-1" />
                    ) : (
                      <ChevronDown className="h-4 w-4 ml-1" />
                    ))}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {data.length > 0 ? (
            data.map((item, index) => renderRow(item, index))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
