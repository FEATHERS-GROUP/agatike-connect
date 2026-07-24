import { useEffect, useRef } from "react";
import { useLocation } from "@tanstack/react-router";
import { recordHeartbeat } from "@/api/telemetry";

export function useTelemetry() {
  const sessionIdRef = useRef<string | null>(null);
  const location = useLocation();
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Generate a unique session ID for this browser tab instance
    if (!sessionIdRef.current) {
      const stored = sessionStorage.getItem("agatike_telemetry_session");
      if (stored) {
        sessionIdRef.current = stored;
      } else {
        const newId =
          "sess_" + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
        sessionStorage.setItem("agatike_telemetry_session", newId);
        sessionIdRef.current = newId;
      }
    }

    const sendHeartbeat = () => {
      // Exclude admin panel from telemetry tracking
      if (location.href.includes("/internal/control/admin")) return;

      if (sessionIdRef.current) {
        recordHeartbeat({
          data: {
            sessionId: sessionIdRef.current,
            path: location.href,
            userAgent: navigator.userAgent,
            visibilityState: document.visibilityState,
          },
        }).catch(console.error);
      }
    };

    // Send initial heartbeat
    sendHeartbeat();

    // Set up interval for every 60 seconds
    heartbeatIntervalRef.current = setInterval(sendHeartbeat, 60000);

    // Send heartbeat immediately when visibility changes (tab active/inactive)
    const handleVisibilityChange = () => {
      sendHeartbeat();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [location.href]);
}
