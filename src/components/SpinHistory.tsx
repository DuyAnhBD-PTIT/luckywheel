import type { SpinRecord } from "../lib/types"

interface SpinHistoryProps {
  history: SpinRecord[]
  onClearHistory: () => void // Add this prop
  disabled?: boolean // Add optional disabled prop
}

export default function SpinHistory({ history, onClearHistory, disabled = false }: SpinHistoryProps) {
  const handleClearClick = () => {
    // Optional: Add a confirmation dialog
    if (window.confirm("Are you sure you want to clear the entire spin history? This cannot be undone.")) {
      onClearHistory()
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        {/* Add a header for the button */}
        <h3>Spin History</h3>
        {history.length > 0 && ( // Only show button if there's history
          <button
            className="button button-danger button-sm" // Added button-sm for smaller size
            onClick={handleClearClick}
            disabled={disabled} // Disable button based on prop
            aria-label="Clear all spin history"
          >
            Clear All
          </button>
        )}
      </div>
      <div className="card-content">
        {history.length === 0 ? (
          <p className="empty-message">No spin history yet</p>
        ) : (
          <ul className="history-list">
            {history.map((record) => (
              <li key={record.id} className="history-item">
                <div className="history-prize">
                  <div className="prize-color" style={{ backgroundColor: record.prizeColor }}></div>
                  {record.prizeName}
                </div>
                <span className="history-time">{new Date(record.timestamp).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}