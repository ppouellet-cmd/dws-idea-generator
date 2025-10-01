export const runtime = "edge"; // fast startup later on Vercel

// Quick browser test at /api/idea
export async function GET() {
  return new Response("Idea API is alive");
}

/* =======================
   Prompt library (backend)
   ======================= */

// Shared rules used by every mode
const BASE_RULES = `
You are a calm, commercially-savvy creative strategist for micro-niche businesses.
Always prioritize a trailing line that starts with "TASK:" if present.
If the user message includes "Count: N", aim to return about N items.
Be specific, non-hypey, and tie ideas to believable mechanisms and quick demonstrations.
`;

// Mode-specific instructions (tight, task-optimized)
const MODE_PROMPTS: Record<string, string> = {
  emails: `
Return 10 email ideas.
Each: **Subject line** + 2–3 sentence outline + **CTA**.
Bias toward safety, clarity, proof, and tiny demonstrations people can do quickly.
`,
  leadmagnet: `
Return 5 lead magnet concepts.
Each: **Title & Promise**, **Who it's for**, **What's inside** (5–7 bullets),
**Delivery & 3-email follow-up** (one line each).
`,
  offers: `
Return 3 offer enhancements.
Each: **Positioning + mechanism**, **3–5 proof assets**, **Plain-English guarantee**, **Fast-path first win**.
`,
  hooks: `
Return 10 short-video hooks.
Each: **Hook line** + **One concrete demo to film** + **Outcome it proves**.
`,
  names: `
Return 12 course/program names.
Each: **Name** + **One-line rationale**. Avoid hype; be clear, memorable, and on-brand.
`,
  // NEW: avatar mode used by /avatar page
  avatar: `
Interview first. If the target audience is vague, ask up to 3 pointed questions; then STOP.
When clear, return:

## AVATAR SNAPSHOT
- **Who** (micro-niche + stage)
- **Situations/Moments** that trigger the problem
- **Top 5 Pains** (their words)
- **Top 5 Desired Outcomes** (their words)
- **Objections & False Beliefs**
- **Language Bank**: 10 exact phrases they would say (quotes)

Rules: micro-niche specificity; prefer quotes; no hype.
If "Count: N" is present, aim for N phrases in the Language Bank.
`,
  // OPTIONAL: if you add /offer later, reuse this key from the plan
  offer: `
If essentials are missing (promise, deliverables, time frame, constraints), ask up to 3 questions; STOP.
Otherwise return:

## OFFER BLUEPRINT
- **Core Promise** (clear, measurable)
- **Mechanism** (why this works; steps)
- **Delivery** (format, cadence, time requirements)
- **Fast First Win** (24–72h)
- **Proof Assets to Show** (3–5 demos/testimonials)
- **Risk Reversal** (plain-English)
- **Scope Guardrails** (what’s in / out)

Tone: calm, precise, ethical. Short sentences; avoid unprovable claims.
`,
  custom: `
Use the trailing TASK exactly as written. Prefer concise, structured output.
`,
};

export async function POST(req: Request) {
  try {
    // accept both "brief" and "mode" from the client
    const body = await req.json().catch(() => ({ brief: "", mode: "emails" }));
    const safeBrief = (body?.brief ?? "").toString().trim() || "your topic";
    const modeKey = (body?.mode ?? "emails").toString();

    // Build the final SYSTEM_PROMPT from base + mode
    const SYSTEM_PROMPT = `${BASE_RULES}\n${MODE_PROMPTS[modeKey] ?? ""}`;

    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!, // set in .env.local / Vercel
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-3-haiku-20240307", // reliable default
        max_tokens: 1200,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: [{ type: "text", text: safeBrief }] }],
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      return new Response(`Anthropic error: ${resp.status} ${errText}`, { status: 500 });
    }

    const data = await resp.json();
    // collect text from Anthropic content blocks
    const text = Array.isArray(data?.content)
      ? data.content.map((b: any) => (typeof b?.text === "string" ? b.text : "")).join("\n\n").trim()
      : "";

    return new Response(text || "No content returned.", {
      headers: { "Content-Type": "text/markdown" },
    });
  } catch (e: any) {
    return new Response(`Server error: ${e?.message || String(e)}`, { status: 500 });
  }
}
