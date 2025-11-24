import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Link } from "react-router-dom";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  brandName?: string;
}

const ProductCard = ({ id, name, price, imageUrl, brandName }: ProductCardProps) => {
  return (
    <Card className="group overflow-hidden border-border hover:shadow-hover transition-smooth">
      <Link to={`/product/${id}`}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-smooth"
          />
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-2 right-2 bg-white/80 hover:bg-white dark:bg-black/80 dark:hover:bg-black"
            onClick={(e) => {
              e.preventDefault();
              // TODO: Add to favorites
            }}
          >
            <Heart className="h-5 w-5" />
          </Button>
        </div>
      </Link>
      <CardContent className="p-4">
        <Link to={`/product/${id}`}>
          {brandName && (
            <p className="text-sm text-muted-foreground mb-1">{brandName}</p>
          )}
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{name}</h3>
          <p className="text-2xl font-bold gradient-hero bg-clip-text text-transparent">
            ₺{price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
          </p>
        </Link>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button className="w-full gradient-hero border-0">Sepete Ekle</Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
