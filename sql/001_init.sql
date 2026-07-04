-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    store_name TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create customers table
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    address_or_purok TEXT NOT NULL,
    created_by_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on customers.full_name
CREATE INDEX IF NOT EXISTS idx_customers_full_name ON public.customers(full_name);

-- Create ledgers table
CREATE TABLE IF NOT EXISTS public.ledgers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    store_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    current_credit NUMERIC NOT NULL DEFAULT 0,
    last_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(customer_id, store_id)
);

-- Create a trigger to automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, store_name, owner_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'store_name', 'Default Store'),
    COALESCE(NEW.raw_user_meta_data->>'owner_name', 'Default Owner')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Trigger the function every time a user is created
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ledgers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
-- Any authenticated user can read all profiles
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
CREATE POLICY "Profiles are viewable by authenticated users"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Only the owner can insert their own profile
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Only the owner can update their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- RLS Policies for customers
-- Any authenticated user can read all customers
DROP POLICY IF EXISTS "Customers are viewable by authenticated users" ON public.customers;
CREATE POLICY "Customers are viewable by authenticated users"
ON public.customers
FOR SELECT
TO authenticated
USING (true);

-- Only authenticated users can insert customers
DROP POLICY IF EXISTS "Authenticated users can insert customers" ON public.customers;
CREATE POLICY "Authenticated users can insert customers"
ON public.customers
FOR INSERT
TO authenticated
WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update and delete customers too (optional, but useful)
DROP POLICY IF EXISTS "Authenticated users can update customers" ON public.customers;
CREATE POLICY "Authenticated users can update customers"
ON public.customers
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can delete customers" ON public.customers;
CREATE POLICY "Authenticated users can delete customers"
ON public.customers
FOR DELETE
TO authenticated
USING (true);

-- RLS Policies for ledgers
-- Any authenticated user can read all ledgers
DROP POLICY IF EXISTS "Ledgers are viewable by authenticated users" ON public.ledgers;
CREATE POLICY "Ledgers are viewable by authenticated users"
ON public.ledgers
FOR SELECT
TO authenticated
USING (true);

-- Only store owner can insert their own ledgers
DROP POLICY IF EXISTS "Store owners can insert their own ledgers" ON public.ledgers;
CREATE POLICY "Store owners can insert their own ledgers"
ON public.ledgers
FOR INSERT
TO authenticated
WITH CHECK (store_id = auth.uid());

-- Only store owner can update their own ledgers
DROP POLICY IF EXISTS "Store owners can update their own ledgers" ON public.ledgers;
CREATE POLICY "Store owners can update their own ledgers"
ON public.ledgers
FOR UPDATE
TO authenticated
USING (store_id = auth.uid())
WITH CHECK (store_id = auth.uid());

-- Only store owner can delete their own ledgers
DROP POLICY IF EXISTS "Store owners can delete their own ledgers" ON public.ledgers;
CREATE POLICY "Store owners can delete their own ledgers"
ON public.ledgers
FOR DELETE
TO authenticated
USING (store_id = auth.uid());
