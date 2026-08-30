import { useEffect, useRef } from "react";

const ONE_HOUR_MS = 60 * 60 * 1000;

export default function useStaleRefresh(callback, intervalMs = ONE_HOUR_MS) {
  const callbackRef = useRef(callback);
  const lastRunRef = useRef(Date.now());

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const runIfStale = () => {
      if (Date.now() - lastRunRef.current < intervalMs) return;
      lastRunRef.current = Date.now();
      callbackRef.current();
    };

    const onVisible = () => {
      if (document.visibilityState === "visible") runIfStale();
    };

    const intervalId = setInterval(runIfStale, intervalMs);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [intervalMs]);
}
