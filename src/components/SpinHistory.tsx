import type { SpinRecord } from "../lib/types"
import "../styles/SpinHistory.css";

interface SpinHistoryProps {
  history: SpinRecord[]
  onClearHistory: () => void 
  disabled?: boolean 
}

export default function SpinHistory({ history, onClearHistory, disabled = false }: SpinHistoryProps) {
  const handleClearClick = () => {
    if (window.confirm("Are you sure you want to clear the entire spin history? This cannot be undone.")) {
      onClearHistory()
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="spin-history-header">Spin History
        {history.length > 0 && (
          <button
            className="button button-danger button-sm" 
            onClick={handleClearClick}
            disabled={disabled} 
            aria-label="Clear all spin history"
          >
            Clear All
          </button>
        )}</h3>
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