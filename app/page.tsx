import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { ArrowRight, Package, Shield, Truck, AlertCircle } from "lucide-react";

export default async function HomePage() {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get cart count if user is logged in
  let cartItemCount = 0;
  if (user) {
    const { count } = await supabase
      .from("cart_items")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);
    cartItemCount = count || 0;
  }

  // Get featured products
  const { data: featuredProducts, error: productsError } = await supabase
    .from("products")
    .select("*")
    .eq("is_featured", true)
    .eq("is_active", true)
    .limit(6);

  // Get categories
  const { data: categories, error: categoriesError } = await supabase
    .from("categories")
    .select("*")
    .limit(4);

  // Check if database tables don't exist
  const databaseNotSetup =
    productsError?.code === "PGRST205" || categoriesError?.code === "PGRST205";

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={user} cartItemCount={cartItemCount} />

      <main className="flex-1">
        {databaseNotSetup && (
          <div className="border-b border-border bg-muted/50 py-8">
            <div className="container mx-auto px-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Database Setup Required</AlertTitle>
                <AlertDescription>
                  The database tables haven&apos;t been created yet. Please run
                  the SQL scripts in the{" "}
                  <code className="rounded bg-muted px-1 py-0.5 text-sm">
                    scripts
                  </code>{" "}
                  folder to set up your database:
                  <ol className="mt-2 list-inside list-decimal space-y-1 text-sm">
                    <li>007-complete-rls-reset.sql (fixes RLS errors)</li>
                    <li>001-create-tables.sql</li>
                    <li>003-seed-data.sql</li>
                  </ol>
                </AlertDescription>
              </Alert>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <section className="relative min-h-[600px] overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src="/luxury-global-import-shipping-containers-modern-wa.jpg"
              alt="Global Import Background"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-background/80 to-secondary/90" />
          </div>

          <div className="relative z-10 flex min-h-[600px] items-center py-20">
            <div className="container mx-auto px-4">
              <div className="mx-auto max-w-3xl text-center">
                <Badge className="mb-4 border-white/20 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20">
                  Welcome to Accraprice
                </Badge>
                <h1 className="mb-6 text-4xl font-bold tracking-tight text-balance text-white sm:text-5xl md:text-6xl">
                  Bringing the World&apos;s Best to Your Doorstep
                </h1>
                <p className="mb-8 text-lg text-white/90 text-pretty">
                  Discover quality imported products at affordable prices. Shop
                  from our curated collection of premium items from around the
                  globe.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button
                    asChild
                    size="lg"
                    className="bg-white text-primary hover:bg-white/90"
                  >
                    <Link href="/products">
                      Shop Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
                  >
                    <Link href="/categories">Browse Categories</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
        </section>

        {/* Features Section */}
        <section className="border-y border-border bg-muted/30 py-12">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 md:grid-cols-3">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Truck className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Fast Shipping</h3>
                <p className="text-sm text-muted-foreground">
                  Quick and reliable delivery to your doorstep
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Secure Payment</h3>
                <p className="text-sm text-muted-foreground">
                  Safe and encrypted payment processing
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Quality Products</h3>
                <p className="text-sm text-muted-foreground">
                  Carefully curated items from trusted sources
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        {!databaseNotSetup && (
          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold">Featured Products</h2>
                  <p className="mt-2 text-muted-foreground">
                    Handpicked items just for you
                  </p>
                </div>
                <Button asChild variant="outline">
                  <Link href="/products">View All</Link>
                </Button>
              </div>
              {featuredProducts && featuredProducts.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {featuredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      id={product.id}
                      name={product.name}
                      slug={product.slug}
                      price={product.price}
                      compareAtPrice={product.compare_at_price}
                      imageUrl={product.image_url}
                      isFeatured={product.is_featured}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-border bg-muted/30 py-12 text-center">
                  <Package className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-muted-foreground">
                    No featured products yet. Check back soon!
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ✅ Fixed "Shop by Category" Section */}
        {!databaseNotSetup && categories && categories.length > 0 && (
          <section className="relative overflow-hidden py-16">
            <div className="absolute inset-0 z-0 opacity-5">
              <img
                src="/abstract-geometric-pattern-teal-blue.jpg"
                alt=""
                className="h-full w-full object-cover"
              />
            </div>

            <div className="container relative z-10 mx-auto px-4">
              <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold">Shop by Category</h2>
                <p className="mt-2 text-muted-foreground">
                  Explore our wide range of products
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/categories/${category.slug}`}
                    className="group relative overflow-hidden rounded-2xl border border-border bg-background/70 shadow-sm transition-all hover:shadow-lg hover:scale-[1.02]"
                  >
                    <div className="absolute inset-0 z-0">
                      <img
                        src={
                          category.image_url
                            ? category.image_url
                            : `/placeholder.jpg?text=${encodeURIComponent(
                                category.name
                              )}`
                        }
                        alt={category.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    </div>

                    <div className="relative z-10 p-6 flex flex-col justify-end h-full">
                      <h3 className="text-xl font-semibold text-white">
                        {category.name}
                      </h3>
                      <p className="mt-2 text-sm text-white/80 line-clamp-2">
                        {category.description}
                      </p>
                      <ArrowRight className="mt-4 h-5 w-5 text-white transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="relative overflow-hidden py-20">
          <div className="absolute inset-0 z-0">
            <img
              src="/premium-shopping-experience-luxury-retail.jpg"
              alt="Premium Shopping"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/95 to-secondary/95" />
          </div>

          <div className="container relative z-10 mx-auto px-4 text-center">
            <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
              Ready to Start Shopping?
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-white/90">
              Join thousands of satisfied customers who trust AccraPrice for
              quality imported products at unbeatable prices.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="bg-white text-primary hover:bg-white/90"
              >
                <Link href="/products">Explore Products</Link>
              </Button>
              {!user && (
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
                >
                  <Link href="/auth/sign-up">Create Account</Link>
                </Button>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
