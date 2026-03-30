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
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Faculty Evaluations</h2>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      {items.length === 0 && !error && <div className="text-gray-600">No evaluations yet.</div>}

      <div className="space-y-4 mt-4">
        {items.map((e) => (
          <div key={e.id} className="bg-white border border-gray-200 rounded-md p-4 shadow-sm">
            <div className="text-sm text-gray-700"><span className="font-medium">Date:</span> {new Date(e.created_at).toLocaleString()}</div>
            <div className="text-sm text-gray-700 mt-2"><span className="font-medium">Rubric:</span>
              <pre className="bg-gray-50 p-2 rounded mt-1 text-sm">{JSON.stringify(e.rubric, null, 2)}</pre>
            </div>
            <div className="text-sm text-gray-700 mt-2"><span className="font-medium">Comment:</span> {e.comment || "(none)"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}