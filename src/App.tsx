"use client"

import { useEffect, useState } from "react"
import LuckyWheel from "./components/LuckyWheel"
import PrizeForm from "./components/PrizeForm"
import PrizeList from "./components/PrizeList"
import SpinHistory from "./components/SpinHistory"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import type { Prize, SpinRecord } from "./lib/types"

// Toast duration in milliseconds
const TOAST_DURATION = 3000

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
      // Optionally show a user-facing error message
      toast.error("Could not load saved data.", { position: "top-center" })
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem("lucky-wheel-prizes", JSON.stringify(prizes))
    } catch (error) {
      console.error("Error saving prizes to localStorage:", error)
      toast.error("Could not save prize data.", { position: "top-center" })
    }
  }, [prizes])

  useEffect(() => {
    try {
      localStorage.setItem("lucky-wheel-history", JSON.stringify(history))
    } catch (error) {
      console.error("Error saving history to localStorage:", error)
      toast.error("Could not save spin history.", { position: "top-center" })
    }
  }, [history])

  const addPrize = (prize: Omit<Prize, "id">) => {
    const newPrize = {
      ...prize,
      id: Date.now().toString(), // Consider a more robust ID generation if needed
    }

    const updatedPrizes = [...prizes, newPrize]
    setPrizes(updatedPrizes)

    // console.log("Prize added:", newPrize)
    // console.log("Updated prizes:", updatedPrizes)
  }

  const deletePrize = (id: string) => {
    setPrizes((currentPrizes) => currentPrizes.filter((prize) => prize.id !== id))
  }

  const handleSpin = (prizeId: string) => {
    const selectedPrize = prizes.find((prize) => prize.id === prizeId)

    if (!selectedPrize) {
      console.error("Selected prize not found after spin:", prizeId)
      setIsSpinning(false) // Ensure spinning stops if prize is missing
      toast.error("An error occurred determining the prize.", { position: "top-center" })
      return
    }

    const spinRecord: SpinRecord = {
      id: Date.now().toString(),
      prizeName: selectedPrize.name,
      timestamp: new Date().toISOString(),
      prizeColor: selectedPrize.color,
    }
    setHistory((currentHistory) => [spinRecord, ...currentHistory])

    toast.success(`Congratulations! You won: ${selectedPrize.name}`, {
      position: "top-center",
      autoClose: TOAST_DURATION,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
      onClose: () => {
        setIsSpinning(false)
        console.log("Toast closed, UI enabled.")
      },
    })

    // 3. Update prize count (immediately after spin result is known)
    const updatedPrizes = prizes
      .map((prize) => {
        if (prize.id === prizeId) {
          // Ensure count doesn't go below 0, although filtering handles it
          const newCount = Math.max(0, prize.count - 1)
          return { ...prize, count: newCount }
        }
        return prize
      })
      .filter((prize) => prize.count > 0) // Remove prizes with 0 count

    setPrizes(updatedPrizes)
  }

  return (
    <>
      {/* Configure ToastContainer once */}
      <ToastContainer
        position="top-center"
        autoClose={TOAST_DURATION}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div className="container">
        <div className="grid">
          <div className="flex-center">
            {/* Pass isSpinning and setIsSpinning down */}
            <LuckyWheel prizes={prizes} onSpin={handleSpin} isSpinning={isSpinning} setIsSpinning={setIsSpinning} />
          </div>

          <div>
            {/* Disable form/list based on isSpinning state */}
            <PrizeForm onAddPrize={addPrize} disabled={isSpinning} />
            <div style={{ height: "20px" }}></div> {/* Consider using CSS margin/padding */}
            <PrizeList prizes={prizes} onDeletePrize={deletePrize} disabled={isSpinning} />
          </div>
        </div>

        <div className="tabs">
          <div className="tabs-list">
            <button
              className="tab"
              onClick={() => setActiveTab("history")}
              data-state={activeTab === "history" ? "active" : "inactive"}
              disabled={isSpinning} 
            >
              Spin History
            </button>
          </div>
          <div className="tab-content">{activeTab === "history" && <SpinHistory history={history} />}</div>
        </div>
      </div>
    </>
  )
}