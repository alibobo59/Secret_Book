import React, { useEffect, useState, useMemo } from 'react';
import { useBook } from '../../contexts/BookContext';

import BookCard from '../../components/client/BookCard';
import BookListView from '../../components/books/BookListView';
import FilterSidebar from '../../components/books/FilterSidebar';
import SearchAndSort from '../../components/books/SearchAndSort';

const BrowseBooksPage = () => {
  const { books, loading, fetchBooks } = useBook();

  
  // Filter and search state
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("title");
  const [viewMode, setViewMode] = useState("grid");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    categories: [],
    authors: [],
    priceRange: [0, 10000000],
    ratings: []
  });

  useEffect(() => {
    fetchBooks();
  }, []);

  // Calculate unique values for filters
  const { uniqueCategories, uniqueAuthors, priceRange } = useMemo(() => {
    if (!books.length) return { uniqueCategories: [], uniqueAuthors: [], priceRange: [0, 10000000] };
    
    const categories = [...new Set(books.map(book => 
      typeof book.category === 'object' ? book.category?.name : book.category
    ).filter(Boolean))];
    
    const authors = [...new Set(books.map(book => 
      typeof book.author === 'object' ? book.author?.name : book.author
    ).filter(Boolean))];
    
    const prices = books.map(book => parseInt(book.price) || 0).filter(price => price > 0);
    const minPrice = Math.min(...prices, 0);
    const maxPrice = Math.max(...prices, 10000000);
    
    return {
      uniqueCategories: categories.sort(),
      uniqueAuthors: authors.sort(),
      priceRange: [Math.floor(minPrice), Math.ceil(maxPrice)]
    };
  }, [books]);

  // Initialize price range filter
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      priceRange: priceRange
    }));
  }, [priceRange]);

  // Filter and sort books
  const filteredAndSortedBooks = useMemo(() => {
    let filtered = books.filter(book => {
      // Search filter
      const bookTitle = book.title || '';
      const bookAuthor = typeof book.author === 'object' ? book.author?.name || '' : book.author || '';
      const bookDescription = book.description || '';
      
      const matchesSearch = !searchTerm || 
        bookTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bookAuthor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bookDescription.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Category filter
      const bookCategory = typeof book.category === 'object' ? book.category?.name : book.category;
      const matchesCategory = filters.categories.length === 0 || 
        filters.categories.includes(bookCategory);
      
      // Author filter
      const matchesAuthor = filters.authors.length === 0 || 
        filters.authors.includes(bookAuthor);
      
      // Price filter
      const bookPrice = parseInt(book.price) || 0;
      const matchesPrice = bookPrice >= filters.priceRange[0] && 
        bookPrice <= filters.priceRange[1];
      
      // Rating filter
      const matchesRating = filters.ratings.length === 0 || 
        filters.ratings.some(rating => {
          const bookRating = book.average_rating || 0;
          return rating === 5 ? bookRating >= 5 : bookRating >= rating && bookRating < rating + 1;
        });
      
      return matchesSearch && matchesCategory && matchesAuthor && matchesPrice && matchesRating;
    });

    // Sort books
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
        case 'newest':
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        case 'oldest':
          return new Date(a.created_at || 0) - new Date(b.created_at || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [books, searchTerm, sortBy, filters]);

  const clearFilters = () => {
    setFilters({
      categories: [],
      authors: [],
      priceRange: priceRange,
      ratings: []
    });
    setSearchTerm("");
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
            resultsCount={filteredAndSortedBooks.length}
          />
          
          {/* Books Grid/List */}
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Duyệt Sách
            </h1>
            
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowseBooksPage;
