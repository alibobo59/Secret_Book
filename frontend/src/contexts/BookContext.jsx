import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../services/api";

const BookContext = createContext();

export const useBook = () => {
  return useContext(BookContext);
};

export const BookProvider = ({ children }) => {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const booksUrl = "/books";
        const categoriesUrl = "/categories";
        const authorsUrl = "/authors";
        const publishersUrl = "/publishers";

        // console.log("Starting fetch...");
        // console.log("Books URL:", `${api.defaults.baseURL}${booksUrl}`);
        // console.log(
        //   "Categories URL:",
        //   `${api.defaults.baseURL}${categoriesUrl}`
        // );

        const [bookRes, catRes, authorRes, publisherRes] = await Promise.all([
          api.get(booksUrl),
          api.get(categoriesUrl),
          api.get(authorsUrl),
          api.get(publishersUrl),
        ]);

        // console.log("Raw books response:", bookRes.data);
        // console.log("Raw categories response:", catRes.data);

        const booksData = Array.isArray(bookRes.data.data)
          ? bookRes.data.data
          : [];
        const categoriesData = Array.isArray(catRes.data.data)
          ? catRes.data.data
          : [];
        const authorsData = Array.isArray(authorRes.data.data)
          ? authorRes.data.data
          : [];
        const publishersData = Array.isArray(publisherRes.data.data)
          ? publisherRes.data.data
          : [];

        if (isMounted) {
          const enrichedBooks = booksData.map((book) => ({
            ...book,
            cover_image: book.cover_image || "/placeholder-image.jpg",
            author: book.author || `Author ${book.author_id}`, // Extract name or fallback to author_id
            stock: book.stock || 15,
            average_rating: book.average_rating || 0,
            ratings: book.ratings || [],
          }));
          setBooks(enrichedBooks);
          setCategories(categoriesData);
          setAuthors(authorsData);
          setPublishers(publishersData);

          console.log(
            "State updated - books:",
            enrichedBooks,
            "categories:",
            categoriesData
          );
        }
      } catch (err) {
        console.error(
          "Fetch error:",
          err.message,
          "Response:",
          err.response?.data
        );
        if (isMounted) {
          setError(err.message || "Failed to fetch data");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          console.log(
            "Final state - loading:",
            loading,
            "error:",
            error,
            "books length:",
            books.length,
            "categories length:",
            categories.length
          );
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  const value = {
    authors,
    publishers,
    books,
    categories,
    loading,
    error,
  };

  return <BookContext.Provider value={value}>{children}</BookContext.Provider>;
};

export default BookProvider;
