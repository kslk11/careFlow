import React from 'react';
import StarRating from './StarRating';

/**
 * RatingDisplay Component
 * Shows rating summary with breakdown
 * @param {object} ratings - Rating data { average, count, breakdown }
 * @param {boolean} showBreakdown - Show detailed breakdown
 * @param {string} size - 'sm', 'md', 'lg'
 */
const RatingDisplay = ({ 
  ratings = { average: 0, count: 0, breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } },
  showBreakdown = false,
  size = 'md'
}) => {
  const { average, count, breakdown } = ratings;

  // Calculate percentages
  const getPercentage = (starCount) => {
    if (count === 0) return 0;
    return ((starCount / count) * 100).toFixed(0);
  };

  return (
    <div className="space-y-4">
      {/* Average Rating */}
      <div className="flex items-center gap-4">
        <div className="text-center">
          <div className="text-4xl font-bold text-gray-900 dark:text-white">
            {average.toFixed(1)}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">out of 5</div>
        </div>
        
        <div className="flex-1">
          <StarRating 
            rating={average} 
            size={size} 
            showValue={false}
          />
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Based on {count} {count === 1 ? 'review' : 'reviews'}
          </p>
        </div>
      </div>

      {/* Rating Breakdown */}
      {showBreakdown && count > 0 && (
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((star) => (
            <div key={star} className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-8">
                {star} ⭐
              </span>
              
              {/* Progress Bar */}
              <div className="flex-1 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 transition-all duration-500"
                  style={{ width: `${getPercentage(breakdown[star])}%` }}
                />
              </div>
              
              <span className="text-sm text-gray-600 dark:text-gray-400 w-16 text-right">
                {breakdown[star]} ({getPercentage(breakdown[star])}%)
              </span>
            </div>
          ))}
        </div>
      )}

      {/* No Reviews Message */}
      {count === 0 && (
        <div className="text-center py-6">
          <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400 text-sm">No reviews yet</p>
          <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">Be the first to leave a review!</p>
        </div>
      )}
    </div>
  );
};

export default RatingDisplay;