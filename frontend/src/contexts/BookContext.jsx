import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../services/api";

const BookContext = createContext();

export const BookProvider = ({ children }) => {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all required data in parallel
      const [
        booksResponse,
        categoriesResponse,
        authorsResponse,
        publishersResponse,
      ] = await Promise.all([
        api.get("/books"),
        api.get("/categories"),
        api.get("/authors"),
        api.get("/publishers"),
      ]);

      // Extract data from responses
      const fetchedBooks = booksResponse.data.data || [];
      const fetchedCategories = categoriesResponse.data.data || [];
      const fetchedAuthors = authorsResponse.data.data || [];
      const fetchedPublishers = publishersResponse.data.data || [];

      // Log fetched data for debugging
      console.log("Fetched data:", {
        books: fetchedBooks,
        categories: fetchedCategories,
        authors: fetchedAuthors,
        publishers: fetchedPublishers,
      });

      // Update state
      setBooks(fetchedBooks);
      setCategories(fetchedCategories);
      setAuthors(fetchedAuthors);
      setPublishers(fetchedPublishers);

      // Log state after update
      console.log("State updated:", {
        books: fetchedBooks,
        categories: fetchedCategories,
        authors: fetchedAuthors,
        publishers: fetchedPublishers,
      });
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.response?.data?.error || "Failed to fetch data");
    } finally {
      setLoading(false);
      console.log("Final state:", {
        loading: false,
        error,
        booksLength: books.length,
        categoriesLength: categories.length,
        authorsLength: authors.length,
        publishersLength: publishers.length,
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
      }}>
      {children}
    </BookContext.Provider>
  );
};

export const useBook = () => {
  const context = useContext(BookContext);
  if (!context) {
    throw new Error("useBook must be used within a BookProvider");
  }
  return context;
};
