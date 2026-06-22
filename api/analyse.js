// api/analyse.js — Vercel Edge Function
export const config = { runtime: "edge" };

export default async function handler(req) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": process.env.APP_URL || "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: corsHeaders });

  let body;
  try { body = await req.json(); }
  catch { return new Response(JSON.stringify({ error: "Ungültige Anfrage" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }); }

  const { antworten, firma, branche, mitarbeiter, dimensionen } = body;
  if (!antworten || !dimensionen) return new Response(JSON.stringify({ error: "Fehlende Daten" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  const summary = dimensionen.map((dim) => {
    const score = dim.fragen.reduce((s, _, fi) => s + (antworten[`${dim.id}_${fi}`] ?? 0), 0);
    const max = dim.fragen.length * 2;
    return `${dim.label}: ${Math.round((score/max)*100)}% (${score}/${max} Punkte)`;
  }).join("\n");

  const prompt = `Du bist ein NIS2-Compliance-Experte und BSI IT-Grundschutz Praktiker. Analysiere folgende Selbstbewertung:

Unternehmen: ${firma || "Nicht angegeben"} | Branche: ${branche || "Nicht angegeben"} | Mitarbeiter: ${mitarbeiter || "Nicht angegeben"}

${summary}

Erstelle eine professionelle Analyse auf Deutsch mit EXAKT diesen Überschriften:

ZUSAMMENFASSUNG
TOP 3 KRITISCHE LÜCKEN
TOP 3 SOFORTMASSNAHMEN
MITTELFRISTIGE MASSNAHMEN
RECHTLICHES RISIKO

Direkt, konkret, mit NIS2-Artikelbezug. Keine Füllwörter.`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1200, messages: [{ role: "user", content: prompt }] }),
    });
    if (!res.ok) return new Response(JSON.stringify({ error: "KI nicht verfügbar" }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const data = await res.json();
    const text = data.content?.find(b => b.type === "text")?.text || "";
    return new Response(JSON.stringify({ text }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Interner Fehler" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
}
