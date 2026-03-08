// src/components/Loader.tsx
import React from "react";

const Loader: React.FC = () => {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
};

export default Loader;