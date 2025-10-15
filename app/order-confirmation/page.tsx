"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [emailSent, setEmailSent] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // 🧾 Fetch order details & items
  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;

      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

      if (orderError) {
        console.error("Error loading order:", orderError);
        setLoading(false);
        return;
      }

      const { data: itemData, error: itemError } = await supabase
        .from("order_items")
        .select("*, products(name, image_url)")
        .eq("order_id", orderId);

      if (itemError) {
        console.error("Error loading order items:", itemError);
      }

      setOrder(orderData);
      setItems(itemData || []);
      setLoading(false);
    };

    fetchOrder();
  }, [orderId]);

  // 📧 Send confirmation email once
  useEffect(() => {
    const sendOrderEmail = async () => {
      if (!orderId || emailSent) return;

      try {
        const res = await fetch("/api/send-order-confirmation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId }),
        });

        if (res.ok) {
          console.log("✅ Order confirmation email sent!");
          setEmailSent(true);
        } else {
          console.error("❌ Failed to send confirmation email");
        }
      } catch (error) {
        console.error("Error sending confirmation email:", error);
      }
    };

    sendOrderEmail();
  }, [orderId, emailSent]);

  // 🌀 Loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-600 animate-pulse">Loading your order...</p>
      </div>
    );
  }

  // 🚫 No order found
  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-600">Order not found.</p>
      </div>
    );
  }

  // ✅ Success
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-2xl"
      >
        <Card className="shadow-lg border-0 rounded-2xl bg-white overflow-hidden">
          <CardHeader className="text-center space-y-2 py-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 120 }}
              className="flex justify-center"
            >
              <CheckCircle2 className="text-green-600 w-16 h-16" />
            </motion.div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              Payment Successful!
            </CardTitle>
            <p className="text-gray-500 text-sm">
              Thank you for shopping with us. Your order has been confirmed.
            </p>
          </CardHeader>

          <CardContent className="space-y-6 pb-8 px-6">
            {/* Order Summary */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">
                Order Summary
              </h3>
              <div className="divide-y divide-gray-100 border rounded-lg bg-gray-50">
                {items.length > 0 ? (
                  items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3"
                    >
                      <div className="flex items-center space-x-3">
                        {item.products?.image_url ? (
                          <Image
                            src={item.products.image_url}
                            alt={item.products.name}
                            width={50}
                            height={50}
                            className="rounded-md object-cover"
                          />
                        ) : (
                          <div className="w-[50px] h-[50px] bg-gray-200 rounded-md" />
                        )}
                        <div>
                          <p className="font-medium text-gray-800">
                            {item.products?.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold text-gray-800">
                        ₵{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No items found for this order.
                  </p>
                )}
              </div>
            </div>

            {/* Totals */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal:</span>
                <span className="font-semibold text-gray-800">
                  ₵{order.total_amount?.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payment Status:</span>
                <span className="font-semibold text-green-600">
                  {order.payment_status || "Paid"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Order Number:</span>
                <span className="font-semibold text-gray-800">
                  {order.order_number || order.id}
                </span>
              </div>
            </div>

            {/* Email status */}
            {emailSent ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-center text-green-600 mt-3"
              >
                ✅ Confirmation email sent to {order.email}.
              </motion.p>
            ) : (
              <p className="text-xs text-center text-gray-400 mt-3">
                Sending confirmation email...
              </p>
            )}

            {/* Buttons */}
            <div className="pt-4">
              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                onClick={() => router.push("/")}
              >
                Continue Shopping
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
