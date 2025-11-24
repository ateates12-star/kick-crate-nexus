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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Filter, X } from "lucide-react";

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
  const [filterOpen, setFilterOpen] = useState(false);

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

  const hasActiveFilters =
    selectedBrand !== "all" || priceRange[0] !== 0 || priceRange[1] !== 10000;

  const clearFilters = () => {
    setSelectedBrand("all");
    setPriceRange([0, 10000]);
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Brand Filter */}
      <div>
        <label className="text-sm font-bold mb-3 block flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
          Marka Seçimi
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
      <div>
        <label className="text-sm font-bold mb-3 block flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
          Fiyat Aralığı
        </label>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">
                Min (₺)
              </Label>
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
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">
                Max (₺)
              </Label>
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
          <div className="px-2">
            <Slider
              value={priceRange}
              onValueChange={setPriceRange}
              max={10000}
              step={100}
              className="mt-2"
            />
          </div>
          <div className="flex justify-between text-xs font-semibold text-muted-foreground px-1">
            <span>₺{priceRange[0].toLocaleString("tr-TR")}</span>
            <span>₺{priceRange[1].toLocaleString("tr-TR")}</span>
          </div>
        </div>
      </div>

      {hasActiveFilters && (
        <Button
          variant="outline"
          className="w-full hover:bg-destructive hover:text-destructive-foreground transition-all"
          onClick={clearFilters}
        >
          <X className="h-4 w-4 mr-2" />
          Filtreleri Temizle
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="text-center mb-8 lg:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 lg:mb-4 gradient-hero bg-clip-text text-transparent animate-fade-in">
            Tüm Ürünler
          </h1>
          <p className="text-muted-foreground text-base lg:text-lg">
            {filteredProducts.length} ürün bulundu
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-28 backdrop-blur-md bg-card/50 rounded-2xl shadow-elegant p-6 border border-border/50">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                Filtreler
              </h2>
              <FilterContent />
            </div>
          </aside>

          {/* Mobile Filter Button */}
          <div className="lg:hidden">
            <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full mb-6 border-2 hover:border-primary transition-colors"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrele
                  {hasActiveFilters && (
                    <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs font-bold">
                      Aktif
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[85vw] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5 text-primary" />
                    Filtreler
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterContent />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
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
                  <div className="backdrop-blur-md bg-card/50 rounded-2xl shadow-elegant p-8 sm:p-12 text-center border border-border/50">
                    <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-primary/10 mb-4">
                      <span className="text-2xl sm:text-3xl">🔍</span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold mb-2">
                      Ürün Bulunamadı
                    </h3>
                    <p className="text-muted-foreground text-sm sm:text-base">
                      Filtreye uygun ürün bulunamadı. Lütfen farklı bir arama
                      deneyin.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Products;
