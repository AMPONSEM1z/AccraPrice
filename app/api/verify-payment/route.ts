import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service key for server routes only
);

export async function POST(req: Request) {
  try {
    const { orderId, reference } = await req.json();

    if (!reference || !orderId) {
      return NextResponse.json(
        { error: "Missing reference or orderId" },
        { status: 400 }
      );
    }

    // ✅ Verify transaction from Paystack
    const verifyRes = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const verifyData = await verifyRes.json();

    if (!verifyRes.ok || !verifyData.status) {
      console.error("Paystack verification failed:", verifyData);
      return NextResponse.json(
        { error: "Invalid or failed verification" },
        { status: 400 }
      );
    }

    const status = verifyData.data.status; // "success" or "failed"
    const amount = verifyData.data.amount / 100; // Paystack returns kobo/pesewas
    const transactionRef = verifyData.data.reference;

    if (status === "success") {
      // ✅ Update order in Supabase
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          transaction_ref: transactionRef,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      if (updateError) {
        console.error("Supabase update error:", updateError);
        return NextResponse.json(
          { error: "Failed to update order" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: "Payment verified successfully",
        amount,
        reference: transactionRef,
      });
    }

    // ❌ Payment failed or abandoned
    return NextResponse.json(
      { message: "Payment not successful", status },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: "Server error while verifying payment" },
      { status: 500 }
    );
  }
}
