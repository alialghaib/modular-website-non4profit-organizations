
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.6';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Create a Supabase client with the service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Invoke the function for sending email
async function sendEmail(to: string, subject: string, body: string) {
  try {
    const emailProvider = Deno.env.get('EMAIL_PROVIDER') || 'none';
    
    if (emailProvider === 'none') {
      console.log(`[SIMULATION] Would send email to ${to} with subject '${subject}'`);
      return { success: true, provider: 'simulation' };
    }
    
    // For actual email sending, implement based on provider
    // You can use services like Resend, SendGrid, etc.
    
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

// Invoke the function for sending SMS
async function sendSMS(phone: string, message: string) {
  try {
    const smsProvider = Deno.env.get('SMS_PROVIDER') || 'none';
    
    if (smsProvider === 'none') {
      console.log(`[SIMULATION] Would send SMS to ${phone} with message: '${message}'`);
      return { success: true, provider: 'simulation' };
    }
    
    // For actual SMS sending, implement based on provider
    // You can use services like Twilio, etc.
    
    return { success: true };
  } catch (error) {
    console.error('Error sending SMS:', error);
    return { success: false, error };
  }
}

// Create a notification entry in the database
async function createNotification(userId: string, type: string, data: any) {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        data,
        read: false
      });
    
    if (error) {
      throw new Error(`Failed to create notification: ${error.message}`);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error creating notification:', error);
    return { success: false, error };
  }
}

// Send a notification based on user preferences
async function sendNotification(
  userId: string, 
  type: string, 
  data: any, 
  emailSubject?: string,
  emailBody?: string,
  smsMessage?: string
) {
  try {
    // Create notification record
    await createNotification(userId, type, data);
    
    // Get user preferences
    const { data: prefData, error: prefError } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .eq('type', type)
      .maybeSingle();
    
    if (prefError) {
      throw new Error(`Failed to get preferences: ${prefError.message}`);
    }
    
    // Default preferences if none exist
    const emailEnabled = prefData ? prefData.email_enabled : true;
    const smsEnabled = prefData ? prefData.sms_enabled : false;
    
    // Get user contact info
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('email, phone')
      .eq('id', userId)
      .single();
    
    if (userError) {
      throw new Error(`Failed to get user data: ${userError.message}`);
    }
    
    const results = { email: null, sms: null };
    
    // Send email if enabled and content available
    if (emailEnabled && emailSubject && emailBody && userData.email) {
      results.email = await sendEmail(userData.email, emailSubject, emailBody);
    }
    
    // Send SMS if enabled and content available
    if (smsEnabled && smsMessage && userData.phone) {
      results.sms = await sendSMS(userData.phone, smsMessage);
    }
    
    return { success: true, results };
  } catch (error) {
    console.error('Error sending notification:', error);
    return { success: false, error };
  }
}

// Process hike reminders
async function processHikeReminders() {
  try {
    // Get upcoming hikes in the next 3 days
    const now = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(now.getDate() + 3);
    
    // Format dates for Postgres
    const nowStr = now.toISOString();
    const futureDateStr = threeDaysFromNow.toISOString();
    
    // Get bookings for hikes in the next 3 days that need reminders
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        id, 
        hike_id, 
        user_id, 
        booking_date, 
        status, 
        customer_name, 
        customer_email,
        hikes:hike_id (name, location, time)
      `)
      .eq('status', 'confirmed')
      .gte('booking_date', nowStr)
      .lte('booking_date', futureDateStr);
    
    if (error) {
      throw new Error(`Failed to get bookings: ${error.message}`);
    }
    
    console.log(`Found ${bookings?.length || 0} upcoming bookings for reminders`);
    
    // Process each booking for reminders
    for (const booking of bookings || []) {
      const hike = booking.hikes;
      const userId = booking.user_id;
      
      if (!hike || !userId) continue;
      
      const bookingDate = new Date(booking.booking_date);
      const daysUntil = Math.ceil((bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      // Notification data
      const notificationData = {
        bookingId: booking.id,
        hikeName: hike.name,
        hikeLocation: hike.location,
        hikeTime: hike.time,
        bookingDate: booking.booking_date,
        daysUntil
      };
      
      // Email subject and body
      const emailSubject = `Reminder: Your hike to ${hike.name} is in ${daysUntil} days`;
      const emailBody = `
        <h2>Your hike is coming up soon!</h2>
        <p>Hello ${booking.customer_name},</p>
        <p>This is a friendly reminder that your hike to <strong>${hike.name}</strong> is scheduled in <strong>${daysUntil} days</strong>.</p>
        <p><strong>Date:</strong> ${new Date(booking.booking_date).toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${hike.time}</p>
        <p><strong>Location:</strong> ${hike.location}</p>
        <p>Please make sure you have appropriate gear and are prepared for the weather conditions.</p>
        <p>We look forward to seeing you soon!</p>
        <p>The Trail Guide Team</p>
      `;
      
      // SMS message
      const smsMessage = `Reminder: Your hike to ${hike.name} is in ${daysUntil} days. Date: ${new Date(booking.booking_date).toLocaleDateString()}, Time: ${hike.time}. The Trail Guide Team`;
      
      // Send the notification
      await sendNotification(
        userId,
        'reminder',
        notificationData,
        emailSubject,
        emailBody,
        smsMessage
      );
      
      console.log(`Sent reminder for booking ${booking.id} to user ${userId}`);
    }
    
    return { success: true, count: bookings?.length || 0 };
  } catch (error) {
    console.error('Error processing hike reminders:', error);
    return { success: false, error };
  }
}

// Process waiver reminders
async function processWaiverReminders() {
  try {
    // Get upcoming hikes in the next 7 days where waivers aren't signed
    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(now.getDate() + 7);
    
    // Format dates for Postgres
    const nowStr = now.toISOString();
    const futureDateStr = sevenDaysFromNow.toISOString();
    
    // Get bookings that need waiver reminders
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        id, 
        hike_id, 
        user_id, 
        booking_date, 
        status,
        e_waiver_signed,
        customer_name, 
        customer_email,
        hikes:hike_id (name, location, time)
      `)
      .eq('status', 'confirmed')
      .eq('e_waiver_signed', false)
      .gte('booking_date', nowStr)
      .lte('booking_date', futureDateStr);
    
    if (error) {
      throw new Error(`Failed to get bookings for waiver reminders: ${error.message}`);
    }
    
    console.log(`Found ${bookings?.length || 0} bookings needing waiver reminders`);
    
    // Process each booking for waiver reminders
    for (const booking of bookings || []) {
      const hike = booking.hikes;
      const userId = booking.user_id;
      
      if (!hike || !userId) continue;
      
      // Notification data
      const notificationData = {
        bookingId: booking.id,
        hikeName: hike.name,
        hikeLocation: hike.location,
        hikeTime: hike.time,
        bookingDate: booking.booking_date
      };
      
      // Email subject and body
      const emailSubject = `Action Required: E-Waiver needed for your ${hike.name} hike`;
      const emailBody = `
        <h2>E-Waiver Required</h2>
        <p>Hello ${booking.customer_name},</p>
        <p>We noticed that you haven't yet completed the required e-waiver for your upcoming hike to <strong>${hike.name}</strong> on <strong>${new Date(booking.booking_date).toLocaleDateString()}</strong>.</p>
        <p>For safety and insurance reasons, all participants must complete an e-waiver before the hike.</p>
        <p><a href="${supabaseUrl}/hike/${booking.hike_id}?booking=${booking.id}#waiver">Click here to complete your e-waiver</a></p>
        <p>Thank you for your cooperation!</p>
        <p>The Trail Guide Team</p>
      `;
      
      // SMS message
      const smsMessage = `Action Required: Please complete the e-waiver for your hike to ${hike.name} on ${new Date(booking.booking_date).toLocaleDateString()}. Visit the booking page to complete. The Trail Guide Team`;
      
      // Send the notification
      await sendNotification(
        userId,
        'waiver_missing',
        notificationData,
        emailSubject,
        emailBody,
        smsMessage
      );
      
      console.log(`Sent waiver reminder for booking ${booking.id} to user ${userId}`);
    }
    
    return { success: true, count: bookings?.length || 0 };
  } catch (error) {
    console.error('Error processing waiver reminders:', error);
    return { success: false, error };
  }
}

// Main handler function
Deno.serve(async (req) => {
  try {
    // Check for Authorization header with service role key
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.split(' ')[1] !== supabaseServiceKey) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    // Process notifications
    const results = {
      hikeReminders: await processHikeReminders(),
      waiverReminders: await processWaiverReminders()
    };
    
    console.log('Scheduled notifications processed:', results);
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Scheduled notifications processed',
      results 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in scheduled-notifications function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
