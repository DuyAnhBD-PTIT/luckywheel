"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import type { Prize } from "../lib/types"

interface LuckyWheelProps {
  prizes: Prize[]
  onSpin: (prizeId: string) => void
  isSpinning: boolean
  setIsSpinning: (spinning: boolean) => void
}

const WHEEL_SIZE = 500
const CENTER_X = WHEEL_SIZE / 2
const CENTER_Y = WHEEL_SIZE / 2
const RADIUS = WHEEL_SIZE / 2 - 10
const TEXT_RADIUS_FACTOR = 0.75
const INNER_CIRCLE_RADIUS_FACTOR = 0.2
const FONT_STYLE = "bold 16px Arial" 
const MIN_FULL_ROTATIONS = 5
const MAX_EXTRA_ROTATIONS = 5
const TRANSITION_DURATION_SECONDS = 5
const DEFAULT_WHEEL_COLORS = ["#EF4444", "#3B82F6", "#22C55E", "#F59E0B", "#EC4899", "#8B5CF6"]

export default function LuckyWheel({ prizes, onSpin, isSpinning, setIsSpinning }: LuckyWheelProps) {
  const wheelRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [targetRotation, setTargetRotation] = useState(0)

  const drawWheel = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !prizes) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return 
    canvas.width = WHEEL_SIZE
    canvas.height = WHEEL_SIZE
    ctx.clearRect(0, 0, WHEEL_SIZE, WHEEL_SIZE)

    const numPrizes = prizes.length
    if (numPrizes === 0) return 

    const anglePerSegment = (2 * Math.PI) / numPrizes

    prizes.forEach((prize, index) => {
      const startAngle = index * anglePerSegment - Math.PI / 2 - anglePerSegment / 2 
      const endAngle = startAngle + anglePerSegment
      ctx.beginPath()
      ctx.moveTo(CENTER_X, CENTER_Y)
      ctx.arc(CENTER_X, CENTER_Y, RADIUS, startAngle, endAngle)
      ctx.closePath()
      ctx.fillStyle = prize.color || DEFAULT_WHEEL_COLORS[index % DEFAULT_WHEEL_COLORS.length]
      ctx.fill()
      ctx.lineWidth = 2
      ctx.strokeStyle = "white" 
      ctx.stroke()

      ctx.save() 
      const textAngle = startAngle + anglePerSegment / 2
      const textRadius = RADIUS * TEXT_RADIUS_FACTOR

      const textX = CENTER_X + Math.cos(textAngle) * textRadius
      const textY = CENTER_Y + Math.sin(textAngle) * textRadius

      ctx.translate(textX, textY)
      ctx.rotate(textAngle + Math.PI / 2)
      ctx.fillStyle = "white"
      ctx.font = FONT_STYLE
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"

      const maxTextWidth = anglePerSegment * textRadius * 0.8 
      const prizeName = prize.name 
      ctx.fillText(prizeName, 0, 0, maxTextWidth)

      ctx.restore() 
    })

    ctx.beginPath()
    ctx.arc(CENTER_X, CENTER_Y, RADIUS * INNER_CIRCLE_RADIUS_FACTOR, 0, 2 * Math.PI)
    ctx.fillStyle = "white"
    ctx.fill()
    ctx.lineWidth = 3
    ctx.strokeStyle = "#4B5563"
    ctx.stroke()
  }, [prizes]) 
  useEffect(() => {
    drawWheel()
  }, [drawWheel])

  const spinWheel = () => {
    if (isSpinning || prizes.length === 0) return

    setIsSpinning(true)

    const fullRotations = MIN_FULL_ROTATIONS + Math.floor(Math.random() * (MAX_EXTRA_ROTATIONS + 1))
    const randomAngleOffset = Math.random() * 360
    const newTargetRotation = targetRotation + fullRotations * 360 + randomAngleOffset

    setTargetRotation(newTargetRotation)

    if (wheelRef.current) {
      wheelRef.current.style.transition = `transform ${TRANSITION_DURATION_SECONDS}s cubic-bezier(0.25, 0.1, 0.25, 1)` 
      wheelRef.current.style.transform = `rotate(${newTargetRotation}deg)`
    }
  }

  useEffect(() => {
    const wheelElement = wheelRef.current
    if (!wheelElement) return

    const handleTransitionEnd = () => {
      if (!isSpinning) return 

      console.log("Transition ended.")

      const finalAngle = targetRotation % 360
      const segmentAngleDegrees = 360 / prizes.length

      const pointerRelativeAngle = (360 - finalAngle) % 360

      const winningIndex = Math.floor((pointerRelativeAngle + segmentAngleDegrees / 2) % 360 / segmentAngleDegrees)

      const selectedPrizeIndex = winningIndex % prizes.length
      const selectedPrize = prizes[selectedPrizeIndex]

      if (selectedPrize) {
        console.log(`Landed on: ${selectedPrize.name} (Index: ${selectedPrizeIndex})`)
        onSpin(selectedPrize.id)
      } else {
        console.error("Could not determine selected prize.", { finalAngle, pointerRelativeAngle, winningIndex, prizes })
        
        setIsSpinning(false)
      }

      // if (wheelRef.current) {
      //   wheelRef.current.style.transition = 'none';
    }

    wheelElement.addEventListener("transitionend", handleTransitionEnd)

    return () => {
      wheelElement.removeEventListener("transitionend", handleTransitionEnd)
    }
  }, [isSpinning, targetRotation, prizes, onSpin, setIsSpinning])

  if (!prizes || prizes.length === 0) {
    return (
      <div className="flex-center flex-col space-y-4"> 
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
    <div className="flex-center flex-col space-y-4">
      <div className="wheel-container">
        <div
          ref={wheelRef}
          className="wheel"
          style={{ transform: `rotate(${targetRotation}deg)` }}
          onClick={spinWheel}
        >
          <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
        </div>

        <div className="wheel-pointer"></div>
      </div>

      <button
        className="button button-lg"
        onClick={spinWheel}
        disabled={isSpinning || prizes.length === 0}
      >
        {isSpinning ? "Spinning..." : "Spin the Wheel!"}
      </button>
    </div>
  )
}