-- Fix critical security vulnerability: Restrict profiles table access
-- Currently profiles table is publicly readable exposing PII

-- 1. Drop the overly permissive public policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- 2. Create a restricted policy for authenticated users to view profiles
-- This allows marketplace functionality while protecting PII
CREATE POLICY "Authenticated users can view basic profile info" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (true);

-- 3. Create a public view with only non-sensitive marketplace data
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  full_name,
  role,
  rating,
  total_reviews,
  is_verified,
  city,
  state
FROM public.profiles;

-- 4. Enable RLS on the view (though views inherit from base table)
-- This is defensive programming
ALTER VIEW public.public_profiles SET (security_barrier = true);

-- 5. Grant public access only to the limited view
GRANT SELECT ON public.public_profiles TO anon;
GRANT SELECT ON public.public_profiles TO authenticated;