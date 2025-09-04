import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useBook } from '../../contexts/BookContext';
import { api } from '../../services/api';

import BookCard from '../../components/client/BookCard';
import BookListView from '../../components/books/BookListView';
import FilterSidebar from '../../components/books/FilterSidebar';
import SearchAndSort from '../../components/books/SearchAndSort';

const BrowseBooksPage = () => {
  const { categories = [], authors = [] } = useBook();
  const [searchParams, setSearchParams] = useSearchParams();

  // Local server-driven list and pagination
  const [serverBooks, setServerBooks] = useState([]);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, per_page: 12, total: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(12);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filter and search state
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    categories: [], // using names for UI; will map to ID for server
    authors: [], // using names for UI; will map to ID for server
    priceRange: [0, 10000000],
    ratings: []
  });

  // Read search term from URL on mount and whenever URL changes
  useEffect(() => {
    const searchFromUrl = searchParams.get('search') || '';
    setSearchTerm(searchFromUrl);
    // Reset to first page when URL search changes
    setCurrentPage(1);
  }, [searchParams]);

  // Build mapping from name -> id for server params
  const categoryNameToId = useMemo(() => {
    const map = {};
    categories.forEach(c => { if (c?.name) map[c.name] = c.id; });
    return map;
  }, [categories]);

  const authorNameToId = useMemo(() => {
    const map = {};
    authors.forEach(a => { if (a?.name) map[a.name] = a.id; });
    return map;
  }, [authors]);

  // Unique options for filters (names for UI)
  const uniqueCategories = useMemo(() => (categories.map(c => c.name).filter(Boolean).sort()), [categories]);
  const uniqueAuthors = useMemo(() => (authors.map(a => a.name).filter(Boolean).sort()), [authors]);

  // Derive price range from currently loaded page (fallback to defaults if empty)
  const priceRange = useMemo(() => {
    if (!serverBooks.length) return [0, 10000000];
    const prices = serverBooks.map(b => parseInt(b.price) || 0).filter(p => p >= 0);
    const minPrice = Math.min(...prices, 0);
    const maxPrice = Math.max(...prices, 10000000);
    return [Math.floor(minPrice), Math.ceil(maxPrice)];
  }, [serverBooks]);

  // Initialize price range filter when page data changes
  useEffect(() => {
    setFilters(prev => ({ ...prev, priceRange }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priceRange[0], priceRange[1]]);

  // Fetch books from server with pagination and server-supported filters
  const fetchServerBooks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        per_page: perPage,
      };

      if (searchTerm && searchTerm.trim() !== '') {
        params.search = searchTerm.trim();
      }

      // Server currently supports single category_id / author_id
      if (filters.categories.length > 0) {
        const firstCategoryName = filters.categories[0];
        const catId = categoryNameToId[firstCategoryName];
        if (catId) params.category_id = catId;
      }
      if (filters.authors.length > 0) {
        const firstAuthorName = filters.authors[0];
        const authorId = authorNameToId[firstAuthorName];
        if (authorId) params.author_id = authorId;
      }

      // Note: price range and ratings are not yet supported on server; these remain client-side for now.

      const response = await api.get('/books', { params });
      const data = response.data;

      const items = data.data || [];
      const newPagination = {
        current_page: data.current_page || currentPage,
        last_page: data.last_page || 1,
        per_page: data.per_page || perPage,
        total: data.total || items.length,
      };

      setServerBooks(items);
      setPagination(newPagination);
    } catch (err) {
      console.error('Failed to fetch books:', err);
      setError(
        err.response?.data?.error ||
        err.message ||
        'Không thể tải danh sách sách. Vui lòng thử lại.'
      );
      setServerBooks([]);
      setPagination(prev => ({ ...prev, total: 0 }));
    } finally {
      setLoading(false);
    }
  }, [currentPage, perPage, searchTerm, filters.categories, filters.authors, categoryNameToId, authorNameToId]);

  // Trigger fetch when dependencies change
  useEffect(() => {
    fetchServerBooks();
  }, [fetchServerBooks]);

  // When filters related to server change, reset to first page
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters.categories, filters.authors]);

  // Client-side filter (price, ratings) and optional sort for current page
  const filteredAndSortedBooks = useMemo(() => {
    let filtered = serverBooks.filter(book => {
      // Price filter (client-side for now)
      const bookPrice = parseInt(book.price) || 0;
      const matchesPrice = bookPrice >= filters.priceRange[0] && bookPrice <= filters.priceRange[1];

      // Rating filter (client-side for now)
      const matchesRating = filters.ratings.length === 0 ||
        filters.ratings.some(rating => {
          const bookRating = book.average_rating || 0;
          return rating === 5 ? bookRating >= 5 : bookRating >= rating && bookRating < rating + 1;
        });

      return matchesPrice && matchesRating;
    });

    // Sort on client for now (server defaults to newest)
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return (a.title || '').localeCompare(b.title || '');
        case 'title-desc':
          return (b.title || '').localeCompare(a.title || '');
        case 'price':
          return (parseInt(a.price) || 0) - (parseInt(b.price) || 0);
        case 'price-desc':
          return (parseInt(b.price) || 0) - (parseInt(a.price) || 0);
        case 'rating':
          return (a.average_rating || 0) - (b.average_rating || 0);
        case 'rating-desc':
          return (b.average_rating || 0) - (a.average_rating || 0);
        case 'oldest':
          return new Date(a.created_at || 0) - new Date(b.created_at || 0);
        case 'newest':
        default:
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      }
    });

    return filtered;
  }, [serverBooks, filters.priceRange, filters.ratings, sortBy]);

  const clearFilters = () => {
    setFilters({
      categories: [],
      authors: [],
      priceRange: priceRange,
      ratings: []
    });
    setSearchTerm("");
    setSearchParams(prev => {
      const params = new URLSearchParams(prev);
      params.delete('search');
      return params;
    });
  };

  // Update URL search param when user types (debounced effect could be added later)
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchParams(prev => {
        const params = new URLSearchParams(prev);
        if (searchTerm && searchTerm.trim() !== '') {
          params.set('search', searchTerm.trim());
        } else {
          params.delete('search');
        }
        return params;
      });
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchTerm, setSearchParams]);

  const handlePageChange = (page) => {
    if (page < 1 || page > (pagination.last_page || 1)) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPagination = () => {
    if ((pagination.last_page || 1) <= 1) return null;

    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(pagination.last_page, startPage + maxVisiblePages - 1);
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    return (
      <div className="mt-8 flex items-center justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Hiển thị {(currentPage - 1) * pagination.per_page + 1}-{Math.min(currentPage * pagination.per_page, pagination.total)} trong tổng số {pagination.total} sách
        </div>
        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:z-20 disabled:opacity-50"
          >
            Trước
          </button>
          {[...Array(endPage - startPage + 1)].map((_, idx) => {
            const page = startPage + idx;
            const active = page === currentPage;
            return (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:z-20 ${active ? 'bg-amber-600 text-white' : 'text-gray-900 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              >
                {page}
              </button>
            );
          })}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === (pagination.last_page || 1)}
            className="relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:z-20 disabled:opacity-50"
          >
            Sau
          </button>
        </nav>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex">
        {/* Filter Sidebar */}
        <FilterSidebar
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          filters={filters}
          setFilters={setFilters}
          uniqueCategories={uniqueCategories}
          uniqueAuthors={uniqueAuthors}
          priceRange={priceRange}
          onClearFilters={clearFilters}
        />
        
        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          {/* Search and Sort Bar */}
          <SearchAndSort
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            sortBy={sortBy}
            setSortBy={setSortBy}
            viewMode={viewMode}
            setViewMode={setViewMode}
            onToggleFilters={() => setIsFilterOpen(!isFilterOpen)}
            resultsCount={pagination.total || filteredAndSortedBooks.length}
          />
          
          {/* Books Grid/List */}
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Duyệt Sách
            </h1>

            {error && (
              <div className="mb-4 p-3 rounded bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                {error}
              </div>
            )}
            
            {filteredAndSortedBooks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  Không tìm thấy sách nào phù hợp với tiêu chí của bạn.
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-4 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-md transition-colors"
                >
                  Xóa Bộ Lọc
                </button>
              </div>
            ) : (
              <>
                <div className={`
                  ${viewMode === 'grid' 
                    ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6' 
                    : 'space-y-4'
                  }
                `}>
                  {filteredAndSortedBooks.map((book) => (
                    viewMode === 'grid' ? (
                      <BookCard key={book.id} book={book} />
                    ) : (
                      <BookListView key={book.id} book={book} />
                    )
                  ))}
                </div>
                {renderPagination()}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowseBooksPage;
