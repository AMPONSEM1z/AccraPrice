import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { createServerClient } from "@/lib/supabase/server";
import { Globe, Package, Shield, Truck } from "lucide-react";

async function getUser() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

async function getCartCount(userId: string) {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("cart_items")
    .select("quantity")
    .eq("user_id", userId);

  return data?.reduce((sum, item) => sum + item.quantity, 0) || 0;
}

export default async function AboutPage() {
  const user = await getUser();
  const cartCount = user ? await getCartCount(user.id) : 0;

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={user} cartItemCount={cartCount} />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-balance mb-6">
              About AccraPrice
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
              Bringing the World's Best to Your Doorstep
            </p>
          </div>

          {/* Story Section */}
          <div className="max-w-4xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-6">Our Story</h2>
            <div className="prose prose-lg dark:prose-invert">
              <p className="text-muted-foreground leading-relaxed">
                Welcome to Accra Price — your ultimate destination for trendy,
                confident, and affordable fashion. We believe style should be
                effortless and accessible to every woman, no matter where she’s
                from. From sexy tops that turn heads, to baggy jeans, cargo
                pants, elegant suits, and statement handbags, every piece in our
                collection is designed to make you feel bold, beautiful, and
                unstoppable. At Accra Price, we focus on quality, comfort, and
                confidence — because your outfit should speak before you do. ✨
                Affordable luxury. Everyday style. 100% confidence. That’s the
                Accra Price promise
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Our team works directly with trusted suppliers and manufacturers
                globally to bring you authentic products at competitive prices.
                Whether you're looking for the latest gadgets, fashion items, or
                home essentials, we've got you covered.
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Globe className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Global Sourcing</h3>
              <p className="text-muted-foreground text-sm">
                Products sourced from trusted suppliers worldwide
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Quality Assured</h3>
              <p className="text-muted-foreground text-sm">
                Every product is carefully inspected for quality
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Package className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Packaging</h3>
              <p className="text-muted-foreground text-sm">
                Items are packaged securely for safe delivery
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Truck className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
              <p className="text-muted-foreground text-sm">
                Quick and reliable shipping to your doorstep
              </p>
            </div>
          </div>

          {/* Values Section */}
          <div className="bg-muted/50 rounded-lg p-8 md:p-12">
            <h2 className="text-3xl font-bold mb-6 text-center">Our Values</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-3">Authenticity</h3>
                <p className="text-muted-foreground">
                  We guarantee that all our products are 100% authentic and
                  sourced from legitimate suppliers.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3">Affordability</h3>
                <p className="text-muted-foreground">
                  Quality shouldn't break the bank. We work hard to offer
                  competitive prices on all products.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3">Customer First</h3>
                <p className="text-muted-foreground">
                  Your satisfaction is our priority. We're here to ensure you
                  have the best shopping experience.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
