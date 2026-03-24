import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "habit_tracker_v2";

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const DEFAULT_HABITS = [
  { id: "default-drink-water", label: "Drink Water", type: "good" },
  { id: "default-eat-fruits", label: "Eat Fruits", type: "good" },
  { id: "default-eat-veggies", label: "Eat Veggies", type: "good" },
  { id: "default-sugar", label: "Sugar", type: "bad" },
  { id: "default-alcohol", label: "Alcohol", type: "bad" },
  { id: "default-soda", label: "Soda", type: "bad" },
];

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

export function useHabits() {
  const [data, setData] = useState(() => {
    const loaded = loadData();
    if (loaded) return loaded;
    return { habits: DEFAULT_HABITS, counts: {} };
  });

  useEffect(() => {
    saveData(data);
  }, [data]);

  const tap = useCallback((habitId) => {
    const key = todayKey();
    setData((prev) => {
      const habitCounts = prev.counts[habitId] || {};
      const current = habitCounts[key] || 0;
      return {
        ...prev,
        counts: {
          ...prev.counts,
          [habitId]: { ...habitCounts, [key]: current + 1 },
        },
      };
    });
  }, []);

  const addHabit = useCallback((label, type) => {
    const id = generateId();
    setData((prev) => ({
      ...prev,
      habits: [...prev.habits, { id, label, type }],
    }));
  }, []);

  const deleteHabit = useCallback((id) => {
    setData((prev) => {
      const counts = { ...prev.counts };
      delete counts[id];
      return { habits: prev.habits.filter((h) => h.id !== id), counts };
    });
  }, []);

  return { habits: data.habits, counts: data.counts, tap, addHabit, deleteHabit };
}
