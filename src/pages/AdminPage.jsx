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
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-2">Admin</h2>
      <p className="text-sm text-gray-600 mb-4">
        Manage master data in Django Admin: <a className="text-blue-600 underline" href="http://localhost:8000/admin/" target="_blank" rel="noreferrer">/admin/</a>
      </p>

      {error && <div className="text-red-600 mb-4">{error}</div>}
      {items.length === 0 && !error && <div className="text-gray-600">No evaluations found.</div>}

      <div className="space-y-4 mt-4">
        {items.map((e) => (
          <div key={e.id} className="bg-white border border-gray-200 rounded-md p-4 shadow-sm">
            <div className="text-sm text-gray-700"><span className="font-medium">Submitted by:</span> {e.submitted_by}</div>
            <div className="text-sm text-gray-700"><span className="font-medium">Faculty:</span> {e.faculty}</div>
            <div className="text-sm text-gray-700"><span className="font-medium">Course:</span> {e.course}</div>
            <div className="text-sm text-gray-700"><span className="font-medium">Term:</span> {e.term}</div>
            <div className="text-sm text-gray-700"><span className="font-medium">Date:</span> {new Date(e.created_at).toLocaleString()}</div>
            <pre className="mt-2 bg-gray-50 p-2 rounded text-sm overflow-auto">{JSON.stringify({ rubric: e.rubric, comment: e.comment }, null, 2)}</pre>
          </div>
        ))}
      </div>
    </div>
  );
}