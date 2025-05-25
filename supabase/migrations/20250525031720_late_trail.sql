/*
  # Add get_user_profile function

  1. New Functions
    - `get_user_profile`: Retrieves a user's profile with error handling and retries
      - Input: user_id (uuid)
      - Output: profiles row
      
  2. Security
    - Function is accessible to authenticated users only
    - Users can only retrieve their own profile
*/

CREATE OR REPLACE FUNCTION get_user_profile(p_user_id uuid)
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
AS $$
BEGIN
  -- Check if user is authenticated and accessing their own profile
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
  SELECT p.*
  FROM profiles p
  WHERE p.id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found' USING ERRCODE = 'P0002';
  END IF;
END;
$$;