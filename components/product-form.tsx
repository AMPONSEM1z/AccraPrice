"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase/client";

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category_id: string;
  image_url: string;
  stock_quantity: number;
  status: string;
  is_active: boolean;
  is_featured: boolean;
}

interface ProductFormProps {
  categories: Category[];
  product?: Product;
}

export default function ProductForm({ categories, product }: ProductFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: product?.name || "",
    slug: product?.slug || "",
    description: product?.description || "",
    price: product?.price || 0,
    category_id: product?.category_id || "",
    image_url: product?.image_url || "",
    stock_quantity: product?.stock_quantity || 0,
    status: product?.status || "available",
    is_active: product?.is_active ?? true,
    is_featured: product?.is_featured ?? false,
  });

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createBrowserClient();
      let response;

      if (product) {
        // 🧩 UPDATE existing product
        response = await supabase
          .from("products")
          .update({
            ...formData,
            price: Number.parseFloat(formData.price.toString()),
            stock_quantity: Number.parseInt(formData.stock_quantity.toString()),
          })
          .eq("id", product.id);
      } else {
        // 🧩 INSERT new product
        response = await supabase.from("products").insert({
          ...formData,
          price: Number.parseFloat(formData.price.toString()),
          stock_quantity: Number.parseInt(formData.stock_quantity.toString()),
        });
      }

      console.log("🪵 Supabase response:", response);

      const { data, error, status, statusText } = response || {};

      if (error) {
        console.error("❌ Supabase detailed error:", error);
        toast({
          title: "Supabase Error",
          description: error.message || "Unknown Supabase error",
          variant: "destructive",
        });
        return;
      }

      console.log("✅ Insert/Update successful:", { data, status, statusText });

      toast({
        title: "Success",
        description: product
          ? "Product updated successfully"
          : "Product created successfully",
      });

      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      console.error("💥 Unexpected error saving product:", error);
      toast({
        title: "Unexpected Error",
        description:
          error instanceof Error ? error.message : JSON.stringify(error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Product Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleNameChange(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug *</Label>
        <Input
          id="slug"
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          placeholder="product-url-slug"
          required
        />
        <p className="text-sm text-muted-foreground">
          Auto-generated from product name. You can edit it manually.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={4}
          required
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="price">Price (GHS) *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: Number(e.target.value) })
            }
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="stock_quantity">Stock Quantity *</Label>
          <Input
            id="stock_quantity"
            type="number"
            min="0"
            value={formData.stock_quantity}
            onChange={(e) =>
              setFormData({
                ...formData,
                stock_quantity: Number(e.target.value),
              })
            }
            required
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select
            value={formData.category_id}
            onValueChange={(value) =>
              setFormData({ ...formData, category_id: value })
            }
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status *</Label>
          <Select
            value={formData.status}
            onValueChange={(value) =>
              setFormData({ ...formData, status: value })
            }
            required
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="preorder">Pre-order</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="image_url">Image URL *</Label>
        <Input
          id="image_url"
          type="url"
          value={formData.image_url}
          onChange={(e) =>
            setFormData({ ...formData, image_url: e.target.value })
          }
          placeholder="https://example.com/image.jpg"
          required
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="is_active">Active</Label>
            <p className="text-sm text-muted-foreground">
              Make this product visible to customers
            </p>
          </div>
          <Switch
            id="is_active"
            checked={formData.is_active}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, is_active: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="is_featured">Featured</Label>
            <p className="text-sm text-muted-foreground">
              Show this product on the homepage
            </p>
          </div>
          <Switch
            id="is_featured"
            checked={formData.is_featured}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, is_featured: checked })
            }
          />
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {product ? "Update Product" : "Create Product"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/products")}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

// "use client"

// import type React from "react"

// import { useState } from "react"
// import { useRouter } from "next/navigation"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Textarea } from "@/components/ui/textarea"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Switch } from "@/components/ui/switch"
// import { useToast } from "@/hooks/use-toast"
// import { Loader2 } from "lucide-react"
// import { createBrowserClient } from "@/lib/supabase/client"

// interface Category {
//   id: string
//   name: string
// }

// interface Product {
//   id: string
//   name: string
//   slug: string
//   description: string
//   price: number
//   category_id: string
//   image_url: string
//   stock_quantity: number
//   status: string
//   is_active: boolean
//   is_featured: boolean
// }

// interface ProductFormProps {
//   categories: Category[]
//   product?: Product
// }

// export default function ProductForm({ categories, product }: ProductFormProps) {
//   const router = useRouter()
//   const { toast } = useToast()
//   const [loading, setLoading] = useState(false)

//   const [formData, setFormData] = useState({
//     name: product?.name || "",
//     slug: product?.slug || "",
//     description: product?.description || "",
//     price: product?.price || 0,
//     category_id: product?.category_id || "",
//     image_url: product?.image_url || "",
//     stock_quantity: product?.stock_quantity || 0,
//     status: product?.status || "available",
//     is_active: product?.is_active ?? true,
//     is_featured: product?.is_featured ?? false,
//   })

//   const generateSlug = (name: string) => {
//     return name
//       .toLowerCase()
//       .replace(/[^a-z0-9]+/g, "-")
//       .replace(/^-+|-+$/g, "")
//   }

//   const handleNameChange = (name: string) => {
//     setFormData({
//       ...formData,
//       name,
//       slug: generateSlug(name),
//     })
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setLoading(true)

//     try {
//       const supabase = createBrowserClient()

//       if (product) {
//         // Update existing product
//         const { error } = await supabase
//           .from("products")
//           .update({
//             ...formData,
//             price: Number.parseFloat(formData.price.toString()),
//             stock_quantity: Number.parseInt(formData.stock_quantity.toString()),
//           })
//           .eq("id", product.id)

//         if (error) throw error

//         toast({
//           title: "Success",
//           description: "Product updated successfully",
//         })
//       } else {
//         // Create new product
//         const { error } = await supabase.from("products").insert({
//           ...formData,
//           price: Number.parseFloat(formData.price.toString()),
//           stock_quantity: Number.parseInt(formData.stock_quantity.toString()),
//         })

//         if (error) throw error

//         toast({
//           title: "Success",
//           description: "Product created successfully",
//         })
//       }

//       router.push("/admin/products")
//       router.refresh()
//     } catch (error) {
//       console.error("Error saving product:", error)
//       toast({
//         title: "Error",
//         description: "Failed to save product. Please try again.",
//         variant: "destructive",
//       })
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <form onSubmit={handleSubmit} className="space-y-6">
//       <div className="space-y-2">
//         <Label htmlFor="name">Product Name *</Label>
//         <Input id="name" value={formData.name} onChange={(e) => handleNameChange(e.target.value)} required />
//       </div>

//       <div className="space-y-2">
//         <Label htmlFor="slug">Slug *</Label>
//         <Input
//           id="slug"
//           value={formData.slug}
//           onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
//           placeholder="product-url-slug"
//           required
//         />
//         <p className="text-sm text-muted-foreground">Auto-generated from product name. You can edit it manually.</p>
//       </div>

//       <div className="space-y-2">
//         <Label htmlFor="description">Description *</Label>
//         <Textarea
//           id="description"
//           value={formData.description}
//           onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//           rows={4}
//           required
//         />
//       </div>

//       <div className="grid gap-6 md:grid-cols-2">
//         <div className="space-y-2">
//           <Label htmlFor="price">Price (GHS) *</Label>
//           <Input
//             id="price"
//             type="number"
//             step="0.01"
//             min="0"
//             value={formData.price}
//             onChange={(e) => setFormData({ ...formData, price: Number.parseFloat(e.target.value) })}
//             required
//           />
//         </div>

//         <div className="space-y-2">
//           <Label htmlFor="stock_quantity">Stock Quantity *</Label>
//           <Input
//             id="stock_quantity"
//             type="number"
//             min="0"
//             value={formData.stock_quantity}
//             onChange={(e) => setFormData({ ...formData, stock_quantity: Number.parseInt(e.target.value) })}
//             required
//           />
//         </div>
//       </div>

//       <div className="grid gap-6 md:grid-cols-2">
//         <div className="space-y-2">
//           <Label htmlFor="category">Category *</Label>
//           <Select
//             value={formData.category_id}
//             onValueChange={(value) => setFormData({ ...formData, category_id: value })}
//             required
//           >
//             <SelectTrigger>
//               <SelectValue placeholder="Select a category" />
//             </SelectTrigger>
//             <SelectContent>
//               {categories.map((category) => (
//                 <SelectItem key={category.id} value={category.id}>
//                   {category.name}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>

//         <div className="space-y-2">
//           <Label htmlFor="status">Status *</Label>
//           <Select
//             value={formData.status}
//             onValueChange={(value) => setFormData({ ...formData, status: value })}
//             required
//           >
//             <SelectTrigger>
//               <SelectValue />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="available">Available</SelectItem>
//               <SelectItem value="preorder">Pre-order</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>
//       </div>

//       <div className="space-y-2">
//         <Label htmlFor="image_url">Image URL *</Label>
//         <Input
//           id="image_url"
//           type="url"
//           value={formData.image_url}
//           onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
//           placeholder="https://example.com/image.jpg"
//           required
//         />
//       </div>

//       <div className="space-y-4">
//         <div className="flex items-center justify-between">
//           <div className="space-y-0.5">
//             <Label htmlFor="is_active">Active</Label>
//             <p className="text-sm text-muted-foreground">Make this product visible to customers</p>
//           </div>
//           <Switch
//             id="is_active"
//             checked={formData.is_active}
//             onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
//           />
//         </div>

//         <div className="flex items-center justify-between">
//           <div className="space-y-0.5">
//             <Label htmlFor="is_featured">Featured</Label>
//             <p className="text-sm text-muted-foreground">Show this product on the homepage</p>
//           </div>
//           <Switch
//             id="is_featured"
//             checked={formData.is_featured}
//             onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
//           />
//         </div>
//       </div>

//       <div className="flex gap-4">
//         <Button type="submit" disabled={loading} className="flex-1">
//           {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//           {product ? "Update Product" : "Create Product"}
//         </Button>
//         <Button type="button" variant="outline" onClick={() => router.push("/admin/products")} disabled={loading}>
//           Cancel
//         </Button>
//       </div>
//     </form>
//   )
// }
