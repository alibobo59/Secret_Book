import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CommentContext = createContext();

export const useComment = () => {
  return useContext(CommentContext);
};

export const CommentProvider = ({ children }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadComments();
  }, []);

  const loadComments = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const storedComments = localStorage.getItem('orderComments');
      if (storedComments) {
        setComments(JSON.parse(storedComments));
      } else {
        // Initialize with some demo comments
        const demoComments = [
          {
            id: 1,
            orderId: 'ORD-00001',
            userId: 1,
            userName: 'John Doe',
            userAvatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
            comment: 'Great service! Books arrived in perfect condition and faster than expected.',
            rating: 5,
            createdAt: '2024-01-20T10:30:00Z',
            isVerifiedPurchase: true,
          },
          {
            id: 2,
            orderId: 'ORD-00002',
            userId: 2,
            userName: 'Jane Smith',
            userAvatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
            comment: 'Love the book selection and the packaging was excellent. Will definitely order again!',
            rating: 5,
            createdAt: '2024-01-19T15:45:00Z',
            isVerifiedPurchase: true,
          },
          {
            id: 3,
            orderId: 'ORD-00003',
            userId: 3,
            userName: 'Mike Johnson',
            userAvatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg',
            comment: 'Good experience overall. Delivery was on time and books were well-protected.',
            rating: 4,
            createdAt: '2024-01-18T09:20:00Z',
            isVerifiedPurchase: true,
          },
        ];
        setComments(demoComments);
        localStorage.setItem('orderComments', JSON.stringify(demoComments));
      }
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (orderId, commentText, rating = 5) => {
    if (!user) {
      throw new Error('User must be logged in to add comments');
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newComment = {
        id: Date.now(),
        orderId,
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
        comment: commentText,
        rating,
        createdAt: new Date().toISOString(),
        isVerifiedPurchase: true,
      };

      const updatedComments = [newComment, ...comments];
      setComments(updatedComments);
      localStorage.setItem('orderComments', JSON.stringify(updatedComments));

      return newComment;
    } catch (error) {
      console.error('Failed to add comment:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getCommentsByOrder = (orderId) => {
    return comments.filter(comment => comment.orderId === orderId);
  };

  const getUserComments = (userId) => {
    return comments.filter(comment => comment.userId === userId);
  };

  const getAllComments = () => {
    return comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  const getAverageRating = () => {
    if (comments.length === 0) return 0;
    const totalRating = comments.reduce((sum, comment) => sum + comment.rating, 0);
    return (totalRating / comments.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    comments.forEach(comment => {
      distribution[comment.rating]++;
    });
    return distribution;
  };

  const value = {
    comments,
    loading,
    addComment,
    getCommentsByOrder,
    getUserComments,
    getAllComments,
    getAverageRating,
    getRatingDistribution,
    refreshComments: loadComments,
  };

  return (
    <CommentContext.Provider value={value}>
      {children}
    </CommentContext.Provider>
  );
};