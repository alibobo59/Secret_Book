import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Star,
  ArrowLeft,
  CheckCircle,
  Package,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useOrder } from "../../contexts/OrderContext";
import { reviewAPI } from "../../services/api";

const ReviewPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getUserOrders } = useOrder();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState({});
  const [submitting, setSubmitting] = useState({});
  const [submitted, setSubmitted] = useState({});

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    loadOrderDetails();
  }, [orderId, user, navigate]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      const orders = await getUserOrders();
      const foundOrder = orders.find(o => o.id.toString() === orderId);
      
      if (!foundOrder) {
        setError("Order not found");
        return;
      }
      
      if (foundOrder.status !== "delivered") {
        setError("You can only review delivered orders");
        return;
      }
      
      setOrder(foundOrder);
      
      // Initialize review states for each item
      const initialReviews = {};
      for (const item of foundOrder.items || []) {
        const bookId = item.book_id || item.bookId;
        try {
          // Check if user can review this book
          const canReviewResponse = await reviewAPI.canReviewBook(bookId);
          if (canReviewResponse.data.can_review) {
            initialReviews[bookId] = {
              rating: 0,
              review: "",
              hoveredRating: 0
            };
          } else {
            console.log(`Cannot review book ${bookId}: ${canReviewResponse.data.reason}`);
          }
        } catch (error) {
          console.error(`Error checking review permission for book ${bookId}:`, error);
        }
      }
      setReviews(initialReviews);
      
    } catch (err) {
      console.error("Failed to load order:", err);
      setError("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const updateReview = (bookId, field, value) => {
    setReviews(prev => ({
      ...prev,
      [bookId]: {
        ...prev[bookId],
        [field]: value
      }
    }));
  };

  const submitReview = async (bookId) => {
    const reviewData = reviews[bookId];
    if (!reviewData || reviewData.rating === 0) {
      alert("Please provide a rating");
      return;
    }

    setSubmitting(prev => ({ ...prev, [bookId]: true }));
    
    try {
      // Check if user can still review the book
      const canReviewResponse = await reviewAPI.canReviewBook(bookId);
      if (!canReviewResponse.data.can_review) {
        alert(canReviewResponse.data.reason);
        return;
      }

      await reviewAPI.submitReview({
        book_id: bookId,
        rating: reviewData.rating,
        review: reviewData.review.trim() || null
      });
      
      setSubmitted(prev => ({ ...prev, [bookId]: true }));
      alert("Review submitted successfully!");
      
      // Check if all items have been reviewed
      const reviewableItems = order?.items?.filter(item => {
        const itemBookId = item.book_id || item.bookId;
        return reviews[itemBookId] !== undefined;
      });
      
      const allItemsReviewed = reviewableItems?.every(item => {
        const itemBookId = item.book_id || item.bookId;
        return itemBookId === bookId || submitted[itemBookId];
      });
      
      // If all reviewable items are reviewed, navigate back to orders after a short delay
      if (allItemsReviewed) {
        setTimeout(() => {
          navigate("/orders");
        }, 2000);
      }
      
    } catch (error) {
      console.error("Failed to submit review:", error);
      const errorMessage = error.response?.data?.message || "Failed to submit review. Please try again.";
      alert(errorMessage);
    } finally {
      setSubmitting(prev => ({ ...prev, [bookId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">
              Loading order details...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <Link
                to="/orders"
                className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Orders
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8">
          <Link
            to="/orders"
            className="inline-flex items-center text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 mb-4">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Orders
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <Package className="h-8 w-8 text-amber-600 dark:text-amber-500" />
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                Review Your Order
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Order #{order?.order_number || order?.id} • Delivered on{" "}
                {new Date(order?.updated_at || order?.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Review Items */}
        <div className="space-y-6">
          {order?.items?.map((item, index) => {
            const bookId = item.book_id || item.bookId;
            const reviewData = reviews[bookId] || { rating: 0, review: "", hoveredRating: 0 };
            const isSubmitted = submitted[bookId];
            const isSubmitting = submitting[bookId];

            return (
              <motion.div
                key={bookId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                
                {/* Book Info */}
                <div className="flex gap-4 mb-6">
                  <img
                    src={item.book?.image_url || item.coverImage || '/placeholder-book.jpg'}
                    alt={item.book?.title || item.title}
                    className="w-20 h-28 object-cover rounded"
                  />
                  <div className="flex-grow">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                      {item.book?.title || item.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      by {item.book?.author?.name || item.author}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>Quantity: {item.quantity}</span>
                      <span>•</span>
                      <span>Price: ${((item.price / 100) * item.quantity).toFixed(2)}</span>
                    </div>
                    {!isReviewable && (
                      <p className="mt-2 text-amber-600 dark:text-amber-500">
                        <AlertCircle className="inline-block w-4 h-4 mr-1" />
                        You have already reviewed this book
                      </p>
                    )}
                  </div>
                </div>

                {isSubmitted ? (
                  /* Success State */
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                      Review Submitted!
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      Thank you for your feedback.
                    </p>
                  </div>
                ) : (
                  /* Review Form */
                  <div>
                    {/* Rating */}
                    <div className="mb-6">
                      <label className="block text-gray-700 dark:text-gray-300 mb-3 font-medium">
                        How would you rate this book?
                      </label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => updateReview(bookId, 'rating', value)}
                            onMouseEnter={() => updateReview(bookId, 'hoveredRating', value)}
                            onMouseLeave={() => updateReview(bookId, 'hoveredRating', 0)}
                            className="focus:outline-none transition-transform hover:scale-110">
                            <Star
                              className={`h-8 w-8 ${
                                value <= (reviewData.hoveredRating || reviewData.rating)
                                  ? "text-amber-500 fill-current"
                                  : "text-gray-300 dark:text-gray-600"
                              }`}
                            />
                          </button>
                        ))}
                        {reviewData.rating > 0 && (
                          <span className="ml-3 text-gray-600 dark:text-gray-400">
                            {reviewData.rating} out of 5 stars
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Review Text */}
                    <div className="mb-6">
                      <label className="block text-gray-700 dark:text-gray-300 mb-3 font-medium">
                        Share your thoughts (optional)
                      </label>
                      <textarea
                        value={reviewData.review}
                        onChange={(e) => updateReview(bookId, 'review', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        rows="4"
                        placeholder="What did you think about this book? How was the quality, story, etc.?"
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                      <button
                        onClick={() => submitReview(bookId)}
                        disabled={reviewData.rating === 0 || isSubmitting}
                        className="px-6 py-3 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2">
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Star className="h-4 w-4" />
                            Submit Review
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Your reviews help other customers make informed decisions.
          </p>
          <Link
            to="/orders"
            className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to My Orders
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default ReviewPage;