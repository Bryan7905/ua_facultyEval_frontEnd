import React, { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

export default function FacultyPage() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch("/api/evaluations/faculty/me/");
        setItems(data);
      } catch (e) {
        setError(e.message || "Failed to load");
      }
    })();
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h2>Faculty Evaluations</h2>
      {error && <div style={{ color: "crimson" }}>{error}</div>}
      {items.length === 0 && !error && <div>No evaluations yet.</div>}

      {items.map((e) => (
        <div key={e.id} style={{ border: "1px solid #ddd", padding: 12, marginBottom: 10 }}>
          <div><b>Date:</b> {new Date(e.created_at).toLocaleString()}</div>
          <div><b>Rubric:</b> <pre>{JSON.stringify(e.rubric, null, 2)}</pre></div>
          <div><b>Comment:</b> {e.comment || "(none)"}</div>
        </div>
      ))}
    </div>
  );
}