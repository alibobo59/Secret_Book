import React, { useState, useEffect, useCallback } from "react";
import BookContext from "./BookContext";
import { api } from "../services/api";

const BookProvider = ({ children }) => {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const fetchWithTimeout = async (endpoint) => {
        try {
          const response = await api.get(endpoint);
          return response;
        } catch (error) {
          console.error(`Error fetching ${endpoint}:`, error);
          throw error;
        }
      };

      const [
        booksResponse,
        categoriesResponse,
        authorsResponse,
        publishersResponse,
      ] = await Promise.all([
        fetchWithTimeout("/books"),
        fetchWithTimeout("/categories"),
        fetchWithTimeout("/authors"),
        fetchWithTimeout("/publishers"),
      ]);

      const fetchedBooks = booksResponse.data.data || [];
      const fetchedCategories = categoriesResponse.data.data || [];
      const fetchedAuthors = authorsResponse.data.data || [];
      const fetchedPublishers = publishersResponse.data.data || [];

      setBooks(fetchedBooks);
      setCategories(fetchedCategories);
      setAuthors(fetchedAuthors);
      setPublishers(fetchedPublishers);
    } catch (err) {
      let errorMessage = "Failed to fetch data";
      if (err.code === 'ECONNABORTED') {
        errorMessage = "Connection timeout. Please try again.";
      } else if (!err.response) {
        errorMessage = "Network error. Please check your connection.";
      } else if (err.response.status === 404) {
        errorMessage = `Resource not found: ${err.config.url}`;
      } else if (err.response.data?.error) {
        errorMessage = err.response.data.error;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <BookContext.Provider
      value={{
        books,
        setBooks,
        categories,
        authors,
        publishers,
        loading,
        error,
        fetchBooks: fetchData,
      }}
    >
      {children}
    </BookContext.Provider>
  );
};

export default BookProvider;