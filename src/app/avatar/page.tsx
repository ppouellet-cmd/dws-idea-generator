"use client";
import { useState } from "react";

export default function AvatarProfiler() {
  const [brief, setBrief] = useState("");
  const [out, setOut] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    try {
      setLoading(true);
      setError("");
      setOut("");

      const resp = await fetch("/api/idea", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ brief: brief.trim(), mode: "avatar" }),
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

  return (
    <main style={{ maxWidth: 820, margin: "0 auto", padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 12 }}>
        Avatar Profiler
      </h1>

      <p style={{ color: "#555", marginBottom: 12 }}>
        Describe your perfect client. If key details are missing, I’ll ask up to
        3 questions, then stop.
      </p>

      <textarea
        placeholder={`NICHE: (e.g., Sea kayakers 50+ who value safety & ease)
SITUATIONS: (moments that trigger the problem)
PAINS (5): (their words)
DESIRES (5): (their words)
OBJECTIONS / FALSE BELIEFS:
PHRASES THEY SAY: (quotes)`}
        value={brief}
        onChange={(e) => setBrief(e.target.value)}
        style={{
          width: "100%",
          height: 180,
          padding: 12,
          border: "1px solid #ddd",
          borderRadius: 6,
        }}
      />

      <div style={{ marginTop: 12 }}>
        <button
          onClick={generate}
          disabled={loading || !brief.trim()}
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            border: "none",
            background: "#000",
            color: "#fff",
            opacity: loading || !brief.trim() ? 0.6 : 1,
          }}
        >
          {loading ? "Profiling…" : "Generate Avatar Snapshot"}
        </button>
      </div>

      {error && <p style={{ color: "crimson", marginTop: 12 }}>{error}</p>}

      {out && (
        <pre
          style={{
            whiteSpace: "pre-wrap",
            background: "#fafafa",
            border: "1px solid #eee",
            padding: 12,
            borderRadius: 6,
            marginTop: 16,
          }}
        >
          {out}
        </pre>
      )}
    </main>
  );
}
