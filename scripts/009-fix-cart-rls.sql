-- Fix cart_items RLS policies to allow inserts
-- The issue: FOR ALL with USING doesn't work for INSERT because the row doesn't exist yet

-- Drop the existing cart policy
DROP POLICY IF EXISTS "Users manage own cart" ON public.cart_items;

-- Create separate policies for different operations
-- SELECT: Users can view their own cart items
CREATE POLICY "Users view own cart" ON public.cart_items
  FOR SELECT USING (auth.uid() = user_id);

-- INSERT: Users can add items to their own cart
CREATE POLICY "Users insert own cart" ON public.cart_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can update their own cart items
CREATE POLICY "Users update own cart" ON public.cart_items
  FOR UPDATE USING (auth.uid() = user_id);

-- DELETE: Users can delete their own cart items
CREATE POLICY "Users delete own cart" ON public.cart_items
  FOR DELETE USING (auth.uid() = user_id);
