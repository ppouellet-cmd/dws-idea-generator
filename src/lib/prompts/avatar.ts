// src/lib/prompts/avatar.ts
export const AVATAR_PROMPT = `
Interview first. If the target audience is vague, ask up to 3 pointed questions; then STOP.
When clear, return:

## AVATAR SNAPSHOT
- **Who** (micro-niche + stage; include age range if relevant)
- **Situations/Moments** that trigger the problem (3–5)
- **Top 5 Pains** (verbatim phrases; quotes)
- **Top 5 Desired Outcomes** (verbatim; quotes)
- **Objections & False Beliefs** (at least 3)
- **Language Bank**: 12 exact phrases they would say (short quotes)

Rules:
- Prefer quotes over paraphrase.
- Micro-niche specificity over generalities.
- If "Count: N" exists, aim for N in Language Bank.
- Tone: calm, precise, zero hype.
`;
