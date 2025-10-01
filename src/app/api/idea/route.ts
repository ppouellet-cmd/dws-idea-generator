// src/app/api/idea/route.ts
export const runtime = "edge"; // fast startup later on Vercel

// Quick browser test at /api/idea
export async function GET() {
  return new Response("Idea API is alive");
}

// === Prompt imports (relative paths from this file) ===
import { BASE_RULES } from "../../../lib/prompts/base";
import { AVATAR_PROMPT } from "../../../lib/prompts/avatar";
import { OFFER_PROMPT } from "../../../lib/prompts/offer";
import { EMAILS_PROMPT } from "../../../lib/prompts/emails";
import { LEADMAGNET_PROMPT } from "../../../lib/prompts/leadmagnet";
import { OFFERS_ENHANCE_PROMPT } from "../../../lib/prompts/offersEnhance";
import { HOOKS_PROMPT } from "../../../lib/prompts/hooks";
import { NAMES_PROMPT } from "../../../lib/prompts/names";
import { CUSTOM_PROMPT } from "../../../lib/prompts/custom";

// Map modes to prompts
const MODE_PROMPTS: Record<string, string> = {
  emails: EMAILS_PROMPT,
  leadmagnet: LEADMAGNET_PROMPT,
  offers: OFFERS_ENHANCE_PROMPT,
  hooks: HOOKS_PROMPT,
  names: NAMES_PROMPT,
  avatar: AVATAR_PROMPT,
  offer: OFFER_PROMPT,
  custom: CUSTOM_PROMPT,
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
