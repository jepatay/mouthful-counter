import { useState } from "react";

function getLast7Days() {
  const days = [];
  for (let i = 0; i < 7; i++) { // 0 = today (first), 6 = oldest (last)
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    days.push({ key, dateNum: d.getDate(), isToday: i === 0 });
  }
  return days;
}

export default function HabitList({ habits, counts, onTap, onUntap, onSelect, onAddHabit, onDelete }) {
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

  const handleDelete = (habit) => {
    if (window.confirm(`Delete "${habit.label}"?`)) {
      onDelete(habit.id);
    }
  };

  return (
    <div className="habit-list-wrap">
      <div className="habit-list">
        {habits.map((habit) => (
          <div key={habit.id} className="habit-row">
            <div className="habit-row-top">
              <button
                className={`habit-name habit-name--${habit.type}`}
                onClick={() => onSelect(habit.id)}
              >
                {habit.label}
              </button>
              <button
                className="habit-delete-btn"
                onClick={() => handleDelete(habit)}
                aria-label={`Delete ${habit.label}`}
              >
                ×
              </button>
            </div>

            <div className="habit-row-bottom">
              <button
                className={`habit-tap-btn habit-tap-btn--${habit.type}`}
                onPointerDown={() => onUntap(habit.id)}
                aria-label={`Remove one ${habit.label}`}
              >
                −
              </button>
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
                    >
                      <span className="chip-label">{day.dateNum}</span>
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
