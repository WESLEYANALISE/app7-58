-- Fix critical security issue: Remove overly permissive RLS policy on user_profiles table
-- This prevents unauthorized access to personal information like usernames (emails) and full names

-- Drop the overly permissive policy that allows anyone to view all profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON public.user_profiles;