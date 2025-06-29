import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useBook } from './BookContext';

const RecommendationContext = createContext();

export const useRecommendation = () => {
  const context = useContext(RecommendationContext);
  if (!context) {
    throw new Error('useRecommendation must be used within a RecommendationProvider');
  }
  return context;
};

export const RecommendationProvider = ({ children }) => {
  const { user } = useAuth();
  const { books } = useBook();
  const [userPreferences, setUserPreferences] = useState({
    viewedBooks: [],
    purchasedBooks: [],
    cartItems: [],
    searchHistory: [],
    ratedBooks: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUserPreferences();
  }, [user]);

  useEffect(() => {
    // Auto-update preferences based on rated books
    if (userPreferences.ratedBooks.length > 0) {
      saveUserPreferences();
    }
  }, [userPreferences.ratedBooks]);

  const loadUserPreferences = () => {
    if (!user) return;
    
    const stored = localStorage.getItem(`userPreferences_${user.id}`);
    if (stored) {
      setUserPreferences(JSON.parse(stored));
    }
  };

  const saveUserPreferences = () => {
    if (!user) return;
    localStorage.setItem(`userPreferences_${user.id}`, JSON.stringify(userPreferences));
  };

  const addToViewHistory = (bookId) => {
    setUserPreferences(prev => ({
      ...prev,
      viewedBooks: [bookId, ...prev.viewedBooks.filter(id => id !== bookId)].slice(0, 50)
    }));
  };

  const addToPurchaseHistory = (bookId) => {
    setUserPreferences(prev => ({
      ...prev,
      purchasedBooks: [...prev.purchasedBooks, bookId]
    }));
  };

  const addToSearchHistory = (query) => {
    setUserPreferences(prev => ({
      ...prev,
      searchHistory: [query, ...prev.searchHistory.filter(q => q !== query)].slice(0, 20)
    }));
  };

  const addRating = (bookId, rating) => {
    setUserPreferences(prev => ({
      ...prev,
      ratedBooks: [
        ...prev.ratedBooks.filter(r => r.bookId !== bookId),
        { bookId, rating, ratedAt: new Date().toISOString() }
      ]
    }));
  };

  const getRecommendationsByGenre = (limit = 10) => {
    if (!books.length) return [];
    
    // Get user's preferred genres based on viewed/purchased books
    const userBooks = books.filter(book => 
      userPreferences.viewedBooks.includes(book.id) || 
      userPreferences.purchasedBooks.includes(book.id)
    );
    
    const genreCount = {};
    userBooks.forEach(book => {
      if (book.genre) {
        genreCount[book.genre] = (genreCount[book.genre] || 0) + 1;
      }
    });
    
    const preferredGenres = Object.keys(genreCount)
      .sort((a, b) => genreCount[b] - genreCount[a])
      .slice(0, 3);
    
    if (preferredGenres.length === 0) {
      return books.slice(0, limit);
    }
    
    return books
      .filter(book => 
        preferredGenres.includes(book.genre) && 
        !userPreferences.viewedBooks.includes(book.id) &&
        !userPreferences.purchasedBooks.includes(book.id)
      )
      .slice(0, limit);
  };

  const getRecommendationsByAuthor = (limit = 10) => {
    if (!books.length) return [];
    
    const userBooks = books.filter(book => 
      userPreferences.viewedBooks.includes(book.id) || 
      userPreferences.purchasedBooks.includes(book.id)
    );
    
    const authorCount = {};
    userBooks.forEach(book => {
      if (book.author) {
        authorCount[book.author] = (authorCount[book.author] || 0) + 1;
      }
    });
    
    const preferredAuthors = Object.keys(authorCount)
      .sort((a, b) => authorCount[b] - authorCount[a])
      .slice(0, 5);
    
    if (preferredAuthors.length === 0) {
      return books.slice(0, limit);
    }
    
    return books
      .filter(book => 
        preferredAuthors.includes(book.author) && 
        !userPreferences.viewedBooks.includes(book.id) &&
        !userPreferences.purchasedBooks.includes(book.id)
      )
      .slice(0, limit);
  };

  const getRecommendationsByPrice = (limit = 10) => {
    if (!books.length) return [];
    
    const userBooks = books.filter(book => 
      userPreferences.purchasedBooks.includes(book.id)
    );
    
    if (userBooks.length === 0) {
      return books.slice(0, limit);
    }
    
    const avgPrice = userBooks.reduce((sum, book) => sum + book.price, 0) / userBooks.length;
    const priceRange = avgPrice * 0.3; // 30% range
    
    return books
      .filter(book => 
        Math.abs(book.price - avgPrice) <= priceRange &&
        !userPreferences.viewedBooks.includes(book.id) &&
        !userPreferences.purchasedBooks.includes(book.id)
      )
      .slice(0, limit);
  };

  const getRecommendationsByRating = (limit = 10) => {
    if (!books.length) return [];
    
    const highRatedBooks = userPreferences.ratedBooks
      .filter(rating => rating.rating >= 4)
      .map(rating => rating.bookId);
    
    if (highRatedBooks.length === 0) {
      return books
        .filter(book => book.rating >= 4)
        .slice(0, limit);
    }
    
    const likedBooks = books.filter(book => highRatedBooks.includes(book.id));
    const similarBooks = [];
    
    likedBooks.forEach(likedBook => {
      const similar = books.filter(book => 
        book.genre === likedBook.genre &&
        book.id !== likedBook.id &&
        !userPreferences.viewedBooks.includes(book.id) &&
        !userPreferences.purchasedBooks.includes(book.id) &&
        !similarBooks.find(sb => sb.id === book.id)
      );
      similarBooks.push(...similar);
    });
    
    return similarBooks.slice(0, limit);
  };

  const calculateBookSimilarity = (book1, book2) => {
    let similarity = 0;
    
    if (book1.genre === book2.genre) similarity += 0.4;
    if (book1.author === book2.author) similarity += 0.3;
    if (Math.abs(book1.price - book2.price) <= 5) similarity += 0.1;
    if (Math.abs(book1.rating - book2.rating) <= 0.5) similarity += 0.2;
    
    return similarity;
  };

  const getTrendingBooks = (limit = 10) => {
    // Simulate trending based on view count and recent activity
    return books
      .sort((a, b) => (b.rating * b.reviewCount) - (a.rating * a.reviewCount))
      .slice(0, limit);
  };

  const getNewReleases = (limit = 10) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return books
      .filter(book => new Date(book.publishedDate) >= thirtyDaysAgo)
      .sort((a, b) => new Date(b.publishedDate) - new Date(a.publishedDate))
      .slice(0, limit);
  };

  const getBestsellers = (limit = 10) => {
    return books
      .sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))
      .slice(0, limit);
  };

  const getRecommendationsByCategory = (category, limit = 10) => {
    switch (category) {
      case 'genre':
        return getRecommendationsByGenre(limit);
      case 'author':
        return getRecommendationsByAuthor(limit);
      case 'price':
        return getRecommendationsByPrice(limit);
      case 'rating':
        return getRecommendationsByRating(limit);
      case 'trending':
        return getTrendingBooks(limit);
      case 'new':
        return getNewReleases(limit);
      case 'bestsellers':
        return getBestsellers(limit);
      default:
        return getRecommendationsByGenre(limit);
    }
  };

  const getSearchBasedRecommendations = (searchQuery, limit = 10) => {
    if (!searchQuery) return [];
    
    const queryWords = searchQuery.toLowerCase().split(' ');
    
    return books
      .filter(book => {
        const bookText = `${book.title} ${book.author} ${book.genre} ${book.description}`.toLowerCase();
        return queryWords.some(word => bookText.includes(word)) &&
               !userPreferences.viewedBooks.includes(book.id);
      })
      .slice(0, limit);
  };

  const value = {
    userPreferences,
    loading,
    addToViewHistory,
    addToPurchaseHistory,
    addToSearchHistory,
    addRating,
    getRecommendationsByGenre,
    getRecommendationsByAuthor,
    getRecommendationsByPrice,
    getRecommendationsByRating,
    getRecommendationsByCategory,
    getSearchBasedRecommendations,
    getTrendingBooks,
    getNewReleases,
    getBestsellers,
    calculateBookSimilarity,
  };

  return (
    <RecommendationContext.Provider value={value}>
      {children}
    </RecommendationContext.Provider>
  );
};