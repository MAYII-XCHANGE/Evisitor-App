import { useEffect } from "react";

const ACTIVITY_EVENTS = ["pointerdown", "keydown", "touchstart"];

export const useSelfServiceReset = ({ onReset, enabled = true, timeoutMs = 180000 }) => {
  useEffect(() => {
    if (!enabled) return undefined;
    let timer;
    const schedule = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(onReset, timeoutMs);
    };
    ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, schedule, { passive: true }));
    schedule();
    return () => {
      window.clearTimeout(timer);
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, schedule));
    };
  }, [enabled, onReset, timeoutMs]);
};
