"use client"

import { useEffect, useRef, useState, useCallback } from "react" // Import useCallback
import type { Prize } from "../lib/types"

interface LuckyWheelProps {
  prizes: Prize[]
  onSpin: (prizeId: string) => void
  isSpinning: boolean
  setIsSpinning: (spinning: boolean) => void
}

// Define constants for better readability and maintainability
const WHEEL_SIZE = 500
const CENTER_X = WHEEL_SIZE / 2
const CENTER_Y = WHEEL_SIZE / 2
const RADIUS = WHEEL_SIZE / 2 - 10
const TEXT_RADIUS_FACTOR = 0.75
const INNER_CIRCLE_RADIUS_FACTOR = 0.2
const FONT_STYLE = "bold 16px Arial" // Adjusted font size slightly
const MIN_FULL_ROTATIONS = 5
const MAX_EXTRA_ROTATIONS = 5
const TRANSITION_DURATION_SECONDS = 5 // Match this with CSS if possible

// Default colors if prize doesn't have one or for fallback
const DEFAULT_WHEEL_COLORS = ["#EF4444", "#3B82F6", "#22C55E", "#F59E0B", "#EC4899", "#8B5CF6"]

export default function LuckyWheel({ prizes, onSpin, isSpinning, setIsSpinning }: LuckyWheelProps) {
  const wheelRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // Store the target rotation separately from the visual rotation
  const [targetRotation, setTargetRotation] = useState(0)

  // Memoize drawWheel to prevent unnecessary redraws if prizes haven't changed structurally
  const drawWheel = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !prizes) return // Early exit if no canvas or prizes

    const ctx = canvas.getContext("2d")
    if (!ctx) return // Early exit if context cannot be obtained

    // Set canvas dimensions
    canvas.width = WHEEL_SIZE
    canvas.height = WHEEL_SIZE
    ctx.clearRect(0, 0, WHEEL_SIZE, WHEEL_SIZE) // Clear previous drawing

    const numPrizes = prizes.length
    if (numPrizes === 0) return // Don't draw if no prizes

    const anglePerSegment = (2 * Math.PI) / numPrizes

    prizes.forEach((prize, index) => {
      const startAngle = index * anglePerSegment - Math.PI / 2 - anglePerSegment / 2 // Start from top
      const endAngle = startAngle + anglePerSegment

      // --- Draw Segment ---
      ctx.beginPath()
      ctx.moveTo(CENTER_X, CENTER_Y)
      ctx.arc(CENTER_X, CENTER_Y, RADIUS, startAngle, endAngle)
      ctx.closePath()
      // Use prize color or fallback to default colors
      ctx.fillStyle = prize.color || DEFAULT_WHEEL_COLORS[index % DEFAULT_WHEEL_COLORS.length]
      ctx.fill()
      ctx.lineWidth = 2
      ctx.strokeStyle = "white" // Segment outline
      ctx.stroke()

      // --- Draw Text ---
      ctx.save() // Save context state
      const textAngle = startAngle + anglePerSegment / 2
      const textRadius = RADIUS * TEXT_RADIUS_FACTOR

      // Calculate text position
      const textX = CENTER_X + Math.cos(textAngle) * textRadius
      const textY = CENTER_Y + Math.sin(textAngle) * textRadius

      // Rotate context for text alignment
      ctx.translate(textX, textY)
      ctx.rotate(textAngle + Math.PI / 2) // Rotate text to be upright

      // Style and draw text
      ctx.fillStyle = "white"
      ctx.font = FONT_STYLE
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"

      // Truncate long text if necessary (optional)
      const maxTextWidth = anglePerSegment * textRadius * 0.8 // Estimate max width
      const prizeName = prize.name // `${prize.name} (${prize.count})` - Removed count for cleaner look
      ctx.fillText(prizeName, 0, 0, maxTextWidth)

      ctx.restore() // Restore context state
    })

    // --- Draw Center Circle ---
    ctx.beginPath()
    ctx.arc(CENTER_X, CENTER_Y, RADIUS * INNER_CIRCLE_RADIUS_FACTOR, 0, 2 * Math.PI)
    ctx.fillStyle = "white"
    ctx.fill()
    ctx.lineWidth = 3
    ctx.strokeStyle = "#4B5563" // Darker gray for outline
    ctx.stroke()
  }, [prizes]) // Dependency array includes prizes

  // Effect to draw the wheel when prizes change
  useEffect(() => {
    drawWheel()
  }, [drawWheel]) // Use the memoized drawWheel

  const spinWheel = () => {
    if (isSpinning || prizes.length === 0) return

    setIsSpinning(true)

    // Calculate a random target rotation
    const fullRotations = MIN_FULL_ROTATIONS + Math.floor(Math.random() * (MAX_EXTRA_ROTATIONS + 1))
    const randomAngleOffset = Math.random() * 360 // Random final position offset
    // Add current rotation to make spins cumulative visually (optional, can remove `targetRotation % 360`)
    const newTargetRotation = targetRotation + fullRotations * 360 + randomAngleOffset

    setTargetRotation(newTargetRotation)

    // Apply the rotation via CSS transition
    if (wheelRef.current) {
      wheelRef.current.style.transition = `transform ${TRANSITION_DURATION_SECONDS}s cubic-bezier(0.25, 0.1, 0.25, 1)` // Ease-out cubic bezier
      wheelRef.current.style.transform = `rotate(${newTargetRotation}deg)`
    }
  }

  // Effect to handle the end of the spin animation
  useEffect(() => {
    const wheelElement = wheelRef.current
    if (!wheelElement) return

    const handleTransitionEnd = () => {
      // Check if the transition that ended was the 'transform' property
      // and if the component is still considered 'spinning'
      if (!isSpinning) return // Avoid running if spin was cancelled or already handled

      console.log("Transition ended.")

      // Calculate the final angle (relative to the start)
      const finalAngle = targetRotation % 360
      const segmentAngleDegrees = 360 / prizes.length

      // Adjust for the pointer being at the top (0 degrees or 360 degrees)
      // The angle needs to be mapped to the prize indices correctly.
      // A rotation of 0 means the first segment's *end* is at the top.
      // We need the segment whose *range* contains the pointer (0/360 degrees).
      const pointerRelativeAngle = (360 - finalAngle) % 360

      // Calculate the winning segment index
      // Add a small offset (half segment) to center the pointer detection within the segment
      const winningIndex = Math.floor((pointerRelativeAngle + segmentAngleDegrees / 2) % 360 / segmentAngleDegrees)

      // Ensure index is within bounds (should be, but belt-and-suspenders)
      const selectedPrizeIndex = winningIndex % prizes.length
      const selectedPrize = prizes[selectedPrizeIndex]

      if (selectedPrize) {
        console.log(`Landed on: ${selectedPrize.name} (Index: ${selectedPrizeIndex})`)
        // Call the onSpin callback provided by the parent (App.tsx)
        // App.tsx will handle the toast and setting isSpinning back to false
        onSpin(selectedPrize.id)
      } else {
        console.error("Could not determine selected prize.", { finalAngle, pointerRelativeAngle, winningIndex, prizes })
        // Handle error case - maybe stop spinning immediately?
        setIsSpinning(false) // Fallback to re-enable UI on error
      }

      // Optional: Reset transition property after spin for immediate redraws if needed
      // if (wheelRef.current) {
      //   wheelRef.current.style.transition = 'none';
      // }
    }

    // Add the event listener
    wheelElement.addEventListener("transitionend", handleTransitionEnd)

    // Cleanup function to remove the event listener
    return () => {
      wheelElement.removeEventListener("transitionend", handleTransitionEnd)
    }
    // Rerun this effect if isSpinning, targetRotation, prizes, onSpin, or setIsSpinning changes
  }, [isSpinning, targetRotation, prizes, onSpin, setIsSpinning])

  // --- Render Logic ---

  if (!prizes || prizes.length === 0) {
    return (
      <div className="flex-center flex-col space-y-4"> {/* Added flex-col and spacing */}
        <div className="wheel-placeholder">
          <p>Add prizes to start spinning!</p>
        </div>
        <button className="button button-lg" disabled>
          Spin the Wheel!
        </button>
      </div>
    )
  }

  return (
    <div className="flex-center flex-col space-y-4"> {/* Added flex-col and spacing */}
      <div className="wheel-container">
        {/* The wheel div rotates */}
        <div
          ref={wheelRef}
          className="wheel"
          // Apply rotation directly; transition is handled in spinWheel function
          style={{ transform: `rotate(${targetRotation}deg)` }}
          // Consider adding onClick={spinWheel} here if you want clicking the wheel itself to spin it
        >
          {/* The canvas contains the static drawing */}
          <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
        </div>

        {/* Static pointer */}
        <div className="wheel-pointer"></div>
      </div>

      <button
        className="button button-lg"
        onClick={spinWheel}
        disabled={isSpinning || prizes.length === 0} // Disable button while spinning
      >
        {isSpinning ? "Spinning..." : "Spin the Wheel!"}
      </button>
    </div>
  )
}