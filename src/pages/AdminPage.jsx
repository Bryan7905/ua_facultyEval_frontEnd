import React, { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

export default function AdminPage() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch("/api/evaluations/admin/all/");
        setItems(data);
      } catch (e) {
        setError(e.message || "Failed to load");
      }
    })();
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h2>Admin</h2>
      <p>
        Manage master data in Django Admin: <a href="http://localhost:8000/admin/" target="_blank" rel="noreferrer">/admin/</a>
      </p>

      {error && <div style={{ color: "crimson" }}>{error}</div>}
      {items.length === 0 && !error && <div>No evaluations found.</div>}

      {items.map((e) => (
        <div key={e.id} style={{ border: "1px solid #ddd", padding: 12, marginBottom: 10 }}>
          <div><b>Submitted by:</b> {e.submitted_by}</div>
          <div><b>Faculty:</b> {e.faculty}</div>
          <div><b>Course:</b> {e.course}</div>
          <div><b>Term:</b> {e.term}</div>
          <div><b>Date:</b> {new Date(e.created_at).toLocaleString()}</div>
          <pre>{JSON.stringify({ rubric: e.rubric, comment: e.comment }, null, 2)}</pre>
        </div>
      ))}
    </div>
  );
}