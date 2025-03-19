
# Community Trail Guide - Setup Instructions

This document provides instructions for setting up and configuring the Community Trail Guide application.

## Prerequisites

- Node.js (v16 or later)
- npm or Yarn
- Supabase account
- Stripe account (for payments)
- Cal.com account (for scheduling)

## Project Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```

## Supabase Configuration

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your project URL and anon key

### 2. Run Migrations

Run the database migrations to set up the required tables and schemas:

```
supabase migration up
```

### 3. Configure Edge Functions

Deploy the edge functions to your Supabase project:

```
supabase functions deploy
```

### 4. Set Up Secrets

Add the required secrets to your Supabase project:

```
supabase secrets set STRIPE_SECRET_KEY=your_stripe_secret_key
```

## Stripe Integration

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your publishable key and secret key
3. Update `src/lib/stripe.ts` with your publishable key
4. Add your secret key to Supabase secrets as shown above

## Cal.com Integration

1. Create a Cal.com account at [cal.com](https://cal.com)
2. Set up your event types to match your hiking offerings
3. Update `src/components/CalBooking.tsx` with your Cal.com username
4. Generate an API key in your Cal.com dashboard:
   - Go to Cal.com dashboard → Settings → Developer → API Keys
   - Create a new API key with appropriate permissions
   - Add the API key to the `apiKey` parameter in the Cal component
5. Configure webhook callbacks to update your booking system:
   - Go to Cal.com dashboard → Webhooks
   - Add a new webhook with the URL of your backend endpoint
   - Select "Booking Created" as the event trigger
   - Use the data received to update your booking database

## E-Waiver System

The e-waiver system uses Supabase Storage to store signed PDF waivers:

1. Create a waiver template PDF
2. Place it in the `public` folder as `waiver-template.pdf`
3. The system will allow users to upload their signed waivers

## User Roles

The system supports three user roles:

1. **Hikers**: Can browse hikes, make bookings, and submit waivers
2. **Guides**: Can view their assigned hikes and participant information
3. **Admins**: Can manage hikes, guides, and view bookings

## Email Notifications

To enable email notifications:

1. Choose an email service provider (SendGrid, Resend, etc.)
2. Update the `send-email` edge function with your provider's integration code
3. Add your email API key to Supabase secrets

## Testing the Application

You can test the application with these demo accounts:

- Hiker: hiker@example.com / password
- Guide: guide@example.com / password
- Admin: admin@example.com / password

## Production Deployment

For production deployment:

1. Build the application:
   ```
   npm run build
   ```
2. Deploy to your preferred hosting service (Vercel, Netlify, etc.)
3. Update environment variables with production values
