
import { supabase } from './supabase';
import { User } from './types';

export enum EmailTemplate {
  BOOKING_CONFIRMATION = 'booking-confirmation',
  BOOKING_CANCELLATION = 'booking-cancellation',
  WAIVER_REMINDER = 'waiver-reminder',
  UPCOMING_HIKE_REMINDER = 'upcoming-hike-reminder',
  ADMIN_NEW_BOOKING = 'admin-new-booking',
  GUIDE_ASSIGNMENT = 'guide-assignment'
}

interface SendEmailOptions {
  to: string;
  subject: string;
  message?: string;
  templateId?: string;
  templateData?: Record<string, any>;
}

export const sendEmail = async (options: SendEmailOptions) => {
  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: options
    });

    if (error) {
      console.error('Email function error:', error);
      return { success: false, error: 'Failed to send email' };
    }

    return data;
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error: 'Failed to send email' };
  }
};

// Helper functions for specific email types
export const sendBookingConfirmation = async (user: User, hikeName: string, hikeDate: string, hikeTime: string, meetingPoint?: string) => {
  return sendEmail({
    to: user.email,
    subject: 'Your Hiking Trip Booking Confirmation',
    templateId: EmailTemplate.BOOKING_CONFIRMATION,
    templateData: {
      firstName: user.firstName,
      hikeName,
      hikeDate,
      hikeTime,
      meetingPoint: meetingPoint || 'To be announced'
    }
  });
};

export const sendBookingNotificationToAdmin = async (adminEmail: string, userEmail: string, hikeName: string, hikeDate: string, hikeTime: string, participants: number) => {
  return sendEmail({
    to: adminEmail,
    subject: 'New Hiking Trip Booking',
    templateId: EmailTemplate.ADMIN_NEW_BOOKING,
    templateData: {
      userEmail,
      hikeName,
      hikeDate,
      hikeTime,
      participants
    }
  });
};

export const sendWaiverReminder = async (user: User, hikeName: string, hikeDate: string, bookingReference: string) => {
  return sendEmail({
    to: user.email,
    subject: 'E-Waiver Reminder for Your Upcoming Hike',
    templateId: EmailTemplate.WAIVER_REMINDER,
    templateData: {
      firstName: user.firstName,
      hikeName,
      hikeDate,
      bookingReference
    }
  });
};

export const sendUpcomingHikeReminder = async (user: User, hikeName: string, hikeDate: string, hikeTime: string, meetingPoint: string) => {
  return sendEmail({
    to: user.email,
    subject: 'Reminder: Your Hiking Trip is Tomorrow',
    templateId: EmailTemplate.UPCOMING_HIKE_REMINDER,
    templateData: {
      firstName: user.firstName,
      hikeName,
      hikeDate,
      hikeTime,
      meetingPoint
    }
  });
};

export const sendGuideAssignment = async (guideEmail: string, hikeName: string, hikeDate: string, hikeTime: string, participantCount: number) => {
  return sendEmail({
    to: guideEmail,
    subject: 'You Have Been Assigned as a Guide',
    templateId: EmailTemplate.GUIDE_ASSIGNMENT,
    templateData: {
      hikeName,
      hikeDate,
      hikeTime,
      participantCount
    }
  });
};

export const sendBookingCancellation = async (user: User, hikeName: string, hikeDate: string, bookingReference: string) => {
  return sendEmail({
    to: user.email,
    subject: 'Your Hiking Trip Booking Has Been Cancelled',
    templateId: EmailTemplate.BOOKING_CANCELLATION,
    templateData: {
      firstName: user.firstName,
      hikeName,
      hikeDate,
      bookingReference
    }
  });
};
