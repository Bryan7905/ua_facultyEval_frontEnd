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
    <div style={{ padding: 16 }}>
      <h2>Student Evaluation</h2>

      <div style={{ display: "grid", gap: 8, maxWidth: 420 }}>
        <label>
          Program:
          <select value={programId} onChange={(e) => { setProgramId(e.target.value); setCohortId(""); }}>
            <option value="">-- Select --</option>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
            ))}
          </select>
        </label>

        <label>
          Year Level:
          <input value={yearLevel} onChange={(e) => setYearLevel(e.target.value)} placeholder="e.g., 1, 2, 3, 4" />
        </label>

        <label>
          Section:
          <input value={section} onChange={(e) => setSection(e.target.value)} placeholder="e.g., A" />
        </label>

        <label>
          Cohort match:
          <select value={cohortId} onChange={(e) => setCohortId(e.target.value)}>
            <option value="">-- Select --</option>
            {filteredCohorts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.program_code} Y{c.year_level}-{c.section}
              </option>
            ))}
          </select>
        </label>
      </div>

      <hr style={{ margin: "16px 0" }} />

      <h3>Faculty Assignments</h3>
      {!cohortId && <div>Select your cohort to load assignments.</div>}
      {cohortId && assignments.length === 0 && <div>No assignments found for this cohort.</div>}

      <ul>
        {assignments.map((a) => (
          <li key={a.id} style={{ marginBottom: 8 }}>
            <button onClick={() => setSelectedAssignment(a)}>
              Evaluate: {a.faculty.display_name} — {a.course.code} ({a.term.school_year} {a.term.term_name})
            </button>
          </li>
        ))}
      </ul>

      {selectedAssignment && (
        <div style={{ marginTop: 16, padding: 12, border: "1px solid #ddd", maxWidth: 600 }}>
          <h4>
            Evaluating {selectedAssignment.faculty.display_name} — {selectedAssignment.course.code}
          </h4>

          {DEFAULT_RUBRIC.map((r) => (
            <label key={r.key} style={{ display: "block", marginBottom: 8 }}>
              {r.label}:
              <input
                type="number"
                min="1"
                max="5"
                value={rubric[r.key] ?? 5}
                onChange={(e) => setRubric((prev) => ({ ...prev, [r.key]: Number(e.target.value) }))}
              />
            </label>
          ))}

          <label style={{ display: "block", marginBottom: 8 }}>
            Optional Comment (will be encrypted after crypto update):
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={4} style={{ width: "100%" }} />
          </label>

          {error && <div style={{ color: "crimson" }}>{error}</div>}
          {status && <div style={{ color: "green" }}>{status}</div>}

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={submit}>Submit</button>
            <button onClick={() => setSelectedAssignment(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}