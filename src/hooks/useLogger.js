import { useCallback } from "react";

export function useLogger(userEmail) {
  const logEvent = useCallback(
    async (type, description, meta = {}) => {
      try {
        await fetch("/api/log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userEmail, type, description, meta }),
        });
      } catch (err) {
        console.error("Failed to log event:", err);
      }
    },
    [userEmail]
  );

  return { logEvent };
}
