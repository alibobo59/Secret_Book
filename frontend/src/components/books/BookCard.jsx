import React from "react";
import { Link } from "react-router-dom";
import { Star, ShoppingCart } from "lucide-react";
import { useCart } from "../../contexts/CartContext";
import { motion } from "framer-motion";
import { useLanguage } from "../../contexts/LanguageContext";

const BookCard = ({ book }) => {
  const { addToCart } = useCart();
  const { t } = useLanguage();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(book);
  };

  return (
    <Link to={`/books/${book.id}`}>
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden h-full hover:shadow-lg transition-shadow duration-300"
        whileHover={{ y: -5 }}
        transition={{ type: "spring", stiffness: 300 }}>
        <div className="relative pb-[140%] overflow-hidden">
          <img
            src={book.cover_image}
            alt={book.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
          <div className="absolute top-2 right-2">
            <button
              onClick={handleAddToCart}
              className="p-2 bg-amber-600 text-white rounded-full opacity-0 hover:bg-amber-700 hover:scale-110 transform transition-all duration-300 group-hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50"
              aria-label={t("addToCart")}>
              <ShoppingCart className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-1 line-clamp-1">
            {book.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
            {book.author}
          </p>
          <div className="flex items-center mb-2">
            <div className="flex text-amber-500">
              {[...Array(5)].map((_, index) => (
                <Star
                  key={index}
                  className={`h-4 w-4 ${
                    index < Math.floor(book.average_rating)
                      ? "fill-current"
                      : index < book.average_rating
                      ? "fill-current opacity-50"
                      : ""
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400 ml-2">
              ({book.ratings?.length || 0} {t("reviews")})
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-bold text-gray-800 dark:text-white">
              ${book.price.toFixed(2)}
            </span>
            <span
              className={`text-xs px-2 py-1 rounded ${
                book.stock > 10
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : book.stock > 0
                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
              }`}>
              {book.stock > 10
                ? t("inStock")
                : book.stock > 0
                ? t("onlyXLeft", { count: book.stock })
                : t("outOfStock")}
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default BookCard;
