import { createClient } from "@/lib/supabase/server"
import { sendOrderStatusUpdateEmail } from "@/lib/email"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { orderId, status } = await request.json()

    if (!orderId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get order details
    const { data: order } = await supabase
      .from("orders")
      .select("*, users(email, full_name)")
      .eq("id", orderId)
      .single()

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Send email
    await sendOrderStatusUpdateEmail({
      orderNumber: order.order_number,
      customerEmail: order.users.email,
      customerName: order.users.full_name || "Customer",
      status: status,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending status update:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
