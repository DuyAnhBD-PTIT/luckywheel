import type { SpinRecord } from "../lib/types"

interface SpinHistoryProps {
  history: SpinRecord[]
}

export default function SpinHistory({ history }: SpinHistoryProps) {
  if (history.length === 0) {
    return (
      <div className="card">
        <div className="card-content">
          <p className="empty-message">No spin history yet</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="card-content">
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
      </div>
    </div>
  )
}
