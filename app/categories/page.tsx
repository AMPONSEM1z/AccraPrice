import { createServerClient } from "@/lib/supabase/server";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

async function getCategories() {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  if (error) {
    console.error(" Error fetching categories:", error);
    return { categories: [], error };
  }

  return { categories: data || [], error: null };
}

async function getUser() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

async function getCartCount(userId: string) {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("cart_items")
    .select("quantity")
    .eq("user_id", userId);

  return data?.reduce((sum, item) => sum + item.quantity, 0) || 0;
}

export default async function CategoriesPage() {
  const user = await getUser();
  const cartCount = user ? await getCartCount(user.id) : 0;
  const { categories, error } = await getCategories();

  const showSetupAlert = error?.code === "PGRST205";

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={user} cartItemCount={cartCount} />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-balance mb-4">
              Shop by Category
            </h1>
            <p className="text-muted-foreground text-lg">
              Browse our curated collection of premium imported products
            </p>
          </div>

          {showSetupAlert && (
            <Alert className="mb-8 border-amber-500 bg-amber-50 dark:bg-amber-950">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800 dark:text-amber-200">
                Database setup required. Please run the SQL scripts in order:
                001-create-tables.sql, 002-enable-rls.sql, 003-seed-data.sql.
                Visit{" "}
                <Link href="/setup" className="underline font-medium">
                  the setup page
                </Link>{" "}
                for detailed instructions.
              </AlertDescription>
            </Alert>
          )}

          {categories.length === 0 && !showSetupAlert ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No categories available yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/products?category=${category.slug}`}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-video relative bg-gradient-to-br from-primary/10 to-primary/5">
                      {category.image_url && (
                        <img
                          src={category.image_url || "/placeholder.svg"}
                          alt={category.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold mb-2">
                        {category.name}
                      </h3>
                      {category.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {category.description}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
