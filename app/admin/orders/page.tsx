"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, Search } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AdminOrdersPage() {
  const supabase = createClient();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [address, setAddress] = useState<any | null>(null);
  const [fetchingDetails, setFetchingDetails] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [filter, search]);

  async function fetchOrders() {
    setLoading(true);

    let query = supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (filter !== "all") query = query.eq("payment_status", filter);

    if (search.trim() !== "") {
      query = query.or(
        `order_number.ilike.%${search}%,email.ilike.%${search}%`
      );
    }

    const { data, error } = await query;

    if (!error && data) setOrders(data);
    setLoading(false);
  }

  async function updatePaymentStatus(order: any, newStatus: string) {
    if (!order.email || !order.order_number || !order.total_amount) {
      console.error("Missing order data, email not sent:", order);
      toast({
        title: "Error",
        description: "Cannot send email: missing order details",
        variant: "destructive",
      });
      return;
    }

    setUpdating(order.id);

    const orderStatus =
      newStatus === "paid"
        ? "completed"
        : newStatus === "cancelled"
        ? "cancelled"
        : "pending";

    const { error } = await supabase
      .from("orders")
      .update({
        payment_status: newStatus,
        status: orderStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    if (!error) {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === order.id
            ? { ...o, payment_status: newStatus, status: orderStatus }
            : o
        )
      );

      if (newStatus === "paid") {
        try {
          const res = await fetch("/api/send-paid-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: order.email,
              orderNumber: order.order_number,
              totalAmount: order.total_amount,
            }),
          });

          if (!res.ok) throw new Error("Failed to send email");

          toast({
            title: "Success",
            description: `Email sent for order ${order.order_number}`,
          });
        } catch (err) {
          console.error("Failed to send order paid email:", err);
          toast({
            title: "Error",
            description: "Failed to send email",
            variant: "destructive",
          });
        }
      }

      toast({
        title: "Success",
        description: `Order ${orderStatus}`,
      });
    } else {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    }

    setUpdating(null);
  }

  async function viewOrderDetails(order: any) {
    setSelectedOrder(order);
    setFetchingDetails(true);
    setOrderItems([]);
    setAddress(null);

    const [{ data: items }, { data: addr }] = await Promise.all([
      supabase.from("order_items").select("*").eq("order_id", order.id),
      supabase
        .from("addresses")
        .select("*")
        .eq("order_id", order.id)
        .maybeSingle(),
    ]);

    if (items) setOrderItems(items);
    if (addr) setAddress(addr);
    setFetchingDetails(false);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Admin Orders</h1>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by order number or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-2">
          {["all", "pending", "paid", "cancelled"].map((status) => (
            <Button
              key={status}
              variant={filter === status ? "default" : "outline"}
              onClick={() => setFilter(status)}
            >
              {status === "all"
                ? "All"
                : status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : orders.length === 0 ? (
        <p className="text-muted-foreground">No orders found.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-semibold">
                    #{order.order_number} — ${order.total_amount.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Placed on{" "}
                    {new Date(order.created_at).toLocaleString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                      timeZone: "Africa/Accra",
                    })}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <Badge
                      variant={
                        order.status === "completed"
                          ? "default"
                          : order.status === "cancelled"
                          ? "destructive"
                          : "outline"
                      }
                    >
                      {order.status}
                    </Badge>
                    <Badge
                      variant={
                        order.payment_status === "paid"
                          ? "default"
                          : order.payment_status === "cancelled"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {order.payment_status}
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => viewOrderDetails(order)}
                  >
                    View Details
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={updating === order.id}
                    onClick={() => updatePaymentStatus(order, "paid")}
                  >
                    {updating === order.id ? "Updating..." : "Mark Paid"}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={updating === order.id}
                    onClick={() => updatePaymentStatus(order, "cancelled")}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={!!selectedOrder}
        onOpenChange={() => setSelectedOrder(null)}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Order Details — #{selectedOrder?.order_number}
            </DialogTitle>
          </DialogHeader>

          {fetchingDetails ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            selectedOrder && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-semibold">Order ID:</p>
                    <p>{selectedOrder.id}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Status:</p>
                    <Badge>{selectedOrder.status}</Badge>
                  </div>
                  <div>
                    <p className="font-semibold">Payment:</p>
                    <Badge>{selectedOrder.payment_status}</Badge>
                  </div>
                  <div>
                    <p className="font-semibold">Total:</p>
                    <p>${selectedOrder.total_amount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Placed:</p>
                    <p>
                      {new Date(selectedOrder.created_at).toLocaleString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                          timeZone: "Africa/Accra",
                        }
                      )}
                    </p>
                  </div>
                  {address && (
                    <>
                      <div>
                        <p className="font-semibold">Shipping Address:</p>
                        <p>{address.line1}</p>
                        <p>{address.line2}</p>
                        <p>
                          {address.city}, {address.state}, {address.postal_code}
                        </p>
                        <p>{address.country}</p>
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-4 space-y-2">
                  {orderItems.map((item) => (
                    <Card key={item.id}>
                      <CardContent className="flex justify-between">
                        <p>{item.product_name}</p>
                        <p>
                          {item.quantity} × ${item.price.toFixed(2)}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
