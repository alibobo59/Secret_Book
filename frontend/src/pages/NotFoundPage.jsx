import React from "react";
import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-5 py-16">
      <div className="text-center">
        <h1 className="mb-4 text-9xl font-bold text-amber-400">404</h1>
        <h2 className="mb-6 text-3xl font-bold text-gray-900">
          Page Not Found
        </h2>
        <p className="mb-8 text-lg text-gray-600">
          The page you are looking for might have been removed, had its name
          changed, or is temporarily unavailable.
        </p>
        <Link
          to="/"
          className="inline-block rounded bg-amber-400 px-6 py-3 font-bold text-gray-900 transition hover:bg-yellow-300">
          Back to Homepage
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
