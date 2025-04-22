"use client"

import type { Prize } from "../lib/types"

interface PrizeListProps {
  prizes: Prize[]
  onDeletePrize: (id: string) => void
  disabled?: boolean
}

export default function PrizeList({ prizes, onDeletePrize, disabled = false }: PrizeListProps) {
  if (prizes.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Prizes</h2>
        </div>
        <div className="card-content">
          <p className="empty-message">No prizes added yet</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Prizes ({prizes.length})</h2>
      </div>
      <div className="card-content">
        <ul className="prize-list">
          {prizes.map((prize) => (
            <li key={prize.id} className="prize-item">
              <div style={{ display: "flex", alignItems: "center" }}>
                <div className="prize-color" style={{ backgroundColor: prize.color }}></div>
                <span className="prize-name">{prize.name}</span>
                <span className="prize-count">({prize.count} remaining)</span>
              </div>
              <button
                className="button button-icon"
                onClick={() => onDeletePrize(prize.id)}
                disabled={disabled}
                aria-label={`Delete ${prize.name}`}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
