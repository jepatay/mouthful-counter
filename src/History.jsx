import { useMemo, useRef, useEffect } from "react";

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAY_LABELS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const CELL = 30;
const GAP = 4;
const STEP = CELL + GAP;

function buildDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
}

function buildGrid(history) {
  const dataMap = {};
  let maxCount = 1;
  history.forEach(({ date, count }) => {
    dataMap[date] = count;
    if (count > maxCount) maxCount = count;
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = buildDateKey(today);

  // Start from oldest data point, minimum 10 weeks back
  let start;
  if (history.length > 0) {
    const oldest = history[history.length - 1].date;
    start = new Date(oldest + "T00:00:00");
  } else {
    start = new Date(today);
  }
  const minStart = new Date(today);
  minStart.setDate(minStart.getDate() - 69); // ~10 weeks
  if (start > minStart) start = minStart;

  // Align to Monday
  const dow = start.getDay();
  start.setDate(start.getDate() - (dow === 0 ? 6 : dow - 1));

  const weeks = [];
  const cur = new Date(start);

  while (cur <= today) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      const key = buildDateKey(cur);
      const count = dataMap[key] || 0;
      week.push({
        key,
        dayNum: cur.getDate(),
        month: cur.getMonth(),
        year: cur.getFullYear(),
        count,
        isToday: key === todayStr,
      });
      cur.setDate(cur.getDate() + 1);
    }
    weeks.push(week);
  }

  return { weeks, maxCount };
}

function cellBg(count, maxCount) {
  if (!count) return undefined;
  const r = count / maxCount;
  if (r < 0.25) return "#133728";
  if (r < 0.5)  return "#1a5c42";
  if (r < 0.75) return "#2d8a60";
  return "#6ee7b7";
}

function cellColor(count, maxCount) {
  if (!count) return undefined;
  return count / maxCount >= 0.75 ? "#0f0f0f" : "#e5e7eb";
}

export default function History({ history }) {
  const scrollRef = useRef(null);
  const { weeks, maxCount } = useMemo(() => buildGrid(history), [history]);

  // Scroll to most recent weeks on mount
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [weeks]);

  // Month label: first week where each month appears
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

  if (!history.length) {
    return (
      <div className="history-empty">
        <p>No history yet.</p>
        <p className="history-empty-sub">Start tapping to record your first day!</p>
      </div>
    );
  }

  const currentYear = new Date().getFullYear();

  return (
    <div className="cal-wrap">
      <h2 className="cal-title">Calendar</h2>
      <div className="cal-outer">
        <div className="cal-scroll" ref={scrollRef}>
          {/* Month labels row */}
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
          {/* Week columns */}
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
                      background: cellBg(cell.count, maxCount),
                      color: cellColor(cell.count, maxCount),
                    }}
                    title={`${cell.key}: ${cell.count} mouthfuls`}
                  >
                    {cell.dayNum}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        {/* Day labels — fixed right column */}
        <div className="cal-day-labels" style={{ gap: GAP }}>
          {DAY_LABELS.map((d) => (
            <div key={d} className="cal-day-label" style={{ height: CELL }}>
              {d}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
