import React from "react";

const InternalServerError = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 py-12">
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-gray-200 shadow-xl max-w-md w-full">
        <h1 className="text-6xl font-extrabold text-red-600 mb-4 tracking-tight">
          500
        </h1>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Internal Server Error
        </h2>
        <p className="text-gray-500 mb-6 text-sm leading-relaxed">
          The server encountered an internal error or misconfiguration and was
          unable to complete your request. Please try again later.
        </p>
        <a
          href="/"
          className="inline-block bg-primary-teal hover:bg-teal-800 text-white px-8 py-3 rounded-full font-bold transition-all shadow-md text-sm tracking-wide"
        >
          Go back Home
        </a>
      </div>
    </div>
  );
};

export default InternalServerError;
