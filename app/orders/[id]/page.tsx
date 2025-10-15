import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import Image from "next/image";

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { payment?: string };
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: order } = await supabase
    .from("orders")
    .select("*, addresses(*)")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (!order) {
    redirect("/account/orders");
  }

  const { data: orderItems } = await supabase
    .from("order_items")
    .select("*, products(*)")
    .eq("order_id", order.id);

  const { count: cartItemCount } = await supabase
    .from("cart_items")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const paymentSuccess = searchParams.payment === "success";

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={user} cartItemCount={cartItemCount || 0} />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="mx-auto max-w-4xl">
            {paymentSuccess && (
              <Card className="mb-6 border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
                <CardContent className="flex items-center gap-4 p-6">
                  <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
                  <div>
                    <h2 className="text-xl font-bold text-green-900 dark:text-green-100">
                      Payment Successful!
                    </h2>
                    <p className="text-green-700 dark:text-green-300">
                      Your order has been confirmed and is being processed.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Order Details</h1>
                <p className="mt-1 text-muted-foreground">
                  Order #{order.order_number}
                </p>
              </div>
              <Badge
                variant={
                  order.payment_status === "paid"
                    ? "default"
                    : order.payment_status === "failed"
                    ? "destructive"
                    : "secondary"
                }
              >
                {order.payment_status}
              </Badge>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Order Items</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {orderItems?.map((item) => (
                      <div key={item.id} className="flex gap-4">
                        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                          <Image
                            src={item.products.image_url || "/placeholder.svg"}
                            alt={item.products.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">
                            {item.products.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Quantity: {item.quantity}
                          </p>
                          <p className="font-semibold text-primary">
                            ₵{(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {order.addresses && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Shipping Address</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-medium">{order.addresses.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.addresses.address_line1}
                        {order.addresses.address_line2 &&
                          `, ${order.addresses.address_line2}`}
                        <br />
                        {order.addresses.city}, {order.addresses.state}{" "}
                        {order.addresses.postal_code}
                        <br />
                        {order.addresses.country}
                        <br />
                        {order.addresses.phone}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant="outline">{order.status}</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Payment:</span>
                      <span className="font-medium capitalize">
                        {order.payment_status}
                      </span>
                    </div>
                    <div className="border-t border-border pt-4">
                      <div className="flex justify-between">
                        <span className="text-lg font-semibold">Total</span>
                        <span className="text-lg font-bold text-primary">
                          ₵{order.total_amount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Button
                  asChild
                  className="w-full bg-transparent"
                  variant="outline"
                >
                  <Link href="/products">Continue Shopping</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
