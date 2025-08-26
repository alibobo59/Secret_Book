// src/pages/client/BookDetailPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import { Star, ShoppingCart, Book, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

import { api, reviewAPI } from "../../services/api";
import { Loading } from "../../components/common";
import BookCard from "../../components/client/BookCard";

const BookDetailPage = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [book, setBook] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [reviewEligibility, setReviewEligibility] = useState(null);
  // Thêm state cho sách liên quan
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);

  // Fetch book details
  useEffect(() => {
    const fetchBook = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/books/${id}`);
        console.log("API Response for Book Detail:", response.data); // Debug API response
        const bookData = response.data.data; // Handle nested data
        console.log(bookData);
        setBook(bookData);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch book details");
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  // Fetch reviews for the book
  useEffect(() => {
    const fetchReviews = async () => {
      if (!id) return;
      setReviewsLoading(true);
      try {
        const response = await reviewAPI.getBookReviews(id);
        setReviews(response.data.data || []);
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
      } finally {
        setReviewsLoading(false);
      }
    };
    fetchReviews();
  }, [id]);

  // Check if user can review the book
  useEffect(() => {
    const checkReviewEligibility = async () => {
      if (!user || !id) return;
      try {
        const response = await reviewAPI.canReviewBook(id);
        setCanReview(response.data.can_review);
        setReviewEligibility(response.data);
      } catch (err) {
        console.error("Failed to check review eligibility:", err);
        setCanReview(false);
      }
    };
    checkReviewEligibility();
  }, [user, id]);

  // Fetch related books (theo embedding). Fallback: cùng tác giả/cùng danh mục
  useEffect(() => {
    const fetchRelated = async () => {
      if (!id) return;
      setRelatedLoading(true);
      try {
        const res = await api.get(`/books/${id}/related`);
        let items = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
          ? res.data.data
          : [];

        const currentId = parseInt(id);
        items = (items || []).filter((b) => b && b.id !== currentId);

        if ((!items || items.length === 0) && book) {
          let fallback = [];
          if (book.author_id) {
            try {
              const byAuthor = await api.get(`/books`, {
                params: { author_id: book.author_id, per_page: 12 },
              });
              const listA = Array.isArray(byAuthor.data)
                ? byAuthor.data
                : Array.isArray(byAuthor.data?.data)
                ? byAuthor.data.data
                : [];
              fallback = listA.filter((b) => b && b.id !== currentId);
            } catch (e) {
              console.warn("Fallback by author failed", e);
            }
          }
          if ((!fallback || fallback.length === 0) && book.category_id) {
            try {
              const byCategory = await api.get(`/books`, {
                params: { category_id: book.category_id, per_page: 12 },
              });
              const listC = Array.isArray(byCategory.data)
                ? byCategory.data
                : Array.isArray(byCategory.data?.data)
                ? byCategory.data.data
                : [];
              fallback = listC.filter((b) => b && b.id !== currentId);
            } catch (e) {
              console.warn("Fallback by category failed", e);
            }
          }
          items = fallback.slice(0, 4);
        }

        setRelatedBooks(items.slice(0, 4));
      } catch (e) {
        console.error("Failed to fetch related books:", e);
        setRelatedBooks([]);
      } finally {
        setRelatedLoading(false);
      }
    };

    fetchRelated();
  }, [id, book]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
            Không Tìm Thấy Sách
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || "Sách bạn đang tìm kiếm không tồn tại."}
          </p>
          <Link
            to="/books"
            className="inline-flex items-center text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Quay Lại Danh Sách Sách
          </Link>
        </div>
      </div>
    );
  }

  // Helper function to get variation name from attributes
  const getVariationName = (variation) => {
    if (!variation.attributes || typeof variation.attributes !== 'object') {
      return variation.type || 'Biến thể';
    }
    
    const attributeStrings = Object.entries(variation.attributes).map(
      ([key, value]) => `${key}: ${value}`
    );
    
    return attributeStrings.join(', ');
  };

  // Get current product info (book or selected variation)
  const getCurrentProduct = () => {
    if (selectedVariation) {
      return {
        ...book,
        // Override specific variation properties without overriding book.id
        price: selectedVariation.price,
        image: selectedVariation.image || book.image,
        stock_quantity: selectedVariation.stock_quantity,
        variation_id: selectedVariation.id,
        variation_name: getVariationName(selectedVariation),
        sku: selectedVariation.sku // Ensure SKU is included for variations
      };
    }
    return book;
  };

  const handleAddToCart = () => {
    const productToAdd = getCurrentProduct();
    addToCart(productToAdd, quantity);
  };

  // Handle variation selection
  const handleVariationSelect = (variation) => {
    setSelectedVariation(variation);
    setQuantity(1); // Reset quantity when changing variation
  };

  // Get current stock and price
  const getCurrentStock = () => {
    if (hasVariations) {
      if (selectedVariation) {
        return parseInt(selectedVariation.stock_quantity) || 0;
      }
      // If has variations but no variation selected, return null to indicate no stock info
      return null;
    }
    return parseInt(book?.stock_quantity || book?.stock) || 0;
  };

  const getCurrentPrice = () => {
    if (selectedVariation) {
      return parseInt(selectedVariation.price) || 0;
    }
    return parseInt(book?.price) || 0;
  };

  // Get current image (book or selected variation)
  const getCurrentImage = () => {
    if (selectedVariation && selectedVariation.image) {
      return selectedVariation.image;
    }
    return book?.image;
  };

  // Check if book has variations
  const hasVariations = book?.variations && book.variations.length > 0;

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (rating === 0) return;

    try {
      const reviewData = {
        book_id: parseInt(id),
        rating: rating,
        review: review.trim() || null,
      };

      await reviewAPI.submitReview(reviewData);

      // Reset form
      setRating(0);
      setReview("");
      setShowReviewForm(false);

      // Refresh reviews and book data
      const [reviewsResponse, bookResponse] = await Promise.all([
        reviewAPI.getBookReviews(id),
        api.get(`/books/${id}`),
      ]);

      setReviews(reviewsResponse.data.data || []);
      setBook(bookResponse.data.data || bookResponse.data);

      // Update review eligibility
      setCanReview(false);
    } catch (err) {
      console.error("Failed to submit review:", err);
      alert(err.response?.data?.message || "Failed to submit review");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        to="/books"
        className="inline-flex items-center text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 mb-6">
        <ArrowLeft className="h-5 w-5 mr-2" />
        Quay Lại Danh Sách Sách
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Book Image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}>
          <div className="relative aspect-[3/4] rounded-lg overflow-hidden shadow-lg">
            <img
              src={`http://127.0.0.1:8000/storage/${getCurrentImage()}`}
              alt={selectedVariation ? `${book.title} - ${getVariationName(selectedVariation)}` : book.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        </motion.div>
        
        {/* Book Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6">
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-800 dark:text-white mb-2">
              {book.title}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Tác giả: {book.author?.name || "Tác giả không xác định"}
            </p>
          </div>

          {/* Rating */}
          <div className="flex items-center space-x-2">
            <div className="flex text-amber-500">
              {[...Array(5)].map((_, index) => (
                <Star
                  key={index}
                  className={`h-5 w-5 ${
                    index < Math.floor(book.average_rating)
                      ? "fill-current"
                      : index < book.average_rating
                      ? "fill-current opacity-50"
                      : ""
                  }`}
                />
              ))}
            </div>
            <span className="text-gray-600 dark:text-gray-400">
              ({book.reviews_count || 0} đánh giá)
            </span>
          </div>

          {/* Book Info */}
          <div className="space-y-3">
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <Book className="h-5 w-5 mr-2" />
              Nhà xuất bản: {book.publisher?.name || "Không có"}
            </div>
          </div>

          {/* Book Description */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Mô Tả Sách
            </h3>
            <div className="text-gray-700 dark:text-gray-300 leading-relaxed prose max-w-none"
                 dangerouslySetInnerHTML={{ __html: book.description || "Không có mô tả" }}>
            </div>
          </div>

          {/* Variations Selection */}
          {hasVariations && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Chọn biến thể
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {book.variations.map((variation) => {
                  const isSelected = selectedVariation?.id === variation.id;
                  const variationStock = parseInt(variation.stock_quantity) || 0;
                  const isOutOfStock = variationStock <= 0;
                  
                  return (
                    <div
                      key={variation.id}
                      onClick={() => !isOutOfStock && handleVariationSelect(variation)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-400'
                          : isOutOfStock
                          ? 'border-gray-200 bg-gray-100 dark:bg-gray-800 dark:border-gray-700 cursor-not-allowed opacity-50'
                          : 'border-gray-200 dark:border-gray-600 hover:border-amber-300 dark:hover:border-amber-500 bg-white dark:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {getVariationName(variation)}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Tồn kho: {variationStock} cuốn
                          </p>
                          <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                            {parseInt(variation.price).toLocaleString("vi-VN")}₫
                          </p>
                        </div>
                        {variation.image && (
                          <div className="ml-3">
                            <img
                              src={`http://127.0.0.1:8000/storage/${variation.image}`}
                              alt={getVariationName(variation)}
                              className="w-16 h-16 object-cover rounded"
                            />
                          </div>
                        )}
                      </div>
                      {isOutOfStock && (
                        <p className="text-sm text-red-500 mt-2">Hết hàng</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Price and Add to Cart */}
          <div className="space-y-4">
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-gray-800 dark:text-white">
                {getCurrentPrice().toLocaleString("vi-VN")} ₫
              </span>
              {selectedVariation && (
                <span className="ml-4 text-sm text-amber-600 dark:text-amber-400">
                  ({getVariationName(selectedVariation)})
                </span>
              )}
              {getCurrentStock() !== null && (
                <span
                  className={`ml-4 px-3 py-1 rounded-full text-sm ${
                    getCurrentStock() > 10
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : getCurrentStock() > 0
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  }`}>
                  {getCurrentStock() > 10
                    ? "Còn hàng"
                    : getCurrentStock() > 0
                    ? `Chỉ còn ${getCurrentStock()} cuốn`
                    : "Hết hàng"}
                </span>
              )}
              {hasVariations && !selectedVariation && (
                <span className="ml-4 px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  Vui lòng chọn biến thể
                </span>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-24">
                <label htmlFor="quantity" className="sr-only">
                  Số lượng
                </label>
                <input
                  type="number"
                  id="quantity"
                  min="1"
                  max={getCurrentStock() || 1}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                />
              </div>
              <button
                onClick={handleAddToCart}
                disabled={getCurrentStock() === null || getCurrentStock() === 0 || (hasVariations && !selectedVariation)}
                className="flex-1 flex items-center justify-center px-6 py-3 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Thêm Vào Giỏ
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Related Books Section */}
      <div className="mt-16">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-serif font-bold text-gray-800 dark:text-white">
            Sách Liên Quan
          </h2>
        </div>
        {relatedLoading ? (
          <Loading size={32} message="Đang gợi ý..." />
        ) : relatedBooks && relatedBooks.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedBooks.map((rb, idx) => (
              <motion.div
                key={rb.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
              >
                <BookCard book={rb} />
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-600 dark:text-gray-400">
            Chưa có gợi ý phù hợp.
          </p>
        )}
      </div>

      {/* Reviews Section */}
      <div className="mt-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-serif font-bold text-gray-800 dark:text-white">
            Đánh Giá Khách Hàng
          </h2>
          {user && canReview && !showReviewForm && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400">
              Viết Đánh Giá
            </button>
          )}
          {user && !canReview && reviewEligibility && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {reviewEligibility.reason}
            </p>
          )}
        </div>

        {/* Review Form */}
        {showReviewForm && (
          <motion.form
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 shadow-md"
            onSubmit={handleSubmitReview}>
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                Đánh giá
              </label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    onMouseEnter={() => setHoveredRating(value)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="focus:outline-none">
                    <Star
                      className={`h-6 w-6 ${
                        value <= (hoveredRating || rating)
                          ? "text-amber-500 fill-current"
                          : "text-gray-300 dark:text-gray-600"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                Nhận xét
              </label>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                rows="4"></textarea>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
                Hủy
              </button>
              <button
                type="submit"
                disabled={rating === 0}
                className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
                Gửi Đánh Giá
              </button>
            </div>
          </motion.form>
        )}

        {/* Reviews List */}
        <div className="space-y-6">
          {reviewsLoading ? (
            <Loading size={32} message="Đang tải..." />
          ) : reviews && reviews.length > 0 ? (
            reviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">
                      {review.user?.name || "Anonymous"}
                    </p>
                    <div className="flex text-amber-500 mt-1">
                      {[...Array(5)].map((_, starIndex) => (
                        <Star
                          key={starIndex}
                          className={`h-4 w-4 ${
                            starIndex < review.rating ? "fill-current" : ""
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
                {review.review && (
                  <p className="text-gray-700 dark:text-gray-300">
                    {review.review}
                  </p>
                )}
              </motion.div>
            ))
          ) : (
            <p className="text-center text-gray-600 dark:text-gray-400">
              {"Chưa có đánh giá nào"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookDetailPage;
