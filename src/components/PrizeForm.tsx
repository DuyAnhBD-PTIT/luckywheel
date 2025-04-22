"use client"

import type React from "react"

import { useState } from "react"
import type { Prize } from "../lib/types"

// Array of colors for the color picker - matching wheelofnames.com
const COLORS = [
  "#EF4444", // Red
  "#3B82F6", // Blue
  "#22C55E", // Green
  "#F59E0B", // Yellow/Orange
]

interface PrizeFormProps {
  onAddPrize: (prize: Omit<Prize, "id">) => void
  disabled?: boolean
}

export default function PrizeForm({ onAddPrize, disabled = false }: PrizeFormProps) {
  const [name, setName] = useState("")
  const [count, setCount] = useState(1)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) return

    // Select a random color for the prize
    const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)]

    const newPrize = {
      name: name.trim(),
      count: Math.max(1, count),
      color: randomColor,
    }

    console.log("Submitting new prize:", newPrize)
    onAddPrize(newPrize)

    // Reset form
    setName("")
    setCount(1)
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Add Prize</h2>
      </div>
      <div className="card-content">
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label" htmlFor="prize-name">
              Prize Name
            </label>
            <input
              className="input"
              id="prize-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter prize name"
              disabled={disabled}
              required
            />
          </div>

          <div className="form-group">
            <label className="label" htmlFor="prize-count">
              Count
            </label>
            <input
              className="input"
              id="prize-count"
              type="number"
              min="1"
              value={count}
              onChange={(e) => setCount(Number.parseInt(e.target.value) || 1)}
              disabled={disabled}
              required
            />
          </div>

          <button className="button" type="submit" disabled={disabled || !name.trim()}>
            Add Prize
          </button>
        </form>
      </div>
    </div>
  )
}
