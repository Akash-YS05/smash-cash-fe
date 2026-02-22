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
          relative overflow-hidden w-56 h-56 rounded-full font-light text-lg transition-all duration-200 transform border
          ${
            disabled
              ? "bg-neutral-800 text-neutral-500 cursor-not-allowed border-neutral-700"
              : isPlaying
                ? "bg-neutral-900 text-white hover:bg-neutral-800 active:scale-95 border-neutral-600 hover:border-neutral-500"
                : "bg-neutral-800 text-neutral-600 cursor-not-allowed border-neutral-700"
          }
          ${isPressed ? "scale-95" : ""}
        `}
      >
        {/* Subtle ripple effects */}
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="absolute bg-white/20 rounded-full animate-ping"
            style={{
              left: ripple.x - 10,
              top: ripple.y - 10,
              width: 20,
              height: 20,
            }}
          />
        ))}

        {/* Button content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full space-y-2">
          {isPlaying ? (
            <>
              <Zap className="w-12 h-12 animate-pulse text-neutral-200" />
              <span className="text-sm tracking-widest uppercase font-light">Tap</span>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <span className="text-xs tracking-wide uppercase font-light">Ready</span>
            </>
          )}
        </div>
      </button>

      {/* Score popup animation */}
      {isPressed && isPlaying && (
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 text-neutral-300 font-light text-xl animate-bounce pointer-events-none font-mono">
          +1
        </div>
      )}
    </div>
  )
}
