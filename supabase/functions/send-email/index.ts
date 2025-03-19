
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Email templates with HTML content
const emailTemplates = {
  'booking-confirmation': (data: any) => `
    <h1>Booking Confirmation</h1>
    <p>Hello ${data.firstName},</p>
    <p>Your booking for ${data.hikeName} on ${data.hikeDate} at ${data.hikeTime} has been confirmed.</p>
    <p>Meeting point: ${data.meetingPoint || 'To be announced'}</p>
    <p>Please remember to complete your e-waiver before the hike.</p>
    <p>Thank you!</p>
  `,
  'booking-cancellation': (data: any) => `
    <h1>Booking Cancellation</h1>
    <p>Hello ${data.firstName},</p>
    <p>Your booking for ${data.hikeName} on ${data.hikeDate} has been cancelled.</p>
    <p>Booking reference: ${data.bookingReference}</p>
    <p>If you did not request this cancellation, please contact us immediately.</p>
    <p>Thank you!</p>
  `,
  'waiver-reminder': (data: any) => `
    <h1>E-Waiver Reminder</h1>
    <p>Hello ${data.firstName},</p>
    <p>This is a reminder to complete your e-waiver for the upcoming ${data.hikeName} on ${data.hikeDate}.</p>
    <p>Booking reference: ${data.bookingReference}</p>
    <p>Please log in to your account and upload your signed waiver form.</p>
    <p>Thank you!</p>
  `,
  'upcoming-hike-reminder': (data: any) => `
    <h1>Your Hike is Coming Up!</h1>
    <p>Hello ${data.firstName},</p>
    <p>This is a reminder that your ${data.hikeName} trip is scheduled for tomorrow, ${data.hikeDate} at ${data.hikeTime}.</p>
    <p>Meeting point: ${data.meetingPoint}</p>
    <p>Don't forget to bring water, appropriate clothing, and comfortable hiking shoes.</p>
    <p>We look forward to seeing you there!</p>
  `,
  'admin-new-booking': (data: any) => `
    <h1>New Booking Alert</h1>
    <p>A new booking has been made for ${data.hikeName} by ${data.userEmail}.</p>
    <p>Booking date: ${data.hikeDate} at ${data.hikeTime}</p>
    <p>Participants: ${data.participants}</p>
    <p>Please check the admin dashboard for more details.</p>
  `,
  'guide-assignment': (data: any) => `
    <h1>Guide Assignment</h1>
    <p>You have been assigned as the guide for ${data.hikeName} on ${data.hikeDate} at ${data.hikeTime}.</p>
    <p>There are currently ${data.participantCount} participants registered for this hike.</p>
    <p>Please log in to your guide dashboard for more details.</p>
  `
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Extract email data from the request
    const { to, subject, message, templateId, templateData } = await req.json();
    
    // Validate required fields
    if (!to || !subject || (!message && !templateId)) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required fields. Required: to, subject, and either message or templateId" 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    console.log(`Sending email to: ${to}, subject: ${subject}`);
    console.log(`Email content: ${message || "Using template: " + templateId}`);
    
    // Generate email content from template if templateId is provided
    let emailContent = message;
    
    if (templateId && !message) {
      const templateFunction = emailTemplates[templateId];
      
      if (templateFunction && templateData) {
        emailContent = templateFunction(templateData);
        console.log(`Generated email content from template: ${templateId}`);
      } else {
        console.log(`Template not found or missing template data: ${templateId}`);
      }
    }
    
    // In a real implementation, you would call your email service here
    // For example, with SendGrid:
    // const sgMail = await import("npm:@sendgrid/mail");
    // sgMail.setApiKey(Deno.env.get("SENDGRID_API_KEY"));
    // await sgMail.send({
    //   to,
    //   from: "your-verified-sender@example.com",
    //   subject,
    //   text: emailContent.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    //   html: emailContent,
    // });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email sent successfully",
        detail: "This is a simulated response. Connect to a real email service in production."
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Failed to send email" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
