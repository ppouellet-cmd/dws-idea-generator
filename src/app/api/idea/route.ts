// POST: real AI call (Claude), non-streaming for simplicity
export async function POST(req: Request) {
  try {
    const { brief } = await req.json().catch(() => ({ brief: "" }));
    const safeBrief = (brief ?? "").toString().trim() || "your topic";

    const SYSTEM_PROMPT = `
You are Paulo's Idea Generator. Purpose: turn short briefs into 10–20 specific, high-quality content ideas that fit the Greenland paddle / Dancing With The Sea ethos: natural movement, ease, stability, and harmony with nature.

Rules:
- Keep ideas concrete and aligned with older paddlers seeking elegance and longevity.
- Prefer ideas that can be demonstrated on water or with simple body-awareness drills.
- Offer belief-shifts when relevant (e.g., delay power, firm the water, pelvis-led rotation).
- Output in clean markdown with short titles + 2–3 sentence descriptions.
- Add a one-line "Why this matters" when helpful (ease & stability).
`;

    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!, // from .env.local
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-3-haiku-20240307",
        max_tokens: 1200,
        system: SYSTEM_PROMPT,
        messages: [
          { role: "user", content: [{ type: "text", text: safeBrief }] }
        ]
      }),
    });

    if (!resp.ok) {
      // bubble up Anthropic's message so the front-end can show it
      const errText = await resp.text();
      return new Response(`Anthropic error: ${resp.status} ${errText}`, { status: 500 });
    }

    const data = await resp.json();
    // Anthropic returns content blocks; collect .text from them
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
