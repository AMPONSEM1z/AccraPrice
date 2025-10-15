import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Package } from "lucide-react"

export default async function ProductsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let cartItemCount = 0
  if (user) {
    const { count } = await supabase
      .from("cart_items")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
    cartItemCount = count || 0
  }

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  const databaseNotSetup = productsError?.code === "PGRST205"

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={user} cartItemCount={cartItemCount} />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold">All Products</h1>
            <p className="mt-2 text-muted-foreground">Browse our complete collection</p>
          </div>

          {databaseNotSetup ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Database Setup Required</AlertTitle>
              <AlertDescription>
                The database tables haven&apos;t been created yet. Please run the SQL scripts in the{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-sm">scripts</code> folder to set up your database:
                <ol className="mt-2 list-inside list-decimal space-y-1 text-sm">
                  <li>001-create-tables.sql</li>
                  <li>002-enable-rls.sql</li>
                  <li>003-seed-data.sql</li>
                </ol>
              </AlertDescription>
            </Alert>
          ) : products && products.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
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
              <p className="mt-4 text-muted-foreground">No products found. Check back soon!</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
