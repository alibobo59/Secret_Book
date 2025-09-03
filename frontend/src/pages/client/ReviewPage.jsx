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
  const [selectedImages, setSelectedImages] = useState({}); // { [bookId]: File[] }
  const [imagePreviews, setImagePreviews] = useState({}); // { [bookId]: string[] }

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
        setError("Không tìm thấy đơn hàng");
        return;
      }
      
      if (foundOrder.status !== "delivered") {
        setError("Bạn chỉ có thể đánh giá các đơn hàng đã giao");
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
            console.log(`Không thể đánh giá sách ${bookId}: ${canReviewResponse.data.reason}`);
          }
        } catch (error) {
          console.error(`Lỗi khi kiểm tra quyền đánh giá cho sách ${bookId}:`, error);
        }
      }
      setReviews(initialReviews);
      
    } catch (err) {
      console.error("Tải đơn hàng thất bại:", err);
      setError("Không thể tải chi tiết đơn hàng");
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

  // Image handlers per book
  const handleImageChange = (bookId, e) => {
    const files = Array.from(e.target.files || []);
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    const filtered = files.filter((f) => validTypes.includes(f.type));
    const combined = [...(selectedImages[bookId] || []), ...filtered].slice(0, 3);

    // cleanup old previews
    (imagePreviews[bookId] || []).forEach((url) => URL.revokeObjectURL(url));

    const previews = combined.map((f) => URL.createObjectURL(f));
    setSelectedImages((prev) => ({ ...prev, [bookId]: combined }));
    setImagePreviews((prev) => ({ ...prev, [bookId]: previews }));

    // reset input
    e.target.value = "";
  };

  const handleRemoveImage = (bookId, idx) => {
    const currentFiles = selectedImages[bookId] || [];
    const currentPreviews = imagePreviews[bookId] || [];
    if (currentPreviews[idx]) URL.revokeObjectURL(currentPreviews[idx]);
    const nextFiles = currentFiles.filter((_, i) => i !== idx);
    const nextPreviews = currentPreviews.filter((_, i) => i !== idx);
    setSelectedImages((prev) => ({ ...prev, [bookId]: nextFiles }));
    setImagePreviews((prev) => ({ ...prev, [bookId]: nextPreviews }));
  };

  const submitReview = async (bookId) => {
    const reviewData = reviews[bookId];
    if (!reviewData || reviewData.rating === 0) {
      alert("Vui lòng chọn mức đánh giá");
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
        review: reviewData.review.trim() || null,
        images: selectedImages[bookId] || [],
      });
      
      setSubmitted(prev => ({ ...prev, [bookId]: true }));
      alert("Gửi đánh giá thành công!");

      // cleanup previews for this book
      (imagePreviews[bookId] || []).forEach((url) => URL.revokeObjectURL(url));
      setSelectedImages((prev) => ({ ...prev, [bookId]: [] }));
      setImagePreviews((prev) => ({ ...prev, [bookId]: [] }));
      
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
      console.error("Gửi đánh giá thất bại:", error);
      const errorMessage = error.response?.data?.message || "Gửi đánh giá thất bại. Vui lòng thử lại.";
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
              Đang tải chi tiết đơn hàng...
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
                Quay lại đơn hàng
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
            Quay lại đơn hàng
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <Package className="h-8 w-8 text-amber-600 dark:text-amber-500" />
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                Đánh giá đơn hàng của bạn
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Đơn hàng #{order?.order_number || order?.id} • Đã giao vào{" "}
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
            const isReviewable = bookId && reviews.hasOwnProperty(bookId);

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
                      bởi {item.book?.author?.name || item.author}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>Số lượng: {item.quantity}</span>
                      <span>•</span>
                      <span>Giá: {((item.price / 100) * item.quantity).toLocaleString('vi-VN')} ₫</span>
                    </div>
                    {!isReviewable && (
                      <p className="mt-2 text-amber-600 dark:text-amber-500">
                        <AlertCircle className="inline-block w-4 h-4 mr-1" />
                        Bạn đã đánh giá sách này rồi
                      </p>
                    )}
                  </div>
                </div>

                {isSubmitted ? (
                  /* Success State */
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                      Đã gửi đánh giá!
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      Cảm ơn bạn đã phản hồi.
                    </p>
                  </div>
                ) : (
                  /* Review Form */
                  <div>
                    {/* Rating */}
                    <div className="mb-6">
                      <label className="block text-gray-700 dark:text-gray-300 mb-3 font-medium">
                        Bạn đánh giá cuốn sách này như thế nào?
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
                            {reviewData.rating} trên 5 sao
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Review Text */}
                    <div className="mb-6">
                      <label className="block text-gray-700 dark:text-gray-300 mb-3 font-medium">
                        Chia sẻ cảm nhận của bạn (tùy chọn)
                      </label>
                      <textarea
                        value={reviewData.review}
                        onChange={(e) => updateReview(bookId, 'review', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        rows="4"
                        placeholder="Chia sẻ suy nghĩ của bạn (tùy chọn)"
                      />
                    </div>

                    {/* Review Images */}
                    <div className="mb-6">
                      <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
                        Ảnh minh họa (tùy chọn, tối đa 3 ảnh)
                      </label>
                      <input
                        type="file"
                        multiple
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={(e) => handleImageChange(bookId, e)}
                        className="block w-full text-sm text-gray-900 dark:text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 dark:file:bg-gray-700 dark:file:text-gray-200"
                      />

                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{(imagePreviews[bookId]?.length || 0)}/3 ảnh đã chọn</p>
                      
                       {imagePreviews[bookId]?.length > 0 && (
                        <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                           {imagePreviews[bookId].map((src, idx) => (
                              <div key={idx} className="relative group rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900 ring-1 ring-gray-200 dark:ring-gray-700">
                                <div className="aspect-square">
                                  <img src={src} alt={`preview-${idx}`} className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105" />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveImage(bookId, idx)}
                                  className="absolute top-1 right-1 px-2 py-1 text-xs bg-black/70 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                  Xóa
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      
                       <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                         Hỗ trợ JPG, PNG, WEBP, GIF. Tối đa 3 ảnh.
                       </p>
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
                            Đang gửi...
                          </>
                        ) : (
                          <>
                            <Star className="h-4 w-4" />
                            Gửi đánh giá
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
            Đánh giá của bạn giúp những khách hàng khác đưa ra quyết định tốt hơn.
          </p>
          <Link
            to="/orders"
            className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại đơn hàng của tôi
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default ReviewPage;