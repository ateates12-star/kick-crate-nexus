import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import HeroSlider from "@/components/HeroSlider";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  price: number;
  brand_id: string | null;
  brands: {
    name: string;
  } | null;
  product_images: {
    image_url: string;
    is_primary: boolean;
  }[];
}

interface Brand {
  id: string;
  name: string;
  logo_url: string | null;
}

const Index = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchBrands();
    fetchFeaturedProducts();
    checkNotifications();
  }, []);

  const checkNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { count, error } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_read", false);

      if (error) throw error;

      if (count && count > 0) {
        toast({
          title: "Bildirimleriniz var!",
          description: `${count} okunmamış bildiriminiz bulunuyor.`,
          duration: 5000,
        });
      }
    } catch (error) {
      console.error("Error checking notifications:", error);
    }
  };

  const fetchBrands = async () => {
    try {
      const { data, error } = await supabase
        .from("brands")
        .select("*")
        .order("name");

      if (error) throw error;
      setBrands(data || []);
    } catch (error) {
      console.error("Error fetching brands:", error);
    }
  };

  const fetchFeaturedProducts = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          brands(name),
          product_images(image_url, is_primary)
        `)
        .eq("is_featured", true)
        .order("created_at", { ascending: false })
        .limit(8);

      if (error) throw error;
      setFeaturedProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBrandClick = (brandId: string) => {
    navigate(`/products?brand=${brandId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Slider */}
        <section className="mb-16">
          <HeroSlider />
        </section>

        {/* Featured Products Section */}
        <section className="mb-16">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-2 text-foreground">Öne Çıkan Ürünler</h2>
              <p className="text-muted-foreground text-sm sm:text-base">En beğenilen ve trend ürünlerimizi keşfedin</p>
            </div>
            <Link to="/products">
              <Button variant="outline" className="w-full sm:w-auto hover:bg-primary hover:text-primary-foreground border-primary/50 hover:border-primary transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/20">Tümünü Gör</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square bg-muted animate-pulse rounded-lg"
                />
              ))
            ) : featuredProducts.length > 0 ? (
              featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  imageUrl={
                    product.product_images.find((img) => img.is_primary)
                      ?.image_url ||
                    product.product_images[0]?.image_url ||
                    "https://images.unsplash.com/photo-1542291026-7eec264c27ff"
                  }
                  brandName={product.brands?.name}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                Öne çıkan ürün bulunmuyor.
              </div>
            )}
          </div>
        </section>

        {/* Brands Section */}
        <section className="mb-16 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent rounded-3xl -z-10" />
          <div className="text-center mb-12 pt-8">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-foreground animate-fade-in">
              Markalar
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base md:text-lg px-4">
              Dünyanın en iyi spor ayakkabı markalarını keşfedin
            </p>
          </div>
          <div className="flex justify-center w-full px-2 sm:px-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6 max-w-7xl w-full">
              {brands.map((brand, index) => (
                <div
                  key={brand.id}
                  className="flex justify-center animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <Card
                    className="cursor-pointer hover:shadow-2xl hover:scale-110 transition-all duration-500 group w-full backdrop-blur-md bg-gradient-to-br from-card/80 to-card/40 border-2 border-border/50 hover:border-primary/50 overflow-hidden relative hover:-translate-y-1"
                    onClick={() => handleBrandClick(brand.id)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <CardContent className="p-8 flex flex-col items-center justify-center aspect-square relative">
                      {brand.logo_url ? (
                        <div className="relative">
                          <div className="absolute inset-0 bg-primary rounded-full blur-xl opacity-0 group-hover:opacity-30 transition-opacity" />
                          <img
                            src={brand.logo_url}
                            alt={brand.name}
                            className="h-20 w-20 object-contain mb-4 group-hover:scale-125 transition-all duration-300 relative z-10 filter drop-shadow-lg"
                          />
                        </div>
                      ) : (
                        <div className="h-20 w-20 bg-primary rounded-full flex items-center justify-center mb-4 group-hover:scale-125 group-hover:rotate-12 transition-all duration-300 shadow-elegant">
                          <span className="text-3xl font-bold text-primary-foreground">
                            {brand.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <h3 className="font-bold text-center text-sm group-hover:text-primary group-hover:scale-105 transition-all duration-300">
                        {brand.name}
                      </h3>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
