// api/webhook.js — Stripe Webhook Handler
// Verifiziert Stripe-Events serverseitig

export const config = { runtime: "edge" };

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return new Response("Webhook-Signatur fehlt", { status: 400 });
  }

  const body = await req.text();

  // Stripe Webhook Signatur verifizieren
  // In Edge Runtime: manuelle HMAC-Verifikation
  const parts = sig.split(",");
  const timestamp = parts.find((p) => p.startsWith("t="))?.split("=")[1];
  const signatures = parts.filter((p) => p.startsWith("v1=")).map((p) => p.split("=")[1]);

  const signedPayload = `${timestamp}.${body}`;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", encoder.encode(webhookSecret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(signedPayload));
  const hex = Array.from(new Uint8Array(signature)).map((b) => b.toString(16).padStart(2, "0")).join("");

  if (!signatures.includes(hex)) {
    return new Response("Ungültige Signatur", { status: 400 });
  }

  const event = JSON.parse(body);

  // Events verarbeiten
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const customerId = session.customer;
      const subscriptionId = session.subscription;
      // TODO: customerId + subscriptionId in deiner Datenbank speichern
      // z.B. Supabase: await supabase.from('subscriptions').insert({ customer_id: customerId, subscription_id: subscriptionId, active: true })
      console.log("Neues Abo:", customerId, subscriptionId);
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object;
      // TODO: Abo in DB als inaktiv markieren
      console.log("Abo gekündigt:", sub.customer);
      break;
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object;
      // TODO: User informieren, Zugang einschränken
      console.log("Zahlung fehlgeschlagen:", invoice.customer);
      break;
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
