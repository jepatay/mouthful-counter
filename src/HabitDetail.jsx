import { useMemo, useRef, useEffect } from "react";

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAY_LABELS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const CELL = 30;
const GAP = 4;
const STEP = CELL + GAP;

function buildDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function buildGrid(counts) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = buildDateKey(today);

  const dateKeys = Object.keys(counts).filter((k) => counts[k] > 0);
  let maxCount = 1;
  dateKeys.forEach((k) => { if (counts[k] > maxCount) maxCount = counts[k]; });

  let start = new Date(today);
  if (dateKeys.length > 0) {
    const oldest = dateKeys.slice().sort()[0];
    const oldestDate = new Date(oldest + "T00:00:00");
    if (oldestDate < start) start = oldestDate;
  }
  const minStart = new Date(today);
  minStart.setDate(minStart.getDate() - 69);
  if (start > minStart) start = new Date(minStart);

  // Align to Monday
  const dow = start.getDay();
  start.setDate(start.getDate() - (dow === 0 ? 6 : dow - 1));

  const weeks = [];
  const cur = new Date(start);
  while (cur <= today) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      const key = buildDateKey(cur);
      week.push({
        key,
        dayNum: cur.getDate(),
        month: cur.getMonth(),
        year: cur.getFullYear(),
        count: counts[key] || 0,
        isToday: key === todayStr,
      });
      cur.setDate(cur.getDate() + 1);
    }
    weeks.push(week);
  }

  return { weeks, maxCount };
}

function cellBg(count, maxCount, type) {
  if (!count) return undefined;
  const r = count / maxCount;
  if (type === "bad") {
    if (r < 0.25) return "#3b1010";
    if (r < 0.5)  return "#6b1c1c";
    if (r < 0.75) return "#9c2626";
    return "#f87171";
  }
  if (r < 0.25) return "#133728";
  if (r < 0.5)  return "#1a5c42";
  if (r < 0.75) return "#2d8a60";
  return "#6ee7b7";
}

function cellColor(count, maxCount) {
  if (!count) return undefined;
  return count / maxCount >= 0.75 ? "#0f0f0f" : "#e5e7eb";
}

export default function HabitDetail({ habit, counts, onBack }) {
  const scrollRef = useRef(null);
  const habitCounts = counts[habit.id] || {};
  const { weeks, maxCount } = useMemo(() => buildGrid(habitCounts), [habitCounts]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [weeks]);

  const monthLabels = useMemo(() => {
    const seen = new Set();
    const labels = [];
    weeks.forEach((week, wi) => {
      for (const cell of week) {
        const mk = `${cell.year}-${cell.month}`;
        if (!seen.has(mk)) {
          seen.add(mk);
          labels.push({ weekIdx: wi, month: cell.month, year: cell.year });
          break;
        }
      }
    });
    return labels;
  }, [weeks]);

  const currentYear = new Date().getFullYear();
  const hasData = Object.values(habitCounts).some((v) => v > 0);

  return (
    <div className="detail-wrap">
      <div className="detail-header">
        <button className="back-btn" onClick={onBack} aria-label="Back">
          ← Back
        </button>
        <h2 className={`detail-title detail-title--${habit.type}`}>{habit.label}</h2>
      </div>

      {!hasData ? (
        <div className="history-empty">
          <p>No history yet.</p>
          <p className="history-empty-sub">Start tapping to record your first day!</p>
        </div>
      ) : (
        <div className="cal-wrap">
          <div className="cal-outer">
            <div className="cal-scroll" ref={scrollRef}>
              <div className="cal-months-row" style={{ width: weeks.length * STEP }}>
                {monthLabels.map(({ weekIdx, month, year }) => (
                  <span
                    key={`${year}-${month}`}
                    className="cal-month-label"
                    style={{ left: weekIdx * STEP }}
                  >
                    {MONTH_NAMES[month]}{year !== currentYear ? ` ${year}` : ""}
                  </span>
                ))}
              </div>
              <div className="cal-cols" style={{ gap: GAP }}>
                {weeks.map((week, wi) => (
                  <div key={wi} className="cal-week" style={{ gap: GAP }}>
                    {week.map((cell) => (
                      <div
                        key={cell.key}
                        className={`cal-cell${cell.isToday ? " cal-today" : ""}`}
                        style={{
                          width: CELL,
                          height: CELL,
                          background: cellBg(cell.count, maxCount, habit.type),
                          color: cellColor(cell.count, maxCount),
                          boxShadow: cell.isToday
                            ? `0 0 0 1.5px ${habit.type === "bad" ? "var(--danger)" : "var(--accent)"}`
                            : undefined,
                        }}
                        title={`${cell.key}: ${cell.count}`}
                      >
                        {cell.dayNum}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div className="cal-day-labels" style={{ gap: GAP }}>
              {DAY_LABELS.map((d) => (
                <div key={d} className="cal-day-label" style={{ height: CELL }}>
                  {d}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
