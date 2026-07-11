import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800">
          <div className="bg-primary-teal text-white py-4 px-6 shadow-md">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <span className="text-xl font-bold tracking-wide">DocSlot</span>
              <a
                href="/"
                className="text-sm font-semibold hover:text-action-gold transition-colors"
              >
                Go Home
              </a>
            </div>
          </div>

          <div className="flex-grow flex flex-col items-center justify-center text-center px-4 py-12">
            <div className="bg-white p-8 sm:p-12 rounded-3xl border border-gray-200 shadow-xl max-w-md w-full">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-500 mx-auto mb-6">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                Something went wrong
              </h1>
              <p className="text-gray-500 mb-6 text-sm sm:text-base leading-relaxed">
                An unexpected error occurred in the application. Please try
                refreshing the page or contact support.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-action-gold hover:bg-yellow-600 text-white py-3 rounded-full font-bold transition-all shadow-md cursor-pointer hover:shadow-lg text-sm tracking-wide"
              >
                Reload Application
              </button>
            </div>
          </div>

          <Footer />
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
