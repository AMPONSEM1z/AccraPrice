import { createServerClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, Circle, AlertCircle } from "lucide-react";

async function checkDatabaseSetup() {
  const supabase = await createServerClient();

  const checks = {
    products: false,
    categories: false,
    orders: false,
    cart_items: false,
    admins: false,
  };

  // Check each table
  for (const table of Object.keys(checks)) {
    try {
      const { error } = await supabase.from(table).select("id").limit(1);
      checks[table as keyof typeof checks] = !error;
    } catch {
      checks[table as keyof typeof checks] = false;
    }
  }

  return checks;
}

export default async function SetupPage() {
  const checks = await checkDatabaseSetup();
  const allTablesExist = Object.values(checks).every(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-balance">Database Setup</h1>
          <p className="text-muted-foreground text-lg">
            Follow these steps to initialize your AccraPrice database
          </p>
        </div>

        {allTablesExist ? (
          <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-900 dark:text-green-100">
              Database Ready!
            </AlertTitle>
            <AlertDescription className="text-green-800 dark:text-green-200">
              All database tables have been created successfully. Your
              e-commerce platform is ready to use.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-900 dark:text-amber-100">
              Setup Required
            </AlertTitle>
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              Your database needs to be initialized. Please run the SQL scripts
              below in order.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {checks.products && checks.categories ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
                Step 1: Create Database Tables
              </CardTitle>
              <CardDescription>
                Run the script to create all necessary tables (products,
                categories, orders, cart, etc.)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                scripts/001-create-tables.sql
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                This creates the core database structure for your e-commerce
                platform.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {allTablesExist ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
                Step 2: Enable Row Level Security
              </CardTitle>
              <CardDescription>
                Run the script to enable RLS policies for data protection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                scripts/002-enable-rls.sql
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                This ensures your data is secure with proper access controls.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {allTablesExist ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
                Step 3: Seed Sample Data
              </CardTitle>
              <CardDescription>
                Run the script to add sample categories and products
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                scripts/003-seed-data.sql
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                This adds sample data so you can see the platform in action
                immediately.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-primary">
          <CardHeader>
            <CardTitle>How to Run SQL Scripts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">
                Option 1: From v0 Interface (Recommended)
              </h3>
              <p className="text-sm text-muted-foreground">
                Look for the "Run Script" buttons in the setup checklist at the
                top of the page.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">
                Option 2: From Supabase Dashboard
              </h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Go to your Supabase project dashboard</li>
                <li>Navigate to the SQL Editor</li>
                <li>Copy and paste each script in order</li>
                <li>Click "Run" for each script</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {allTablesExist && (
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Your database is ready! You can now:
            </p>
            <div className="flex gap-4 justify-center">
              <a
                href="/"
                className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                View Homepage
              </a>
              <a
                href="/admin"
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
              >
                Go to Admin Dashboard
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
