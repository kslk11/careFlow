import React, { useState } from 'react';
import StarRating from './StarRating';

/**
 * ReviewCard Component
 * Displays a single review with user info, rating, and text
 * @param {object} review - Review object
 * @param {boolean} canEdit - Can current user edit this review
 * @param {boolean} canDelete - Can current user delete this review
 * @param {function} onEdit - Edit callback
 * @param {function} onDelete - Delete callback
 * @param {boolean} showCategories - Show category ratings (for hospitals)
 */
const ReviewCard = ({ 
  review, 
  canEdit = false, 
  canDelete = false,
  onEdit = null,
  onDelete = null,
  showCategories = false,
  darkMode = false
}) => {
  const [showFullReview, setShowFullReview] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Handle delete
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    setIsDeleting(true);
    try {
      await onDelete(review._id);
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Failed to delete review');
    } finally {
      setIsDeleting(false);
    }
  };

  // Truncate long reviews
  const reviewText = review.review || '';
  const shouldTruncate = reviewText.length > 200;
  const displayText = shouldTruncate && !showFullReview 
    ? reviewText.substring(0, 200) + '...' 
    : reviewText;

  return (
    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow`}>
      {/* Header: User info and rating */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {/* User Avatar */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            {review.userId?.name?.charAt(0) || 'U'}
          </div>

          {/* User Info */}
          <div>
            <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {review.userId?.name || 'Anonymous'}
            </h4>
            <div className="flex items-center space-x-2 mt-1">
              <StarRating rating={review.rating} size="sm" />
              {review.isVerified && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Verified
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Date */}
        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {formatDate(review.createdAt)}
        </span>
      </div>

      {/* Category Ratings (Hospital Reviews) */}
      {showCategories && review.categories && (
        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h5 className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-3`}>
            Category Ratings
          </h5>
          <div className="grid grid-cols-2 gap-3">
            {review.categories.cleanliness > 0 && (
              <div>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>🧹 Cleanliness</p>
                <StarRating rating={review.categories.cleanliness} size="sm" />
              </div>
            )}
            {review.categories.staff > 0 && (
              <div>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>👥 Staff</p>
                <StarRating rating={review.categories.staff} size="sm" />
              </div>
            )}
            {review.categories.facilities > 0 && (
              <div>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>🏥 Facilities</p>
                <StarRating rating={review.categories.facilities} size="sm" />
              </div>
            )}
            {review.categories.waitTime > 0 && (
              <div>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>⏱️ Wait Time</p>
                <StarRating rating={review.categories.waitTime} size="sm" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Review Text */}
      {reviewText && (
        <div className="mb-4">
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>
            {displayText}
          </p>
          {shouldTruncate && (
            <button
              onClick={() => setShowFullReview(!showFullReview)}
              className="text-cyan-600 dark:text-cyan-400 text-sm font-medium mt-2 hover:underline"
            >
              {showFullReview ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>
      )}

      {/* Hospital/Doctor Info (if populated) */}
      {(review.doctorId || review.hospitalId) && (
        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-4`}>
          {review.doctorId && (
            <span>👨‍⚕️ Dr. {review.doctorId.name}</span>
          )}
          {review.hospitalId && review.doctorId && <span> • </span>}
          {review.hospitalId && (
            <span>🏥 {review.hospitalId.name}</span>
          )}
        </div>
      )}

      {/* Action Buttons */}
      {(canEdit || canDelete) && (
        <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          {canEdit && onEdit && (
            <button
              onClick={() => onEdit(review)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                darkMode 
                  ? 'bg-blue-900 text-blue-200 hover:bg-blue-800' 
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              ✏️ Edit
            </button>
          )}
          {canDelete && onDelete && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                darkMode 
                  ? 'bg-red-900 text-red-200 hover:bg-red-800' 
                  : 'bg-red-100 text-red-700 hover:bg-red-200'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isDeleting ? '⏳ Deleting...' : '🗑️ Delete'}
            </button>
          )}
        </div>
      )}

      {/* Helpful/Report (Optional Future Feature) */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button className={`text-sm ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'} flex items-center gap-1`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
          </svg>
          Helpful ({review.helpfulCount || 0})
        </button>
        <button className={`text-sm ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'} flex items-center gap-1`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
          </svg>
          Report
        </button>
      </div>
    </div>
  );
};

export default ReviewCard;