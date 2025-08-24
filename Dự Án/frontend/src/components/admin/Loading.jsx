import React from "react";

const Loading = ({ size = 12, message = "Loading..." }) => {
  return (
    <div className="flex items-center justify-center h-full">
      <div
        className={`animate-spin rounded-full h-${size} w-${size} border-t-4 border-amber-600`}
        style={{ height: `${size}px`, width: `${size}px` }}></div>
      {message && (
        <p className="ml-4 text-gray-600 dark:text-gray-300">{message}</p>
      )}
    </div>
  );
};

export default Loading;
