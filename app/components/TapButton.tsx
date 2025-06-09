'use client';

import React, { useState, useCallback } from 'react';
import { Target, Zap } from 'lucide-react';

interface TapButtonProps {
  onTap: () => void;
  disabled: boolean;
  score: number;
  isPlaying: boolean;
}

export const TapButton: React.FC<TapButtonProps> = ({ 
  onTap, 
  disabled, 
  score, 
  isPlaying 
}) => {
  const [tapEffect, setTapEffect] = useState(false);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const handleTap = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    
    onTap();
    setTapEffect(true);
    
    // Create ripple effect
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newRipple = { id: Date.now(), x, y };
    
    setRipples(prev => [...prev, newRipple]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
    
    setTimeout(() => setTapEffect(false), 150);
  }, [onTap, disabled]);

  return (
    <div className="relative flex flex-col items-center justify-center">
      <div className="mb-4 text-center">
        <div className="text-6xl font-bold text-white mb-2">
          {score}
        </div>
        <div className="text-purple-300 text-lg">
          {isPlaying ? 'Keep Tapping!' : 'Taps'}
        </div>
      </div>

      <button
        onClick={handleTap}
        disabled={disabled}
        className={`
          relative overflow-hidden
          w-64 h-64 rounded-full
          bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500
          hover:from-purple-400 hover:via-pink-400 hover:to-orange-400
          active:scale-95
          transition-all duration-150 ease-out
          shadow-2xl hover:shadow-purple-500/50
          border-4 border-white/20
          ${tapEffect ? 'animate-pulse-fast scale-110' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${isPlaying ? 'animate-bounce-slow' : ''}
        `}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          {isPlaying ? (
            <Zap className="w-20 h-20 text-white animate-pulse" />
          ) : (
            <Target className="w-20 h-20 text-white" />
          )}
        </div>

        {ripples.map((ripple) => (
          <div
            key={ripple.id}
            className="absolute pointer-events-none"
            style={{
              left: ripple.x - 25,
              top: ripple.y - 25,
            }}
          >
            <div className="w-12 h-12 bg-white/30 rounded-full animate-ping" />
          </div>
        ))}

        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-full" />
      </button>

      {!isPlaying && (
        <div className="mt-6 text-center text-purple-300">
          <div className="text-lg font-medium">Ready to Play?</div>
          <div className="text-sm opacity-75">Click START to begin!</div>
        </div>
      )}
    </div>
  );
};