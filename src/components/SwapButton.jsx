import React, { useState } from 'react';
import { ArrowLeftRight } from 'lucide-react';

export const SwapButton = ({ onSwap, disabled = false }) => {
  const [isRotating, setIsRotating] = useState(false);

  const handleClick = () => {
    if (disabled) return;
    setIsRotating(true);
    onSwap();
    setTimeout(() => setIsRotating(false), 400);
  };

  return (
    <div className="flex items-center justify-center">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className="p-3.5 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed group"
        title="Swap source and target currencies"
        aria-label="Swap currencies"
      >
        <ArrowLeftRight
          className={`w-5 h-5 transition-transform duration-300 ease-out ${
            isRotating ? 'rotate-180 scale-110' : 'group-hover:scale-110'
          }`}
        />
      </button>
    </div>
  );
};

export default SwapButton;
