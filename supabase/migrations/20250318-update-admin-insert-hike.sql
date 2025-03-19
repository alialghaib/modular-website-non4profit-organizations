
-- Update the admin_insert_hike function to check both profiles table and auth.jwt() claims
CREATE OR REPLACE FUNCTION public.admin_insert_hike(hike_data json)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role text;
  jwt_role text;
BEGIN
  -- Get role from profiles table if exists
  SELECT role INTO user_role FROM public.profiles WHERE id = auth.uid();
  
  -- Also check the user metadata for role
  SELECT coalesce(auth.jwt() ->> 'role', auth.jwt() -> 'user_metadata' ->> 'role') INTO jwt_role;
  
  -- Check if the current user is an admin either from profiles or jwt claims
  IF user_role = 'admin' OR jwt_role = 'admin' THEN
    -- Insert the hike data
    INSERT INTO public.hikes (
      name,
      date,
      time,
      image,
      description,
      difficulty,
      location,
      duration,
      guide,
      price,
      available_spots,
      booked_spots,
      assigned_guide_id
    )
    VALUES (
      (hike_data->>'name')::text,
      (hike_data->>'date')::date,
      (hike_data->>'time')::text,
      (hike_data->>'image')::text,
      (hike_data->>'description')::text,
      (hike_data->>'difficulty')::text,
      (hike_data->>'location')::text,
      (hike_data->>'duration')::text,
      (hike_data->>'guide')::text,
      (hike_data->>'price')::numeric,
      (hike_data->>'available_spots')::smallint,
      (hike_data->>'booked_spots')::smallint,
      (hike_data->>'assigned_guide_id')::uuid
    );
  ELSE
    RAISE EXCEPTION 'Only admin users can insert hikes using this function. Found profile role: %, jwt role: %', user_role, jwt_role;
  END IF;
END;
$$;

-- Create a function to get a user's role from JWT to help with debugging
CREATE OR REPLACE FUNCTION public.get_jwt_role()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  role_value text;
BEGIN
  -- First try direct 'role' claim
  role_value := auth.jwt() ->> 'role';
  
  -- If not found, try in user_metadata
  IF role_value IS NULL THEN
    role_value := auth.jwt() -> 'user_metadata' ->> 'role';
  END IF;
  
  RETURN role_value;
END;
$$;
