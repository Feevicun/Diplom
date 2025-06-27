import React, { useEffect, useState } from "react";

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Завантаження історії з сервера
  useEffect(() => {
    async function fetchHistory() {
      try {
        setLoading(true);
        const response = await fetch("/api/history"); // endpoint для отримання історії
        if (!response.ok) throw new Error("Failed to fetch history");
        const data = await response.json();
        setHistory(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  if (loading) return <p>Завантаження історії...</p>;
  if (error) return <p style={{ color: "red" }}>Помилка: {error}</p>;

  return (
    <div className="history-container" style={{ padding: "20px" }}>
      <h2>Історія дій користувача</h2>
      {history.length === 0 ? (
        <p>Історія порожня.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #ccc" }}>
              <th style={{ textAlign: "left", padding: "8px" }}>Дата</th>
              <th style={{ textAlign: "left", padding: "8px" }}>Користувач</th>
              <th style={{ textAlign: "left", padding: "8px" }}>Тип події</th>
              <th style={{ textAlign: "left", padding: "8px" }}>Опис</th>
              <th style={{ textAlign: "left", padding: "8px" }}>Додатково</th>
            </tr>
          </thead>
          <tbody>
            {history.map(({ id, timestamp, userEmail, type, description, meta }) => (
              <tr key={id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "8px" }}>
                  {new Date(timestamp).toLocaleString()}
                </td>
                <td style={{ padding: "8px" }}>{userEmail}</td>
                <td style={{ padding: "8px", textTransform: "capitalize" }}>{type}</td>
                <td style={{ padding: "8px" }}>{description}</td>
                <td style={{ padding: "8px", fontSize: "0.9em", color: "#666" }}>
                  {meta && Object.keys(meta).length > 0
                    ? JSON.stringify(meta, null, 2)
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default History;
