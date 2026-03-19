import { useState } from "react";
import Counter from "./Counter";
import History from "./History";
import { useCounter } from "./useCounter";
import "./App.css";

export default function App() {
  const [tab, setTab] = useState("counter");
  const { count, history, loading, saving, increment, decrement, reset } = useCounter();

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Mouthful Counter</h1>
        <nav className="tab-nav">
          <button
            className={`tab-btn ${tab === "counter" ? "active" : ""}`}
            onClick={() => setTab("counter")}
          >
            Today
          </button>
          <button
            className={`tab-btn ${tab === "history" ? "active" : ""}`}
            onClick={() => setTab("history")}
          >
            History
          </button>
        </nav>
      </header>

      <main className="app-main">
        {loading ? (
          <div className="loading">Loading…</div>
        ) : tab === "counter" ? (
          <Counter
            count={count}
            saving={saving}
            onIncrement={increment}
            onDecrement={decrement}
            onReset={reset}
          />
        ) : (
          <History history={history} />
        )}
      </main>
    </div>
  );
}
