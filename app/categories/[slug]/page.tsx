"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/product-card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Package } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CategoryPage() {
  const params = useParams();
  const slug = params?.slug; // e.g. "handbags"
  const supabase = createClient();

  const [category, setCategory] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // ✅ Get logged in user
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);

        if (user) {
          const { count } = await supabase
            .from("cart_items")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id);
          setCartItemCount(count || 0);
        }

        // ✅ Fetch category details by slug
        const { data: catData, error: catError } = await supabase
          .from("categories")
          .select("*")
          .eq("slug", slug)
          .single();

        if (catError || !catData) {
          setError("Category not found.");
          setLoading(false);
          return;
        }

        setCategory(catData);

        // ✅ Fetch products that belong to this category
        // Make sure your `products` table has `category_id` or `category_slug` column
        const { data: prodData, error: prodError } = await supabase
          .from("products")
          .select("*")
          .eq("category_id", catData.id) // 🔹 Use this if you link by ID
          // .eq("category_slug", slug)  // 🔹 OR use this if you link by slug instead
          .eq("is_active", true);

        if (prodError) throw prodError;
        setProducts(prodData || []);
      } catch (err: any) {
        console.error(err);
        setError("An error occurred while loading products.");
      } finally {
        setLoading(false);
      }
    }

    if (slug) fetchData();
  }, [slug]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header user={user} cartItemCount={cartItemCount} />
        <main className="flex-1 container mx-auto px-4 py-12">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header user={user} cartItemCount={cartItemCount} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[350px] md:h-[450px] overflow-hidden">
          <motion.div
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0"
          >
            <img
              src={
                category?.image_url ||
                "https://tsnkaxxoyycsahbhqtez.supabase.co/storage/v1/object/public/logo/globalnestimportslogo.jpeg"
              }
              alt={category?.name || "Category"}
              className="h-full w-full object-cover"
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

          {/* Overlay text */}
          <div className="relative z-10 flex h-full flex-col items-center justify-center text-center text-white px-4">
            <motion.h1
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-5xl font-bold mb-3 drop-shadow-lg"
            >
              {category?.name}
            </motion.h1>
            {category?.description && (
              <motion.p
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1 }}
                className="max-w-2xl text-white/90 text-lg leading-relaxed drop-shadow-md"
              >
                {category.description}
              </motion.p>
            )}
          </div>
        </section>

        {/* Products Section */}
        <section className="py-16 relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <img
              src="/abstract-geometric-pattern-teal-blue.jpg"
              alt=""
              className="h-full w-full object-cover"
            />
          </div>

          <div className="container relative z-10 mx-auto px-4">
            {loading ? (
              <p className="text-center text-muted-foreground py-16">
                Loading products...
              </p>
            ) : products.length > 0 ? (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="text-center mb-10"
                >
                  <h2 className="text-3xl font-bold">
                    Explore {category?.name} Products
                  </h2>
                  <p className="text-muted-foreground mt-2">
                    Discover quality items tailored for you
                  </p>
                </motion.div>

                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { staggerChildren: 0.1 },
                    },
                  }}
                  className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                >
                  {products.map((product) => (
                    <motion.div
                      key={product.id}
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 },
                      }}
                      whileHover={{ scale: 1.03 }}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      <ProductCard
                        id={product.id}
                        name={product.name}
                        slug={product.slug}
                        price={product.price ?? 0}
                        compareAtPrice={product.compare_at_price ?? 0}
                        imageUrl={
                          product.image_url ||
                          "https://tsnkaxxoyycsahbhqtez.supabase.co/storage/v1/object/public/logo/globalnestimportslogo.jpeg"
                        }
                        isFeatured={product.is_featured}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  No Products Found
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  We don’t have any products listed in this category yet. Check
                  back soon!
                </p>
                <Button asChild className="mt-6">
                  <Link href="/products">Browse All Products</Link>
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
