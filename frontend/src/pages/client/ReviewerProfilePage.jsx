import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User,
  Star,
  Calendar,
  BookOpen,
  ArrowLeft,
  Award,
  TrendingUp,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import ReviewInteractionButtons from "../components/reviews/ReviewInteractionButtons";

const ReviewerProfilePage = () => {
  const { reviewerId } = useParams();
  const { t } = useLanguage();
  const [reviewer, setReviewer] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    // Simulate API call to fetch reviewer data
    const fetchReviewerData = async () => {
      setLoading(true);
      
      // Mock reviewer data
      const mockReviewer = {
        id: parseInt(reviewerId),
        name: "Jane Smith",
        username: "bookworm_jane",
        avatar: null,
        joinDate: "2022-03-15",
        totalReviews: 47,
        averageRating: 4.2,
        helpfulVotes: 156,
        bio: "Passionate reader with a love for contemporary fiction and mystery novels. Always looking for the next page-turner!",
        favoriteGenres: ["Fiction", "Mystery", "Romance", "Thriller"],
        badges: [
          { name: "Top Reviewer", icon: Award, color: "text-yellow-500" },
          { name: "Helpful Reviewer", icon: TrendingUp, color: "text-green-500" },
        ],
      };

      // Mock reviews data with like/dislike counts
      const mockReviews = [
        {
          id: 1,
          bookId: 1,
          bookTitle: "The Great Gatsby",
          bookAuthor: "F. Scott Fitzgerald",
          bookCover: "https://images.pexels.com/photos/4170629/pexels-photo-4170629.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
          rating: 5,
          review: "A timeless classic that never fails to captivate. Fitzgerald's prose is absolutely beautiful, and the story of Jay Gatsby's pursuit of the American Dream is both tragic and compelling. The symbolism throughout the novel is masterful.",
          date: "2023-07-15",
          helpfulVotes: 23,
          verified: true,
          likes: 28,
          dislikes: 3,
        },
        {
          id: 2,
          bookId: 2,
          bookTitle: "To Kill a Mockingbird",
          bookAuthor: "Harper Lee",
          bookCover: "https://images.pexels.com/photos/7034646/pexels-photo-7034646.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
          rating: 5,
          review: "An incredibly powerful and important book that everyone should read. Harper Lee's portrayal of racial injustice through the eyes of Scout Finch is both heartbreaking and enlightening. The character development is exceptional.",
          date: "2023-07-10",
          helpfulVotes: 31,
          verified: true,
          likes: 35,
          dislikes: 2,
        },
        {
          id: 3,
          bookId: 6,
          bookTitle: "1984",
          bookAuthor: "George Orwell",
          bookCover: "https://images.pexels.com/photos/4170629/pexels-photo-4170629.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
          rating: 4,
          review: "Orwell's dystopian masterpiece is more relevant today than ever. The concepts of Big Brother, thoughtcrime, and doublethink are chillingly prescient. While the pacing can be slow at times, the overall impact is undeniable.",
          date: "2023-07-05",
          helpfulVotes: 18,
          verified: false,
          likes: 22,
          dislikes: 5,
        },
        {
          id: 4,
          bookId: 4,
          bookTitle: "Pride and Prejudice",
          bookAuthor: "Jane Austen",
          bookCover: "https://images.pexels.com/photos/6373305/pexels-photo-6373305.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
          rating: 4,
          review: "Austen's wit and social commentary shine through in this delightful romance. Elizabeth Bennet is a wonderful protagonist, and the slow-burn romance with Mr. Darcy is perfectly executed. A true classic of English literature.",
          date: "2023-06-28",
          helpfulVotes: 15,
          verified: true,
          likes: 19,
          dislikes: 2,
        },
        {
          id: 5,
          bookId: 3,
          bookTitle: "The Hobbit",
          bookAuthor: "J.R.R. Tolkien",
          bookCover: "https://images.pexels.com/photos/13660017/pexels-photo-13660017.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
          rating: 5,
          review: "The perfect introduction to Middle-earth! Tolkien's world-building is extraordinary, and Bilbo's journey from comfortable hobbit to unlikely hero is beautifully told. The adventure is thrilling and the characters are memorable.",
          date: "2023-06-20",
          helpfulVotes: 27,
          verified: true,
          likes: 31,
          dislikes: 1,
        },
      ];

      // Simulate loading delay
      setTimeout(() => {
        setReviewer(mockReviewer);
        setReviews(mockReviews);
        setLoading(false);
      }, 800);
    };

    fetchReviewerData();
  }, [reviewerId]);

  const sortedReviews = [...reviews].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.date) - new Date(a.date);
      case "oldest":
        return new Date(a.date) - new Date(b.date);
      case "highest":
        return b.rating - a.rating;
      case "lowest":
        return a.rating - b.rating;
      case "helpful":
        return b.helpfulVotes - a.helpfulVotes;
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8">
            <div className="flex items-center gap-6 mb-6">
              <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="space-y-3">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!reviewer) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
            Reviewer Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The reviewer profile you're looking for doesn't exist.
          </p>
          <Link
            to="/books"
            className="inline-flex items-center text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Books
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <Link
          to="/books"
          className="inline-flex items-center text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 mb-6">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Books
        </Link>

        {/* Reviewer Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 flex items-center justify-center text-white text-3xl font-bold">
              {reviewer.avatar ? (
                <img
                  src={reviewer.avatar}
                  alt={reviewer.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                reviewer.name.charAt(0)
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-grow text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                  {reviewer.name}
                </h1>
                <div className="flex gap-2 justify-center md:justify-start">
                  {reviewer.badges.map((badge, index) => {
                    const Icon = badge.icon;
                    return (
                      <div
                        key={index}
                        className={`flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-xs ${badge.color}`}>
                        <Icon className="h-3 w-3" />
                        {badge.name}
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                @{reviewer.username}
              </p>
              
              <p className="text-gray-700 dark:text-gray-300 mb-4 max-w-2xl">
                {reviewer.bio}
              </p>

              {/* Stats */}
              <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Joined {new Date(reviewer.joinDate).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  {reviewer.totalReviews} Reviews
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-amber-500" />
                  {reviewer.averageRating.toFixed(1)} Avg Rating
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  {reviewer.helpfulVotes} Helpful Votes
                </div>
              </div>

              {/* Favorite Genres */}
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Favorite Genres:
                </p>
                <div className="flex flex-wrap gap-2">
                  {reviewer.favoriteGenres.map((genre, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 rounded-full text-sm">
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Reviews Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          
          {/* Reviews Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              Reviews ({reviews.length})
            </h2>
            
            {/* Sort Options */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200">
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
              <option value="helpful">Most Helpful</option>
            </select>
          </div>

          {/* Reviews List */}
          <div className="space-y-6">
            {sortedReviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                
                <div className="flex gap-4">
                  {/* Book Cover */}
                  <Link to={`/books/${review.bookId}`} className="shrink-0">
                    <img
                      src={review.bookCover}
                      alt={review.bookTitle}
                      className="w-16 h-20 object-cover rounded-md hover:opacity-80 transition-opacity"
                    />
                  </Link>

                  {/* Review Content */}
                  <div className="flex-grow">
                    {/* Book Info */}
                    <div className="mb-3">
                      <Link
                        to={`/books/${review.bookId}`}
                        className="text-lg font-semibold text-gray-800 dark:text-white hover:text-amber-600 dark:hover:text-amber-500 transition-colors">
                        {review.bookTitle}
                      </Link>
                      <p className="text-gray-600 dark:text-gray-400">
                        by {review.bookAuthor}
                      </p>
                    </div>

                    {/* Rating and Date */}
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <div className="flex text-amber-500">
                          {[...Array(5)].map((_, starIndex) => (
                            <Star
                              key={starIndex}
                              className={`h-4 w-4 ${
                                starIndex < review.rating ? "fill-current" : ""
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {review.rating}/5
                        </span>
                      </div>
                      
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(review.date).toLocaleDateString()}
                      </span>
                      
                      {review.verified && (
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full">
                          Verified Purchase
                        </span>
                      )}
                    </div>

                    {/* Review Text */}
                    <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                      {review.review}
                    </p>

                    {/* Like/Dislike Buttons */}
                    <ReviewInteractionButtons
                      reviewId={review.id}
                      initialLikes={review.likes}
                      initialDislikes={review.dislikes}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* No Reviews Message */}
          {reviews.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                This reviewer hasn't written any reviews yet.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ReviewerProfilePage;