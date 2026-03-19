import { useState, useEffect, useCallback, useRef } from 'react';
import type { LogEntry } from '../types';
import { toCamelCase } from '@/lib/apiUtils';

const API_BASE = import.meta.env.VITE_API_URL ?? '/api';

/**
 * Custom hook that provides a live log streaming feed.
 *
 * Attempts to connect to the backend SSE endpoint for real-time logs.
 * Falls back to interval-based mock streaming if SSE connection fails.
 *
 * @param options.agentId - Agent ID for SSE connection
 * @param options.view - View type ('list' or 'detail')
 * @param options.initialLogs - Initial logs to display
 * @param options.streamQueue - Queue of entries to stream in mock mode
 * @param options.isActive - Whether the agent is currently active
 * @param options.intervalMs - Interval for mock streaming (default: 3000ms)
 */
export function useAgentLogStream({
  agentId,
  view = 'list',
  initialLogs,
  streamQueue,
  isActive,
  intervalMs = 3000,
}: {
  agentId: string;
  view?: 'list' | 'detail';
  initialLogs: LogEntry[];
  streamQueue: Array<Omit<LogEntry, 'id' | 'time'>>;
  isActive: boolean;
  intervalMs?: number;
}) {
  const [logs, setLogs] = useState<LogEntry[]>(initialLogs);
  const [pulse, setPulse] = useState(true);
  const [usingSSE, setUsingSSE] = useState(false);
  const streamIdxRef = useRef(0);
  const eventSourceRef = useRef<EventSource | null>(null);

  /* Attempt SSE connection when active */
  useEffect(() => {
    if (!isActive) {
      // Close any existing connection when agent becomes inactive
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
        setUsingSSE(false);
      }
      return;
    }

    // Try to connect to SSE endpoint
    const sseUrl = `${API_BASE}/agents/${agentId}/logs/stream?view=${view}`;

    try {
      const source = new EventSource(sseUrl);
      eventSourceRef.current = source;

      source.onopen = () => {
        console.log(`[SSE] Connected to agent ${agentId} log stream`);
        setUsingSSE(true);
      };

      source.onmessage = (event) => {
        try {
          const log = toCamelCase<LogEntry>(JSON.parse(event.data));
          setLogs((prev) => [...prev, log]);
        } catch (e) {
          console.warn('[SSE] Failed to parse log entry:', e);
        }
      };

      source.onerror = () => {
        console.warn('[SSE] Connection failed, falling back to mock streaming');
        source.close();
        eventSourceRef.current = null;
        setUsingSSE(false);
      };

      return () => {
        source.close();
        eventSourceRef.current = null;
      };
    } catch (e) {
      console.warn('[SSE] Failed to create EventSource, using mock streaming:', e);
      setUsingSSE(false);
    }
  }, [agentId, view, isActive]);

  /* Fallback: mock streaming when SSE is not available */
  useEffect(() => {
    if (!isActive || usingSSE || !streamQueue.length) return;

    const interval = setInterval(() => {
      const idx = streamIdxRef.current % streamQueue.length;
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

      streamIdxRef.current += 1;
    }, intervalMs);

    return () => clearInterval(interval);
  }, [isActive, usingSSE, streamQueue, intervalMs]);

  /* Pulsing indicator for live agents */
  useEffect(() => {
    if (!isActive) return;
    const t = setInterval(() => setPulse((p) => !p), 800);
    return () => clearInterval(t);
  }, [isActive]);

  /** Imperatively reset the log feed (e.g. when agent changes) */
  const resetLogs = useCallback((newLogs: LogEntry[]) => {
    setLogs(newLogs);
    streamIdxRef.current = 0;
  }, []);

  return { logs, pulse, resetLogs, usingSSE };
}
