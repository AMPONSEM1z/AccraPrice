# Globalnestimport Setup Guide

Complete setup instructions for the Globalnestimport e-commerce platform.

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- A Supabase account (already connected in v0)
- A Paystack account for payment processing
- A Gmail account for sending emails

## 🚀 Quick Start

### 1. Environment Variables

The following environment variables are already configured in v0:

✅ **Supabase** (Auto-configured)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

⚠️ **Required: Add these manually**

**Paystack Configuration:**
1. Go to [Paystack Dashboard](https://dashboard.paystack.com/)
2. Navigate to Settings → API Keys & Webhooks
3. Copy your Public Key and Secret Key
4. Add to yr environment variables:
   - `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` = `pk_test_xxxxx` (or `pk_live_xxxxx` for production)
   - `PAYSTACK_SECRET_KEY` = `sk_test_xxxxx` (or `sk_live_xxxxx` for production)

**Email Configuration (Gmail SMTP):**
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account → Security → 2-Step Verification → App passwords
   - Select "Mail" and your device
   - Copy the 16-character password
3. Add to v0 environment variables:
   - `SMTP_HOST` = `smtp.gmail.com`
   - `SMTP_PORT` = `465`
   - `SMTP_USER` = `your.email@gmail.com`
   - `SMTP_PASS` = `your 16-character app password`

**Application URL:**
- `NEXT_PUBLIC_APP_URL` = Your deployment URL (e.g., `https://your-app.vercel.app`)
- For development: `http://localhost:3000`

### 2. Database Setup

Run the SQL scripts in order to set up your database:

1. **Create Tables** - Run `scripts/001-create-tables.sql`
   - Creates all necessary tables (users, products, categories, orders, etc.)

2. **Enable Row Level Security** - Run `scripts/002-enable-rls.sql`
   - Enables RLS policies to protect your data

3. **Seed Sample Data** - Run `scripts/003-seed-data.sql`
   - Adds sample categories and products to get started

**How to run scripts in v0:**
- Click the "Run" button next to each script file
- Scripts will execute directly in your Supabase database

### 3. Paystack Mobile Money Setup

To enable Mobile Money payments:

1. Log in to your Paystack Dashboard
2. Go to Settings → Payment Channels
3. Enable Mobile Money for Ghana:
   - MTN Mobile Money
   - Vodafone Cash
   - AirtelTigo Money
4. Complete the verification process
5. Test with Paystack test credentials before going live

**Test Mobile Money Numbers:**
- MTN: `0241234567`
- Vodafone: `0501234567`
- AirtelTigo: `0271234567`

### 4. Admin Access

To make a user an admin:

1. Sign up for an account on your site
2. Get your user ID from Supabase:
   - Go to Authentication → Users
   - Copy the user's UUID
3. Run this SQL in Supabase SQL Editor:
   \`\`\`sql
   INSERT INTO admins (user_id) VALUES ('your-user-uuid-here');
   \`\`\`
4. Access admin dashboard at `/admin`

## 🎨 Customization

### Update Brand Colors

Edit `app/globals.css` to change the teal/blue theme:

\`\`\`css
@theme inline {
  --color-primary: 14 116 144; /* Teal */
  --color-secondary: 8 145 178; /* Blue */
}
\`\`\`

### Add Products

1. Log in as an admin
2. Go to `/admin/products`
3. Click "Add Product"
4. Fill in product details:
   - Name, description, price
   - Upload image (or use placeholder)
   - Set status: "available" or "preorder"
   - Set stock quantity

### Configure Categories

1. Go to `/admin/categories`
2. Add, edit, or remove categories
3. Products will be organized by category

## 📧 Email Templates

Email templates are in `lib/email.ts`. Customize the HTML to match your brand:

- Order confirmation emails
- Payment receipts
- Shipping notifications

## 🔒 Security Checklist

Before going live:

- [ ] Replace Paystack test keys with live keys
- [ ] Enable Paystack live mode
- [ ] Set up proper Gmail App Password
- [ ] Review RLS policies in Supabase
- [ ] Test all payment flows
- [ ] Verify email delivery
- [ ] Set production `NEXT_PUBLIC_APP_URL`

## 🚢 Deployment

### Deploy to Vercel

1. Click "Publish" in v0
2. Your Supabase credentials are auto-configured
3. Add Paystack and email environment variables
4. Deploy!

### Post-Deployment

1. Update `NEXT_PUBLIC_APP_URL` with your live URL
2. Test the complete checkout flow
3. Verify email delivery
4. Test Mobile Money payments

## 📱 Mobile Money Testing

**Test Mode:**
- Use test API keys
- Use test phone numbers provided by Paystack
- No real money is charged

**Live Mode:**
- Switch to live API keys
- Real transactions will be processed
- Ensure you've completed Paystack verification

## 🆘 Troubleshooting

**Emails not sending:**
- Verify Gmail App Password is correct
- Check SMTP settings
- Ensure 2FA is enabled on Gmail

**Payments failing:**
- Verify Paystack keys are correct
- Check if Mobile Money is enabled in Paystack
- Test with Paystack test credentials first

**Database errors:**
- Ensure all SQL scripts ran successfully
- Check RLS policies are enabled
- Verify user authentication

## 📞 Support

For technical issues:
- Check the [Supabase Documentation](https://supabase.com/docs)
- Review [Paystack API Docs](https://paystack.com/docs)
- Contact Vercel support for deployment issues

---

**Ready to launch?** Follow this checklist and you'll be live in minutes! 🚀
