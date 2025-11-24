import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart, Star, ChevronLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  brands: {
    name: string;
  } | null;
  product_images: {
    image_url: string;
    is_primary: boolean;
  }[];
}

interface ProductSize {
  size: string;
  stock: number;
}

const ProductDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [sizes, setSizes] = useState<ProductSize[]>([]);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (id) {
      fetchProduct();
      fetchSizes();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          brands(name),
          product_images(image_url, is_primary, display_order)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (error) {
      console.error("Error fetching product:", error);
      toast({
        title: "Hata",
        description: "Ürün bilgileri yüklenemedi.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSizes = async () => {
    try {
      const { data, error } = await supabase
        .from("product_sizes")
        .select("size, stock")
        .eq("product_id", id)
        .order("size");

      if (error) throw error;
      setSizes(data || []);
    } catch (error) {
      console.error("Error fetching sizes:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 w-32 bg-muted rounded" />
            <div className="grid md:grid-cols-2 gap-8">
              <div className="aspect-square bg-muted rounded-lg" />
              <div className="space-y-4">
                <div className="h-8 w-3/4 bg-muted rounded" />
                <div className="h-6 w-1/2 bg-muted rounded" />
                <div className="h-32 w-full bg-muted rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-xl text-muted-foreground">Ürün bulunamadı.</p>
          <Link to="/">
            <Button className="mt-4">Ana Sayfaya Dön</Button>
          </Link>
        </div>
      </div>
    );
  }

  const images = product.product_images.sort((a, b) => {
    if (a.is_primary) return -1;
    if (b.is_primary) return 1;
    return 0;
  });

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Link
          to="/"
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-smooth"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Ürünlere Dön
        </Link>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <Card className="overflow-hidden shadow-card">
              <div className="aspect-square bg-muted">
                <img
                  src={
                    images[selectedImage]?.image_url ||
                    "https://images.unsplash.com/photo-1542291026-7eec264c27ff"
                  }
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </Card>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-smooth ${
                      index === selectedImage
                        ? "border-primary"
                        : "border-transparent hover:border-border"
                    }`}
                  >
                    <img
                      src={img.image_url}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {product.brands && (
              <p className="text-sm text-muted-foreground">{product.brands.name}</p>
            )}
            <h1 className="text-4xl font-bold">{product.name}</h1>
            <p className="text-3xl font-bold gradient-hero bg-clip-text text-transparent">
              ₺{product.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
            </p>

            {product.description && (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground">{product.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Size Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Numara Seçin</label>
              <div className="grid grid-cols-5 gap-2">
                {sizes.map((size) => (
                  <Button
                    key={size.size}
                    variant={selectedSize === size.size ? "default" : "outline"}
                    className={
                      selectedSize === size.size ? "gradient-hero border-0" : ""
                    }
                    onClick={() => setSelectedSize(size.size)}
                    disabled={size.stock === 0}
                  >
                    {size.size}
                  </Button>
                ))}
              </div>
              {sizes.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Şu anda stokta numara bulunmamaktadır.
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                size="lg"
                className="w-full gradient-hero border-0"
                disabled={!selectedSize}
                onClick={() => {
                  toast({
                    title: "Sepete eklendi!",
                    description: `${product.name} - Numara: ${selectedSize}`,
                  });
                }}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Sepete Ekle
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full"
                onClick={() => {
                  toast({
                    title: "Favorilere eklendi!",
                    description: product.name,
                  });
                }}
              >
                <Heart className="mr-2 h-5 w-5" />
                Favorilere Ekle
              </Button>
            </div>

            {/* Stock Info */}
            {selectedSize && (
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">
                  Stok: {sizes.find((s) => s.size === selectedSize)?.stock || 0} adet
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section (Placeholder) */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Yorumlar</h2>
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground py-8">
                Henüz yorum yapılmamış. İlk yorumu siz yapın!
              </p>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default ProductDetail;
