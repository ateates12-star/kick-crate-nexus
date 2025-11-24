import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

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
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<number[]>([0, 10000]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    fetchBrands();
    fetchProducts();

    // Check if brand filter is passed in URL
    const brandParam = searchParams.get("brand");
    if (brandParam) {
      setSelectedBrand(brandParam);
    }
  }, [searchParams]);

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

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          brands(name),
          product_images(image_url, is_primary)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    const brandMatch =
      selectedBrand === "all" || product.brand_id === selectedBrand;
    const priceMatch =
      product.price >= priceRange[0] && product.price <= priceRange[1];
    const searchMatch =
      searchQuery === "" ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brands?.name.toLowerCase().includes(searchQuery.toLowerCase());
    return brandMatch && priceMatch && searchMatch;
  });

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 gradient-hero bg-clip-text text-transparent animate-fade-in">
            Tüm Ürünler
          </h1>
          <p className="text-muted-foreground text-lg">
            {filteredProducts.length} ürün bulundu
          </p>
        </div>

        {/* Filters */}
        <div className="backdrop-blur-md bg-card/50 rounded-2xl shadow-elegant p-6 mb-8 border border-border/50 hover:border-primary/30 transition-all">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Brand Filter */}
            <div>
              <label className="text-sm font-semibold mb-3 block flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-gradient-primary" />
                Marka
              </label>
              <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                <SelectTrigger className="border-2 hover:border-primary transition-colors">
                  <SelectValue placeholder="Tüm Markalar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Markalar</SelectItem>
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price Range Filter */}
            <div className="md:col-span-2">
              <label className="text-sm font-semibold mb-3 block flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-gradient-primary" />
                Fiyat Aralığı
              </label>
              <div className="space-y-4">
                <div className="flex gap-4 items-center">
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground">Min (₺)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={priceRange[0]}
                      onChange={(e) => {
                        const val = Math.max(0, parseInt(e.target.value) || 0);
                        setPriceRange([val, Math.max(val, priceRange[1])]);
                      }}
                      className="border-2 hover:border-primary transition-colors"
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground">Max (₺)</Label>
                    <Input
                      type="number"
                      placeholder="10000"
                      value={priceRange[1]}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 10000;
                        setPriceRange([priceRange[0], Math.max(priceRange[0], val)]);
                      }}
                      className="border-2 hover:border-primary transition-colors"
                    />
                  </div>
                </div>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  max={10000}
                  step={100}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>₺{priceRange[0].toLocaleString("tr-TR")}</span>
                  <span>₺{priceRange[1].toLocaleString("tr-TR")}</span>
                </div>
              </div>
            </div>
          </div>

          {selectedBrand !== "all" || priceRange[0] !== 0 || priceRange[1] !== 10000 ? (
            <Button
              variant="outline"
              className="mt-6 hover:bg-primary hover:text-white transition-all"
              onClick={() => {
                setSelectedBrand("all");
                setPriceRange([0, 10000]);
              }}
            >
              Filtreleri Temizle
            </Button>
          ) : null}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square bg-muted/50 animate-pulse rounded-2xl backdrop-blur-sm"
              />
            ))
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map((product, index) => (
              <div
                key={product.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <ProductCard
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
              </div>
            ))
          ) : (
            <div className="col-span-full">
              <div className="backdrop-blur-md bg-card/50 rounded-2xl shadow-elegant p-12 text-center border border-border/50">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-primary/10 mb-4">
                  <span className="text-3xl">🔍</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Ürün Bulunamadı</h3>
                <p className="text-muted-foreground">
                  Filtreye uygun ürün bulunamadı. Lütfen farklı bir arama deneyin.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Products;
