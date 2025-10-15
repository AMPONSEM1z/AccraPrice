import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { redirect } from "next/navigation";
import { CartItems } from "@/components/cart-items";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export default async function CartPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/cart");
  }

  const { data: cartItems } = await supabase
    .from("cart_items")
    .select("*, products(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const { count: cartItemCount } = await supabase
    .from("cart_items")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const subtotal =
    cartItems?.reduce(
      (sum, item) => sum + item.products.price * item.quantity,
      0
    ) || 0;
  const shipping = subtotal > 0 ? 0 : 0;
  const total = subtotal + shipping;

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={user} cartItemCount={cartItemCount || 0} />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <h1 className="mb-8 text-3xl font-bold">Shopping Cart</h1>

          {!cartItems || cartItems.length === 0 ? (
            <Card className="py-12">
              <CardContent className="flex flex-col items-center justify-center text-center">
                <ShoppingBag className="mb-4 h-16 w-16 text-muted-foreground" />
                <h2 className="mb-2 text-2xl font-semibold">
                  Your cart is empty
                </h2>
                <p className="mb-6 text-muted-foreground">
                  Add some products to get started
                </p>
                <Button asChild>
                  <Link href="/products">Continue Shopping</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <CartItems items={cartItems} />
              </div>

              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">
                        ₵{subtotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Delivery</span>
                      <span className="font-medium">
                        ₵{shipping.toFixed(2)}
                      </span>
                    </div>
                    <div className="border-t border-border pt-4">
                      <div className="flex justify-between">
                        <span className="text-lg font-semibold">Total</span>
                        <span className="text-lg font-bold text-primary">
                          ₵{total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <Button asChild className="w-full" size="lg">
                      <Link href="/checkout">Proceed to Checkout</Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="w-full bg-transparent"
                    >
                      <Link href="/products">Continue Shopping</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
