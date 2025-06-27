import { useState, useEffect } from "react";

export function useHistory(userEmail) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userEmail) return;

    async function fetchHistory() {
      setLoading(true);
      try {
        const res = await fetch(`/api/history?email=${encodeURIComponent(userEmail)}`);
        if (!res.ok) throw new Error("Failed to fetch history");
        const data = await res.json();
        setHistory(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, [userEmail]);

  return { history, loading, error };
}
