-- Add UPI ID to profiles table
ALTER TABLE public.profiles 
ADD COLUMN upi_id TEXT;

-- Add delivery and location fields to orders table
ALTER TABLE public.orders 
ADD COLUMN delivery_otp TEXT,
ADD COLUMN delivery_status TEXT DEFAULT 'pending',
ADD COLUMN fisherman_latitude NUMERIC,
ADD COLUMN fisherman_longitude NUMERIC,
ADD COLUMN buyer_latitude NUMERIC,
ADD COLUMN buyer_longitude NUMERIC,
ADD COLUMN estimated_delivery_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN tracking_enabled BOOLEAN DEFAULT false,
ADD COLUMN delivery_completed_at TIMESTAMP WITH TIME ZONE;

-- Add location fields to profiles for default locations
ALTER TABLE public.profiles
ADD COLUMN latitude NUMERIC,
ADD COLUMN longitude NUMERIC;

-- Create function to generate random OTP
CREATE OR REPLACE FUNCTION generate_delivery_otp()
RETURNS TEXT AS $$
BEGIN
  RETURN LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;