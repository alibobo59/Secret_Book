import React from 'react';
import { SortAsc, Grid, List } from 'lucide-react';
import sortOptions from './sortOptions';

const SortAndView = ({ sortBy, setSortBy, viewMode, setViewMode, resultsCount }) => {
  return (
    <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
      {/* Results Count */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Tìm thấy {resultsCount} {resultsCount === 1 ? 'cuốn sách' : 'cuốn sách'}
      </div>

      {/* Sort Dropdown */}
      <div className="flex items-center gap-2">
        <SortAsc className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                   bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm
                   focus:ring-2 focus:ring-amber-500 focus:border-transparent"
        >
          {sortOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
        <button
          onClick={() => setViewMode('grid')}
          className={`p-2 transition-colors ${
            viewMode === 'grid'
              ? 'bg-amber-600 text-white'
              : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600'
          }`}
          title="Xem Dạng Lưới"
        >
          <Grid className="h-4 w-4" />
        </button>
        <button
          onClick={() => setViewMode('list')}
          className={`p-2 transition-colors ${
            viewMode === 'list'
              ? 'bg-amber-600 text-white'
              : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600'
          }`}
          title="Xem Dạng Danh Sách"
        >
          <List className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default SortAndView;
