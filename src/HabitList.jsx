import { useState } from "react";

const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getLast7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    days.push({
      key,
      label: i === 0 ? "Today" : `${DAY_SHORT[d.getDay()]} ${d.getDate()}`,
      isToday: i === 0,
    });
  }
  return days;
}

export default function HabitList({ habits, counts, onTap, onSelect, onAddHabit }) {
  const [showModal, setShowModal] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newType, setNewType] = useState("good");

  const last7 = getLast7Days();

  const handleAdd = () => {
    if (newLabel.trim()) {
      onAddHabit(newLabel.trim(), newType);
      setNewLabel("");
      setNewType("good");
      setShowModal(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleAdd();
    if (e.key === "Escape") setShowModal(false);
  };

  return (
    <div className="habit-list-wrap">
      <div className="habit-list">
        {habits.map((habit) => (
          <div key={habit.id} className="habit-row">
            <button
              className={`habit-name habit-name--${habit.type}`}
              onClick={() => onSelect(habit.id)}
            >
              {habit.label}
            </button>

            <div className="habit-row-right">
              <button
                className={`habit-tap-btn habit-tap-btn--${habit.type}`}
                onPointerDown={() => onTap(habit.id)}
                aria-label={`Tap ${habit.label}`}
              >
                +
              </button>

              <div className="day-chips">
                {last7.map((day) => {
                  const count = counts[habit.id]?.[day.key] || 0;
                  return (
                    <div
                      key={day.key}
                      className={`day-chip day-chip--${habit.type}${day.isToday ? " day-chip--today" : ""}`}
                      title={day.label}
                    >
                      <span className="chip-label">{day.label}</span>
                      <span className="chip-count">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="add-habit-btn" onClick={() => setShowModal(true)}>
        + Add Habit
      </button>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">New Habit</h3>
            <input
              className="modal-input"
              placeholder="Habit name"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
            <div className="modal-type-row">
              <button
                className={`type-btn type-btn--good${newType === "good" ? " active" : ""}`}
                onClick={() => setNewType("good")}
              >
                Good
              </button>
              <button
                className={`type-btn type-btn--bad${newType === "bad" ? " active" : ""}`}
                onClick={() => setNewType("bad")}
              >
                Bad
              </button>
            </div>
            <div className="modal-actions">
              <button className="modal-cancel" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="modal-confirm" onClick={handleAdd}>
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
