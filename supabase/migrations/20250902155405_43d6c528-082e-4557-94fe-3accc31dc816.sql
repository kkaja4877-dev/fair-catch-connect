-- Fix the security definer view issue
DROP VIEW IF EXISTS public.marketplace_profiles;

-- Create a regular view without security_barrier
CREATE VIEW public.marketplace_profiles AS
SELECT 
  id,
  full_name,
  role,
  COALESCE(rating, 0.0) as rating,
  COALESCE(total_reviews, 0) as total_reviews,
  COALESCE(is_verified, false) as is_verified,
  city,
  state
FROM public.profiles;

-- Fix the function search path issue by dropping and recreating
DROP FUNCTION IF EXISTS public.get_public_profile_info(UUID);

-- Update the secure function with proper search path
CREATE OR REPLACE FUNCTION public.get_safe_marketplace_profile(profile_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = 'public'
AS $$
DECLARE
  result JSON;
BEGIN
  -- Return only safe, non-sensitive profile information for marketplace display
  SELECT json_build_object(
    'id', profiles.id,
    'full_name', profiles.full_name,
    'role', profiles.role,
    'rating', COALESCE(profiles.rating, 0.0),
    'total_reviews', COALESCE(profiles.total_reviews, 0),
    'is_verified', COALESCE(profiles.is_verified, false),
    'city', profiles.city,
    'state', profiles.state
    -- Explicitly exclude: phone, address, upi_id, latitude, longitude
  ) INTO result
  FROM profiles 
  WHERE profiles.id = profile_id;
  
  RETURN result;
END;
$$;

-- Simplify RLS policies to be more secure and clear
DROP POLICY IF EXISTS "Limited public marketplace access" ON public.profiles;
DROP POLICY IF EXISTS "Anonymous marketplace info via function only" ON public.profiles;

-- Only allow authenticated users to access profiles directly
CREATE POLICY "Authenticated users only"
ON public.profiles
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Grant appropriate permissions
GRANT SELECT ON public.marketplace_profiles TO authenticated, anon;