"use client"

import type React from "react"
import { useState } from "react"
import { Zap } from "lucide-react"

interface TapButtonProps {
  onTap: () => void
  disabled: boolean
  score: number
  isPlaying: boolean
}

export function TapButton({ onTap, disabled, score, isPlaying }: TapButtonProps) {
  const [isPressed, setIsPressed] = useState(false)
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([])

  const handleTap = (e: React.MouseEvent) => {
    if (disabled) return

    onTap()
    setIsPressed(true)

    // Create ripple effect
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const newRipple = { id: Date.now(), x, y }

    setRipples((prev) => [...prev, newRipple])

    // Remove ripple after animation
    setTimeout(() => {
      setRipples((prev) => prev.filter((ripple) => ripple.id !== newRipple.id))
    }, 600)

    // Reset pressed state
    setTimeout(() => setIsPressed(false), 150)
  }

  return (
    <div className="relative">
      <button
        onClick={handleTap}
        disabled={disabled}
        className={`
          relative overflow-hidden w-48 h-48 rounded-full font-black text-2xl transition-all duration-200 transform shadow-2xl
          ${
            disabled
              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
              : isPlaying
                ? "bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 text-white hover:scale-110 active:scale-95 shadow-emerald-500/50 hover:shadow-emerald-400/60"
                : "bg-gradient-to-br from-gray-500 to-gray-600 text-gray-300 cursor-not-allowed"
          }
          ${isPressed ? "scale-95" : ""}
        `}
      >
        {/* Ripple effects */}
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="absolute bg-white/30 rounded-full animate-ping"
            style={{
              left: ripple.x - 10,
              top: ripple.y - 10,
              width: 20,
              height: 20,
            }}
          />
        ))}

        {/* Button content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full">
          {isPlaying ? (
            <>
              <Zap className="w-12 h-12 mb-2 animate-bounce" />
              <span>SMASH!</span>
            </>
          ) : (
            <>
              <div className="w-12 h-12 mb-2 rounded-full bg-gray-500 flex items-center justify-center">
                <Zap className="w-6 h-6" />
              </div>
              <span>TAP</span>
            </>
          )}
        </div>

        {/* Glow effect when playing */}
        {isPlaying && (
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 blur-xl animate-pulse"></div>
        )}
      </button>

      {/* Score popup animation */}
      {isPressed && isPlaying && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-emerald-400 font-bold text-xl animate-bounce pointer-events-none">
          +1
        </div>
      )}
    </div>
  )
}
