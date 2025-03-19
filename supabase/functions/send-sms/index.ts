
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    // Extract the phone number and message from the request
    const { phone, message } = await req.json();
    
    // Validate required fields
    if (!phone || !message) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required fields. Required: phone, message" 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    console.log(`Sending SMS to: ${phone}`);
    console.log(`SMS content: ${message}`);
    
    // Get configured SMS provider from environment variables
    const smsProvider = Deno.env.get("SMS_PROVIDER") || "none";
    
    // Handle different SMS providers
    if (smsProvider === "twilio") {
      const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
      const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
      const fromNumber = Deno.env.get("TWILIO_PHONE_NUMBER");
      
      if (!accountSid || !authToken || !fromNumber) {
        console.error("Missing Twilio configuration");
        throw new Error("Missing SMS provider configuration");
      }
      
      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
      const auth = btoa(`${accountSid}:${authToken}`);
      
      const twilioResponse = await fetch(twilioUrl, {
        method: "POST",
        headers: {
          "Authorization": `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: phone,
          From: fromNumber,
          Body: message,
        }),
      });
      
      const twilioData = await twilioResponse.json();
      if (!twilioResponse.ok) {
        throw new Error(JSON.stringify(twilioData));
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "SMS sent successfully via Twilio",
          provider: "twilio",
          sid: twilioData.sid
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    } else {
      // Simulate success for development without an SMS provider
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "SMS simulated successfully",
          detail: "This is a simulated response. Connect to a real SMS service in production.",
          provider: "simulation"
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
  } catch (error) {
    console.error("Error sending SMS:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Failed to send SMS" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
