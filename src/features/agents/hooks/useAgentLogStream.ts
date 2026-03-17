import { useState, useEffect, useCallback } from 'react';
import type { LogEntry } from '../types';

/**
 * Custom hook that simulates a live log streaming feed.
 *
 * Accepts initial logs, a queue of upcoming entries, and whether
 * the agent is currently active. Appends entries from the queue
 * every `intervalMs` milliseconds while the agent is active.
 */
export function useAgentLogStream({
  initialLogs,
  streamQueue,
  isActive,
  intervalMs = 3000,
}: {
  initialLogs: LogEntry[];
  streamQueue: Array<Omit<LogEntry, 'id' | 'time'>>;
  isActive: boolean;
  intervalMs?: number;
}) {
  const [logs, setLogs] = useState<LogEntry[]>(initialLogs);
  const [streamIdx, setStreamIdx] = useState(0);
  const [pulse, setPulse] = useState(true);

  /* Append a new entry from the queue on each tick */
  useEffect(() => {
    if (!isActive || !streamQueue.length) return;

    const interval = setInterval(() => {
      setStreamIdx((prev) => {
        const idx = prev % streamQueue.length;
        const entry = streamQueue[idx];
        const now = new Date();
        setLogs((l) => [
          ...l,
          {
            ...entry,
            id: `live_${Date.now()}_${idx}`,
            time: now.toTimeString().slice(0, 8),
          },
        ]);
        return prev + 1;
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [isActive, streamQueue, intervalMs]);

  /* Pulsing indicator for live agents */
  useEffect(() => {
    if (!isActive) return;
    const t = setInterval(() => setPulse((p) => !p), 800);
    return () => clearInterval(t);
  }, [isActive]);

  /** Imperatively reset the log feed (e.g. when agent changes) */
  const resetLogs = useCallback((newLogs: LogEntry[]) => {
    setLogs(newLogs);
    setStreamIdx(0);
  }, []);

  return { logs, pulse, resetLogs };
}
