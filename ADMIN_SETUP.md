# Admin Portal Setup Guide

## Current Issue
The site is experiencing an infinite recursion error with Row Level Security (RLS) policies. This prevents the homepage and admin portal from loading.

## Fix Steps

### Step 1: Reset RLS Policies
Run the script `007-complete-rls-reset.sql` to drop all existing policies and create simple, non-recursive ones.

**How to run:**
1. Click the "Run Script" button in v0, OR
2. Go to Supabase Dashboard > SQL Editor
3. Copy and paste the contents of `007-complete-rls-reset.sql`
4. Click "Run"

### Step 2: Find Your User ID
Before you can access the admin portal, you need to add yourself as an admin.

**To find your User ID:**
1. Log into your Globalnestimport account (sign up if you haven't)
2. Go to Supabase Dashboard > Authentication > Users
3. Find your email and copy the "UID" (User ID)
   - It looks like: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`

**OR run this SQL query:**
\`\`\`sql
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';
\`\`\`

### Step 3: Add Yourself as Admin
1. Open `scripts/008-add-admin-user.sql`
2. Replace `YOUR_USER_ID_HERE` with your actual User ID
3. Replace `your-email@example.com` with your email
4. Run the script

**Example:**
\`\`\`sql
INSERT INTO public.admins (user_id, email, created_at)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'john@example.com',
  NOW()
);
\`\`\`

### Step 4: Access Admin Portal
1. Make sure you're logged in
2. Navigate to: `https://your-site.com/admin`
3. You should now see the admin dashboard!

## Admin Portal Features

Once you're logged in as an admin, you can:

- **Dashboard** (`/admin`) - View statistics and recent orders
- **Orders** (`/admin/orders`) - Manage all customer orders and update status
- **Products** (`/admin/products`) - Add, edit, and delete products
- **Categories** (`/admin/categories`) - Manage product categories

## Troubleshooting

### "Access Denied" Message
- Make sure you've added your user ID to the admins table
- Verify you're logged in with the correct account
- Check that the user ID matches exactly (no extra spaces)

### Still Getting RLS Errors
- Ensure you ran `007-complete-rls-reset.sql` successfully
- Check Supabase logs for any errors during script execution
- Try refreshing the page after running the script

### Can't Find User ID
Run this query in Supabase SQL Editor:
\`\`\`sql
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC;
\`\`\`

This will show all users - find yours by email.

## Security Note

The new RLS policies are simplified:
- **Products & Categories**: Publicly readable, authenticated users can write
- **Admin verification**: Happens in the application layer (not RLS)
- **User data**: Protected by user_id checks (cart, orders, addresses)

This approach eliminates recursion while maintaining security through application-level admin checks on all admin pages.
