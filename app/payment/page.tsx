"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PaymentPage() {
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");
  const supabase = createClient();
  const router = useRouter();
  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY as string;

  // 🧩 Load order details from Supabase
  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

      if (error || !data) {
        console.error("❌ Order fetch error:", error);
        router.push("/checkout");
        return;
      }

      setOrder(data);
      setIsLoading(false);
    };

    fetchOrder();
  }, [orderId]);

  // 🧩 Load Paystack script safely
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading payment details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Order not found.</p>
      </div>
    );
  }

  // 💳 Handle payment (fixed callback)
  const handlePayment = () => {
    if (!window.PaystackPop) {
      alert("Paystack failed to load. Please refresh and try again.");
      return;
    }

    console.log("🧾 Initializing Paystack payment:", {
      key: publicKey,
      email: order.email,
      amount: order.total_amount,
    });

    const handler = window.PaystackPop.setup({
      key: publicKey,
      email: order.email || "customer@example.com",
      amount: Math.round(order.total_amount * 100), // Paystack expects pesewas
      currency: "GHS", // Ghana Cedi
      channels: ["mobile_money"], // restrict to MoMo if needed
      ref: `${order.id}-${Date.now()}`,
      callback: function (response: any) {
        console.log("✅ Payment success:", response);

        // Run async logic safely
        (async () => {
          const { error } = await supabase
            .from("orders")
            .update({
              payment_status: "paid",
              status: "processing",
              payment_reference: response.reference,
            })
            .eq("id", order.id);

          if (error) {
            console.error("❌ Failed to update order:", error);
            alert("Payment succeeded, but order update failed.");
            return;
          }

          router.push(`/order-confirmation?order=${order.id}`);
        })();
      },
      onClose: function () {
        console.log("❌ Payment window closed by user");
        alert("Payment window closed.");
      },
    });

    handler.openIframe();
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <Card className="max-w-md w-full shadow-lg">
        <CardHeader>
          <CardTitle>Complete Your Payment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between text-sm">
            <span>Order Number:</span>
            <span className="font-semibold">{order.order_number}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span>Total Amount:</span>
            <span className="font-semibold">
              GHS {order.total_amount.toFixed(2)}
            </span>
          </div>

          <Button
            onClick={handlePayment}
            className="w-full bg-green-600 text-white py-2 rounded-md font-medium hover:bg-green-700 transition-colors"
          >
            Pay with Paystack
          </Button>

          <Button
            variant="outline"
            className="w-full mt-2"
            onClick={() => router.push("/checkout")}
          >
            Cancel
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
