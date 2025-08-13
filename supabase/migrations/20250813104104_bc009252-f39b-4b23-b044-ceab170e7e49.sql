-- Fix total_bid column issue and add new features
ALTER TABLE bids ALTER COLUMN total_bid SET DEFAULT 0;

-- Add message table for in-platform chat
CREATE TABLE public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL,
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create policies for messages
CREATE POLICY "Users can view messages they're part of" 
ON public.messages 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND (profiles.id = messages.sender_id OR profiles.id = messages.receiver_id)
  )
);

CREATE POLICY "Users can send messages" 
ON public.messages 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.id = messages.sender_id
  )
);

-- Add image metadata for geotagging
CREATE TABLE public.listing_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  latitude DECIMAL,
  longitude DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on listing_images
ALTER TABLE public.listing_images ENABLE ROW LEVEL SECURITY;

-- Create policies for listing images
CREATE POLICY "Anyone can view listing images" 
ON public.listing_images 
FOR SELECT 
USING (true);

CREATE POLICY "Fishermen can manage their listing images" 
ON public.listing_images 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM listings l
    JOIN profiles p ON p.id = l.fisherman_id
    WHERE l.id = listing_images.listing_id 
    AND p.user_id = auth.uid()
  )
);

-- Update orders table to include negotiated prices
ALTER TABLE orders ADD COLUMN negotiated_price DECIMAL DEFAULT NULL;
ALTER TABLE orders ADD COLUMN chat_summary TEXT DEFAULT NULL;