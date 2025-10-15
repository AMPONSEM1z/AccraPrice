# Globalnestimport E-commerce Platform

A modern, full-stack e-commerce platform built with Next.js, Supabase, and Paystack.

## Features

- 🛍️ **Product Catalog**: Browse products with categories, search, and filtering
- 🛒 **Shopping Cart**: Add items, update quantities, and manage cart
- 💳 **Secure Checkout**: Integrated with Paystack for payments
- 👤 **User Authentication**: Email/password authentication with Supabase
- 📦 **Order Management**: Track orders and view order history
- 🔐 **Admin Dashboard**: Manage products, orders, and categories
- 📧 **Email Notifications**: Order confirmations and status updates
- 🎨 **Modern UI**: Teal and blue luxury theme with responsive design

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payments**: Paystack
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Supabase account
- Paystack account (for payments)

### Installation

1. Clone the repository
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Set up environment variables (already configured in v0):

   - Supabase credentials are automatically provided
   - Add your Paystack public key to `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`
   - Add your Paystack secret key to `PAYSTACK_SECRET_KEY`

4. Run the database migrations:

   - Execute the SQL scripts in the `scripts` folder in order
   - These will create tables, enable RLS, and seed sample data

5. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

## Database Schema

The application uses the following main tables:

- **users**: User profiles (extends Supabase auth.users)
- **products**: Product catalog with pricing and inventory
- **categories**: Product categories
- **cart_items**: Shopping cart items
- **orders**: Customer orders
- **order_items**: Individual items in orders
- **addresses**: Shipping addresses
- **reviews**: Product reviews

All tables have Row Level Security (RLS) enabled for data protection.

## Payment Integration

The application uses Paystack for payment processing:

1. Update the Paystack public key in `components/paystack-payment.tsx`
2. Implement payment verification in `app/api/verify-payment/route.ts`
3. Test with Paystack test keys before going live

## Email Notifications

Email notifications are configured in `lib/email.ts`. To enable:

1. Choose an email service (Resend, SendGrid, Mailgun, etc.)
2. Add your API key to environment variables
3. Uncomment and configure the email sending code
4. Customize email templates as needed

## Admin Access

Access the admin dashboard at `/admin` after logging in. The admin panel allows you to:

- View sales statistics and analytics
- Manage orders and update statuses
- Add, edit, and remove products
- Organize product categories

## Deployment

This application is ready to deploy on Vercel:

1. Click the "Publish" button in v0
2. Your Supabase credentials will be automatically configured
3. Add your Paystack keys to the Vercel environment variables
4. Deploy!

## Security Notes

- All database tables use Row Level Security (RLS)
- User authentication is handled by Supabase
- Payment processing is secured through Paystack
- Environment variables are used for sensitive data

## Support

---
