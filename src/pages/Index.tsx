import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import HeroSlider from "@/components/HeroSlider";
import ProductCard from "@/components/ProductCard";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
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
        <section className="mb-12">
          <HeroSlider />
        </section>

        {/* Featured Products Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold">Öne Çıkan Ürünler</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold">Markalar</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {brands.map((brand) => (
              <Card
                key={brand.id}
                className="cursor-pointer hover:shadow-hover transition-smooth group"
                onClick={() => handleBrandClick(brand.id)}
              >
                <CardContent className="p-6 flex flex-col items-center justify-center aspect-square">
                  {brand.logo_url ? (
                    <img
                      src={brand.logo_url}
                      alt={brand.name}
                      className="h-16 w-16 object-contain mb-3 group-hover:scale-110 transition-smooth"
                    />
                  ) : (
                    <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-3">
                      <span className="text-2xl font-bold text-muted-foreground">
                        {brand.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <h3 className="font-semibold text-center">{brand.name}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
