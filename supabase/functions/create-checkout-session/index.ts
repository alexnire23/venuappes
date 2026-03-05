// CONFIGURACIÓN MANUAL NECESARIA:
// 1. En Stripe Dashboard → Products: crear producto "Cesta — Acceso ilimitado" a 1,99€
// 2. En Supabase → Settings → Edge Functions → Secrets:
//    - STRIPE_SECRET_KEY (de Stripe Dashboard → Developers → API Keys)

import Stripe from "https://esm.sh/stripe@13.3.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id } = await req.json();

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: "Missing user_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
      apiVersion: "2023-10-16",
      httpClient: Stripe.createFetchHttpClient(),
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: 199,
            product_data: {
              name: "Cesta — Acceso ilimitado",
            },
          },
          quantity: 1,
        },
      ],
      success_url: "https://venuappes.vercel.app/payment-success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "https://venuappes.vercel.app/paywall",
      metadata: {
        user_id,
      },
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in create-checkout-session:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
