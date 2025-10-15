import { createClient } from "@/lib/supabase/server"
import { sendOrderReceipt } from "@/lib/email"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json({ error: "Missing order ID" }, { status: 400 })
    }

    const supabase = await createClient()

    // Verify the user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get order details with user info
    const { data: order } = await supabase
      .from("orders")
      .select("*, users(email, full_name)")
      .eq("id", orderId)
      .eq("user_id", user.id)
      .single()

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Get order items with product details
    const { data: orderItems } = await supabase
      .from("order_items")
      .select("*, products(name, status)")
      .eq("order_id", orderId)

    if (!orderItems || orderItems.length === 0) {
      return NextResponse.json({ error: "Order items not found" }, { status: 404 })
    }

    const result = await sendOrderReceipt({
      customerEmail: order.users.email,
      customerName: order.users.full_name || "Customer",
      productName: orderItems.map((item) => item.products.name).join(", "),
      amount: order.total_amount,
      paystackReference: order.payment_reference || "N/A",
      orderType: orderItems[0].products.status as "available" | "preorder",
      orderDate: new Date(order.created_at).toLocaleDateString(),
      orderId: order.order_number,
    })

    if (result.success) {
      // Mark email as sent
      await supabase.from("orders").update({ email_sent: true }).eq("id", orderId)
    }

    return NextResponse.json({ success: result.success })
  } catch (error) {
    console.error("[v0] Error sending order confirmation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
