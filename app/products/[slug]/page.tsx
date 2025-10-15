import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Star } from "lucide-react";
import { AddToCartButton } from "@/components/add-to-cart-button";

export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let cartItemCount = 0;
  if (user) {
    const { count } = await supabase
      .from("cart_items")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);
    cartItemCount = count || 0;
  }

  const { data: product } = await supabase
    .from("products")
    .select("*, categories(name)")
    .eq("slug", params.slug)
    .single();

  if (!product) {
    notFound();
  }

  const discount = product.compare_at_price
    ? Math.round(
        ((product.compare_at_price - product.price) /
          product.compare_at_price) *
          100
      )
    : 0;

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={user} cartItemCount={cartItemCount} />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                <Image
                  src={product.image_url || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
                {discount > 0 && (
                  <Badge className="absolute right-4 top-4 bg-destructive text-destructive-foreground">
                    -{discount}%
                  </Badge>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {product.is_featured && (
                <Badge className="bg-primary text-primary-foreground">
                  Featured
                </Badge>
              )}
              <div>
                <h1 className="text-3xl font-bold text-balance">
                  {product.name}
                </h1>
                {product.categories && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Category: {product.categories.name}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-primary">
                  ₵{product.price.toFixed(2)}
                </span>
                {product.compare_at_price && (
                  <span className="text-xl text-muted-foreground line-through">
                    ₵{product.compare_at_price.toFixed(2)}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 fill-primary text-primary"
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  (0 reviews)
                </span>
              </div>

              <Card className="p-4">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {product.description}
                </p>
              </Card>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Availability:</span>
                  <span
                    className={
                      product.stock_quantity > 0
                        ? "text-green-600"
                        : "text-destructive"
                    }
                  >
                    {product.stock_quantity > 0
                      ? `${product.stock_quantity} in stock`
                      : "Out of stock"}
                  </span>
                </div>
              </div>

              <AddToCartButton
                productId={product.id}
                disabled={product.stock_quantity === 0}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
