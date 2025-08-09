-- Create user roles enum
CREATE TYPE public.user_role AS ENUM ('fisherman', 'supplier', 'hotel', 'market', 'admin');

-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  role user_role NOT NULL DEFAULT 'supplier',
  rating DECIMAL(2,1) DEFAULT 0.0,
  total_reviews INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create fish types table for standardized fish categories
CREATE TABLE public.fish_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create listings table for fish catch postings
CREATE TABLE public.listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fisherman_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  fish_type_id UUID NOT NULL REFERENCES public.fish_types(id),
  title TEXT NOT NULL,
  description TEXT,
  weight_kg DECIMAL(8,2) NOT NULL,
  price_per_kg DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) GENERATED ALWAYS AS (weight_kg * price_per_kg) STORED,
  catch_date DATE NOT NULL,
  location TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'sold', 'reserved', 'expired')),
  image_url TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bids table
CREATE TABLE public.bids (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  bidder_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  bid_amount DECIMAL(10,2) NOT NULL,
  quantity_kg DECIMAL(8,2) NOT NULL,
  total_bid DECIMAL(10,2) GENERATED ALWAYS AS (bid_amount * quantity_kg) STORED,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL REFERENCES public.listings(id),
  buyer_id UUID NOT NULL REFERENCES public.profiles(id),
  seller_id UUID NOT NULL REFERENCES public.profiles(id),
  quantity_kg DECIMAL(8,2) NOT NULL,
  price_per_kg DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  delivery_address TEXT NOT NULL,
  delivery_date DATE,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id),
  reviewed_id UUID NOT NULL REFERENCES public.profiles(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create price history table for market analytics
CREATE TABLE public.price_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fish_type_id UUID NOT NULL REFERENCES public.fish_types(id),
  avg_price DECIMAL(10,2) NOT NULL,
  min_price DECIMAL(10,2) NOT NULL,
  max_price DECIMAL(10,2) NOT NULL,
  total_volume_kg DECIMAL(12,2) NOT NULL,
  date DATE NOT NULL,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(fish_type_id, date, location)
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fish_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for fish_types (public read access)
CREATE POLICY "Anyone can view fish types" ON public.fish_types FOR SELECT USING (true);

-- Create RLS policies for listings
CREATE POLICY "Anyone can view available listings" ON public.listings FOR SELECT USING (true);
CREATE POLICY "Fishermen can create their own listings" ON public.listings FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = fisherman_id AND user_id = auth.uid() AND role = 'fisherman')
);
CREATE POLICY "Fishermen can update their own listings" ON public.listings FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = fisherman_id AND user_id = auth.uid())
);
CREATE POLICY "Fishermen can delete their own listings" ON public.listings FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = fisherman_id AND user_id = auth.uid())
);

-- Create RLS policies for bids
CREATE POLICY "Users can view bids on their listings or bids they made" ON public.bids FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    JOIN public.listings l ON l.fisherman_id = p.id 
    WHERE l.id = listing_id AND p.user_id = auth.uid()
  ) OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = bidder_id AND user_id = auth.uid())
);
CREATE POLICY "Authenticated users can create bids" ON public.bids FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = bidder_id AND user_id = auth.uid())
);
CREATE POLICY "Users can update their own bids" ON public.bids FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = bidder_id AND user_id = auth.uid())
);

-- Create RLS policies for orders
CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = buyer_id AND user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = seller_id AND user_id = auth.uid())
);
CREATE POLICY "Authenticated users can create orders" ON public.orders FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = buyer_id AND user_id = auth.uid())
);
CREATE POLICY "Order participants can update orders" ON public.orders FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = buyer_id AND user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = seller_id AND user_id = auth.uid())
);

-- Create RLS policies for reviews
CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews for their orders" ON public.reviews FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders o 
    JOIN public.profiles p ON p.id = o.buyer_id OR p.id = o.seller_id
    WHERE o.id = order_id AND p.user_id = auth.uid() AND p.id = reviewer_id
  )
);

-- Create RLS policies for price_history (read-only for users)
CREATE POLICY "Anyone can view price history" ON public.price_history FOR SELECT USING (true);

-- Insert sample fish types
INSERT INTO public.fish_types (name, category, description) VALUES
('Pomfret', 'Marine', 'Popular white fish with delicate flavor'),
('Kingfish', 'Marine', 'Firm textured fish, excellent for curry'),
('Mackerel', 'Marine', 'Oily fish rich in omega-3'),
('Sardine', 'Marine', 'Small silvery fish, usually sold fresh'),
('Prawns', 'Shellfish', 'Popular crustacean, various sizes available'),
('Crab', 'Shellfish', 'Fresh water and sea water varieties'),
('Rohu', 'Freshwater', 'Popular river fish in India'),
('Catla', 'Freshwater', 'Large freshwater fish'),
('Hilsa', 'Marine', 'Prized fish especially in Bengal'),
('Tuna', 'Marine', 'Large ocean fish, excellent for steaks');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON public.listings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bids_updated_at BEFORE UPDATE ON public.bids FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'supplier')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_listings_fisherman_id ON public.listings(fisherman_id);
CREATE INDEX idx_listings_status ON public.listings(status);
CREATE INDEX idx_listings_fish_type ON public.listings(fish_type_id);
CREATE INDEX idx_bids_listing_id ON public.bids(listing_id);
CREATE INDEX idx_bids_bidder_id ON public.bids(bidder_id);
CREATE INDEX idx_orders_buyer_id ON public.orders(buyer_id);
CREATE INDEX idx_orders_seller_id ON public.orders(seller_id);
CREATE INDEX idx_reviews_order_id ON public.reviews(order_id);
CREATE INDEX idx_price_history_date_fish ON public.price_history(date, fish_type_id);