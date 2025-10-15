import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { redirect } from "next/navigation"
import { PaystackPayment } from "@/components/paystack-payment"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function PaymentPage({ searchParams }: { searchParams: { order: string } }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const orderId = searchParams.order

  if (!orderId) {
    redirect("/cart")
  }

  const { data: order } = await supabase
    .from("orders")
    .select("*, addresses(*)")
    .eq("id", orderId)
    .eq("user_id", user.id)
    .single()

  if (!order) {
    redirect("/cart")
  }

  const { data: orderItems } = await supabase
    .from("order_items")
    .select("*, products(status)")
    .eq("order_id", orderId)
    .limit(1)

  const orderType = orderItems?.[0]?.products?.status || "available"

  const { count: cartItemCount } = await supabase
    .from("cart_items")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={user} cartItemCount={cartItemCount || 0} />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="mx-auto max-w-2xl">
            <h1 className="mb-8 text-3xl font-bold">Payment</h1>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Order Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Order Number:</span>
                  <span className="font-medium">{order.order_number}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Amount:</span>
                  <span className="text-lg font-bold text-primary">GHS {order.total_amount.toFixed(2)}</span>
                </div>
                {order.addresses && (
                  <div className="mt-4 rounded-md bg-muted p-3">
                    <p className="text-sm font-medium">Shipping to:</p>
                    <p className="text-sm text-muted-foreground">
                      {order.addresses.full_name}
                      <br />
                      {order.addresses.address_line1}
                      {order.addresses.address_line2 && `, ${order.addresses.address_line2}`}
                      <br />
                      {order.addresses.city}, {order.addresses.state} {order.addresses.postal_code}
                      <br />
                      {order.addresses.phone}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <PaystackPayment
              orderId={order.id}
              orderNumber={order.order_number}
              amount={order.total_amount}
              email={user.email!}
              orderType={orderType as "available" | "preorder"}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
