"use client"

import { useEffect } from "react"
import { motion, useSpring } from "framer-motion"

export function SmoothCursor() {
  const cursorX = useSpring(0, { damping: 30, stiffness: 200, mass: 0.5 })
  const cursorY = useSpring(0, { damping: 30, stiffness: 200, mass: 0.5 })
  const cursorDotX = useSpring(0, { damping: 10, stiffness: 100 })
  const cursorDotY = useSpring(0, { damping: 10, stiffness: 100 })

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)
      cursorDotX.set(e.clientX)
      cursorDotY.set(e.clientY)
    }

    window.addEventListener("mousemove", moveCursor)

    return () => {
      window.removeEventListener("mousemove", moveCursor)
    }
  }, [cursorX, cursorY, cursorDotX, cursorDotY])

  return (
    <>
      {/* Outer ring */}
      <motion.div
        style={{
          position: "fixed",
          left: cursorX,
          top: cursorY,
          width: "32px",
          height: "32px",
          border: "2px solid rgba(34, 197, 94, 0.5)",
          borderRadius: "50%",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
          zIndex: 9999,
          mixBlendMode: "difference",
        }}
      />
      
      {/* Inner dot */}
      <motion.div
        style={{
          position: "fixed",
          left: cursorDotX,
          top: cursorDotY,
          width: "6px",
          height: "6px",
          backgroundColor: "rgb(34, 197, 94)",
          borderRadius: "50%",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
          zIndex: 9999,
        }}
      />
    </>
  )
}
