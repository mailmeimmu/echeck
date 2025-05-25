/*
  # Add get_user_profile function

  1. New Function
    - `get_user_profile(p_user_id uuid)`
      - Takes a user ID as input
      - Returns profile data for the specified user
      - Returns NULL if user not found

  2. Return Fields
    - All fields from profiles table
    - Additional fields from related tables if needed

  3. Security
    - Function is accessible to authenticated users
    - Users can only view their own profile data
*/

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
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.first_name,
    p.avatar_url,
    p.created_at,
    p.updated_at,
    p.email_verified,
    p.email_notifications
  FROM profiles p
  WHERE p.id = p_user_id
  AND (
    -- User can only view their own profile
    p_user_id = auth.uid() OR
    -- Or they are an admin
    EXISTS (
      SELECT 1 FROM admin_users a 
      WHERE a.id = auth.uid()
    )
  );
END;
$$;