import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, AlertCircle } from 'lucide-react';
import { useReview } from '../../contexts/ReviewContext';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const ReviewInteractionButtons = ({ 
  reviewId, 
  initialLikes = 0, 
  initialDislikes = 0,
  className = "" 
}) => {
  const { user } = useAuth();
  const { 
    likeReview, 
    dislikeReview, 
    getReviewInteraction, 
    loading 
  } = useReview();
  
  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const userInteraction = getReviewInteraction(reviewId);
  const hasLiked = userInteraction?.type === 'like';
  const hasDisliked = userInteraction?.type === 'dislike';

  const handleLike = async () => {
    if (!user) {
      setShowLoginPrompt(true);
      setTimeout(() => setShowLoginPrompt(false), 3000);
      return;
    }

    if (isProcessing) return;
    setIsProcessing(true);

    try {
      await likeReview(reviewId);
      
      // Update local counts based on previous state
      if (hasLiked) {
        setLikes(prev => prev - 1);
      } else if (hasDisliked) {
        setLikes(prev => prev + 1);
        setDislikes(prev => prev - 1);
      } else {
        setLikes(prev => prev + 1);
      }
    } catch (error) {
      console.error('Failed to like review:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDislike = async () => {
    if (!user) {
      setShowLoginPrompt(true);
      setTimeout(() => setShowLoginPrompt(false), 3000);
      return;
    }

    if (isProcessing) return;
    setIsProcessing(true);

    try {
      await dislikeReview(reviewId);
      
      // Update local counts based on previous state
      if (hasDisliked) {
        setDislikes(prev => prev - 1);
      } else if (hasLiked) {
        setDislikes(prev => prev + 1);
        setLikes(prev => prev - 1);
      } else {
        setDislikes(prev => prev + 1);
      }
    } catch (error) {
      console.error('Failed to dislike review:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center gap-4">
        {/* Like Button */}
        <button
          onClick={handleLike}
          disabled={isProcessing}
          className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 ${
            hasLiked
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400'
          } ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          title={user ? (hasLiked ? 'Remove like' : 'Like this review') : 'Login to like reviews'}
        >
          <motion.div
            animate={hasLiked ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            <ThumbsUp 
              className={`h-4 w-4 ${hasLiked ? 'fill-current' : ''}`} 
            />
          </motion.div>
          <span className="text-sm font-medium">{likes}</span>
        </button>

        {/* Dislike Button */}
        <button
          onClick={handleDislike}
          disabled={isProcessing}
          className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 ${
            hasDisliked
              ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400'
          } ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          title={user ? (hasDisliked ? 'Remove dislike' : 'Dislike this review') : 'Login to dislike reviews'}
        >
          <motion.div
            animate={hasDisliked ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            <ThumbsDown 
              className={`h-4 w-4 ${hasDisliked ? 'fill-current' : ''}`} 
            />
          </motion.div>
          <span className="text-sm font-medium">{dislikes}</span>
        </button>

        {/* Helpful indicator */}
        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
          <span>{likes > dislikes ? 'Helpful' : likes === dislikes ? 'Mixed' : 'Not helpful'}</span>
        </div>
      </div>

      {/* Login Prompt */}
      <AnimatePresence>
        {showLoginPrompt && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 mt-2 p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-md shadow-lg z-10 min-w-max"
          >
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Please login to interact with reviews</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReviewInteractionButtons;