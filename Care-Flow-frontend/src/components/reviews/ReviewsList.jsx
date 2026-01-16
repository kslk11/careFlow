import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReviewCard from './ReviewCard';
import RatingDisplay from './RatingDisplay';

/**
 * ReviewsList Component
 * Fetches and displays paginated reviews
 * @param {string} entityId - Doctor ID or Hospital ID
 * @param {string} type - 'doctor' or 'hospital'
 * @param {boolean} canManage - Can current user edit/delete reviews
 * @param {function} onReviewUpdate - Callback when review is updated/deleted
 */
const ReviewsList = ({ 
  entityId, 
  type = 'doctor',
  canManage = false,
  onReviewUpdate = null,
  darkMode = false
}) => {
  const [reviews, setReviews] = useState([]);
  const [ratings, setRatings] = useState({ average: 0, count: 0, breakdown: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('-createdAt'); // newest first

  const token = localStorage.getItem('UserToken');
  const currentUserId = JSON.parse(localStorage.getItem('Userinfo'))?.user?._id;

  // Fetch reviews
  const fetchReviews = async () => {
    setLoading(true);
    setError('');

    try {
      const endpoint = `https://careflow-lsf5.onrender.com/api/review/${type}/${entityId}`;
      const response = await axios.get(endpoint, {
        params: {
          page: currentPage,
          limit: 10,
          sort: sortBy
        }
      });

      setReviews(response.data.data || []);
      setRatings(response.data.ratings || { average: 0, count: 0, breakdown: {} });
      setTotalPages(response.data.pagination?.totalPages || 1);

    } catch (error) {
      console.error('Error fetching reviews:', error);
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (entityId) {
      fetchReviews();
    }
  }, [entityId, currentPage, sortBy]);

  // Handle delete review
  const handleDeleteReview = async (reviewId) => {
    try {
      await axios.delete(
        `https://careflow-lsf5.onrender.com/api/review/${type}/${reviewId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert('Review deleted successfully');
      fetchReviews(); // Refresh list
      
      if (onReviewUpdate) {
        onReviewUpdate();
      }

    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  };

  // Handle edit review (you can implement edit modal)
  const handleEditReview = (review) => {
    console.log('Edit review:', review);
    // TODO: Open edit modal
    alert('Edit functionality coming soon!');
  };

  // Sort options
  const sortOptions = [
    { value: '-createdAt', label: 'Newest First' },
    { value: 'createdAt', label: 'Oldest First' },
    { value: '-rating', label: 'Highest Rating' },
    { value: 'rating', label: 'Lowest Rating' }
  ];

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6 shadow-sm`}>
        <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
          {type === 'doctor' ? 'Doctor' : 'Hospital'} Ratings
        </h3>
        <RatingDisplay 
          ratings={ratings} 
          showBreakdown={true}
          size="md"
        />
      </div>

      {/* Reviews Header */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6 shadow-sm`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Reviews ({ratings.count})
          </h3>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <label className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Sort by:
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`px-3 py-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500`}
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Loading reviews...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Reviews List */}
        {!loading && !error && (
          <>
            {reviews.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-lg`}>No reviews yet</p>
                <p className={`${darkMode ? 'text-gray-500' : 'text-gray-400'} text-sm mt-1`}>Be the first to leave a review!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <ReviewCard
                    key={review._id}
                    review={review}
                    canEdit={canManage && review.userId?._id === currentUserId}
                    canDelete={canManage && review.userId?._id === currentUserId}
                    onEdit={handleEditReview}
                    onDelete={handleDeleteReview}
                    showCategories={type === 'hospital'}
                    darkMode={darkMode}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-600'
                      : 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200 dark:bg-cyan-900 dark:text-cyan-200 dark:hover:bg-cyan-800'
                  }`}
                >
                  Previous
                </button>

                <div className="flex items-center gap-2">
                  {[...Array(totalPages)].map((_, index) => {
                    const page = index + 1;
                    // Show first page, last page, current page, and pages around current
                    const showPage = 
                      page === 1 || 
                      page === totalPages || 
                      Math.abs(page - currentPage) <= 1;

                    if (!showPage) {
                      // Show ellipsis
                      if (page === 2 || page === totalPages - 1) {
                        return <span key={page} className={darkMode ? 'text-gray-600' : 'text-gray-400'}>...</span>;
                      }
                      return null;
                    }

                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          currentPage === page
                            ? 'bg-cyan-600 text-white'
                            : darkMode
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-600'
                      : 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200 dark:bg-cyan-900 dark:text-cyan-200 dark:hover:bg-cyan-800'
                  }`}
                >
                  Next
                </button>
              </div>
            )}

            {/* Page Info */}
            <p className={`text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-4`}>
              Page {currentPage} of {totalPages}
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default ReviewsList;