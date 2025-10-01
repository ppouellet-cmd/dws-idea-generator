"use client";
import { useMemo, useState } from "react";

type TaskKey = "emails" | "leadmagnet" | "offers" | "hooks" | "names" | "custom";

const TASK_TEXT: Record<TaskKey, string> = {
  emails:
    "TASK: Generate 10 email ideas for a warm list. Format: subject line + 2–3 sentence outline + CTA.",
  leadmagnet:
    "TASK: Give me 5 lead-magnet concepts. Format: title & promise, who it’s for, 5–7 bullets, delivery & a 3-email follow-up (one line each).",
  offers:
    "TASK: Propose 3 offer enhancements. Include: mechanism, 3–5 proof assets to show, plain-English guarantee, and a fast-path 'first win'.",
  hooks:
    "TASK: Create 10 short-video hooks. Format: hook line + one concrete demo to film + the outcome it proves.",
  names:
    "TASK: Propose 10 course/program names. Constraints: clear, memorable, on-brand; avoid hype. Return: name + one-line rationale.",
  custom: "TASK: ",
};

export default function Home() {
  const [brief, setBrief] = useState("");
  const [task, setTask] = useState<TaskKey>("emails");
  const [customTask, setCustomTask] = useState("");
  const [out, setOut] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const taskLine = useMemo(() => {
    if (task === "custom") {
      const t = (customTask || "").trim();
      return t ? (t.startsWith("TASK:") ? t : `TASK: ${t}`) : "";
    }
    return TASK_TEXT[task];
  }, [task, customTask]);

  async function generate() {
    try {
      setLoading(true);
      setError("");
      setOut("");

      const composed = [brief.trim(), taskLine].filter(Boolean).join("\n\n");

      const resp = await fetch("/api/idea", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ brief: composed, mode: task }),
      });

      if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(errText || `Request failed (${resp.status})`);
      }

      const text = await resp.text();
      setOut(text);
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function copyAll() {
    try {
      await navigator.clipboard.writeText(out || "");
      alert("Copied!");
    } catch {
      alert("Copy failed — select and copy manually.");
    }
  }

  return (
    <main style={{ maxWidth: 820, margin: "0 auto", padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 12 }}>
        Idea Generator (micro-niche)
      </h1>

      <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
        Your brief
      </label>
      <textarea
        placeholder={
          "AUDIENCE: [who, niche, mindset]\n" +
          "CORE PROBLEM: [one painful thing]\n" +
          "PRIMARY OUTCOME: [specific change]\n" +
          "UNIQUE EDGE: [mechanism/process/proof]\n" +
          "CONSTRAINTS: [channels, safety, timeline]\n" +
          "ASSETS: [testimonials, demos, data]\n" +
          "TONE: [calm, candid, no hype]"
        }
        value={brief}
        onChange={(e) => setBrief(e.target.value)}
        style={{ width: "100%", height: 160, padding: 12, border: "1px solid #ddd", borderRadius: 6 }}
      />

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 12, flexWrap: "wrap" }}>
        <div>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
            Task
          </label>
          <select
            value={task}
            onChange={(e) => setTask(e.target.value as TaskKey)}
            style={{ padding: "10px 12px", borderRadius: 6, border: "1px solid #ddd", minWidth: 260 }}
          >
            <option value="emails">Email ideas</option>
            <option value="leadmagnet">Lead magnet concepts</option>
            <option value="offers">Offer enhancements</option>
            <option value="hooks">Short-video hooks</option>
            <option value="names">Course/Program names</option>
            <option value="custom">Custom TASK…</option>
          </select>
        </div>

        <button
          onClick={generate}
          disabled={loading || !brief.trim()}
          style={{ padding: "10px 16px", borderRadius: 8, border: "none", background: "#000", color: "#fff", opacity: loading || !brief.trim() ? 0.6 : 1, height: 44, alignSelf: "end" }}
        >
          {loading ? "Generating…" : "Generate"}
        </button>
      </div>

      {taskLine && (
        <p style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
          <strong>Task line being sent:</strong> {taskLine}
        </p>
      )}

      {error && <p style={{ color: "crimson", marginTop: 12 }}>{error}</p>}

      {out && (
        <>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
            <button
              onClick={copyAll}
              style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #ddd", background: "#fff" }}
              title="Copy all ideas"
            >
              Copy to Clipboard
            </button>
          </div>
          <pre
            style={{
              whiteSpace: "pre-wrap",
              background: "#fafafa",
              border: "1px solid #eee",
              padding: 12,
              borderRadius: 6,
              marginTop: 8,
            }}
          >
            {out}
          </pre>
        </>
      )}
    </main>
  );
}
