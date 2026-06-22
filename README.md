# NIS2 Checker Platform

KI-gestützter NIS2 Compliance-Check + ISMS-Dokumentenvorlagen als SaaS.

## Produkt

**Free:** Kostenloser Compliance-Check (18 Fragen, 6 Dimensionen, KI-Analyse)
**Pro (29€/Monat):** 8 ISMS-Dokumentenvorlagen, KI-generiert, sofort einsetzbar

---

## Deployment (Schritt für Schritt)

### 1. Stripe einrichten (15 Minuten)

1. stripe.com → Konto erstellen
2. Dashboard → Produkte → Neues Produkt:
   - Name: "NIS2 Checker Pro"
   - Preis: 29,00 € / Monat / wiederkehrend
3. Den **Preis-ID** kopieren (beginnt mit `price_...`)
4. Dashboard → Entwickler → API-Schlüssel → Secret Key kopieren (`sk_live_...`)
5. Für Tests zuerst `sk_test_...` verwenden!

### 2. GitHub Repo erstellen

```bash
cd nis2-platform
git init
git add .
git commit -m "initial"
gh repo create nis2-checker --private --push --source=.
```

### 3. Vercel verbinden

1. vercel.com → New Project → GitHub Repo importieren
2. Framework: Vite (oder Create React App)
3. Deploy klicken

### 4. Environment Variables in Vercel

Settings → Environment Variables → folgende eintragen:

| Key | Wert |
|-----|------|
| `ANTHROPIC_API_KEY` | sk-ant-... |
| `STRIPE_SECRET_KEY` | sk_live_... (erst sk_test_ zum Testen) |
| `STRIPE_PRICE_ID` | price_... |
| `APP_URL` | https://deine-domain.vercel.app |

→ Redeploy nach dem Eintragen

### 5. Stripe Webhook (für Abo-Kündigung später)

Dashboard → Entwickler → Webhooks → Endpoint hinzufügen:
- URL: `https://deine-domain.vercel.app/api/webhook`
- Events: `customer.subscription.deleted`, `invoice.payment_failed`

---

## Sicherheit — Was eingebaut ist

- ✅ API Keys nur serverseitig (Vercel Serverless Functions)
- ✅ HTTPS erzwungen (HSTS Header, max-age 2 Jahre)
- ✅ XSS-Schutz (CSP + X-XSS-Protection Header)
- ✅ Clickjacking-Schutz (X-Frame-Options: DENY)
- ✅ CORS auf eigene Domain beschränkt
- ✅ Stripe-Zahlung serverseitig validiert
- ✅ No-Cache für API Routes

## Rechtliches (vor Launch)

- [ ] Impressum (§5 TMG) → e-recht24.de/impressum-generator
- [ ] Datenschutzerklärung (DSGVO) → Anthropic + Stripe als Auftragsverarbeiter nennen
- [ ] AGB mit Widerrufsrecht (14 Tage) für digitale Produkte
- [ ] DPA mit Anthropic → console.anthropic.com

## Umsatzpotenzial

| Kunden | Monatlich |
|--------|-----------|
| 50 | 1.450 € |
| 100 | 2.900 € |
| 200 | 5.800 € |

API-Kosten (Claude): ca. 0,50–1 € pro Analyse → Marge >95%
