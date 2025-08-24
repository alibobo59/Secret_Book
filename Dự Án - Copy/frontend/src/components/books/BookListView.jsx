import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { motion } from 'framer-motion';


const BookListView = ({ book }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(book);
  };

  const averageRating = Number(book.average_rating) || 0;
  const ratingsCount = book.reviews_count || 0;

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : index < rating
            ? 'text-yellow-400 fill-current opacity-50'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg 
                 transition-all duration-300 border border-gray-200 dark:border-gray-700"
    >
      <Link to={`/books/${book.id}`} className="block">
        <div className="flex gap-4 p-4">
          {/* Book Image */}
          <div className="shrink-0">
            <img
              src={book.image || '/api/placeholder/120/160'}
              alt={book.title}
              className="w-20 h-28 object-cover rounded-md shadow-sm"
              onError={(e) => {
                e.target.src = '/api/placeholder/120/160';
              }}
            />
          </div>

          {/* Book Details */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col h-full">
              {/* Title and Author */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white 
                             line-clamp-2 hover:text-amber-600 dark:hover:text-amber-500 transition-colors">
                  {book.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {typeof book.author === 'object' ? book.author?.name || 'Tác giả không xác định' : book.author}
                </p>
                
                {/* Category */}
                {book.category && (
                  <span className="inline-block mt-2 px-2 py-1 text-xs bg-amber-100 dark:bg-amber-900 
                                 text-amber-800 dark:text-amber-200 rounded-full">
                    {typeof book.category === 'object' ? book.category?.name || 'Danh mục không xác định' : book.category}
                  </span>
                )}

                {/* Description */}
                {book.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                    {book.description}
                  </p>
                )}
              </div>

              {/* Rating and Reviews */}
              <div className="flex items-center gap-2 mt-3">
                <div className="flex items-center gap-1">
                  {renderStars(averageRating)}
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {Number(averageRating).toFixed(1)}
                </span>
                {ratingsCount > 0 && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    ({ratingsCount} đánh giá)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Price and Actions */}
          <div className="shrink-0 flex flex-col items-end justify-between">
            {/* Price */}
            <div className="text-right">
              <div className="text-xl font-bold text-amber-600 dark:text-amber-500">
                {(parseInt(book.price) || 0).toLocaleString('vi-VN')} ₫
              </div>
              {book.original_price && parseInt(book.original_price) > parseInt(book.price) && (
                <div className="text-sm text-gray-500 dark:text-gray-400 line-through">
                  {(parseInt(book.original_price) || 0).toLocaleString('vi-VN')} ₫
                </div>
              )}
            </div>

            {/* Add to Cart Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddToCart}
              className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 
                       text-white px-4 py-2 rounded-md transition-colors duration-200 
                       focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2
                       dark:focus:ring-offset-gray-800"
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="text-sm font-medium">Thêm vào giỏ</span>
            </motion.button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default BookListView;