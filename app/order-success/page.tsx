"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"

export default function OrderSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get("order")
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    if (!orderId) return

    const fetchOrder = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          id,
          order_number,
          total_amount,
          payment_status,
          status,
          created_at
        `)
        .eq("id", orderId)
        .single()

      if (!error && data) {
        setOrder(data)
      }
      setLoading(false)
    }

    fetchOrder()
  }, [orderId])

  if (loading) {
    return <div className="text-center p-10 text-lg">Loading your order...</div>
  }

  if (!order) {
    return (
      <div className="text-center p-10 text-red-600">
        Order not found. Please check your email for confirmation.
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto mt-16 text-center">
      <CheckCircle className="mx-auto text-green-600 mb-4" size={72} />
      <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
      <p className="text-muted-foreground mb-6">
        Thank you for your purchase. Your order has been received and is being
        processed.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>
            <strong>Order Number:</strong> {order.order_number}
          </p>
          <p>
            <strong>Status:</strong> {order.status}
          </p>
          <p>
            <strong>Payment Status:</strong> {order.payment_status}
          </p>
          <p>
            <strong>Total Paid:</strong> ₦{order.total_amount.toLocaleString()}
          </p>
          <p>
            <strong>Date:</strong>{" "}
            {new Date(order.created_at).toLocaleString()}
          </p>
        </CardContent>
      </Card>

      <div className="mt-8 flex justify-center gap-4">
        <Button onClick={() => router.push("/")}>Continue Shopping</Button>
        <Button variant="outline" onClick={() => router.push("/account/orders")}>
          View My Orders
        </Button>
      </div>
    </div>
  )
}
