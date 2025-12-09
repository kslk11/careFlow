import React, { useState } from 'react';

/**
 * ChatBotButton Component
 * Floating button to open/close chatbot
 */
const ChatBotButton = ({ onClick, isOpen, darkMode = false, unreadCount = 0 }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Unread Badge */}
      {unreadCount > 0 && !isOpen && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-bounce z-10">
          {unreadCount > 9 ? '9+' : unreadCount}
        </div>
      )}

      {/* Main Button */}
      <button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`relative w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 transform ${
          isOpen 
            ? 'bg-red-500 hover:bg-red-600 rotate-90 scale-110' 
            : 'bg-gradient-to-br from-cyan-600 via-blue-600 to-purple-600 hover:from-cyan-700 hover:via-blue-700 hover:to-purple-700 hover:scale-110'
        }`}
        style={{
          boxShadow: isHovered 
            ? '0 20px 60px rgba(6, 182, 212, 0.5), 0 0 40px rgba(59, 130, 246, 0.3)' 
            : '0 10px 40px rgba(6, 182, 212, 0.4)'
        }}
      >
        {/* Pulse Animation */}
        {!isOpen && (
          <div className="absolute inset-0 rounded-full bg-cyan-400 opacity-75 animate-ping"></div>
        )}

        {/* Icon */}
        <div className="relative z-10">
          {isOpen ? (
            // Close Icon
            <svg 
              className="w-8 h-8 text-white transition-transform duration-300" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            // Chat Icon
            <svg 
              className="w-8 h-8 text-white transition-transform duration-300" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" 
              />
            </svg>
          )}
        </div>

        {/* Ripple Effect on Click */}
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <div className={`absolute inset-0 bg-white opacity-0 ${isHovered ? 'animate-ripple' : ''}`}></div>
        </div>
      </button>

      {/* Tooltip */}
      {isHovered && !isOpen && (
        <div className="absolute bottom-20 right-0 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap shadow-xl animate-fadeIn">
          Need help? Chat with us!
          <div className="absolute -bottom-1 right-6 w-2 h-2 bg-gray-900 transform rotate-45"></div>
        </div>
      )}

      {/* Welcome Message (First Time) */}
      {!isOpen && unreadCount === 0 && (
        <div className="absolute bottom-20 right-0 bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-4 w-64 animate-slideInRight border border-gray-200 dark:border-gray-700">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Hi there! 👋</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                I'm your CareFlow assistant. Need help with appointments, bills, or anything else?
              </p>
            </div>
            <button 
              onClick={() => {}}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white dark:bg-gray-800 transform rotate-45 border-r border-b border-gray-200 dark:border-gray-700"></div>
        </div>
      )}
    </div>
  );
};

export default ChatBotButton;