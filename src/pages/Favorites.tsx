import Navbar from "@/components/Navbar";
import { useFavorites } from "@/hooks/useFavorites";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

const Favorites = () => {
  const { items, loading, removeFromFavorites } = useFavorites();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">Yükleniyor...</div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-3xl font-bold mb-4">Favorileriniz Boş</h1>
          <p className="text-muted-foreground mb-6">
            Henüz favorilere ürün eklemediniz.
          </p>
          <Link to="/">
            <Button className="gradient-hero border-0">Ürünleri Keşfet</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Favorilerim</h1>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item) => {
            const primaryImage = item.products.product_images.find(
              (img) => img.is_primary
            );
            return (
              <Card key={item.id} className="group overflow-hidden">
                <Link to={`/product/${item.product_id}`}>
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={
                        primaryImage?.image_url ||
                        "https://images.unsplash.com/photo-1542291026-7eec264c27ff"
                      }
                      alt={item.products.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </Link>
                <CardContent className="p-4">
                  <Link to={`/product/${item.product_id}`}>
                    <h3 className="font-semibold mb-2 hover:text-primary transition-colors">
                      {item.products.name}
                    </h3>
                  </Link>
                  <p className="text-lg font-bold mb-3 gradient-hero bg-clip-text text-transparent">
                    ₺{item.products.price.toLocaleString("tr-TR", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                  <div className="flex gap-2">
                    <Link to={`/product/${item.product_id}`} className="flex-1">
                      <Button size="sm" className="w-full gradient-hero border-0">
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Sepete Ekle
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFromFavorites(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Favorites;
