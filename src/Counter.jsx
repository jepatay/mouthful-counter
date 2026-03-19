import { useCallback, useRef } from "react";

export default function Counter({ count, saving, onIncrement, onDecrement, onReset }) {
  const pressTimer = useRef(null);

  // Long-press on decrement button → reset
  const handleDecrementMouseDown = useCallback(() => {
    pressTimer.current = setTimeout(() => {
      onReset();
    }, 700);
  }, [onReset]);

  const handleDecrementMouseUp = useCallback(() => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
      onDecrement();
    }
  }, [onDecrement]);

  const handleDecrementTouchStart = useCallback(
    (e) => {
      e.preventDefault();
      handleDecrementMouseDown();
    },
    [handleDecrementMouseDown]
  );

  const handleDecrementTouchEnd = useCallback(
    (e) => {
      e.preventDefault();
      handleDecrementMouseUp();
    },
    [handleDecrementMouseUp]
  );

  return (
    <div className="counter-container">
      <div className="count-display">
        <span className="count-number">{count}</span>
        <span className="count-label">mouthfuls today</span>
      </div>

      <div className="tap-btn-wrap">
        <button
          className="tap-btn"
          onPointerDown={onIncrement}
          aria-label="Add mouthful"
        >
          <span className="tap-btn-inner">TAP</span>
        </button>
      </div>

      <div className="secondary-controls">
        <button
          className="secondary-btn"
          onMouseDown={handleDecrementMouseDown}
          onMouseUp={handleDecrementMouseUp}
          onMouseLeave={() => {
            if (pressTimer.current) {
              clearTimeout(pressTimer.current);
              pressTimer.current = null;
            }
          }}
          onTouchStart={handleDecrementTouchStart}
          onTouchEnd={handleDecrementTouchEnd}
          aria-label="Remove one (hold to reset)"
        >
          −1
        </button>
        <button className="secondary-btn reset-btn" onClick={onReset} aria-label="Reset">
          Reset
        </button>
      </div>

      <p className="save-indicator">{saving ? "Saving…" : "Synced"}</p>
    </div>
  );
}
