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
          relative overflow-hidden w-52 h-52 rounded-full font-black text-2xl transition-all duration-200 transform shadow-2xl border-2
          ${
            disabled
              ? "bg-slate-700 text-slate-400 cursor-not-allowed border-slate-600"
              : isPlaying
                ? "bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 text-white hover:scale-110 active:scale-95 shadow-purple-600/50 hover:shadow-purple-500/70 border-purple-400/30 hover:border-purple-300/50"
                : "bg-gradient-to-br from-slate-600 to-slate-700 text-slate-300 cursor-not-allowed border-slate-500"
          }
          ${isPressed ? "scale-95" : ""}
        `}
      >
        {/* Ripple effects */}
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="absolute bg-white/40 rounded-full animate-ping"
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
              <Zap className="w-14 h-14 mb-2 animate-bounce text-amber-200" />
              <span className="text-xl tracking-widest">SMASH</span>
            </>
          ) : (
            <>
              <div className="w-12 h-12 mb-2 rounded-full bg-slate-600 flex items-center justify-center">
                <Zap className="w-6 h-6" />
              </div>
              <span className="text-lg tracking-wide">TAP</span>
            </>
          )}
        </div>

        {/* Glow effect when playing */}
        {isPlaying && (
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-400/30 to-purple-600/20 blur-xl animate-pulse"></div>
        )}
      </button>

      {/* Score popup animation */}
      {isPressed && isPlaying && (
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 text-amber-300 font-black text-2xl animate-bounce pointer-events-none font-mono">
          +1
        </div>
      )}
    </div>
  )
}
