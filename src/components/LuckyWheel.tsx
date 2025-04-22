"use client"

import { useEffect, useRef, useState } from "react"
import type { Prize } from "../lib/types"

interface LuckyWheelProps {
  prizes: Prize[]
  onSpin: (prizeId: string) => void
  isSpinning: boolean
  setIsSpinning: (spinning: boolean) => void
}

const WHEEL_COLORS = [
  "#EF4444", 
  "#3B82F6", 
  "#22C55E", 
  "#F59E0B", 
]

export default function LuckyWheel({ prizes, onSpin, isSpinning, setIsSpinning }: LuckyWheelProps) {
  const wheelRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [rotation, setRotation] = useState(0)
  const [selectedPrizeId, setSelectedPrizeId] = useState<string | null>(null)

  useEffect(() => {
    drawWheel()
  }, [prizes])
  const drawWheel = () => {
    if (!canvasRef.current || prizes.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const size = 500
    canvas.width = size
    canvas.height = size
    ctx.clearRect(0, 0, size, size)

    const centerX = size / 2
    const centerY = size / 2
    const radius = size / 2 - 10
    const anglePerSegment = (2 * Math.PI) / prizes.length

    prizes.forEach((prize, index) => {
      const startAngle = index * anglePerSegment
      const endAngle = (index + 1) * anglePerSegment
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, startAngle, endAngle)
      ctx.closePath()
      ctx.fillStyle = WHEEL_COLORS[index % WHEEL_COLORS.length]
      ctx.fill()
      ctx.lineWidth = 2
      ctx.strokeStyle = "white"
      ctx.stroke()
      ctx.save()

      const textAngle = startAngle + anglePerSegment / 2
      const textRadius = radius * 0.75

      const textX = centerX + Math.cos(textAngle) * textRadius
      const textY = centerY + Math.sin(textAngle) * textRadius

      ctx.translate(textX, textY)
      ctx.rotate(textAngle + Math.PI / 2)

      ctx.fillStyle = "white"
      ctx.font = "bold 20px Arial"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"

      const displayText = `${prize.name} (${prize.count})`
      ctx.fillText(displayText, 0, 0)

      ctx.restore()
    })

    ctx.beginPath()
    ctx.arc(centerX, centerY, radius * 0.2, 0, 2 * Math.PI)
    ctx.fillStyle = "white"
    ctx.fill()
    ctx.lineWidth = 2
    ctx.strokeStyle = "#333"
    ctx.stroke()

  }

  const spinWheel = () => {
    if (isSpinning || prizes.length === 0) return

    setIsSpinning(true)

    const prizeIndex = Math.floor(Math.random() * prizes.length)
    const selectedPrize = prizes[prizeIndex]

    const segmentAngle = 360 / prizes.length
    const segmentStart = prizeIndex * segmentAngle
    const randomOffset = Math.random() * segmentAngle
    const stopAngle = segmentStart + randomOffset

    const fullRotations = 5 + Math.floor(Math.random() * 5) 
    const newRotation = rotation + fullRotations * 360 + stopAngle

    setRotation(newRotation)
    setSelectedPrizeId(selectedPrize.id)
  }

  useEffect(() => {
    if (!isSpinning || !wheelRef.current) return

    const handleTransitionEnd = () => {
      setIsSpinning(false)
      if (selectedPrizeId) {
        onSpin(selectedPrizeId)
        setSelectedPrizeId(null)
      }
    }

    wheelRef.current.addEventListener("transitionend", handleTransitionEnd)

    return () => {
      wheelRef.current?.removeEventListener("transitionend", handleTransitionEnd)
    }
  }, [isSpinning, onSpin, selectedPrizeId, setIsSpinning])

  if (prizes.length === 0) {
    return (
      <div className="flex-center">
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
    <div className="flex-center">
      <div className="wheel-container">
        <div
          ref={wheelRef}
          className="wheel"
          style={{ transform: `rotate(${rotation}deg)` }}
          onClick={!isSpinning ? spinWheel : undefined}
        >
          <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
        </div>

        <div className="wheel-pointer"></div>
      </div>

      <button className="button button-lg" onClick={spinWheel} disabled={isSpinning || prizes.length === 0}>
        {isSpinning ? "Spinning..." : "Spin the Wheel!"}
      </button>
    </div>
  )
}
