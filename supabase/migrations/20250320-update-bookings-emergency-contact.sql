
-- Add emergency contact fields to bookings table
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT DEFAULT NULL;

-- Update hikes table to include max participants per time slot
ALTER TABLE public.hikes
ADD COLUMN IF NOT EXISTS max_participants_per_time_slot SMALLINT DEFAULT 10;
