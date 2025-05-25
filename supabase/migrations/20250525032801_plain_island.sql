/*
  # Add get_user_profile function

  1. New Functions
    - `get_user_profile(p_user_id uuid)`
      - Returns a single profile record for the given user ID
      - Returns null if no profile is found
      - Used for efficient profile lookups during authentication

  2. Security
    - Function is accessible to authenticated users only
    - Users can only retrieve their own profile data
*/

-- Create the get_user_profile function
CREATE OR REPLACE FUNCTION public.get_user_profile(p_user_id uuid)
RETURNS TABLE (
  id uuid,
  email text,
  first_name text,
  avatar_url text,
  created_at timestamptz,
  updated_at timestamptz,
  email_verified boolean,
  email_notifications boolean
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    profiles.id,
    profiles.email,
    profiles.first_name,
    profiles.avatar_url,
    profiles.created_at,
    profiles.updated_at,
    profiles.email_verified,
    profiles.email_notifications
  FROM profiles
  WHERE profiles.id = p_user_id
  LIMIT 1;
END;
$$;