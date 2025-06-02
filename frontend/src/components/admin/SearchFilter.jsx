import React from "react";
import { Search, Filter, ChevronDown } from "lucide-react";

/**
 * Reusable SearchFilter component for admin dashboard
 *
 * @param {Object} props
 * @param {string} props.searchTerm - Current search term
 * @param {Function} props.onSearchChange - Function to call when search term changes
 * @param {string} props.searchPlaceholder - Placeholder text for search input
 * @param {string} props.filterValue - Current filter value
 * @param {Function} props.onFilterChange - Function to call when filter value changes
 * @param {Array} props.filterOptions - Array of filter options with {value, label}
 * @param {string} props.filterPlaceholder - Placeholder text for filter dropdown
 */
const SearchFilter = ({
  searchTerm,
  onSearchChange,
  searchPlaceholder = "Search...",
  filterValue,
  onFilterChange,
  filterOptions = [],
  filterPlaceholder = "All",
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      {onSearchChange && (
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md w-full bg-white dark:bg-gray-800"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      )}

      {onFilterChange && filterOptions.length > 0 && (
        <div className="relative w-full md:w-64">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <select
            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md w-full bg-white dark:bg-gray-800 appearance-none"
            value={filterValue}
            onChange={(e) => onFilterChange(e.target.value)}>
            <option value="">{filterPlaceholder}</option>
            {filterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        </div>
      )}
    </div>
  );
};

export default SearchFilter;
