"use client"

import { useEffect, useState } from "react"
import { motion, useSpring, useMotionValue } from "framer-motion"

export function SmoothCursor() {
  const [isHovering, setIsHovering] = useState(false)
  const [isClicking, setIsClicking] = useState(false)
  
  const cursorX = useSpring(0, { damping: 25, stiffness: 250 })
  const cursorY = useSpring(0, { damping: 25, stiffness: 250 })
  const cursorScale = useSpring(1, { damping: 20, stiffness: 300 })

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)
      
      // Check if hovering over interactive element
      const target = e.target as HTMLElement
      const isInteractive = target.closest('button, a, input, textarea, select, [role="button"]')
      setIsHovering(!!isInteractive)
    }

    const handleMouseDown = () => {
      setIsClicking(true)
      cursorScale.set(0.85)
    }

    const handleMouseUp = () => {
      setIsClicking(false)
      cursorScale.set(isHovering ? 1.3 : 1)
    }

    window.addEventListener("mousemove", moveCursor)
    window.addEventListener("mousedown", handleMouseDown)
    window.addEventListener("mouseup", handleMouseUp)

    return () => {
      window.removeEventListener("mousemove", moveCursor)
      window.removeEventListener("mousedown", handleMouseDown)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [cursorX, cursorY, cursorScale, isHovering])

  useEffect(() => {
    cursorScale.set(isHovering ? 1.3 : 1)
  }, [isHovering, cursorScale])

  return (
    <motion.div
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        x: cursorX,
        y: cursorY,
        scale: cursorScale,
        pointerEvents: "none",
        zIndex: 9999,
      }}
    >
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: "drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3))",
        }}
      >
        {/* Main pointer shape */}
        <path
          d="M3 3 L3 24 L9 18 L13 28 L17 26 L13 16 L21 16 L3 3Z"
          fill={isClicking ? "rgb(34, 197, 94)" : isHovering ? "rgb(74, 222, 128)" : "white"}
          stroke="rgb(34, 197, 94)"
          strokeWidth="1.5"
          strokeLinejoin="round"
          style={{
            transition: "fill 0.15s ease-out",
          }}
        />
        
        {/* Subtle gradient overlay */}
        <path
          d="M3 3 L3 24 L9 18 L13 28 L17 26 L13 16 L21 16 L3 3Z"
          fill="url(#cursorGradient)"
          opacity="0.4"
        />
        
        <defs>
          <linearGradient id="cursorGradient" x1="3" y1="3" x2="21" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="rgb(34, 197, 94)" />
            <stop offset="100%" stopColor="rgb(22, 163, 74)" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Glow effect when hovering/clicking */}
      {(isHovering || isClicking) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          style={{
            position: "absolute",
            left: "16px",
            top: "16px",
            width: "24px",
            height: "24px",
            background: "radial-gradient(circle, rgba(34, 197, 94, 0.4) 0%, transparent 70%)",
            borderRadius: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
      )}
    </motion.div>
  )
}
