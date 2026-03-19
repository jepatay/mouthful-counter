import { useState, useEffect, useCallback, useRef } from "react";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  orderBy,
  getDocs,
} from "firebase/firestore";
import { db } from "./firebase";

const DEVICE_ID = (() => {
  let id = localStorage.getItem("mouthful_device_id");
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("mouthful_device_id", id);
  }
  return id;
})();

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function msUntilMidnight() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight - now;
}

export function useCounter() {
  const [count, setCount] = useState(0);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const pendingRef = useRef(null);

  const docRef = useCallback(
    (dateKey) => doc(db, "counters", DEVICE_ID, "days", dateKey),
    []
  );

  const historyColRef = useCallback(
    () => collection(db, "counters", DEVICE_ID, "days"),
    []
  );

  // Load today's count from Firestore
  const loadToday = useCallback(async () => {
    const key = todayKey();
    try {
      const snap = await getDoc(docRef(key));
      if (snap.exists()) {
        setCount(snap.data().count ?? 0);
      } else {
        setCount(0);
      }
    } catch {
      // fall back to localStorage
      const local = Number(localStorage.getItem(`mouthful_${key}`) ?? 0);
      setCount(local);
    } finally {
      setLoading(false);
    }
  }, [docRef]);

  // Load full history
  const loadHistory = useCallback(async () => {
    try {
      const q = query(historyColRef(), orderBy("date", "desc"));
      const snap = await getDocs(q);
      const rows = snap.docs.map((d) => ({ date: d.id, count: d.data().count }));
      setHistory(rows);
    } catch {
      setHistory([]);
    }
  }, [historyColRef]);

  // Debounced save to Firestore
  const saveCount = useCallback(
    (newCount) => {
      const key = todayKey();
      localStorage.setItem(`mouthful_${key}`, newCount);

      if (pendingRef.current) clearTimeout(pendingRef.current);
      pendingRef.current = setTimeout(async () => {
        if (savingRef.current) return;
        savingRef.current = true;
        setSaving(true);
        try {
          await setDoc(docRef(key), { count: newCount, date: key }, { merge: true });
          // refresh history entry for today
          setHistory((prev) => {
            const filtered = prev.filter((r) => r.date !== key);
            return [{ date: key, count: newCount }, ...filtered];
          });
        } catch {
          // silently fail — localStorage already updated
        } finally {
          savingRef.current = false;
          setSaving(false);
        }
      }, 600);
    },
    [docRef]
  );

  const increment = useCallback(() => {
    setCount((prev) => {
      const next = prev + 1;
      saveCount(next);
      return next;
    });
  }, [saveCount]);

  const decrement = useCallback(() => {
    setCount((prev) => {
      const next = Math.max(0, prev - 1);
      saveCount(next);
      return next;
    });
  }, [saveCount]);

  const reset = useCallback(() => {
    setCount(0);
    saveCount(0);
  }, [saveCount]);

  // Initial load
  useEffect(() => {
    loadToday();
    loadHistory();
  }, [loadToday, loadHistory]);

  // Midnight reset
  useEffect(() => {
    const schedule = () => {
      const ms = msUntilMidnight();
      const t = setTimeout(() => {
        setCount(0);
        loadHistory();
        schedule(); // reschedule for next midnight
      }, ms);
      return t;
    };
    const t = schedule();
    return () => clearTimeout(t);
  }, [loadHistory]);

  return { count, history, loading, saving, increment, decrement, reset };
}
