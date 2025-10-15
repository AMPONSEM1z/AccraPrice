-- Insert sample categories
INSERT INTO public.categories (name, slug, description, image_url) VALUES
  ('Electronics', 'electronics', 'Latest gadgets and electronic devices', '/placeholder.svg?height=400&width=600'),
  ('Fashion', 'fashion', 'Trendy clothing and accessories', '/placeholder.svg?height=400&width=600'),
  ('Home & Living', 'home-living', 'Quality home decor and furniture', '/placeholder.svg?height=400&width=600'),
  ('Beauty & Health', 'beauty-health', 'Premium beauty and wellness products', '/placeholder.svg?height=400&width=600'),
  ('Sports & Outdoors', 'sports-outdoors', 'Gear for active lifestyles', '/placeholder.svg?height=400&width=600')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample products
INSERT INTO public.products (name, slug, description, price, compare_at_price, category_id, image_url, images, stock_quantity, status, is_featured, is_active) 
SELECT 
  'Wireless Noise-Cancelling Headphones',
  'wireless-headphones',
  'Premium wireless headphones with active noise cancellation, 30-hour battery life, and superior sound quality.',
  89.99,
  129.99,
  id,
  '/placeholder.svg?height=600&width=600',
  ARRAY['/placeholder.svg?height=600&width=600', '/placeholder.svg?height=600&width=600'],
  50,
  'available',
  true,
  true
FROM public.categories WHERE slug = 'electronics'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (name, slug, description, price, compare_at_price, category_id, image_url, images, stock_quantity, status, is_featured, is_active)
SELECT 
  'Smart Watch Pro',
  'smart-watch-pro',
  'Advanced fitness tracking, heart rate monitoring, GPS, and smartphone notifications in a sleek design.',
  199.99,
  299.99,
  id,
  '/placeholder.svg?height=600&width=600',
  ARRAY['/placeholder.svg?height=600&width=600', '/placeholder.svg?height=600&width=600'],
  30,
  'available',
  true,
  true
FROM public.categories WHERE slug = 'electronics'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (name, slug, description, price, category_id, image_url, images, stock_quantity, status, is_featured, is_active)
SELECT 
  'Premium Leather Jacket',
  'premium-leather-jacket',
  'Genuine leather jacket with modern cut, perfect for any season. Available in multiple sizes.',
  249.99,
  id,
  '/placeholder.svg?height=600&width=600',
  ARRAY['/placeholder.svg?height=600&width=600', '/placeholder.svg?height=600&width=600'],
  25,
  'available',
  true,
  true
FROM public.categories WHERE slug = 'fashion'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (name, slug, description, price, compare_at_price, category_id, image_url, images, stock_quantity, status, is_active)
SELECT 
  'Designer Sunglasses',
  'designer-sunglasses',
  'UV protection sunglasses with polarized lenses and premium frame construction.',
  79.99,
  120.00,
  id,
  '/placeholder.svg?height=600&width=600',
  ARRAY['/placeholder.svg?height=600&width=600'],
  40,
  'available',
  false,
  true
FROM public.categories WHERE slug = 'fashion'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (name, slug, description, price, category_id, image_url, images, stock_quantity, status, is_featured, is_active)
SELECT 
  'Modern Table Lamp',
  'modern-table-lamp',
  'Elegant LED table lamp with adjustable brightness and contemporary design.',
  45.99,
  id,
  '/placeholder.svg?height=600&width=600',
  ARRAY['/placeholder.svg?height=600&width=600'],
  60,
  'available',
  false,
  true
FROM public.categories WHERE slug = 'home-living'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (name, slug, description, price, compare_at_price, category_id, image_url, images, stock_quantity, status, is_active)
SELECT 
  'Luxury Skincare Set',
  'luxury-skincare-set',
  'Complete skincare routine with cleanser, toner, serum, and moisturizer. Suitable for all skin types.',
  129.99,
  180.00,
  id,
  '/placeholder.svg?height=600&width=600',
  ARRAY['/placeholder.svg?height=600&width=600', '/placeholder.svg?height=600&width=600'],
  35,
  'available',
  false,
  true
FROM public.categories WHERE slug = 'beauty-health'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (name, slug, description, price, category_id, image_url, images, stock_quantity, status, is_featured, is_active)
SELECT 
  'Yoga Mat Premium',
  'yoga-mat-premium',
  'Non-slip yoga mat with extra cushioning, eco-friendly materials, and carrying strap included.',
  39.99,
  id,
  '/placeholder.svg?height=600&width=600',
  ARRAY['/placeholder.svg?height=600&width=600'],
  45,
  'available',
  false,
  true
FROM public.categories WHERE slug = 'sports-outdoors'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (name, slug, description, price, compare_at_price, category_id, image_url, images, stock_quantity, status, is_active)
SELECT 
  'Portable Bluetooth Speaker',
  'bluetooth-speaker',
  'Waterproof portable speaker with 360° sound, 12-hour battery, and deep bass.',
  59.99,
  89.99,
  id,
  '/placeholder.svg?height=600&width=600',
  ARRAY['/placeholder.svg?height=600&width=600'],
  55,
  'available',
  false,
  true
FROM public.categories WHERE slug = 'electronics'
ON CONFLICT (slug) DO NOTHING;

-- Add a preorder product example
INSERT INTO public.products (name, slug, description, price, category_id, image_url, images, stock_quantity, status, is_featured, is_active)
SELECT 
  'Next-Gen Gaming Console',
  'gaming-console-preorder',
  'Pre-order the latest gaming console with 4K graphics and lightning-fast load times. Ships in 2 weeks.',
  499.99,
  id,
  '/placeholder.svg?height=600&width=600',
  ARRAY['/placeholder.svg?height=600&width=600'],
  0,
  'preorder',
  true,
  true
FROM public.categories WHERE slug = 'electronics'
ON CONFLICT (slug) DO NOTHING;
