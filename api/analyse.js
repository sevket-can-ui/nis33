// api/analyse.js — Vercel Edge Function mit RAG-Wissensbasis
export const config = { runtime: "edge" };

// NIS2 + BSI Wissensbasis direkt eingebettet (RAG-Ansatz ohne Vektordatenbank)
const NIS2_KNOWLEDGE = `
=== NIS2-RICHTLINIE (EU) 2022/2555 — RELEVANTE ARTIKEL ===

Art. 20 Governance:
(1) Leitungsorgane wesentlicher und wichtiger Einrichtungen müssen Cybersicherheits-Risikomanagementmaßnahmen billigen und deren Umsetzung überwachen. Sie können für Verstöße verantwortlich gemacht werden.
(2) Mitglieder der Leitungsorgane müssen an Cybersicherheitsschulungen teilnehmen.

Art. 21 Abs. 2 — Pflichtmaßnahmen:
a) Risikoanalyse und Sicherheitskonzepte für Informationssysteme
b) Bewältigung von Sicherheitsvorfällen (Incident Management)
c) Betriebskontinuität: Backup-Management, Notfallwiederherstellung, Krisenmanagement
d) Sicherheit der Lieferkette: Beziehungen zu Anbietern und Dienstleistern
e) Sicherheit bei Erwerb, Entwicklung und Wartung von IT-Systemen, Schwachstellenmanagement
f) Bewertung der Wirksamkeit von Risikomanagementmaßnahmen
g) Cyberhygiene und Schulungen im Bereich Cybersicherheit
h) Kryptographie und Verschlüsselung
i) Personalsicherheit, Zugriffskontrolle, Asset-Management
j) Multi-Faktor-Authentifizierung (MFA), sichere Kommunikation

Art. 23 Meldepflichten:
- Frühwarnung: innerhalb 24 Stunden nach Kenntnisnahme eines erheblichen Vorfalls
- Offizielle Meldung: innerhalb 72 Stunden
- Abschlussbericht: innerhalb 1 Monat
- Meldestelle Deutschland: BSI (Bundesamt für Sicherheit in der Informationstechnik)

Art. 34 Sanktionen:
- Wesentliche Einrichtungen: bis 10 Mio. EUR oder 2% des weltweiten Jahresumsatzes
- Wichtige Einrichtungen: bis 7 Mio. EUR oder 1,4% des weltweiten Jahresumsatzes

=== BSI IT-GRUNDSCHUTZ KOMPENDIUM 2023 ===

ISMS.1 Sicherheitsmanagement:
- ISMS.1.A1 (BASIS): Leitung übernimmt Gesamtverantwortung für Informationssicherheit
- ISMS.1.A3 (BASIS): Leitlinie zur Informationssicherheit erstellen und verabschieden
- ISMS.1.A4 (BASIS): Informationssicherheitsbeauftragten (ISB) benennen
- ISMS.1.A6 (BASIS): Organisationsstruktur für Informationssicherheit festlegen
- ISMS.1.A8 (STANDARD): Mitarbeiter in Sicherheitsprozess integrieren

ORP.3 Sensibilisierung und Schulung:
- ORP.3.A1 (BASIS): Führungskräfte für Informationssicherheit sensibilisieren
- ORP.3.A2 (BASIS): Personal in sicheren Umgang mit IT einweisen
- ORP.3.A3 (STANDARD): Regelmäßige Schulungen der Mitarbeiter durchführen
- ORP.3.A5 (HOCH): Awareness-Maßnahmen und Phishing-Simulationen

DER.2.1 Behandlung von Sicherheitsvorfällen:
- DER.2.1.A1 (BASIS): Sicherheitsvorfall definieren und dokumentieren
- DER.2.1.A2 (BASIS): Richtlinie zur Vorfallbehandlung erstellen
- DER.2.1.A3 (BASIS): Verantwortlichkeiten und Ansprechpartner festlegen
- DER.2.1.A4 (STANDARD): Betroffene Stellen benachrichtigen

BSI 200-3 Risikoanalyse:
- Schutzbedarfsfeststellung: Normal / Hoch / Sehr hoch
- Risikobehandlung: Vermeidung / Reduktion / Übertragung / Akzeptanz (mit Dokumentation)
- Asset-Inventar als Grundlage jeder Risikoanalyse zwingend erforderlich

BSI 200-4 Business Continuity Management:
- Pflichtschritte: BIA → Risikoanalyse → BCM-Strategie → Notfallpläne → Tests
- RTO (Recovery Time Objective): maximal tolerierbare Ausfallzeit je System
- RPO (Recovery Point Objective): maximal tolerierbarer Datenverlust
- Backup-Tests: mindestens quartalsweise Wiederherstellungstests

KRITIS (§ 8a BSIG) — Zusatzpflichten für Betreiber kritischer Infrastrukturen:
- Zweijährige Sicherheitsaudits oder Zertifizierungen (ISO 27001 oder BSI-Testat)
- Unverzügliche Meldung erheblicher Störungen an BSI
- Benannte Kontaktstelle für BSI rund um die Uhr erreichbar
- Sektoren: Energie, Wasser, Ernährung, IT/TK, Transport, Gesundheit, Finanz

=== MASSNAHMEN-REFERENZ ===

Governance-Lücken:
- Kein ISB → ISMS.1.A4 umsetzen, ISB formal benennen (NIS2 Art. 20)
- Keine Leitlinie → ISMS.1.A3, Leitlinie durch Geschäftsführung verabschieden
- Keine Leitungsbefassung → ISMS.1.A1, quartalsweise Sicherheitsberichte an GF

Risiko-Lücken:
- Keine Risikoanalyse → BSI 200-3 anwenden, strukturierte Analyse mit Asset-Inventar (NIS2 Art. 21 Abs. 2 lit. a)
- Kein Risiko-Tracking → Risikoregister einführen mit Verantwortlichen und Terminen

Incident-Lücken:
- Kein Meldeprozess → DER.2.1.A2, Meldekette aufbauen, BSI als Meldestelle einrichten
- Keine 24h-Meldung → NIS2 Art. 23, Bereitschaftsdienst oder SOC-Anbindung prüfen

BCM-Lücken:
- Keine Notfallpläne → BSI 200-4, BIA durchführen, kritische Prozesse und RTO/RPO definieren
- Keine Backup-Tests → Quartalsweise Wiederherstellungstests, Ergebnisse dokumentieren

Lieferketten-Lücken:
- Keine Vertragsklauseln → NIS2 Art. 21 Abs. 2 lit. d, IT-Sicherheitsklauseln in alle relevanten Verträge
- Kein Drittanbieter-Inventar → alle Lieferanten mit Systemzugang erfassen und bewerten

Awareness-Lücken:
- Keine Schulungen → ORP.3.A3, jährliche Pflichtschulung für alle Mitarbeiter einführen
- Keine Phishing-Tests → ORP.3.A5, simulierte Angriffe min. 2x jährlich durchführen
`;

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
    const pct = Math.round((score / max) * 100);
    const niveau = pct >= 70 ? "ERFÜLLT" : pct >= 40 ? "TEILWEISE" : "KRITISCH";
    return `${dim.label}: ${pct}% — ${niveau} (${score}/${max} Punkte)`;
  }).join("\n");

  const isCritical = branche?.includes("KRITIS");

  const prompt = `Du bist ein zertifizierter NIS2-Compliance-Experte und BSI IT-Grundschutz Praktiker mit CISA-Zertifizierung. Analysiere die folgende Selbstbewertung auf Basis der dir bereitgestellten Wissensbasis.

WISSENSBASIS — VERWENDE NUR DIESE QUELLEN FÜR ARTIKEL- UND BAUSTEIN-REFERENZEN:
${NIS2_KNOWLEDGE}

UNTERNEHMENSPROFIL:
Unternehmen: ${firma || "Nicht angegeben"}
Branche: ${branche || "Nicht angegeben"}${isCritical ? " — KRITIS-Betreiber, erhöhte Anforderungen nach § 8a BSIG" : ""}
Mitarbeiterzahl: ${mitarbeiter || "Nicht angegeben"}

BEWERTUNGSERGEBNISSE:
${summary}

AUFGABE: Erstelle eine präzise, fachlich korrekte Analyse auf Deutsch. Referenziere IMMER konkrete NIS2-Artikel und BSI-Bausteine aus der Wissensbasis. Keine generischen Aussagen.

Antworte EXAKT in diesem Format mit diesen Überschriften:

ZUSAMMENFASSUNG
[2-3 Sätze mit konkretem Compliance-Befund, Gesamtscore und wichtigstem Handlungsbedarf. Bei KRITIS: § 8a BSIG erwähnen.]

TOP 3 KRITISCHE LÜCKEN
[Nummeriere 1-3. Je Lücke: Bezeichnung, betroffene NIS2-Artikel und BSI-Bausteine aus der Wissensbasis, konkrete Auswirkung.]

TOP 3 SOFORTMASSNAHMEN
[Nummeriere 1-3. Je Maßnahme: konkrete Handlung, zuständige Rolle, Frist in Tagen, BSI-Baustein-Referenz.]

MITTELFRISTIGE MASSNAHMEN
[Nummeriere 1-4. Maßnahmen für 3-6 Monate mit NIS2-Artikel-Bezug.]

RECHTLICHES RISIKO
[Max. 3 Sätze. Konkretes Bußgeldrisiko nach NIS2 Art. 34, ob wesentliche oder wichtige Einrichtung, geschätzte Einstufung.]`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 3000,
        system: "Du bist ein NIS2-Compliance-Experte. Antworte ausschließlich auf Basis der bereitgestellten Wissensbasis. Zitiere immer konkrete Artikel und Bausteine. Keine Halluzinationen. Wenn du unsicher bist, sage es explizit.",
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!res.ok) return new Response(JSON.stringify({ error: "KI nicht verfügbar" }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const data = await res.json();
    const text = data.content?.find(b => b.type === "text")?.text || "";
    return new Response(JSON.stringify({ text }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Interner Fehler" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
}
