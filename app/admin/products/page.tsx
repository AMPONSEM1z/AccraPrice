"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Search } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function AdminProductsPage() {
  const supabase = createClient();
  const [products, setProducts] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (search.trim() === "") setFiltered(products);
    else {
      const lower = search.toLowerCase();
      setFiltered(
        products.filter(
          (p) =>
            p.name.toLowerCase().includes(lower) ||
            p.categories?.name?.toLowerCase().includes(lower)
        )
      );
    }
  }, [search, products]);

  async function fetchProducts() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/auth/login?redirect=/admin/products";
      return;
    }

    const { data: adminCheck } = await supabase
      .from("admins")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!adminCheck) {
      window.location.href = "/";
      return;
    }

    const { data, error } = await supabase
      .from("products")
      .select("*, categories(name)")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setProducts(data);
      setFiltered(data);
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b border-border bg-background">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-2xl font-bold">Manage Products</h1>
          <div className="flex items-center gap-4">
            <Button asChild size="sm">
              <Link href="/admin/products/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Link>
            </Button>
            <Link
              href="/admin"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="mb-4 text-muted-foreground">No products found</p>
              <Button asChild>
                <Link href="/admin/products/new">Add Your First Product</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <div className="relative aspect-square bg-muted">
                  <Image
                    src={product.image_url || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                  {!product.is_active && (
                    <Badge className="absolute right-2 top-2 bg-destructive text-destructive-foreground">
                      Inactive
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="mb-2 font-semibold text-balance">
                    {product.name}
                  </h3>
                  <p className="mb-2 text-sm text-muted-foreground">
                    {product.categories?.name || "Uncategorized"}
                  </p>
                  <div className="mb-4 flex items-center gap-2">
                    <span className="text-lg font-bold text-primary">
                      ₵{product.price?.toFixed(2) || "0.00"}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Stock: {product.stock_quantity ?? 0}
                    </span>
                  </div>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="w-full bg-transparent"
                  >
                    <Link href={`/admin/products/${product.id}/edit`}>
                      Edit Product
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
