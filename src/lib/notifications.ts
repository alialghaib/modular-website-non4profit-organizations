
import { supabase } from "@/lib/supabase";
import { toast } from 'sonner';

// Notification types - used for storing preferences
export const NOTIFICATION_TYPES = {
  BOOKING_CONFIRMATION: 'booking_confirmed',
  BOOKING_CANCELLATION: 'booking_canceled',
  BOOKING_REMINDER: 'reminder',
  WAIVER_REMINDER: 'waiver_missing',
  GUIDE_ASSIGNED: 'guide_assigned',
};

// Gets the label for each notification type, used in UI
export const getNotificationTypeLabel = (type: string) => {
  switch (type) {
    case NOTIFICATION_TYPES.BOOKING_CONFIRMATION:
      return 'Booking Confirmations';
    case NOTIFICATION_TYPES.BOOKING_CANCELLATION:
      return 'Booking Cancellations';
    case NOTIFICATION_TYPES.BOOKING_REMINDER:
      return 'Hike Reminders';
    case NOTIFICATION_TYPES.WAIVER_REMINDER:
      return 'Waiver Reminders';
    case NOTIFICATION_TYPES.GUIDE_ASSIGNED:
      return 'Guide Assignments';
    default:
      return 'Unknown Notification Type';
  }
};

// Get all notification types as an array for display
export const getAllNotificationTypes = () => {
  return Object.values(NOTIFICATION_TYPES);
};

// Create a notification in the database
export const createNotification = async (
  userId: string,
  type: string,
  data: any
) => {
  try {
    const { error } = await supabase.from('notifications').insert({
      user_id: userId,
      type,
      data,
    });

    if (error) {
      console.error('Error creating notification:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error('Error creating notification:', error);
    return { success: false, error };
  }
};

// Get notification preferences for a user
export const getNotificationPreferences = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error getting notification preferences:', error);
      return { preferences: [], error };
    }

    return { preferences: data || [], error: null };
  } catch (error) {
    console.error('Error getting notification preferences:', error);
    return { preferences: [], error };
  }
};

// Ensure a user has all notification preferences set
export const ensureUserHasAllPreferences = async (userId: string) => {
  try {
    // Get current preferences
    const { preferences } = await getNotificationPreferences(userId);
    
    // Find which types are missing
    const existingTypes = preferences.map(pref => pref.type);
    const allTypes = getAllNotificationTypes();
    const missingTypes = allTypes.filter(type => !existingTypes.includes(type));
    
    // Create missing preferences with default values
    if (missingTypes.length > 0) {
      const newPreferences = missingTypes.map(type => ({
        user_id: userId,
        type,
        email_enabled: true,
        sms_enabled: false
      }));
      
      const { error } = await supabase
        .from('notification_preferences')
        .insert(newPreferences);
      
      if (error) {
        console.error('Error creating default preferences:', error);
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error ensuring notification preferences:', error);
    return { success: false, error };
  }
};

// Update notification preferences
export const updateNotificationPreference = async (
  userId: string,
  type: string,
  emailEnabled: boolean,
  smsEnabled: boolean
) => {
  try {
    // First check if preference exists
    const { data, error: fetchError } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .eq('type', type)
      .maybeSingle();
    
    if (fetchError) {
      console.error('Error checking preference:', fetchError);
      return { success: false, error: fetchError };
    }
    
    if (data) {
      // Update existing preference
      const { error } = await supabase
        .from('notification_preferences')
        .update({
          email_enabled: emailEnabled,
          sms_enabled: smsEnabled,
          updated_at: new Date().toISOString()
        })
        .eq('id', data.id);
      
      if (error) {
        console.error('Error updating preference:', error);
        return { success: false, error };
      }
    } else {
      // Create new preference
      const { error } = await supabase
        .from('notification_preferences')
        .insert({
          user_id: userId,
          type,
          email_enabled: emailEnabled,
          sms_enabled: smsEnabled
        });
      
      if (error) {
        console.error('Error creating preference:', error);
        return { success: false, error };
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error updating notification preference:', error);
    return { success: false, error };
  }
};

// Send notification based on user preferences
export const sendNotification = async (
  userId: string,
  type: string,
  data: any,
  emailSubject?: string,
  emailBody?: string,
  smsMessage?: string
) => {
  try {
    // Create notification record
    await createNotification(userId, type, data);
    
    // Get user preferences for this notification type
    const { data: prefData, error: prefError } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .eq('type', type)
      .maybeSingle();
    
    if (prefError) {
      console.error('Error fetching user preferences:', prefError);
      return { success: false, error: prefError };
    }
    
    // If no preferences found, use defaults (email: true, sms: false)
    const emailEnabled = prefData ? prefData.email_enabled : true;
    const smsEnabled = prefData ? prefData.sms_enabled : false;
    
    // Get user contact info
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('email, phone')
      .eq('id', userId)
      .single();
    
    if (userError || !userData) {
      console.error('Error fetching user contact info:', userError);
      return { success: false, error: userError };
    }
    
    const results = { email: null, sms: null };
    
    // Send email if enabled and we have valid content and address
    if (emailEnabled && emailSubject && emailBody && userData.email) {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: userData.email,
          subject: emailSubject,
          body: emailBody
        })
      });
      
      results.email = await response.json();
    }
    
    // Send SMS if enabled and we have valid content and phone number
    if (smsEnabled && smsMessage && userData.phone) {
      const response = await fetch('/api/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: userData.phone,
          message: smsMessage
        })
      });
      
      results.sms = await response.json();
    }
    
    return { success: true, results };
  } catch (error) {
    console.error('Error sending notification:', error);
    return { success: false, error };
  }
};

// Mark a notification as read
export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);
    
    if (error) {
      console.error('Error marking notification as read:', error);
      return { success: false, error };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { success: false, error };
  }
};

// Count unread notifications for a user
export const countUnreadNotifications = async (userId: string) => {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);
    
    if (error) {
      console.error('Error counting unread notifications:', error);
      return { count: 0, error };
    }
    
    return { count: count || 0, error: null };
  } catch (error) {
    console.error('Error counting unread notifications:', error);
    return { count: 0, error };
  }
};
