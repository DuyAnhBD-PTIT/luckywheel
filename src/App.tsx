"use client"

import { useEffect, useState } from "react"
import "../styles.css"
import LuckyWheel from "./components/LuckyWheel"
import PrizeForm from "./components/PrizeForm"
import PrizeList from "./components/PrizeList"
import SpinHistory from "./components/SpinHistory"
import type { Prize, SpinRecord } from "./lib/types"

export default function Home() {
  const [prizes, setPrizes] = useState<Prize[]>([])
  const [history, setHistory] = useState<SpinRecord[]>([])
  const [isSpinning, setIsSpinning] = useState(false)
  const [activeTab, setActiveTab] = useState("history")

  useEffect(() => {
    try {
      const savedPrizes = localStorage.getItem("lucky-wheel-prizes")
      const savedHistory = localStorage.getItem("lucky-wheel-history")

      if (savedPrizes) {
        setPrizes(JSON.parse(savedPrizes))
      }

      if (savedHistory) {
        setHistory(JSON.parse(savedHistory))
      }
    } catch (error) {
      console.error("Error loading data from localStorage:", error)
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem("lucky-wheel-prizes", JSON.stringify(prizes))
    } catch (error) {
      console.error("Error saving prizes to localStorage:", error)
    }
  }, [prizes])

  useEffect(() => {
    try {
      localStorage.setItem("lucky-wheel-history", JSON.stringify(history))
    } catch (error) {
      console.error("Error saving history to localStorage:", error)
    }
  }, [history])

  const addPrize = (prize: Omit<Prize, "id">) => {
    const newPrize = {
      ...prize,
      id: Date.now().toString(),
    }

    const updatedPrizes = [...prizes, newPrize]
    setPrizes(updatedPrizes)

    console.log("Prize added:", newPrize)
    console.log("Updated prizes:", updatedPrizes)
  }

  const deletePrize = (id: string) => {
    setPrizes(prizes.filter((prize) => prize.id !== id))
  }

  const handleSpin = (prizeId: string) => {
    const selectedPrize = prizes.find((prize) => prize.id === prizeId)

    if (!selectedPrize) return

    const spinRecord: SpinRecord = {
      id: Date.now().toString(),
      prizeName: selectedPrize.name,
      timestamp: new Date().toISOString(),
      prizeColor: selectedPrize.color,
    }
    setHistory([spinRecord, ...history])

    const updatedPrizes = prizes
      .map((prize) => {
        if (prize.id === prizeId) {
          return { ...prize, count: prize.count - 1 }
        }
        return prize
      })
      .filter((prize) => prize.count > 0) 

    setPrizes(updatedPrizes)
  }

  return (
    <div className="container">
      <h1 className="main-title">Lucky Wheel Game</h1>

      <div className="grid">
        <div className="flex-center">
          <LuckyWheel prizes={prizes} onSpin={handleSpin} isSpinning={isSpinning} setIsSpinning={setIsSpinning} />
        </div>

        <div>
          <PrizeForm onAddPrize={addPrize} disabled={isSpinning} />
          <div style={{ height: "20px" }}></div>
          <PrizeList prizes={prizes} onDeletePrize={deletePrize} disabled={isSpinning} />
        </div>
      </div>

      <div className="tabs">
        <div className="tabs-list">
          <button
            className="tab"
            onClick={() => setActiveTab("history")}
            data-state={activeTab === "history" ? "active" : "inactive"}
          >
            Spin History
          </button>
        </div>
        <div className="tab-content">{activeTab === "history" && <SpinHistory history={history} />}</div>
      </div>
    </div>
  )
}
