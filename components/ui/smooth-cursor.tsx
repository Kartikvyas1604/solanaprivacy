"use client"

import { useEffect, useRef } from "react"
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
        velocity.current = {
          x: (currentPos.x - lastMousePos.current.x) / deltaTime,
          y: (currentPos.y - lastMousePos.current.y) / deltaTime,
        }
      }

      lastUpdateTime.current = currentTime
      lastMousePos.current = currentPos
    }

    const smoothMouseMove = (e: MouseEvent) => {
      const currentPos = { x: e.clientX, y: e.clientY }
      updateVelocity(currentPos)

      const speed = Math.sqrt(
        Math.pow(velocity.current.x, 2) + Math.pow(velocity.current.y, 2)
      )

      cursorX.set(currentPos.x)
      cursorY.set(currentPos.y)

      if (speed > 0.1) {
        const currentAngle =
          Math.atan2(velocity.current.y, velocity.current.x) * (180 / Math.PI) +
          90

        let angleDiff = currentAngle - previousAngle.current
        if (angleDiff > 180) angleDiff -= 360
        if (angleDiff < -180) angleDiff += 360
        accumulatedRotation.current += angleDiff
        rotation.set(accumulatedRotation.current)
        previousAngle.current = currentAngle
if (!isMouseDown.current) {
          scale.set(0.95)
          setIsMoving(true)

          if (timeoutId) clearTimeout(timeoutId)
          timeoutId = setTimeout(() => {
            scale.set(1)
            setIsMoving(false)
          }, 150)
        }
      }
    }

    let rafId: number
    const throttledMouseMove = (e: MouseEvent) => {
      if (rafId) return

      rafId = requestAnimationFrame(() => {
        smoothMouseMove(e)
        rafId = 0
      })
    }

    const handleMouseDown = () => {
      isMouseDown.current = true
      scale.set(0.8)
    }

    const handleMouseUp = () => {
      isMouseDown.current = false
      scale.set(1)
    }

    const styleElement = document.createElement("style")
    styleElement.innerHTML = `* { cursor: none !important; }`
    document.head.appendChild(styleElement)

    window.addEventListener("mousemove", throttledMouseMove)
    window.addEventListener("mousedown", handleMouseDown)
    window.addEventListener("mouseup", handleMouseUp)

    return () => {
      window.removeEventListener("mousemove", throttledMouseMove)
      window.removeEventListener("mousedown", handleMouseDown)
      window.removeEventListener("mouseup", handleMouseUp)
      document.head.removeChild(styleElement)
      if (rafId) cancelAnimationFrame(rafId)
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [cursorX, cursorY, rotation, scale])

  return (
    <motion.div
      style={{
        position: "fixed",
        left: cursorX,
        top: cursorY,
        translateX: "-50%",
        translateY: "-50%",
        rotate: rotation,
        scale: scale,
        zIndex: 9999,
        pointerEvents: "none",
        willChange: "transform",
      }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 30,
      }}
    >
      {cursor}
    </motion.div>
  )
}
