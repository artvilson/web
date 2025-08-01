import React from 'react';

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center opacity-0">
      <div className="w-16 h-16 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
    </div>
  );
}