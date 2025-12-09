import React, { useState, useEffect, useRef } from 'react';
import { questionTree, getQuestion, getFilteredOptions } from './questionTree';

/**
 * ChatBot Component
 * Intelligent conversational assistant for CareFlow
 */
const ChatBot = ({ 
  isOpen, 
  onClose, 
  userData = {},
  onAction = () => {},
  darkMode = false 
}) => {
  // ==================== STATE ====================
  const [messages, setMessages] = useState([]);
  const [currentQuestionId, setCurrentQuestionId] = useState('main');
  const [conversationHistory, setConversationHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
const [chatUserData, setChatUserData] = useState(userData);  
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // ==================== EFFECTS ====================
  
  // Initialize chatbot with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setTimeout(() => {
        addBotMessage('main');
      }, 500);
    }
  }, [isOpen]);

  // Update user data when props change
  useEffect(() => {
    setChatUserData(userData);
  }, [userData]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ==================== FUNCTIONS ====================

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Add bot message to chat
  const addBotMessage = (questionId, delay = 0) => {
    setIsTyping(true);
    
    setTimeout(() => {
      const question = getQuestion(questionId);
      let messageText = question.message;

      // Handle dynamic messages
      if (question.dynamicMessage) {
        messageText = question.dynamicMessage(chatUserData);
      }

      // Replace placeholders
      messageText = messageText.replace('{userName}', chatUserData.name || 'there');

      const botMessage = {
        id: Date.now(),
        type: 'bot',
        text: messageText,
        questionId: questionId,
        options: getFilteredOptions(question, chatUserData),
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setCurrentQuestionId(questionId);
      setIsTyping(false);
    }, delay);
  };

  // Add user message to chat
  const addUserMessage = (text) => {
    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
  };

  // Handle user option selection
  const handleOptionClick = async (option) => {
    // Add user's selection to chat
    addUserMessage(option.text);

    // Add to conversation history
    setConversationHistory(prev => [...prev, {
      questionId: currentQuestionId,
      selectedOption: option.id,
      timestamp: new Date()
    }]);

    // Execute action if defined
    if (option.action) {
      const actionResult = await executeAction(option.action);
      
      // Update user data if action returns data
      if (actionResult) {
        setUserData(prev => ({ ...prev, ...actionResult }));
      }
    }

    // Navigate to next question
    if (option.nextId) {
      addBotMessage(option.nextId, 800);
    }
  };

  // Execute actions (fetch data, navigate, etc.)
  const executeAction = async (actionName) => {
    console.log('Executing action:', actionName);

    try {
      switch (actionName) {
        case 'fetchAppointments':
          // Data should already be in userData
          return null;

        case 'fetchBills':
          return null;

        case 'fetchHospitals':
          return null;

        case 'fetchDoctors':
          return null;

        case 'navigateToAppointments':
          onAction('navigate', 'appointments');
          onClose();
          return null;

        case 'navigateToBills':
          onAction('navigate', 'bills');
          onClose();
          return null;

        case 'navigateToHospitals':
          onAction('navigate', 'hospitals');
          onClose();
          return null;

        case 'navigateToReviews':
          onAction('navigate', 'reviews');
          onClose();
          return null;

        case 'bookAppointment':
          onAction('navigate', 'hospitals');
          onClose();
          return null;

        case 'payBill':
          onAction('navigate', 'bills');
          onClose();
          return null;

        case 'getNextAppointment':
          const nextApt = chatUserData.appointments
            ?.filter(a => a.status === 'approved' || a.status === 'pending')
            .sort((a, b) => new Date(a.date) - new Date(b.date))[0];
          return { nextAppointment: nextApt };

        case 'cancelAppointment':
          onAction('cancelAppointment', chatUserData.nextAppointment);
          return null;

        default:
          return null;
      }
    } catch (error) {
      console.error('Error executing action:', error);
      return null;
    }
  };

  // Handle back button
  const handleBack = () => {
    if (conversationHistory.length > 0) {
      // Go back to previous question
      const previousState = conversationHistory[conversationHistory.length - 1];
      setConversationHistory(prev => prev.slice(0, -1));
      
      const question = getQuestion(previousState.questionId);
      if (question.backTo) {
        addBotMessage(question.backTo, 300);
      }
    } else {
      // Go to main menu
      addBotMessage('main', 300);
    }
  };

  // Reset chat
  const handleReset = () => {
    setMessages([]);
    setCurrentQuestionId('main');
    setConversationHistory([]);
    addBotMessage('main', 500);
  };

  // ==================== RENDER ====================

  if (!isOpen) return null;

  const bgColor = darkMode ? 'bg-gray-800' : 'bg-white';
  const borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-600';

  return (
    <div className="fixed bottom-24 right-6 w-96 h-[600px] rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden border-2 border-cyan-500">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">CareFlow Assistant</h3>
            <p className="text-cyan-100 text-xs">Online • Here to help!</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Reset Button */}
          <button
            onClick={handleReset}
            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all"
            title="Start Over"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div 
        ref={chatContainerRef}
        className={`flex-1 overflow-y-auto p-4 space-y-4 ${bgColor}`}
        style={{ 
          backgroundImage: darkMode 
            ? 'radial-gradient(circle at 20% 50%, rgba(6, 182, 212, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.05) 0%, transparent 50%)'
            : 'radial-gradient(circle at 20% 50%, rgba(6, 182, 212, 0.03) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.03) 0%, transparent 50%)'
        }}
      >
        {messages.map((message, index) => (
          <div key={message.id}>
            {/* Message Bubble */}
            <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-2`}>
              <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                {/* Bot Avatar */}
                {message.type === 'bot' && (
                  <div className="flex items-start space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className={`${darkMode ? 'bg-gray-700 text-gray-100' : 'bg-gray-100 text-gray-900'} rounded-2xl rounded-tl-none px-4 py-3 shadow-md`}>
                        <p className="text-sm whitespace-pre-line leading-relaxed">{message.text}</p>
                      </div>
                      <p className={`text-xs ${textSecondary} mt-1 ml-2`}>
                        {message.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                )}

                {/* User Message */}
                {message.type === 'user' && (
                  <div>
                    <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-2xl rounded-tr-none px-4 py-3 shadow-md">
                      <p className="text-sm">{message.text}</p>
                    </div>
                    <p className={`text-xs ${textSecondary} mt-1 mr-2 text-right`}>
                      {message.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Options Buttons */}
            {message.type === 'bot' && message.options && index === messages.length - 1 && !isTyping && (
              <div className="space-y-2 ml-10 mt-3 animate-fadeIn">
                {message.options.map((option, optIndex) => (
                  <button
                    key={option.id}
                    onClick={() => handleOptionClick(option)}
                    className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 hover:shadow-lg ${
                      darkMode
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-100 border border-gray-600'
                        : 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 shadow-sm'
                    }`}
                    style={{
                      animationDelay: `${optIndex * 100}ms`
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{option.emoji}</span>
                      <span className="text-sm flex-1">{option.text}</span>
                      <svg className="w-4 h-4 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-2xl rounded-tl-none px-6 py-3 shadow-md`}>
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-cyan-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-cyan-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-cyan-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Footer */}
      <div className={`${bgColor} border-t ${borderColor} p-3`}>
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={conversationHistory.length === 0 && currentQuestionId === 'main'}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
              conversationHistory.length === 0 && currentQuestionId === 'main'
                ? 'opacity-50 cursor-not-allowed bg-gray-200 dark:bg-gray-700'
                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm">Back</span>
          </button>

          <button
            onClick={() => addBotMessage('main', 300)}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-md hover:shadow-lg"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-sm">Main Menu</span>
          </button>
        </div>

        <p className={`text-xs ${textSecondary} text-center mt-2`}>
          Powered by CareFlow AI • {messages.length} messages
        </p>
      </div>
    </div>
  );
};

export default ChatBot;