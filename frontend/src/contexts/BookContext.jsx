import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../services/api";

const BookContext = createContext();

export const useBook = () => {
  return useContext(BookContext);
};

export const BookProvider = ({ children }) => {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const booksUrl = "/books";
        const categoriesUrl = "/categories";

        // Log the full URLs
        // console.log(
        //   "Fetching books from:",
        //   `${api.defaults.baseURL}${booksUrl}`
        // );
        // console.log(
        //   "Fetching categories from:",
        //   `${api.defaults.baseURL}${categoriesUrl}`
        // );

        // const bookRes = await api.get(booksUrl);
        // const catRes = await api.get(categoriesUrl);
        const [bookRes, catRes] = await Promise.all([
          api.get(booksUrl),
          api.get(categoriesUrl),
        ]);
        // Log the response data
        console.log("Books response:", bookRes.data);
        console.log("Categories response:", catRes.data);
        const enrichedBooks = bookRes.data.map((book) => ({
          ...book,
          cover_image: book.cover_image || "/placeholder-image.jpg", // Fallback image
          author: `Author ${book.author_id}`, // Generate author from author_id
          stock: book.stock || 15, // Default stock
          average_rating: book.average_rating || 0, // Default rating
          ratings: book.ratings || [], // Default empty array
        }));
        const enrichedCategories = catRes.data.map((category) => ({
          ...category,
          name: category.name || `Category ${category.id}`, // Fallback name
        }));

        setBooks(enrichedBooks);
        setCategories(enrichedCategories);
        console.log(books);
        console.log(categories);
      } catch (err) {
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const value = {
    books,
    categories,
    loading,
    error,
  };

  return <BookContext.Provider value={value}>{children}</BookContext.Provider>;
};
