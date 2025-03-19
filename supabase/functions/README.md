
# Community Trail Guide - Supabase Edge Functions

This folder contains the Edge Functions used by the Community Trail Guide application. These functions handle various backend operations like payments, email notifications, and more.

## Function Overview

1. **create-checkout:** Creates a Stripe checkout session for hike bookings
2. **retrieve-payment:** Retrieves payment details from Stripe
3. **send-email:** Sends email notifications to users, guides, and admins

## Setup Instructions

### 1. Stripe Integration

To set up Stripe integration:

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your API keys from the Stripe Dashboard
3. Add your Stripe secret key to Supabase secrets:
   ```
   supabase secrets set STRIPE_SECRET_KEY=sk_test_51R45dIERyjuxcD4Y0mCydIbFTryFHjJjrikFP8LwOm9bTXkrYqmxfF4wQqggPmtiEK7yWo8DBpRVxgzANDmTcWE000GV86v5z2
   ```

### 2. Email Notifications

The email function is set up as a mock implementation. To use a real email service:

1. Create an account with an email service like SendGrid, Resend, or AWS SES
2. Get your API key
3. Uncomment and modify the relevant code in `send-email/index.ts`
4. Add your email service API key to Supabase secrets

### 3. Storage Buckets

The project uses a Supabase storage bucket for storing e-waivers:

- `hiking-waivers`: For storing signed PDF waivers

## Deployment

Edge functions are automatically deployed when you deploy your Supabase project.

```
supabase functions deploy create-checkout
supabase functions deploy retrieve-payment
supabase functions deploy send-email
```

## Testing

You can test the functions locally using the Supabase CLI:

```
supabase functions serve
```

Then use a tool like `curl` or Postman to send requests to the local endpoints.
