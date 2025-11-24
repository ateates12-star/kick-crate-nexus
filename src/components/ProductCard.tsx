import { Heart, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useFavorites } from "@/hooks/useFavorites";
import { useProductViews } from "@/hooks/useProductViews";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  brandName?: string;
}

const ProductCard = ({ id, name, price, imageUrl, brandName }: ProductCardProps) => {
  const { isFavorite, addToFavorites, items } = useFavorites();
  const viewCount = useProductViews(id);
  const isFav = isFavorite(id);
  
  return (
    <Card className="group overflow-hidden border-2 border-border/50 hover:border-primary/30 hover:shadow-2xl transition-all duration-500 backdrop-blur-sm bg-card/95 hover:-translate-y-2">
      <Link to={`/product/${id}`}>
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-secondary/20 to-muted">
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-125 group-hover:rotate-2 transition-all duration-700"
          />
          <div className="absolute inset-0 ring-2 ring-primary/0 group-hover:ring-primary/20 ring-inset transition-all duration-500" />
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-3 right-3 bg-background/90 hover:bg-background backdrop-blur-md border border-border/50 hover:border-primary/50 hover:scale-110 transition-all duration-300 z-20"
            onClick={(e) => {
              e.preventDefault();
              addToFavorites(id);
            }}
          >
            <Heart
              className={`h-5 w-5 transition-all duration-300 ${
                isFav ? "fill-red-500 text-red-500 scale-110" : "group-hover:scale-110"
              }`}
            />
          </Button>
          <div className="absolute top-3 left-3 bg-primary/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-primary-foreground opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-2 group-hover:translate-x-0 z-20">
            YENİ
          </div>
        </div>
      </Link>
      <CardContent className="p-5 relative">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <Link to={`/product/${id}`}>
          {brandName && (
            <p className="text-xs text-muted-foreground mb-2 font-medium tracking-wider uppercase">{brandName}</p>
          )}
          <h3 className="font-bold text-lg mb-3 line-clamp-2 group-hover:text-primary transition-colors duration-300">{name}</h3>
          <div className="flex items-center justify-between">
            <p className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              ₺{price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary/30 px-2.5 py-1.5 rounded-full">
              <Eye className="h-3.5 w-3.5" />
              <span className="font-medium">{viewCount}</span>
            </div>
          </div>
        </Link>
      </CardContent>
      <CardFooter className="p-5 pt-0">
        <Link to={`/product/${id}`} className="w-full">
          <Button className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground border-0 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 font-semibold">
            Ürünü İncele
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
