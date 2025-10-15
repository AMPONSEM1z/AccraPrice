"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Smartphone, Loader2 } from "lucide-react";
import Script from "next/script";

interface PaystackPaymentProps {
  orderId: string;
  orderNumber: string;
  amount: number;
  email: string;
}

declare global {
  interface Window {
    PaystackPop: any;
  }
}

export function PaystackPayment({
  orderId,
  orderNumber,
  amount,
  email,
}: PaystackPaymentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const router = useRouter();

  const verifyPayment = async (reference: string) => {
    console.log("✅ Verifying payment:", reference);
    try {
      const res = await fetch("/api/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, reference }),
      });

      if (res.ok) {
        console.log("✅ Payment verified successfully");
        router.push(`/orders/${orderId}?payment=success`);
      } else {
        console.error("❌ Payment verification failed");
        alert("Payment verification failed. Please contact support.");
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Error verifying payment:", err);
      alert("An error occurred while verifying payment.");
      setIsLoading(false);
    }
  };

  const handlePayment = () => {
    console.log("🟢 Button clicked!");
    if (typeof window === "undefined" || !window.PaystackPop) {
      alert("Payment system is still loading. Please refresh and try again.");
      return;
    }

    setIsLoading(true);

    console.log("🧾 Paystack initialization:", {
      paystackLoaded: !!window.PaystackPop,
      paystackKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      email,
      amount: Math.round(amount * 100),
      callbackType: typeof verifyPayment,
    });

    try {
      const handler = window.PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
        email,
        amount: Math.round(amount * 100),
        currency: "GHS",
        channels: ["mobile_money"],
        ref: `${orderNumber}-${Date.now()}`,
        callback: function (response: any) {
          console.log("✅ Paystack callback triggered:", response);
          verifyPayment(response.reference);
        },
        onClose: function () {
          console.log("❌ Paystack window closed");
          setIsLoading(false);
        },
      });

      handler.openIframe();
    } catch (error) {
      console.error("❌ Paystack setup error:", error);
      alert("Unable to initialize payment. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <>
      <Script
        src="https://js.paystack.co/v1/inline.js"
        strategy="afterInteractive"
        onLoad={() => {
          console.log("📦 Paystack script loaded");
          setScriptLoaded(true);
        }}
      />

      <Card>
        <CardHeader>
          <CardTitle>Pay with Mobile Money</CardTitle>
          <CardDescription>Use MTN, Vodafone, or AirtelTigo</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-md border-2 border-primary bg-primary/5 p-4 flex items-center gap-3">
            <Smartphone className="h-6 w-6 text-primary" />
            <div>
              <p className="font-semibold text-primary">Mobile Money Payment</p>
              <p className="text-sm text-muted-foreground">
                Securely pay GHS {amount.toFixed(2)} using MoMo.
              </p>
            </div>
          </div>

          <Button
            onClick={() => {
              console.log("🟢 Pay with Paystack button pressed");
              handlePayment();
            }}
            disabled={!scriptLoaded || isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Pays with Paystack"
            )}
          </Button>
        </CardContent>
      </Card>
    </>
  );
}
