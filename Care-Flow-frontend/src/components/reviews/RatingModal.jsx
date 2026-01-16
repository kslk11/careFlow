import React, { useState } from 'react';
import axios from 'axios';
import StarRating from './StarRating';

/**
 * RatingModal Component
 * @param {boolean} isOpen - Modal visibility
 * @param {function} onClose - Close modal callback
 * @param {string} type - 'doctor' or 'hospital'
 * @param {object} entity - Doctor or Hospital object
 * @param {string} appointmentId - For doctor reviews
 * @param {string} referralId - For hospital reviews
 * @param {string} hospitalId - Hospital ID (for doctor reviews)
 * @param {function} onSuccess - Success callback
 */
const RatingModal = ({ 
  isOpen, 
  onClose, 
  type = 'doctor', 
  entity = {},
  appointmentId = null,
  referralId = null,
  hospitalId = null,
  onSuccess = () => {}
}) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [categories, setCategories] = useState({
    cleanliness: 0,
    staff: 0,
    facilities: 0,
    waitTime: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const token = localStorage.getItem('UserToken');

  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let endpoint = '';
      let payload = {};

      if (type === 'doctor') {
        endpoint = 'https://careflow-lsf5.onrender.com/api/review/doctor';
        payload = {
          doctorId: entity._id,
          hospitalId: hospitalId,
          appointmentId: appointmentId,
          rating: rating,
          review: review
        };
      } else {
        endpoint = 'https://careflow-lsf5.onrender.com/api/review/hospital';
        payload = {
          hospitalId: entity._id,
          referralId: referralId,
          rating: rating,
          review: review,
          categories: categories
        };
      }

      const response = await axios.post(endpoint, payload, config);

      alert('Review submitted successfully!');
      onSuccess(response.data);
      handleClose();
      
    } catch (error) {
      console.error('Error submitting review:', error);
      setError(error.response?.data?.message || 'Failed to submit review');
      alert('Review not submit!');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setReview('');
    setCategories({ cleanliness: 0, staff: 0, facilities: 0, waitTime: 0 });
    setError('');
    onClose();
  };

  const handleCategoryChange = (category, value) => {
    setCategories(prev => ({ ...prev, [category]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-cyan-500 to-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white">
                Rate {type === 'doctor' ? 'Doctor' : 'Hospital'}
              </h3>
              <p className="text-cyan-100 text-sm mt-1">
                {type === 'doctor' ? `Dr. ${entity.name}` : entity.name}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Overall Rating */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
              Overall Rating <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <StarRating
                rating={rating}
                onRatingChange={setRating}
                interactive={true}
                size="xl"
              />
            </div>
            {rating > 0 && (
              <p className="text-center mt-2 text-sm text-gray-600 dark:text-gray-400">
                {rating === 5 ? '⭐ Excellent!' : 
                 rating === 4 ? '👍 Very Good!' : 
                 rating === 3 ? '😊 Good' : 
                 rating === 2 ? '😐 Fair' : 
                 '☹️ Needs Improvement'}
              </p>
            )}
          </div>

          {/* Category Ratings (Hospital Only) */}
          {type === 'hospital' && (
            <div className="space-y-4">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                Rate Categories (Optional)
              </label>

              {/* Cleanliness */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">🧹 Cleanliness</span>
                </div>
                <StarRating
                  rating={categories.cleanliness}
                  onRatingChange={(value) => handleCategoryChange('cleanliness', value)}
                  interactive={true}
                  size="md"
                />
              </div>

              {/* Staff */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">👥 Staff Behavior</span>
                </div>
                <StarRating
                  rating={categories.staff}
                  onRatingChange={(value) => handleCategoryChange('staff', value)}
                  interactive={true}
                  size="md"
                />
              </div>

              {/* Facilities */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">🏥 Facilities</span>
                </div>
                <StarRating
                  rating={categories.facilities}
                  onRatingChange={(value) => handleCategoryChange('facilities', value)}
                  interactive={true}
                  size="md"
                />
              </div>

              {/* Wait Time */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">⏱️ Wait Time</span>
                </div>
                <StarRating
                  rating={categories.waitTime}
                  onRatingChange={(value) => handleCategoryChange('waitTime', value)}
                  interactive={true}
                  size="md"
                />
              </div>
            </div>
          )}

          {/* Review Text */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Write a Review (Optional)
            </label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Share your experience..."
              rows="4"
              maxLength={1000}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
              {review.length}/1000 characters
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-3 rounded-xl font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || rating === 0}
              className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Submitting...
                </span>
              ) : (
                'Submit Review'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RatingModal;