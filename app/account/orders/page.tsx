import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Package } from "lucide-react";

export default async function OrdersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/account/orders");
  }

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const { count: cartItemCount } = await supabase
    .from("cart_items")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={user} cartItemCount={cartItemCount || 0} />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <h1 className="mb-8 text-3xl font-bold">My Orders</h1>

          {!orders || orders.length === 0 ? (
            <Card className="py-12">
              <CardContent className="flex flex-col items-center justify-center text-center">
                <Package className="mb-4 h-16 w-16 text-muted-foreground" />
                <h2 className="mb-2 text-2xl font-semibold">No orders yet</h2>
                <p className="text-muted-foreground">
                  Start shopping to see your orders here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const createdAt = order.created_at
                  ? new Date(order.created_at).toLocaleString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: true,
                      timeZone: "Africa/Accra",
                    })
                  : "Unknown";

                const updatedAt = order.updated_at
                  ? new Date(order.updated_at).toLocaleString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: true,
                      timeZone: "Africa/Accra",
                    })
                  : "Never updated";

                return (
                  <Link key={order.id} href={`/orders/${order.id}`}>
                    <Card className="transition-all hover:shadow-md">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">
                              Order #{order.order_number}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium">Placed:</span>{" "}
                              {createdAt}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              <span className="font-medium">Last updated:</span>{" "}
                              {updatedAt}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="font-bold text-primary">
                              ${order.total_amount.toFixed(2)}
                            </p>
                            <div className="mt-1 flex gap-2">
                              <Badge variant="outline">{order.status}</Badge>
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
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
