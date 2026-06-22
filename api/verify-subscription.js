// api/verify-subscription.js — Prüft ob User aktives Abo hat
export const config = { runtime: "edge" };

export default async function handler(req) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": process.env.APP_URL || "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });

  let body;
  try { body = await req.json(); }
  catch { return new Response(JSON.stringify({ active: false }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }); }

  const { sessionId } = body;
  if (!sessionId) return new Response(JSON.stringify({ active: false }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    // Stripe Checkout Session abrufen
    const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
      headers: { "Authorization": `Bearer ${process.env.STRIPE_SECRET_KEY}` },
    });
    const session = await res.json();

    const active = session.payment_status === "paid" || session.subscription !== null;
    const email = session.customer_email || session.customer_details?.email || "";

    return new Response(JSON.stringify({ active, email }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ active: false }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
}
