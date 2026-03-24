import { useState } from "react";
import HabitList from "./HabitList";
import HabitDetail from "./HabitDetail";
import { useHabits } from "./useHabits";
import "./App.css";

export default function App() {
  const { habits, counts, tap, addHabit, deleteHabit } = useHabits();
  const [selectedId, setSelectedId] = useState(null);

  const selectedHabit = selectedId ? habits.find((h) => h.id === selectedId) : null;

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">
          {selectedHabit ? "History" : "Habit Tracker"}
        </h1>
      </header>

      <main className="app-main">
        {selectedHabit ? (
          <HabitDetail
            habit={selectedHabit}
            counts={counts}
            onBack={() => setSelectedId(null)}
          />
        ) : (
          <HabitList
            habits={habits}
            counts={counts}
            onTap={tap}
            onSelect={setSelectedId}
            onAddHabit={addHabit}
            onDelete={deleteHabit}
          />
        )}
      </main>
    </div>
  );
}
