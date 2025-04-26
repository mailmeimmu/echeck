/*
  # Add profile creation policy

  1. Security Changes
    - Add INSERT policy for profiles table to allow authenticated users to create their own profile
    - Policy ensures users can only create a profile with their own auth ID
    
  Note: This fixes the RLS violation error during profile creation
*/

CREATE POLICY "Users can create their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);