import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  imageUrl: string;
  isFeatured?: boolean;
}

export function ProductCard({
  id,
  name,
  slug,
  price,
  compareAtPrice,
  imageUrl,
  isFeatured,
}: ProductCardProps) {
  const discount = compareAtPrice
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : 0;

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      <Link href={`/products/${slug}`}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          <Image
            src={imageUrl || "/placeholder.svg"}
            alt={name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {discount > 0 && (
            <Badge className="absolute right-2 top-2 bg-destructive text-destructive-foreground">
              -{discount}%
            </Badge>
          )}
          {isFeatured && (
            <Badge className="absolute left-2 top-2 bg-primary text-primary-foreground">
              Featured
            </Badge>
          )}
        </div>
      </Link>

      <CardContent className="p-4">
        <Link href={`/products/${slug}`}>
          <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-balance hover:text-primary">
            {name}
          </h3>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-primary">
            ₵{price.toFixed(2)}
          </span>
          {compareAtPrice && (
            <span className="text-sm text-muted-foreground line-through">
              ₵{compareAtPrice.toFixed(2)}
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Link href={`/products/${slug}`} className="w-full">
          <Button className="w-full" size="sm">
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to cart
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
