"use client";

import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AddToCartButtonProps {
  productId: string;
  disabled?: boolean;
}

export function AddToCartButton({ productId, disabled }: AddToCartButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleAddToCart = async () => {
    const supabase = createClient();
    setIsLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to add items to your cart.",
          variant: "destructive",
        });
        router.push("/auth/login?redirect=" + window.location.pathname);
        return;
      }

      // Check if user record exists in "users" table
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("id", user.id)
        .single();

      if (!existingUser) {
        // Create user record if missing
        const { error: userError } = await supabase.from("users").insert({
          id: user.id,
          email: user.email!,
          full_name: user.user_metadata?.full_name || null,
        });

        if (userError) {
          console.error("🧩 Error creating user record:", userError);
          toast({
            title: "Error",
            description: "Failed to create user record. Please try again.",
            variant: "destructive",
          });
          return;
        }
      }

      // Check if item already in cart
      const { data: existingItem, error: fetchError } = await supabase
        .from("cart_items")
        .select("*")
        .eq("user_id", user.id)
        .eq("product_id", productId)
        .maybeSingle();

      if (fetchError) {
        console.error("🧩 Error fetching cart item:", fetchError);
        throw fetchError;
      }

      if (existingItem) {
        // Update quantity if item already exists
        const { error: updateError } = await supabase
          .from("cart_items")
          .update({
            quantity: existingItem.quantity + 1,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingItem.id);

        if (updateError) {
          console.error("🧩 Error updating cart:", updateError);
          throw updateError;
        }

        toast({
          title: "Cart updated",
          description: "Item quantity increased in your cart.",
        });
      } else {
        // Insert new cart item
        const { error: insertError } = await supabase
          .from("cart_items")
          .insert({
            user_id: user.id,
            product_id: productId,
            quantity: 1,
          });

        if (insertError) {
          console.error("🧩 Error inserting cart item:", insertError);
          throw insertError;
        }

        toast({
          title: "Added to cart",
          description: "Item successfully added to your cart.",
        });
      }

      router.refresh();
    } catch (error) {
      console.error("🧩 Error adding to cart:", error);
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleAddToCart}
      disabled={disabled || isLoading}
      size="lg"
      className="w-full"
    >
      <ShoppingCart className="mr-2 h-5 w-5" />
      {isLoading ? "Adding..." : "Add to Cart"}
    </Button>
  );
}
