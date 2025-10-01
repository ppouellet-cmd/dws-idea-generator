"use client";
import { useState } from "react";

export default function OfferBuilder() {
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
        body: JSON.stringify({ brief: brief.trim(), mode: "offer" }),
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
        Offer Builder
      </h1>

      <p style={{ color: "#555", marginBottom: 12 }}>
        Outline your offer. If essentials are missing, I’ll ask up to 3 questions, then stop.
      </p>

      <textarea
        placeholder={`PROMISE: (clear, measurable)
DELIVERABLES: (format, cadence)
MECHANISM: (why this works; steps)
FAST FIRST WIN: (24–72h)
PROOF ASSETS: (demos/testimonials)
RISK REVERSAL: (plain-English)
SCOPE GUARDRAILS: (what’s in/out)`}
        value={brief}
        onChange={(e) => setBrief(e.target.value)}
        style={{
          width: "100%",
          height: 200,
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
          {loading ? "Building…" : "Generate Offer Blueprint"}
        </button>
      </div>

      {error && <p style={{ color: "crimson", marginTop: 12 }}>{error}</p>}

      {out && (
        <>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
            <button
              onClick={copyAll}
              style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #ddd", background: "#fff" }}
              title="Copy all"
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
