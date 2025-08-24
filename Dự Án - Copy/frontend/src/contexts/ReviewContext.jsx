import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const ReviewContext = createContext();

export const useReview = () => {
  const context = useContext(ReviewContext);
  if (!context) {
    throw new Error('useReview must be used within a ReviewProvider');
  }
  return context;
};

export const ReviewProvider = ({ children }) => {
  const { user } = useAuth();
  const [userInteractions, setUserInteractions] = useState({
    likedReviews: [],
    dislikedReviews: [],
  });

  useEffect(() => {
    loadUserInteractions();
  }, [user]);

  const loadUserInteractions = () => {
    if (!user) return;
    
    const stored = localStorage.getItem(`reviewInteractions_${user.id}`);
    if (stored) {
      setUserInteractions(JSON.parse(stored));
    }
  };

  const saveUserInteractions = (interactions) => {
    if (!user) return;
    localStorage.setItem(`reviewInteractions_${user.id}`, JSON.stringify(interactions));
  };

  const likeReview = (reviewId) => {
    const newInteractions = {
      ...userInteractions,
      likedReviews: [...userInteractions.likedReviews, reviewId],
      dislikedReviews: userInteractions.dislikedReviews.filter(id => id !== reviewId)
    };
    setUserInteractions(newInteractions);
    saveUserInteractions(newInteractions);
  };

  const dislikeReview = (reviewId) => {
    const newInteractions = {
      ...userInteractions,
      dislikedReviews: [...userInteractions.dislikedReviews, reviewId],
      likedReviews: userInteractions.likedReviews.filter(id => id !== reviewId)
    };
    setUserInteractions(newInteractions);
    saveUserInteractions(newInteractions);
  };

  const removeLike = (reviewId) => {
    const newInteractions = {
      ...userInteractions,
      likedReviews: userInteractions.likedReviews.filter(id => id !== reviewId)
    };
    setUserInteractions(newInteractions);
    saveUserInteractions(newInteractions);
  };

  const removeDislike = (reviewId) => {
    const newInteractions = {
      ...userInteractions,
      dislikedReviews: userInteractions.dislikedReviews.filter(id => id !== reviewId)
    };
    setUserInteractions(newInteractions);
    saveUserInteractions(newInteractions);
  };

  const getInteractionStatus = (reviewId) => {
    return {
      liked: userInteractions.likedReviews.includes(reviewId),
      disliked: userInteractions.dislikedReviews.includes(reviewId)
    };
  };

  const getUserInteractionStats = () => {
    return {
      totalLikes: userInteractions.likedReviews.length,
      totalDislikes: userInteractions.dislikedReviews.length,
      totalInteractions: userInteractions.likedReviews.length + userInteractions.dislikedReviews.length
    };
  };

  const value = {
    userInteractions,
    likeReview,
    dislikeReview,
    removeLike,
    removeDislike,
    getInteractionStatus,
    getUserInteractionStats,
  };

  return (
    <ReviewContext.Provider value={value}>
      {children}
    </ReviewContext.Provider>
  );
};