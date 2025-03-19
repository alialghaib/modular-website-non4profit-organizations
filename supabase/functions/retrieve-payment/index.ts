
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the Stripe secret key from environment variable or use the hardcoded one for development
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY") || "sk_test_51R45dIERyjuxcD4Y0mCydIbFTryFHjJjrikFP8LwOm9bTXkrYqmxfF4wQqggPmtiEK7yWo8DBpRVxgzANDmTcWE000GV86v5z2";
    
    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2022-11-15",
    });

    // Parse request body
    const { sessionId } = await req.json();

    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: "Session ID is required" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    console.log(`Retrieving payment for session: ${sessionId}`);

    // Retrieve the session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Get payment details if payment was successful
    if (session.payment_status === "paid") {
      const paymentIntent = await stripe.paymentIntents.retrieve(
        session.payment_intent as string
      );

      return new Response(
        JSON.stringify({
          success: true,
          status: session.payment_status,
          amount: session.amount_total ? session.amount_total / 100 : 0, // Convert from cents
          created: new Date(session.created * 1000).toISOString(),
          customer: session.customer,
          customerEmail: session.customer_details?.email,
          paymentMethod: paymentIntent.payment_method,
          receiptUrl: session.receipt_url,
          metadata: session.metadata
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        status: session.payment_status,
        session: session
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error retrieving payment:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Failed to retrieve payment" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
