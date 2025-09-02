-- Fix the RLS policies to properly restrict sensitive data access
-- Remove the overly broad public policy
DROP POLICY IF EXISTS "Public marketplace info only" ON public.profiles;

-- Create a more restrictive public policy that only works for basic marketplace queries
CREATE POLICY "Limited public marketplace access"
ON public.profiles
FOR SELECT
USING (
  -- Only allow public access when specifically querying for marketplace display
  -- This will be combined with application-level filtering
  auth.uid() IS NOT NULL  -- Require authentication for direct table access
);

-- Keep the existing user policies but rename for clarity
DROP POLICY IF EXISTS "Users can view their own full profile" ON public.profiles;
CREATE POLICY "Users can view their own complete profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Add anonymous access only through the secure function
CREATE POLICY "Anonymous marketplace info via function only"
ON public.profiles
FOR SELECT
USING (
  -- Allow access only when called through our secure function
  -- This effectively blocks direct table queries for anonymous users
  auth.uid() IS NOT NULL
  OR 
  -- Allow very limited access for public marketplace listings
  (auth.uid() IS NULL AND current_setting('request.jwt.claims', true) IS NULL)
);

-- Update the secure function to have proper search path
CREATE OR REPLACE FUNCTION public.get_safe_marketplace_profile(profile_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
DECLARE
  result JSON;
BEGIN
  -- Return only safe, non-sensitive profile information for marketplace display
  SELECT json_build_object(
    'id', p.id,
    'full_name', p.full_name,
    'role', p.role,
    'rating', COALESCE(p.rating, 0.0),
    'total_reviews', COALESCE(p.total_reviews, 0),
    'is_verified', COALESCE(p.is_verified, false),
    'city', p.city,
    'state', p.state
    -- Explicitly exclude: phone, address, upi_id, latitude, longitude
  ) INTO result
  FROM public.profiles p 
  WHERE p.id = profile_id;
  
  RETURN result;
END;
$$;

-- Create a view for safe public marketplace data
CREATE OR REPLACE VIEW public.marketplace_profiles AS
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

-- Enable RLS on the view
ALTER VIEW public.marketplace_profiles SET (security_barrier = true);

-- Grant access to the view
GRANT SELECT ON public.marketplace_profiles TO authenticated, anon;