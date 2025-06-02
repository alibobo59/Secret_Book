import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const BookContext = createContext();

export const useBook = () => {
  return useContext(BookContext);
};

export const BookProvider = ({ children }) => {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch books when component mounts
  useEffect(() => {
    fetchBooks();
    fetchCategories();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      // In a real app, this would be an API call to the Laravel backend
      // For now, we'll use mock data
      const response = await simulateApiCall(null, 800);
      setBooks(response.data.books);
    } catch (error) {
      setError('Failed to fetch books');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      // In a real app, this would be an API call to the Laravel backend
      // For now, we'll use mock data
      const response = await simulateApiCall(null, 600);
      setCategories(response.data.categories);
    } catch (error) {
      setError('Failed to fetch categories');
      console.error(error);
    }
  };

  const getBookById = (id) => {
    return books.find(book => book.id.toString() === id.toString());
  };

  const getBooksByCategory = (categoryId) => {
    return books.filter(book => book.category_id.toString() === categoryId.toString());
  };

  const searchBooks = (query) => {
    if (!query) return books;
    
    const lowercaseQuery = query.toLowerCase();
    return books.filter(book => 
      book.title.toLowerCase().includes(lowercaseQuery) || 
      book.author.toLowerCase().includes(lowercaseQuery) ||
      book.description.toLowerCase().includes(lowercaseQuery)
    );
  };

  const addRating = async (bookId, rating, review) => {
    try {
      // In a real app, this would be an API call to the Laravel backend
      // For now, we'll update our local state
      const updatedBooks = books.map(book => {
        if (book.id.toString() === bookId.toString()) {
          // Add the new rating to the book
          const newRating = {
            id: Date.now(), // Generate a unique ID
            rating,
            review,
            user_id: 1, // Assume current user
            user_name: 'Current User',
            created_at: new Date().toISOString(),
          };
          
          // Calculate new average rating
          const totalRatings = (book.ratings?.length || 0) + 1;
          const sumRatings = (book.ratings?.reduce((sum, r) => sum + r.rating, 0) || 0) + rating;
          const averageRating = sumRatings / totalRatings;
          
          return {
            ...book,
            ratings: [...(book.ratings || []), newRating],
            average_rating: averageRating,
          };
        }
        return book;
      });
      
      setBooks(updatedBooks);
      return true;
    } catch (error) {
      setError('Failed to add rating');
      console.error(error);
      return false;
    }
  };

  const value = {
    books,
    categories,
    loading,
    error,
    getBookById,
    getBooksByCategory,
    searchBooks,
    addRating,
  };

  return (
    <BookContext.Provider value={value}>
      {children}
    </BookContext.Provider>
  );
};

// Helper function to simulate API calls (for development only)
const simulateApiCall = (data, delay = 1000) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          books: [
            {
              id: 1,
              title: 'The Great Gatsby',
              author: 'F. Scott Fitzgerald',
              description: 'A story of wealth, love, and tragedy set in the Roaring Twenties.',
              cover_image: 'https://images.pexels.com/photos/4170629/pexels-photo-4170629.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
              price: 12.99,
              stock: 25,
              category_id: 1,
              average_rating: 4.5,
              ratings: [
                { id: 1, rating: 5, review: 'A timeless classic!', user_id: 2, user_name: 'Jane Smith', created_at: '2023-05-15T10:30:00Z' },
                { id: 2, rating: 4, review: 'Beautifully written.', user_id: 3, user_name: 'Bob Johnson', created_at: '2023-05-10T14:20:00Z' }
              ],
              published_date: '1925-04-10',
              isbn: '9780743273565',
              page_count: 180
            },
            {
              id: 2,
              title: 'To Kill a Mockingbird',
              author: 'Harper Lee',
              description: 'A story about racial injustice and moral growth in the American South.',
              cover_image: 'https://images.pexels.com/photos/7034646/pexels-photo-7034646.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
              price: 14.99,
              stock: 18,
              category_id: 1,
              average_rating: 4.8,
              ratings: [
                { id: 3, rating: 5, review: 'One of the greatest books ever written.', user_id: 4, user_name: 'Alice Williams', created_at: '2023-04-20T09:15:00Z' },
                { id: 4, rating: 5, review: 'Required reading for everyone.', user_id: 5, user_name: 'David Brown', created_at: '2023-04-18T16:45:00Z' },
                { id: 5, rating: 4, review: 'Powerful and moving.', user_id: 6, user_name: 'Sarah Miller', created_at: '2023-04-05T11:30:00Z' }
              ],
              published_date: '1960-07-11',
              isbn: '9780061120084',
              page_count: 336
            },
            {
              id: 3,
              title: 'The Hobbit',
              author: 'J.R.R. Tolkien',
              description: 'A fantasy adventure about Bilbo Baggins and his quest to win a share of the treasure guarded by the dragon, Smaug.',
              cover_image: 'https://images.pexels.com/photos/13660017/pexels-photo-13660017.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
              price: 15.99,
              stock: 22,
              category_id: 2,
              average_rating: 4.7,
              ratings: [
                { id: 6, rating: 5, review: 'The perfect fantasy adventure.', user_id: 7, user_name: 'Michael Clark', created_at: '2023-06-01T10:00:00Z' },
                { id: 7, rating: 4, review: 'A magical journey.', user_id: 8, user_name: 'Jennifer Garcia', created_at: '2023-05-27T14:20:00Z' }
              ],
              published_date: '1937-09-21',
              isbn: '9780618260300',
              page_count: 310
            },
            {
              id: 4,
              title: 'Pride and Prejudice',
              author: 'Jane Austen',
              description: 'A romantic novel about the Bennet sisters and their journey through courtship and marriage in 19th-century England.',
              cover_image: 'https://images.pexels.com/photos/6373305/pexels-photo-6373305.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
              price: 10.99,
              stock: 15,
              category_id: 3,
              average_rating: 4.6,
              ratings: [
                { id: 8, rating: 5, review: 'A timeless romance.', user_id: 9, user_name: 'Emma Thompson', created_at: '2023-05-05T16:30:00Z' },
                { id: 9, rating: 4, review: 'Austen at her best.', user_id: 10, user_name: 'James Wilson', created_at: '2023-04-28T11:15:00Z' }
              ],
              published_date: '1813-01-28',
              isbn: '9780141439518',
              page_count: 432
            },
            {
              id: 5,
              title: 'The Alchemist',
              author: 'Paulo Coelho',
              description: 'A philosophical novel about a young Andalusian shepherd who dreams of finding a worldly treasure.',
              cover_image: 'https://images.pexels.com/photos/3646105/pexels-photo-3646105.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
              price: 11.99,
              stock: 20,
              category_id: 4,
              average_rating: 4.5,
              ratings: [
                { id: 10, rating: 5, review: 'Life-changing book.', user_id: 11, user_name: 'Thomas Lee', created_at: '2023-06-10T09:45:00Z' },
                { id: 11, rating: 4, review: 'Inspirational journey.', user_id: 12, user_name: 'Olivia Martin', created_at: '2023-06-05T13:20:00Z' }
              ],
              published_date: '1988-01-01',
              isbn: '9780062315007',
              page_count: 208
            },
            {
              id: 6,
              title: '1984',
              author: 'George Orwell',
              description: 'A dystopian novel set in a totalitarian society where critical thought is suppressed.',
              cover_image: 'https://images.pexels.com/photos/4170629/pexels-photo-4170629.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
              price: 13.99,
              stock: 17,
              category_id: 1,
              average_rating: 4.7,
              ratings: [
                { id: 12, rating: 5, review: 'Chillingly relevant.', user_id: 13, user_name: 'William Davis', created_at: '2023-05-22T14:10:00Z' },
                { id: 13, rating: 5, review: 'A masterpiece of dystopian fiction.', user_id: 14, user_name: 'Sophia Rodriguez', created_at: '2023-05-18T10:30:00Z' },
                { id: 14, rating: 4, review: 'Thought-provoking and haunting.', user_id: 15, user_name: 'Daniel Taylor', created_at: '2023-05-15T15:45:00Z' }
              ],
              published_date: '1949-06-08',
              isbn: '9780451524935',
              page_count: 328
            }
          ],
          categories: [
            { id: 1, name: 'Fiction', description: 'Literary works created from the imagination' },
            { id: 2, name: 'Fantasy', description: 'Fiction with magical or supernatural elements' },
            { id: 3, name: 'Romance', description: 'Stories centered around romantic relationships' },
            { id: 4, name: 'Philosophy', description: 'Books exploring fundamental questions about existence and knowledge' },
            { id: 5, name: 'Science Fiction', description: 'Fiction based on scientific discoveries or advanced technology' },
            { id: 6, name: 'Mystery', description: 'Stories that focus on solving a crime or puzzling event' },
            { id: 7, name: 'Biography', description: 'Account of a person\'s life written by someone else' },
            { id: 8, name: 'History', description: 'Books about past events and human societies' }
          ]
        }
      });
    }, delay);
  });
};