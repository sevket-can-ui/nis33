import { useState, useEffect } from "react";

const C = {
  bg: "#0B1120", surface: "#111827", surface2: "#1a2640",
  border: "#1E3A5F", accent: "#00C2FF", accentDim: "rgba(0,194,255,0.1)",
  accentBorder: "rgba(0,194,255,0.25)", red: "#FF4444", redDim: "rgba(255,68,68,0.1)",
  green: "#22C55E", greenDim: "rgba(34,197,94,0.1)", yellow: "#F59E0B",
  yellowDim: "rgba(245,158,11,0.1)", text: "#F0F4FF", muted: "#6B7FA3", mutedLight: "#94A3C0",
};
const FONT = "'Space Grotesk', 'Inter', sans-serif";
const BODY = "'Inter', sans-serif";

const DIMENSIONEN = [
  { id: "governance", label: "Governance & Verantwortung", fragen: ["Gibt es eine benannte Person (ISB/CISO) die für Informationssicherheit verantwortlich ist?", "Hat die Geschäftsführung eine formale Sicherheitsleitlinie verabschiedet?", "Werden Sicherheitsthemen regelmäßig auf Leitungsebene behandelt?"] },
  { id: "risiko", label: "Risikoanalyse", fragen: ["Führen Sie regelmäßige Risikoanalysen für Ihre IT-Systeme durch?", "Sind kritische Assets und deren Schutzbedarf dokumentiert?", "Werden identifizierte Risiken mit Maßnahmen nachverfolgt?"] },
  { id: "incident", label: "Incident Response", fragen: ["Gibt es einen dokumentierten Prozess für Sicherheitsvorfälle?", "Sind Mitarbeiter geschult Vorfälle zu erkennen und zu eskalieren?", "Werden erhebliche Vorfälle innerhalb von 24h an Behörden gemeldet?"] },
  { id: "bcm", label: "Business Continuity", fragen: ["Existieren Notfallpläne für kritische IT-Systeme?", "Werden Backups regelmäßig auf Wiederherstellbarkeit getestet?", "Gibt es definierte RTO/RPO-Ziele für kritische Systeme?"] },
  { id: "lieferkette", label: "Lieferkettensicherheit", fragen: ["Werden IT-Sicherheitsanforderungen in Lieferantenverträge aufgenommen?", "Gibt es eine Übersicht aller kritischen Drittanbieter und Zugriffe?", "Werden Sicherheitsnachweise von Lieferanten eingeholt?"] },
  { id: "awareness", label: "Awareness & Schulung", fragen: ["Erhalten alle Mitarbeiter regelmäßige Sicherheitsschulungen?", "Gibt es Phishing-Simulationen oder praktische Übungen?", "Sind Mitarbeiter über Social Engineering Angriffe informiert?"] },
];

const VORLAGEN = [
  { id: "leitlinie", name: "ISMS-Leitlinie", desc: "Informationssicherheitsleitlinie nach ISO 27001 / BSI IT-Grundschutz", badge: "ISO 27001", icon: "📋" },
  { id: "passwort", name: "Passwortrichtlinie", desc: "Anforderungen an sichere Passwörter und Authentifizierung", badge: "BSI", icon: "🔐" },
  { id: "risiko", name: "Risikoanalyse-Template", desc: "Excel-Vorlage für systematische IT-Risikoanalyse nach BSI 200-3", badge: "BSI 200-3", icon: "⚠️" },
  { id: "notfall", name: "Notfallplan (BCP)", desc: "Business Continuity Plan Vorlage nach BSI 200-4", badge: "BSI 200-4", icon: "🚨" },
  { id: "asset", name: "Asset-Inventar", desc: "Vollständige Vorlage zur Erfassung aller IT-Assets und Schutzbedarf", badge: "NIS2", icon: "🗂️" },
  { id: "vvt", name: "Verarbeitungsverzeichnis", desc: "DSGVO-konformes Verzeichnis von Verarbeitungstätigkeiten (VVT)", badge: "DSGVO", icon: "📁" },
  { id: "incident-plan", name: "Incident Response Plan", desc: "Reaktionsplan für Sicherheitsvorfälle inkl. Meldeformulare NIS2", badge: "NIS2", icon: "🛡️" },
  { id: "awareness-plan", name: "Awareness-Jahresplan", desc: "12-Monats-Schulungsplan für Mitarbeiter-Sensibilisierung", badge: "Best Practice", icon: "🎓" },
];

// Simple Markdown renderer — bold, headers, list items
function renderMarkdown(text) {
  if (!text) return null;
  return text.split("\n").map((line, i) => {
    // H3
    if (line.startsWith("### ")) {
      const content = line.replace(/^### /, "").replace(/\*\*(.*?)\*\*/g, "$1");
      return <div key={i} style={{ fontWeight: 700, fontSize: 14, marginTop: 10, marginBottom: 4, color: "#F0F4FF" }}>{content}</div>;
    }
    // H2
    if (line.startsWith("## ")) {
      const content = line.replace(/^## /, "").replace(/\*\*(.*?)\*\*/g, "$1");
      return <div key={i} style={{ fontWeight: 700, fontSize: 15, marginTop: 12, marginBottom: 6, color: "#F0F4FF" }}>{content}</div>;
    }
    // Empty line
    if (!line.trim()) return <div key={i} style={{ height: 6 }} />;
    // Normal line with bold
    const parts = line.split(/\*\*(.*?)\*\*/g);
    return (
      <div key={i} style={{ fontSize: 13, lineHeight: 1.7, color: "#94A3C0", marginBottom: 2 }}>
        {parts.map((p, j) => j % 2 === 1 ? <strong key={j} style={{ color: "#F0F4FF", fontWeight: 600 }}>{p}</strong> : p)}
      </div>
    );
  });
}

function RadarChart({ scores }) {
  const size = 240, center = 120, maxR = 90, n = scores.length;
  const angle = (i) => (i * 2 * Math.PI) / n - Math.PI / 2;
  const pt = (r, i) => ({ x: center + r * Math.cos(angle(i)), y: center + r * Math.sin(angle(i)) });
  const labels = ["Governance", "Risiko", "Incident", "BCM", "Lieferkette", "Awareness"];
  const dataPath = scores.map((s, i) => { const p = pt((s / 2) * maxR, i); return `${i === 0 ? "M" : "L"}${p.x},${p.y}`; }).join(" ") + "Z";
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {[0.25, 0.5, 0.75, 1].map((r, ri) => {
        const path = Array.from({ length: n }, (_, i) => { const p = pt(r * maxR, i); return `${i === 0 ? "M" : "L"}${p.x},${p.y}`; }).join(" ") + "Z";
        return <path key={ri} d={path} fill="none" stroke={C.border} strokeWidth={1} />;
      })}
      {Array.from({ length: n }, (_, i) => { const o = pt(maxR, i); return <line key={i} x1={center} y1={center} x2={o.x} y2={o.y} stroke={C.border} strokeWidth={1} />; })}
      <path d={dataPath} fill={`${C.accent}22`} stroke={C.accent} strokeWidth={2} strokeLinejoin="round" />
      {scores.map((s, i) => { const p = pt((s / 2) * maxR, i); return <circle key={i} cx={p.x} cy={p.y} r={4} fill={C.accent} />; })}
      {Array.from({ length: n }, (_, i) => { const p = pt(maxR + 20, i); return <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fontSize={8.5} fill={C.mutedLight} fontFamily={BODY}>{labels[i]}</text>; })}
    </svg>
  );
}

function ScoreRing({ pct, color }) {
  const r = 40, circ = 2 * Math.PI * r, dash = (pct / 100) * circ;
  const label = pct >= 70 ? "Gut" : pct >= 40 ? "Ausbaufähig" : "Kritisch";
  return (
    <svg width={100} height={100} viewBox="0 0 100 100">
      <circle cx={50} cy={50} r={r} fill="none" stroke={C.border} strokeWidth={7} />
      <circle cx={50} cy={50} r={r} fill="none" stroke={color} strokeWidth={7}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" transform="rotate(-90 50 50)" />
      <text x={50} y={46} textAnchor="middle" fontSize={18} fontWeight={800} fill={color} fontFamily={FONT}>{pct}%</text>
      <text x={50} y={60} textAnchor="middle" fontSize={8} fill={C.muted} fontFamily={BODY}>{label}</text>
    </svg>
  );
}

export default function App() {
  const [page, setPage] = useState("home"); // home | check | ergebnis | preise | dashboard
  const [step, setStep] = useState("intro"); // intro | fragen | loading
  const [dim, setDim] = useState(0);
  const [antworten, setAntworten] = useState({});
  const [firma, setFirma] = useState(""); const [branche, setBranche] = useState(""); const [mitarbeiter, setMitarbeiter] = useState("");
  const [analyse, setAnalyse] = useState(null);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [generatingVorlage, setGeneratingVorlage] = useState(null);
  const [vorlageTexts, setVorlageTexts] = useState({});
  const [error, setError] = useState("");

  // Check Stripe session on dashboard load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (sessionId) {
      fetch("/api/verify-subscription", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      }).then(r => r.json()).then(d => {
        if (d.active) { setSubscribed(true); setEmail(d.email); setPage("dashboard"); }
      });
    }
    if (params.get("canceled")) setError("Zahlung abgebrochen.");
  }, []);

  const totalF = DIMENSIONEN.flatMap(d => d.fragen).length;
  const beantwortet = Object.keys(antworten).length;
  const fortschritt = Math.round((beantwortet / totalF) * 100);
  const dimScores = DIMENSIONEN.map(d => d.fragen.reduce((s, _, fi) => s + (antworten[`${d.id}_${fi}`] ?? 0), 0) / d.fragen.length);
  const gesamtPct = Math.round((Object.values(antworten).reduce((a, b) => a + b, 0) / (totalF * 2)) * 100);
  const scoreColor = gesamtPct >= 70 ? C.green : gesamtPct >= 40 ? C.yellow : C.red;

  const canAdvance = () => DIMENSIONEN[dim].fragen.every((_, fi) => antworten[`${DIMENSIONEN[dim].id}_${fi}`] !== undefined);

  const setAnt = (dimId, fi, val) => setAntworten(p => ({ ...p, [`${dimId}_${fi}`]: val }));

  const doAnalyse = async () => {
    setStep("loading"); setError("");
    try {
      const res = await fetch("/api/analyse", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ antworten, firma, branche, mitarbeiter, dimensionen: DIMENSIONEN }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAnalyse(data.text); setPage("ergebnis");
    } catch (e) { setError(e.message || "Fehler"); setStep("fragen"); }
  };

  const doCheckout = async () => {
    setLoadingCheckout(true); setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else throw new Error(data.error);
    } catch (e) { setError(e.message); setLoadingCheckout(false); }
  };

  const genVorlage = async (vorlage) => {
    if (vorlageTexts[vorlage.id]) return;
    setGeneratingVorlage(vorlage.id);
    const prompt = `Erstelle eine professionelle ${vorlage.name} auf Deutsch für ein deutsches KMU, NIS2- und DSGVO-konform. Formatiere als vollständiges Dokument mit Abschnitten, Tabellen als Text-Tabellen, und konkreten Beispielen. Ca. 600-800 Wörter. Direkt und praxistauglich.`;
    try {
      const res = await fetch("/api/analyse", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ antworten: { _vorlage: 1 }, firma: vorlage.name, branche: "Vorlage", mitarbeiter: "", dimensionen: [{ id: "v", label: vorlage.name, fragen: [prompt] }] }),
      });
      // Für Vorlagen nutzen wir einen direkten Claude-Call mit eigenem Prompt
      const directRes = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1000, messages: [{ role: "user", content: prompt }] }),
      });
      const d = await directRes.json();
      const text = d.content?.find(b => b.type === "text")?.text || "";
      setVorlageTexts(p => ({ ...p, [vorlage.id]: text }));
    } catch { setVorlageTexts(p => ({ ...p, [vorlage.id]: "Fehler beim Laden." })); }
    setGeneratingVorlage(null);
  };

  const downloadVorlage = (vorlage) => {
    const text = vorlageTexts[vorlage.id];
    if (!text) return;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${vorlage.id}.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  const parseSection = (text, heading) => {
    const regex = new RegExp(`${heading}[:\\s]*([\\s\\S]*?)(?=\\n[A-ZÄÖÜ]{3,}|$)`, "i");
    const m = text?.match(regex);
    return m ? m[1].trim() : "";
  };

  // ─── STYLES ───
  const card = { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 26, marginBottom: 18 };
  const btn = (variant = "primary") => ({
    padding: "12px 22px", border: "none", borderRadius: 10, cursor: "pointer", fontFamily: FONT, fontWeight: 700, fontSize: 14,
    background: variant === "primary" ? `linear-gradient(135deg, ${C.accent}, #0057FF)` : variant === "ghost" ? "transparent" : C.surface2,
    color: variant === "primary" ? "#fff" : variant === "ghost" ? C.muted : C.text,
    ...(variant === "ghost" ? { border: `1px solid ${C.border}` } : {}),
  });
  const inputStyle = { width: "100%", background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 12px", fontSize: 14, color: C.text, fontFamily: BODY };

  // ─── PAGES ───
  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: BODY }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700;800&family=Inter:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .fade { animation: fadeUp 0.35s ease forwards; }
        button { cursor:pointer; font-family:inherit; transition:all 0.15s; }
        button:hover { opacity: 0.88; }
        button:active { transform:scale(0.97); }
        input:focus, select:focus { outline:none; border-color:${C.accent}!important; box-shadow:0 0 0 3px ${C.accentDim}; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: ${C.bg}; } ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius:4px; }
      `}</style>

      {/* NAV */}
      <nav style={{ borderBottom: `1px solid ${C.border}`, padding: "0 28px", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: C.bg, zIndex: 50 }}>
        <button onClick={() => setPage("home")} style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", color: C.text }}>
          <div style={{ width: 28, height: 28, background: `linear-gradient(135deg,${C.accent},#0057FF)`, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontWeight: 800, fontSize: 13, color: "#fff" }}>N2</div>
          <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 15, letterSpacing: "-0.3px" }}>NIS2 Checker</span>
        </button>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={() => setPage("preise")} style={{ ...btn("ghost"), padding: "7px 16px", fontSize: 13 }}>Preise</button>
          {subscribed
            ? <button onClick={() => setPage("dashboard")} style={{ ...btn("primary"), padding: "7px 16px", fontSize: 13 }}>Dashboard</button>
            : <button onClick={() => { setPage("check"); setStep("intro"); }} style={{ ...btn("primary"), padding: "7px 16px", fontSize: 13 }}>Check starten</button>}
        </div>
      </nav>

      <main style={{ maxWidth: 740, margin: "0 auto", padding: "44px 20px 80px" }}>

        {/* ── HOME ── */}
        {page === "home" && (
          <div className="fade">
            <div style={{ textAlign: "center", marginBottom: 52 }}>
              <div style={{ display: "inline-block", fontSize: 11, fontWeight: 600, letterSpacing: "1.5px", textTransform: "uppercase", color: C.accent, marginBottom: 20, borderBottom: `1px solid ${C.accentBorder}`, paddingBottom: 6 }}>
                NIS2 · BSI IT-Grundschutz · ISO 27001
              </div>
              <h1 style={{ fontFamily: FONT, fontSize: "clamp(30px,5vw,50px)", fontWeight: 800, letterSpacing: "-2px", lineHeight: 1.08, marginBottom: 18 }}>
                Wie NIS2-konform ist<br /><span style={{ color: C.accent }}>Ihr Unternehmen?</span>
              </h1>
              <p style={{ fontSize: 16, color: C.mutedLight, lineHeight: 1.7, maxWidth: 480, margin: "0 auto 36px" }}>
                Kostenloser KI-gestützter Compliance-Check in 5 Minuten. Konkreter Maßnahmenplan. Fertige Dokumentenvorlagen.
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                <button onClick={() => { setPage("check"); setStep("intro"); }} style={{ ...btn("primary"), padding: "14px 32px", fontSize: 15 }}>
                  Kostenlos prüfen →
                </button>
                <button onClick={() => setPage("preise")} style={{ ...btn("ghost"), padding: "14px 32px", fontSize: 15 }}>
                  Alle Features
                </button>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 40 }}>
              {[
                { icon: "⚡", t: "5 Minuten", s: "18 Fragen, 6 Dimensionen" },
                { icon: "🤖", t: "KI-Analyse", s: "Sofort, konkret, NIS2-konform" },
                { icon: "📄", t: "8 Vorlagen", s: "Sofort einsetzbare Dokumente" },
              ].map(c => (
                <div key={c.t} style={{ ...card, textAlign: "center", padding: "20px 14px", marginBottom: 0 }}>
                  <div style={{ fontSize: 26, marginBottom: 8 }}>{c.icon}</div>
                  <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{c.t}</div>
                  <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>{c.s}</div>
                </div>
              ))}
            </div>

            <div style={{ ...card, background: `linear-gradient(135deg, rgba(0,194,255,0.06), rgba(0,87,255,0.06))`, border: `1px solid ${C.accentBorder}`, textAlign: "center" }}>
              <div style={{ fontFamily: FONT, fontSize: 16, fontWeight: 700, marginBottom: 6 }}>NIS2 gilt seit Oktober 2024</div>
              <p style={{ fontSize: 13, color: C.mutedLight, marginBottom: 18, lineHeight: 1.6 }}>Tausende deutsche Unternehmen sind noch nicht compliant. Bußgelder bis zu 10 Mio. € oder 2% des Jahresumsatzes drohen.</p>
              <button onClick={() => { setPage("check"); setStep("intro"); }} style={{ ...btn("primary"), padding: "11px 24px" }}>Jetzt kostenlos prüfen</button>
            </div>
          </div>
        )}

        {/* ── CHECK ── */}
        {page === "check" && (
          <div className="fade">
            {step === "intro" && (
              <div>
                <h2 style={{ fontFamily: FONT, fontSize: 26, fontWeight: 800, letterSpacing: "-0.8px", marginBottom: 8 }}>NIS2 Compliance-Check</h2>
                <p style={{ fontSize: 14, color: C.muted, marginBottom: 28 }}>18 Fragen · 5 Minuten · Sofort-Ergebnis</p>
                <div style={card}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 18 }}>Optionale Angaben</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                    <div><label style={{ fontSize: 12, color: C.muted, display: "block", marginBottom: 5 }}>Unternehmensname</label><input value={firma} onChange={e => setFirma(e.target.value)} placeholder="Mustermann GmbH" style={inputStyle} /></div>
                    <div><label style={{ fontSize: 12, color: C.muted, display: "block", marginBottom: 5 }}>Branche</label>
                      <select value={branche} onChange={e => setBranche(e.target.value)} style={inputStyle}>
                        <option value="">Wählen…</option>
                        {["KRITIS / Energie", "KRITIS / Wasser", "KRITIS / Gesundheit", "KRITIS / Transport", "Finanzdienstleistung", "IT / Digitale Infrastruktur", "Produktion", "Öffentliche Verwaltung", "Sonstiges"].map(b => <option key={b}>{b}</option>)}
                      </select>
                    </div>
                  </div>
                  <div><label style={{ fontSize: 12, color: C.muted, display: "block", marginBottom: 5 }}>Mitarbeiterzahl</label>
                    <select value={mitarbeiter} onChange={e => setMitarbeiter(e.target.value)} style={inputStyle}>
                      <option value="">Wählen…</option>
                      {["1–49", "50–249", "250–999", "1000+"].map(m => <option key={m}>{m}</option>)}
                    </select>
                  </div>
                </div>
                <button onClick={() => setStep("fragen")} style={{ ...btn("primary"), width: "100%", padding: "14px" }}>Bewertung starten →</button>
                <p style={{ textAlign: "center", fontSize: 11, color: C.muted, marginTop: 12 }}>Keine Registrierung · DSGVO-konform</p>
              </div>
            )}

            {step === "fragen" && (
              <div>
                <div style={{ marginBottom: 28 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                    <span style={{ fontSize: 13, color: C.muted }}>Dimension {dim + 1} / {DIMENSIONEN.length}</span>
                    <span style={{ fontSize: 13, color: C.accent, fontWeight: 600 }}>{fortschritt}%</span>
                  </div>
                  <div style={{ height: 4, background: C.surface2, borderRadius: 4 }}>
                    <div style={{ height: "100%", width: `${fortschritt}%`, background: `linear-gradient(90deg,${C.accent},#0057FF)`, borderRadius: 4, transition: "width 0.4s" }} />
                  </div>
                  <div style={{ display: "flex", gap: 5, marginTop: 12, flexWrap: "wrap" }}>
                    {DIMENSIONEN.map((d, i) => {
                      const done = d.fragen.every((_, fi) => antworten[`${d.id}_${fi}`] !== undefined);
                      const active = i === dim;
                      return <button key={d.id} onClick={() => setDim(i)} style={{ fontSize: 10, padding: "3px 9px", borderRadius: 20, border: `1px solid ${active ? C.accent : done ? C.green : C.border}`, color: active ? C.accent : done ? C.green : C.muted, background: active ? C.accentDim : done ? C.greenDim : "transparent" }}>{done && !active ? "✓ " : ""}{d.label.split(" ")[0]}</button>;
                    })}
                  </div>
                </div>

                <div style={card}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: C.accent, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6 }}>Dimension {dim + 1}</div>
                  <h3 style={{ fontFamily: FONT, fontSize: 19, fontWeight: 700, letterSpacing: "-0.4px", marginBottom: 26 }}>{DIMENSIONEN[dim].label}</h3>
                  {DIMENSIONEN[dim].fragen.map((frage, fi) => {
                    const key = `${DIMENSIONEN[dim].id}_${fi}`;
                    const sel = antworten[key];
                    return (
                      <div key={fi} style={{ marginBottom: fi < DIMENSIONEN[dim].fragen.length - 1 ? 26 : 0 }}>
                        <p style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 10 }}><span style={{ color: C.muted, fontSize: 12, marginRight: 5 }}>{fi + 1}.</span>{frage}</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                          {[{ v: 2, l: "Ja, vollständig umgesetzt", e: "✅" }, { v: 1, l: "Teilweise / in Bearbeitung", e: "🔶" }, { v: 0, l: "Nein / nicht vorhanden", e: "❌" }].map(a => (
                            <button key={a.v} onClick={() => setAnt(DIMENSIONEN[dim].id, fi, a.v)} style={{ padding: "10px 14px", borderRadius: 8, textAlign: "left", fontSize: 13, fontWeight: sel === a.v ? 600 : 400, border: `1px solid ${sel === a.v ? (a.v === 2 ? C.green : a.v === 1 ? C.yellow : C.red) : C.border}`, background: sel === a.v ? (a.v === 2 ? C.greenDim : a.v === 1 ? C.yellowDim : C.redDim) : "transparent", color: sel === a.v ? C.text : C.mutedLight }}>
                              {a.e} {a.l}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  {dim > 0 && <button onClick={() => setDim(d => d - 1)} style={{ ...btn("ghost"), flex: 1 }}>← Zurück</button>}
                  {dim < DIMENSIONEN.length - 1
                    ? <button onClick={() => canAdvance() && setDim(d => d + 1)} disabled={!canAdvance()} style={{ ...btn(canAdvance() ? "primary" : "ghost"), flex: 2 }}>Weiter →</button>
                    : <button onClick={() => canAdvance() && doAnalyse()} disabled={!canAdvance()} style={{ ...btn(canAdvance() ? "primary" : "ghost"), flex: 2 }}>Analyse generieren ✨</button>
                  }
                </div>
                {error && <div style={{ marginTop: 14, padding: "11px 14px", background: C.redDim, border: `1px solid ${C.red}`, borderRadius: 8, fontSize: 13, color: "#ff8080" }}>⚠️ {error}</div>}
              </div>
            )}

            {step === "loading" && (
              <div style={{ textAlign: "center", paddingTop: 80 }}>
                <div style={{ width: 52, height: 52, border: `3px solid ${C.border}`, borderTop: `3px solid ${C.accent}`, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 20px" }} />
                <h3 style={{ fontFamily: FONT, fontSize: 18, fontWeight: 700, marginBottom: 8 }}>KI analysiert Ihre Antworten…</h3>
                <p style={{ fontSize: 13, color: C.muted }}>NIS2-Anforderungen werden abgeglichen</p>
              </div>
            )}
          </div>
        )}

        {/* ── ERGEBNIS ── */}
        {page === "ergebnis" && analyse && (
          <div className="fade">
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.accent, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10 }}>Ihre NIS2-Bewertung</div>
              <h2 style={{ fontFamily: FONT, fontSize: 26, fontWeight: 800, letterSpacing: "-1px", marginBottom: 4 }}>{firma || "Ihr Unternehmen"}</h2>
              {branche && <p style={{ fontSize: 13, color: C.muted }}>{branche}{mitarbeiter ? ` · ${mitarbeiter} Mitarbeiter` : ""}</p>}
            </div>

            <div style={{ ...card, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "center" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}><ScoreRing pct={gesamtPct} color={scoreColor} /></div>
                {DIMENSIONEN.map((d, i) => {
                  const pct = Math.round((dimScores[i] / 2) * 100);
                  const col = pct >= 70 ? C.green : pct >= 40 ? C.yellow : C.red;
                  return (
                    <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                      <div style={{ fontSize: 10, color: C.muted, width: 76, textAlign: "right", flexShrink: 0 }}>{d.label.split(" ")[0]}</div>
                      <div style={{ flex: 1, height: 3, background: C.surface2, borderRadius: 3 }}><div style={{ width: `${pct}%`, height: "100%", background: col, borderRadius: 3, transition: "width 0.8s" }} /></div>
                      <div style={{ fontSize: 10, color: col, width: 28 }}>{pct}%</div>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: "flex", justifyContent: "center" }}><RadarChart scores={dimScores} /></div>
            </div>

            {[
              { h: "ZUSAMMENFASSUNG", icon: "📊", t: "Befund", bg: null },
              { h: "TOP 3 KRITISCHE LÜCKEN", icon: "🚨", t: "Kritische Lücken", bg: C.redDim, brd: `1px solid rgba(255,68,68,0.2)` },
              { h: "TOP 3 SOFORTMASSNAHMEN", icon: "⚡", t: "Sofortmaßnahmen (30 Tage)", bg: C.accentDim, brd: `1px solid ${C.accentBorder}` },
              { h: "MITTELFRISTIGE MASSNAHMEN", icon: "📅", t: "Mittelfristig (3–6 Monate)", bg: null },
              { h: "RECHTLICHES RISIKO", icon: "⚖️", t: "Rechtliches Risiko", bg: C.yellowDim, brd: `1px solid rgba(245,158,11,0.2)` },
            ].map(({ h, icon, t, bg, brd }) => {
              const content = parseSection(analyse, h);
              if (!content) return null;
              return (
                <div key={h} style={{ ...card, background: bg || C.surface, border: brd || `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 10 }}>{icon} {t}</div>
                  <div>{renderMarkdown(content)}</div>
                </div>
              );
            })}

            <div style={{ ...card, background: `linear-gradient(135deg,rgba(0,194,255,0.07),rgba(0,87,255,0.07))`, border: `1px solid ${C.accentBorder}`, textAlign: "center" }}>
              <div style={{ fontFamily: FONT, fontSize: 17, fontWeight: 700, marginBottom: 6 }}>Nächster Schritt: Dokumentenvorlagen</div>
              <p style={{ fontSize: 13, color: C.muted, marginBottom: 20, lineHeight: 1.6 }}>8 sofort einsetzbare ISMS-Vorlagen — Leitlinie, Risikoanalyse, Notfallplan, VVT und mehr. Für 29 €/Monat.</p>
              <button onClick={() => setPage("preise")} style={{ ...btn("primary"), padding: "12px 28px" }}>Vorlagen freischalten →</button>
            </div>

            <button onClick={() => { setPage("check"); setStep("intro"); setAntworten({}); setAnalyse(null); setDim(0); }} style={{ ...btn("ghost"), width: "100%", marginTop: 4 }}>Neue Bewertung starten</button>
          </div>
        )}

        {/* ── PREISE ── */}
        {page === "preise" && (
          <div className="fade">
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <h2 style={{ fontFamily: FONT, fontSize: 30, fontWeight: 800, letterSpacing: "-1px", marginBottom: 10 }}>Einfache Preisgestaltung</h2>
              <p style={{ fontSize: 14, color: C.muted }}>Compliance-Check kostenlos · Dokumentenvorlagen im Abo</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 32 }}>
              {[
                { name: "Free", preis: "0 €", sub: "Kostenlos", features: ["NIS2 Compliance-Check", "KI-Analyse & Maßnahmenplan", "Radar-Chart & Scoring", "Unbegrenzte Checks"], cta: "Jetzt prüfen", action: () => { setPage("check"); setStep("intro"); }, primary: false },
                { name: "Pro", preis: "29 €", sub: "/ Monat", features: ["Alles aus Free", "8 ISMS-Dokument-Vorlagen", "KI-generierte Inhalte", "Leitlinie, BCP, VVT, Risiko…", "SEPA & Kreditkarte"], cta: "Pro freischalten", action: () => document.getElementById("checkout-form")?.scrollIntoView({ behavior: "smooth" }), primary: true },
              ].map(p => (
                <div key={p.name} style={{ ...card, border: p.primary ? `1px solid ${C.accent}` : `1px solid ${C.border}`, background: p.primary ? "rgba(0,194,255,0.05)" : C.surface, position: "relative" }}>
                  {p.primary && <div style={{ position: "absolute", top: -1, right: 20, background: C.accent, color: "#000", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: "0 0 8px 8px", letterSpacing: "0.5px" }}>BELIEBT</div>}
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.muted, marginBottom: 10 }}>{p.name}</div>
                  <div style={{ fontFamily: FONT, fontSize: 32, fontWeight: 800, letterSpacing: "-1.5px", color: p.primary ? C.accent : C.text }}>{p.preis}<span style={{ fontSize: 14, fontWeight: 500, color: C.muted }}>{p.sub}</span></div>
                  <div style={{ margin: "18px 0", borderTop: `1px solid ${C.border}` }} />
                  {p.features.map(f => <div key={f} style={{ fontSize: 13, color: C.mutedLight, marginBottom: 7, display: "flex", alignItems: "center", gap: 7 }}><span style={{ color: p.primary ? C.accent : C.green }}>✓</span>{f}</div>)}
                  <button onClick={p.action} style={{ ...btn(p.primary ? "primary" : "ghost"), width: "100%", marginTop: 18, padding: "11px" }}>{p.cta}</button>
                </div>
              ))}
            </div>

            {/* Checkout Form */}
            <div id="checkout-form" style={{ ...card, border: `1px solid ${C.accentBorder}` }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Pro-Abo starten — 29 € / Monat</div>
              <label style={{ fontSize: 12, color: C.muted, display: "block", marginBottom: 6 }}>E-Mail-Adresse</label>
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="ihre@email.de" type="email" style={{ ...inputStyle, marginBottom: 14 }} />
              <button onClick={doCheckout} disabled={loadingCheckout || !email} style={{ ...btn("primary"), width: "100%", padding: "13px", opacity: !email ? 0.5 : 1 }}>
                {loadingCheckout ? "Weiterleitung…" : "Zu Stripe → Sicher bezahlen"}
              </button>
              <p style={{ fontSize: 11, color: C.muted, textAlign: "center", marginTop: 10 }}>
                Sicher via Stripe · SEPA & Kreditkarte · Jederzeit kündbar
              </p>
            </div>
            {error && <div style={{ padding: "11px 14px", background: C.redDim, border: `1px solid ${C.red}`, borderRadius: 8, fontSize: 13, color: "#ff8080", marginTop: 12 }}>⚠️ {error}</div>}
          </div>
        )}

        {/* ── DASHBOARD ── */}
        {page === "dashboard" && (
          <div className="fade">
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.green, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10 }}>✓ Pro-Mitglied</div>
              <h2 style={{ fontFamily: FONT, fontSize: 26, fontWeight: 800, letterSpacing: "-1px", marginBottom: 4 }}>Ihre Dokumentenvorlagen</h2>
              {email && <p style={{ fontSize: 13, color: C.muted }}>{email}</p>}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {VORLAGEN.map(v => (
                <div key={v.id} style={{ ...card, marginBottom: 0, display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                    <div style={{ fontSize: 24 }}>{v.icon}</div>
                    <div style={{ fontSize: 10, fontWeight: 600, background: C.accentDim, border: `1px solid ${C.accentBorder}`, color: C.accent, padding: "2px 8px", borderRadius: 20 }}>{v.badge}</div>
                  </div>
                  <div style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{v.name}</div>
                  <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5, flex: 1, marginBottom: 14 }}>{v.desc}</div>

                  {vorlageTexts[v.id] ? (
                    <div>
                      <div style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 8, padding: 12, fontSize: 11, color: C.mutedLight, lineHeight: 1.6, maxHeight: 120, overflow: "auto", marginBottom: 10, whiteSpace: "pre-wrap" }}>
                        {vorlageTexts[v.id].slice(0, 400)}…
                      </div>
                      <button onClick={() => downloadVorlage(v)} style={{ ...btn("primary"), width: "100%", padding: "9px", fontSize: 12 }}>⬇ Herunterladen</button>
                    </div>
                  ) : (
                    <button onClick={() => genVorlage(v)} disabled={generatingVorlage === v.id} style={{ ...btn(generatingVorlage === v.id ? "ghost" : "primary"), width: "100%", padding: "9px", fontSize: 12 }}>
                      {generatingVorlage === v.id ? (
                        <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                          <span style={{ width: 12, height: 12, border: `2px solid ${C.muted}`, borderTop: `2px solid ${C.accent}`, borderRadius: "50%", animation: "spin 0.8s linear infinite", display: "inline-block" }} />
                          Wird generiert…
                        </span>
                      ) : "Vorlage generieren"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
