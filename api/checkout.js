// api/checkout.js — Stripe Checkout Session erstellen
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

  const { email } = body;
  const appUrl = process.env.APP_URL || "https://nis2-checker.vercel.app";

  // Stripe Checkout Session via REST API (kein SDK nötig im Edge Runtime)
  const params = new URLSearchParams({
    "mode": "subscription",
    "customer_email": email || "",
    "line_items[0][price]": process.env.STRIPE_PRICE_ID, // monatlicher Abo-Preis aus Stripe Dashboard
    "line_items[0][quantity]": "1",
    "success_url": `${appUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    "cancel_url": `${appUrl}/?canceled=true`,
    "payment_method_types[0]": "card",
    "payment_method_types[1]": "sepa_debit", // wichtig für DE-Markt
    "locale": "de",
    "subscription_data[metadata][source]": "nis2-checker",
  });

  try {
    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error("Stripe error:", err);
      return new Response(JSON.stringify({ error: "Zahlung konnte nicht initiiert werden" }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const session = await res.json();
    return new Response(JSON.stringify({ url: session.url }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Interner Fehler" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
}
