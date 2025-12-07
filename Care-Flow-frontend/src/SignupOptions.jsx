import React from "react";
import { useNavigate, Link } from "react-router-dom";

const SignupOptions = () => {
  const navigate = useNavigate();

  const cards = [
    { 
      title: "Hospital Signup", 
      path: "/hospitaladd", 
      gradient: "from-orange-500 to-amber-600",
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      description: "Register your facility"
    },
    { 
      title: "Patient Signup", 
      path: "/userResister", 
      gradient: "from-cyan-500 to-sky-600",
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      description: "Register as a patient"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      
      {/* Back Button */}
      <div className="container mx-auto mb-8">
        <Link 
          to="/" 
          className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>
      </div>

      <div className="container mx-auto text-center">
        {/* Heading */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Sign Up As
          </h1>
          <p className="text-xl text-gray-600">
            Choose your role to create an account
          </p>
        </div>

        {/* Cards Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {cards.map((card, index) => (
            <div
              key={index}
              onClick={() => navigate(card.path)}
              className={`group bg-gradient-to-br ${card.gradient} rounded-2xl p-8 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl shadow-lg`}
            >
              <div className="text-white">
                <div className="mb-4 flex justify-center group-hover:scale-110 transition-transform duration-300">
                  {card.icon}
                </div>
                <h3 className="text-2xl font-bold mb-2">{card.title}</h3>
                <p className="text-white/80 text-sm">{card.description}</p>
                
                <div className="mt-6 flex justify-center">
                  <div className="w-12 h-1 bg-white/50 rounded-full group-hover:w-20 transition-all duration-300"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Already have account */}
        <div className="mt-12">
          <p className="text-gray-600">
            Already have an account?{" "}
            <Link 
              to="/LoginOptions" 
              className="text-indigo-600 font-semibold hover:text-indigo-800 transition-colors"
            >
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupOptions;