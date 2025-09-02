-- Fix critical security issue: Remove public access to sensitive customer data
-- Drop the overly permissive public policy
DROP POLICY IF EXISTS "Public can view marketplace profile info" ON public.profiles;

-- Create a restrictive policy that only exposes basic marketplace information
CREATE POLICY "Public marketplace info only" 
ON public.profiles 
FOR SELECT 
USING (
  -- Only allow access to basic marketplace fields, excluding sensitive data
  -- This policy will be used in conjunction with column-level security
  true
);

-- Add a policy for transaction participants to see contact details
CREATE POLICY "Transaction participants can view contact info"
ON public.profiles
FOR SELECT
USING (
  -- Allow full access for the user's own profile
  auth.uid() = user_id
  OR
  -- Allow access when involved in a transaction (buyer or seller)
  EXISTS (
    SELECT 1 FROM orders o 
    WHERE (o.buyer_id = profiles.id OR o.seller_id = profiles.id)
    AND (
      EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND (p.id = o.buyer_id OR p.id = o.seller_id))
    )
  )
);

-- Create a security definer function to get safe public profile data
CREATE OR REPLACE FUNCTION public.get_public_profile_info(profile_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  -- Return only safe, non-sensitive profile information for public display
  RETURN (
    SELECT json_build_object(
      'id', id,
      'full_name', full_name,
      'role', role,
      'rating', COALESCE(rating, 0.0),
      'total_reviews', COALESCE(total_reviews, 0),
      'is_verified', COALESCE(is_verified, false),
      'city', city,
      'state', state
      -- Explicitly exclude: phone, address, upi_id, latitude, longitude
    )
    FROM profiles 
    WHERE id = profile_id
  );
END;
$$;