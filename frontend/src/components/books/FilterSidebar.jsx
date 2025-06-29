import React from 'react';
import { X, Filter, DollarSign, Star, User, Tag } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const FilterSidebar = ({
  isOpen,
  onClose,
  filters,
  setFilters,
  uniqueCategories,
  uniqueAuthors,
  priceRange,
  onClearFilters
}) => {
  const { t } = useLanguage();

  const handleCategoryChange = (category) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleAuthorChange = (author) => {
    setFilters(prev => ({
      ...prev,
      authors: prev.authors.includes(author)
        ? prev.authors.filter(a => a !== author)
        : [...prev.authors, author]
    }));
  };

  const handleRatingChange = (rating) => {
    setFilters(prev => ({
      ...prev,
      ratings: prev.ratings.includes(rating)
        ? prev.ratings.filter(r => r !== rating)
        : [...prev.ratings, rating]
    }));
  };

  const handlePriceChange = (index, value) => {
    const newPriceRange = [...filters.priceRange];
    newPriceRange[index] = parseInt(value);
    setFilters(prev => ({
      ...prev,
      priceRange: newPriceRange
    }));
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:sticky top-0 left-0 h-screen w-80 bg-white dark:bg-gray-800 
        border-r border-gray-200 dark:border-gray-700 z-50 transform transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        overflow-y-auto
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-amber-600" />
            <h2 className="font-semibold text-gray-900 dark:text-white">Filters</h2>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Clear Filters */}
          <button
            onClick={onClearFilters}
            className="w-full py-2 px-4 text-sm text-amber-600 hover:text-amber-700 
                     border border-amber-600 hover:border-amber-700 rounded-md transition-colors"
          >
            Clear All Filters
          </button>

          {/* Categories */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Tag className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <h3 className="font-medium text-gray-900 dark:text-white">Categories</h3>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {uniqueCategories.map(category => (
                <label key={category} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(category)}
                    onChange={() => handleCategoryChange(category)}
                    className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{category}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Authors */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <h3 className="font-medium text-gray-900 dark:text-white">Authors</h3>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {uniqueAuthors.map(author => (
                <label key={author} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.authors.includes(author)}
                    onChange={() => handleAuthorChange(author)}
                    className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{author}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <h3 className="font-medium text-gray-900 dark:text-white">Price Range (VND)</h3>
            </div>
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="number"
                  value={filters.priceRange[0]}
                  onChange={(e) => handlePriceChange(0, e.target.value)}
                  min={priceRange[0]}
                  max={priceRange[1]}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                           rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Tối thiểu"
                />
                <input
                  type="number"
                  value={filters.priceRange[1]}
                  onChange={(e) => handlePriceChange(1, e.target.value)}
                  min={priceRange[0]}
                  max={priceRange[1]}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                           rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Tối đa"
                />
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {filters.priceRange[0].toLocaleString('vi-VN')} ₫ - {filters.priceRange[1].toLocaleString('vi-VN')} ₫
              </div>
            </div>
          </div>

          {/* Ratings */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Star className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <h3 className="font-medium text-gray-900 dark:text-white">Ratings</h3>
            </div>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map(rating => (
                <label key={rating} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.ratings.includes(rating)}
                    onChange={() => handleRatingChange(rating)}
                    className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                  />
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="text-sm text-gray-700 dark:text-gray-300 ml-1">
                      {rating === 5 ? '5 stars' : `${rating}+ stars`}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FilterSidebar;