import React, { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../lib/api";

const DEFAULT_RUBRIC = [
  { key: "clarity", label: "Clarity (1-5)" },
  { key: "punctuality", label: "Punctuality (1-5)" },
  { key: "knowledge", label: "Subject Knowledge (1-5)" },
];

export default function StudentPage() {
  const [programs, setPrograms] = useState([]);
  const [cohorts, setCohorts] = useState([]);
  const [assignments, setAssignments] = useState([]);

  const [programId, setProgramId] = useState("");
  const [yearLevel, setYearLevel] = useState("");
  const [section, setSection] = useState("");
  const [cohortId, setCohortId] = useState("");

  const [selectedAssignment, setSelectedAssignment] = useState(null);

  const [rubric, setRubric] = useState(() =>
    Object.fromEntries(DEFAULT_RUBRIC.map((r) => [r.key, 5]))
  );
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const data = await apiFetch("/api/academics/programs/");
      setPrograms(data);
    })();
  }, []);

  useEffect(() => {
    if (!programId) return;
    (async () => {
      const data = await apiFetch(`/api/academics/cohorts/?program_id=${programId}`);
      setCohorts(data);
    })();
  }, [programId]);

  const filteredCohorts = useMemo(() => {
    if (!yearLevel || !section) return [];
    return cohorts.filter(
      (c) => String(c.year_level) === String(yearLevel) && String(c.section).toLowerCase() === String(section).toLowerCase()
    );
  }, [cohorts, yearLevel, section]);

  useEffect(() => {
    if (!cohortId) return;
    (async () => {
      const data = await apiFetch(`/api/academics/assignments/?cohort_id=${cohortId}`);
      setAssignments(data);
    })();
  }, [cohortId]);

  async function submit() {
    setError("");
    setStatus("");

    if (!selectedAssignment) {
      setError("Pick a faculty assignment to evaluate.");
      return;
    }

    try {
      await apiFetch("/api/evaluations/", {
        method: "POST",
        body: JSON.stringify({
          assignment_id: selectedAssignment.id,
          rubric,
          // TODO: encrypted comment (requires backend P-256 ECDH update)
          // For now we send no encrypted fields; backend will store empty comment.
          // If you want plaintext comment temporarily, we must change backend serializer/model.
        }),
      });
      setStatus("Evaluation submitted.");
      setSelectedAssignment(null);
      setComment("");
    } catch (e) {
      setError(e.message || "Submit failed");
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Student Evaluation</h2>

      <div className="grid gap-3 max-w-md">
        <label className="flex flex-col text-sm">
          <span className="mb-1 text-gray-700">Program</span>
          <select value={programId} onChange={(e) => { setProgramId(e.target.value); setCohortId(""); }} className="border rounded px-2 py-1">
            <option value="">-- Select --</option>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col text-sm">
          <span className="mb-1 text-gray-700">Year Level</span>
          <input value={yearLevel} onChange={(e) => setYearLevel(e.target.value)} placeholder="e.g., 1, 2, 3, 4" className="border rounded px-2 py-1" />
        </label>

        <label className="flex flex-col text-sm">
          <span className="mb-1 text-gray-700">Section</span>
          <input value={section} onChange={(e) => setSection(e.target.value)} placeholder="e.g., A" className="border rounded px-2 py-1" />
        </label>

        <label className="flex flex-col text-sm">
          <span className="mb-1 text-gray-700">Cohort match</span>
          <select value={cohortId} onChange={(e) => setCohortId(e.target.value)} className="border rounded px-2 py-1">
            <option value="">-- Select --</option>
            {filteredCohorts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.program_code} Y{c.year_level}-{c.section}
              </option>
            ))}
          </select>
        </label>
      </div>

      <hr className="my-6" />

      <h3 className="text-xl font-medium mb-2">Faculty Assignments</h3>
      {!cohortId && <div className="text-gray-600 mb-2">Select your cohort to load assignments.</div>}
      {cohortId && assignments.length === 0 && <div className="text-gray-600 mb-2">No assignments found for this cohort.</div>}

      <ul className="space-y-2 mb-4">
        {assignments.map((a) => (
          <li key={a.id}>
            <button className="text-left w-full bg-white border border-gray-200 rounded px-3 py-2 hover:bg-gray-50" onClick={() => setSelectedAssignment(a)}>
              Evaluate: {a.faculty.display_name} — {a.course.code} <span className="text-sm text-gray-500">({a.term.school_year} {a.term.term_name})</span>
            </button>
          </li>
        ))}
      </ul>

      {selectedAssignment && (
        <div className="mt-4 p-4 border border-gray-200 rounded-md max-w-2xl bg-white">
          <h4 className="text-lg font-medium">Evaluating {selectedAssignment.faculty.display_name} — {selectedAssignment.course.code}</h4>

          <div className="mt-3 space-y-3">
            {DEFAULT_RUBRIC.map((r) => (
              <label key={r.key} className="flex items-center justify-between" >
                <span className="text-sm text-gray-700">{r.label}</span>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={rubric[r.key] ?? 5}
                  onChange={(e) => setRubric((prev) => ({ ...prev, [r.key]: Number(e.target.value) }))}
                  className="w-20 border rounded px-2 py-1 text-center"
                />
              </label>
            ))}
          </div>

          <label className="block mt-4">
            <div className="text-sm text-gray-700 mb-1">Optional Comment (will be encrypted after crypto update)</div>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={4} className="w-full border rounded p-2" />
          </label>

          {error && <div className="text-red-600 mt-3">{error}</div>}
          {status && <div className="text-green-600 mt-3">{status}</div>}

          <div className="flex gap-3 mt-4">
            <button onClick={submit} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Submit</button>
            <button onClick={() => setSelectedAssignment(null)} className="bg-gray-200 px-4 py-2 rounded">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}