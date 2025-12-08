import React, { useState } from 'react';

/**
 * StarRating Component
 * @param {number} rating - Current rating value (0-5)
 * @param {function} onRatingChange - Callback when rating changes
 * @param {boolean} interactive - Whether stars are clickable
 * @param {string} size - Size of stars: 'sm', 'md', 'lg', 'xl'
 * @param {boolean} showValue - Show numeric value next to stars
 */
const StarRating = ({ 
  rating = 0, 
  onRatingChange = null, 
  interactive = false,
  size = 'md',
  showValue = false,
  className = ''
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  // Size classes
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-10 h-10'
  };

  const handleClick = (value) => {
    if (interactive && onRatingChange) {
      onRatingChange(value);
    }
  };

  const handleMouseEnter = (value) => {
    if (interactive) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleClick(star)}
          onMouseEnter={() => handleMouseEnter(star)}
          onMouseLeave={handleMouseLeave}
          disabled={!interactive}
          className={`${sizeClasses[size]} ${
            interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'
          } focus:outline-none`}
        >
          <svg
            className={`${sizeClasses[size]} ${
              star <= displayRating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300 dark:text-gray-600'
            } ${interactive && star <= hoverRating ? 'drop-shadow-lg' : ''}`}
            fill={star <= displayRating ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={star <= displayRating ? 0 : 2}
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
        </button>
      ))}
      
      {showValue && (
        <span className="ml-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
          {rating.toFixed(1)}
        </span>
      )}
      
      {interactive && hoverRating > 0 && (
        <span className="ml-2 text-sm font-medium text-gray-600 dark:text-gray-400">
          {hoverRating} {hoverRating === 1 ? 'star' : 'stars'}
        </span>
      )}
    </div>
  );
};

export default StarRating;