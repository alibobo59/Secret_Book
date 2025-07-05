import React from 'react';
import { Search, Filter, Grid, List, SortAsc } from 'lucide-react';


const SearchAndSort = ({
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  onToggleFilters,
  resultsCount
}) => {


  const sortOptions = [
    { value: 'title', label: 'Tiêu Đề A-Z' },
    { value: 'title-desc', label: 'Tiêu Đề Z-A' },
    { value: 'price', label: 'Giá Thấp Đến Cao' },
    { value: 'price-desc', label: 'Giá Cao Đến Thấp' },
    { value: 'rating-desc', label: 'Đánh Giá Cao Nhất' },
    { value: 'rating', label: 'Đánh Giá Thấp Nhất' },
    { value: 'newest', label: 'Mới Nhất' },
    { value: 'oldest', label: 'Cũ Nhất' }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        {/* Left side - Search and Filter */}
        <div className="flex flex-1 gap-4 items-center w-full lg:w-auto">
          {/* Filter Toggle Button */}
          <button
            onClick={onToggleFilters}
            className="lg:hidden flex items-center gap-2 px-3 py-2 border border-gray-300 
                     dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Filter className="h-4 w-4" />
            <span className="text-sm">Bộ Lọc</span>
          </button>

          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm sách, tác giả, mô tả..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 
                       rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500"
            />
          </div>
        </div>

        {/* Right side - Sort, View Mode, Results Count */}
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
      </div>
    </div>
  );
};

export default SearchAndSort;