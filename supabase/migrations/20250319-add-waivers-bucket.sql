
-- Create the hiking-waivers storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('hiking-waivers', 'hiking-waivers', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the hiking-waivers bucket
CREATE POLICY "Allow authenticated users to view waivers"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'hiking-waivers');

CREATE POLICY "Allow authenticated users to upload waivers"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'hiking-waivers');

-- Create bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hike_id UUID REFERENCES public.hikes(id),
  user_id UUID REFERENCES auth.users(id),
  booking_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  participants INTEGER DEFAULT 1,
  payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  payment_id TEXT,
  e_waiver_signed BOOLEAN DEFAULT FALSE,
  e_waiver_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Set up RLS for bookings table
ALTER TABLE IF EXISTS public.bookings ENABLE ROW LEVEL SECURITY;

-- Hikers can view and create their own bookings
CREATE POLICY "Hikers can view their own bookings"
ON public.bookings FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR 
      (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'guide'));

CREATE POLICY "Hikers can create their own bookings"
ON public.bookings FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Hikers can update their own bookings"
ON public.bookings FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());
