function formatDate(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  ) {
    return "Today";
  }
  if (
    d.getFullYear() === yesterday.getFullYear() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getDate() === yesterday.getDate()
  ) {
    return "Yesterday";
  }
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

function maxCount(history) {
  return history.reduce((m, r) => Math.max(m, r.count), 1);
}

export default function History({ history }) {
  if (!history.length) {
    return (
      <div className="history-empty">
        <p>No history yet.</p>
        <p className="history-empty-sub">Start tapping to record your first day!</p>
      </div>
    );
  }

  const peak = maxCount(history);

  return (
    <div className="history-list">
      {history.map((row) => (
        <div key={row.date} className="history-row">
          <div className="history-row-meta">
            <span className="history-date">{formatDate(row.date)}</span>
            <span className="history-count">{row.count}</span>
          </div>
          <div className="history-bar-bg">
            <div
              className="history-bar-fill"
              style={{ width: `${Math.round((row.count / peak) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
