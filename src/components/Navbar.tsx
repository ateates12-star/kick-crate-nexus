import { useState, useEffect, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, User, Moon, Sun, Menu, X, Trash2, Instagram, Facebook, Twitter, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "next-themes";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import NotificationBell from "./NotificationBell";
import { useCart } from "@/hooks/useCart";
import { useFavorites } from "@/hooks/useFavorites";
import { useAdmin } from "@/hooks/useAdmin";
import { Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface NavbarProps {
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
}

const Navbar = ({ searchQuery = "", setSearchQuery }: NavbarProps) => {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [siteLogo, setSiteLogo] = useState<string | null>(null);
  const [cartSheetOpen, setCartSheetOpen] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const { items: cartItems, removeItem, updateQuantity } = useCart();
  const { items: favoriteItems, removeFromFavorites } = useFavorites();
  const { isAdmin } = useAdmin();
  const { toast } = useToast();
  const [authOpen, setAuthOpen] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  useEffect(() => {
    if (cartSheetOpen && cartItems.length === 0 && favoriteItems.length === 0) {
      // Boşken de kullanıcı isterse açabilsin diye artık otomatik kapatmıyoruz
    }
  }, [cartSheetOpen, cartItems.length, favoriteItems.length]);

  useEffect(() => {
    const fetchSiteLogo = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "site_logo")
        .maybeSingle();

      if (data?.value) {
        setSiteLogo(data.value);
      }
    };

    fetchSiteLogo();
  }, []);

  useEffect(() => {
    const searchProducts = async () => {
      if (localSearchQuery.trim().length < 2) {
        setSearchResults([]);
        setShowSearchResults(false);
        return;
      }

      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          brands(name),
          product_images(image_url, is_primary)
        `)
        .ilike("name", `%${localSearchQuery}%`)
        .limit(5);

      if (!error && data) {
        setSearchResults(data);
        setShowSearchResults(true);
      }
    };

    const debounceTimer = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounceTimer);
  }, [localSearchQuery]);

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setIsAuthLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: signInEmail,
        password: signInPassword,
      });

      if (error) throw error;

      toast({
        title: "Giriş başarılı!",
        description: "Hoş geldiniz.",
      });
      setAuthOpen(false);
    } catch (error: any) {
      toast({
        title: "Giriş başarısız",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    setIsAuthLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: signUpEmail,
        password: signUpPassword,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;

      toast({
        title: "Kayıt başarılı!",
        description: "Hesabınız oluşturuldu. Giriş yapabilirsiniz.",
      });
    } catch (error: any) {
      toast({
        title: "Kayıt başarısız",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Çıkış yapıldı",
      description: "Tekrar görüşmek üzere.",
    });
    navigate("/");
  };

  const handleSearchResultClick = (productId: string) => {
    setShowSearchResults(false);
    setLocalSearchQuery("");
    navigate(`/product/${productId}`);
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-xl border-b border-border/60 shadow-elegant supports-[backdrop-filter]:bg-background/70">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            {siteLogo ? (
              <img src={siteLogo} alt="Logo" className="h-8 object-contain" />
            ) : (
              <div className="text-2xl font-bold gradient-hero bg-clip-text text-transparent">
                KICKZ
              </div>
            )}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/products">
              <Button variant="ghost" className="text-base">
                Tüm Ürünler
              </Button>
            </Link>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-xl mx-6">
            <div className="relative w-full">
              <div className="absolute inset-0 rounded-full bg-gradient-primary opacity-10 pointer-events-none" />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Marka, model veya numara ara..."
                className="pl-11 pr-4 rounded-full bg-background/80 border-border/60 focus-visible:ring-2 focus-visible:ring-primary/60"
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
                onFocus={() => localSearchQuery.length >= 2 && setShowSearchResults(true)}
                onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
              />
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute top-full mt-3 w-full bg-card border border-border rounded-2xl shadow-elegant max-h-96 overflow-y-auto z-50">
                  {searchResults.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-3 p-3 hover:bg-muted cursor-pointer transition-colors border-b border-border/60 last:border-0"
                      onClick={() => handleSearchResultClick(product.id)}
                    >
                      <img
                        src={
                          product.product_images?.find((img: any) => img.is_primary)?.image_url ||
                          product.product_images?.[0]?.image_url ||
                          "https://images.unsplash.com/photo-1542291026-7eec264c27ff"
                        }
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <p className="font-semibold line-clamp-1">{product.name}</p>
                        {product.brands && (
                          <p className="text-sm text-muted-foreground">{product.brands.name}</p>
                        )}
                        <p className="text-sm font-bold text-primary">
                          ₺{product.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="hover-scale"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            <NotificationBell />

            <Sheet open={cartSheetOpen} onOpenChange={setCartSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative hover-scale">
                  <ShoppingCart className="h-5 w-5" />
                  {(cartItems.length + favoriteItems.length) > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {cartItems.length + favoriteItems.length}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-lg">
                <SheetHeader>
                  <SheetTitle>Sepetim & Favorilerim</SheetTitle>
                </SheetHeader>
                <Tabs defaultValue="cart" className="mt-6">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="cart">
                      Sepet ({cartItems.length})
                    </TabsTrigger>
                    <TabsTrigger value="favorites">
                      Favoriler ({favoriteItems.length})
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="cart" className="space-y-4 mt-4">
                    {cartItems.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        Sepetiniz boş
                      </p>
                    ) : (
                      <>
                        {cartItems.map((item) => (
                          <Card key={item.id}>
                            <CardContent className="p-4">
                              <div className="flex gap-4">
                                <img
                                  src={
                                    item.products.product_images?.find(
                                      (img) => img.is_primary
                                    )?.image_url ||
                                    item.products.product_images?.[0]?.image_url ||
                                    "https://images.unsplash.com/photo-1542291026-7eec264c27ff"
                                  }
                                  alt={item.products.name}
                                  className="w-20 h-20 object-cover rounded"
                                />
                                <div className="flex-1">
                                  <h4 className="font-semibold">
                                    {item.products.name}
                                  </h4>
                                  <p className="text-sm text-muted-foreground">
                                    Beden: {item.size}
                                  </p>
                                  <p className="font-semibold mt-1">
                                    ₺{item.products.price.toLocaleString("tr-TR")}
                                  </p>
                                  <div className="flex items-center gap-2 mt-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                        updateQuantity(
                                          item.id,
                                          Math.max(1, item.quantity - 1)
                                        )
                                      }
                                    >
                                      -
                                    </Button>
                                    <span className="w-8 text-center">
                                      {item.quantity}
                                    </span>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                        updateQuantity(item.id, item.quantity + 1)
                                      }
                                    >
                                      +
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => removeItem(item.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                        <div className="pt-4 border-t">
                          <div className="flex justify-between mb-4">
                            <span className="font-semibold">Toplam:</span>
                            <span className="font-bold text-lg">
                              ₺
                              {cartItems
                                .reduce(
                                  (sum, item) =>
                                    sum + item.products.price * item.quantity,
                                  0
                                )
                                .toLocaleString("tr-TR")}
                            </span>
                          </div>
                          <Link to="/cart" onClick={() => setCartSheetOpen(false)}>
                            <Button className="w-full gradient-hero border-0">
                              Sepete Git
                            </Button>
                          </Link>
                        </div>
                      </>
                    )}
                  </TabsContent>
                  <TabsContent value="favorites" className="space-y-4 mt-4">
                    {favoriteItems.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        Favori ürününüz yok
                      </p>
                    ) : (
                      favoriteItems.map((item) => (
                        <Card key={item.id}>
                          <CardContent className="p-4">
                            <div className="flex gap-4">
                              <img
                                src={
                                  item.products.product_images?.find(
                                    (img) => img.is_primary
                                  )?.image_url ||
                                  item.products.product_images?.[0]?.image_url ||
                                  "https://images.unsplash.com/photo-1542291026-7eec264c27ff"
                                }
                                alt={item.products.name}
                                className="w-20 h-20 object-cover rounded"
                              />
                              <div className="flex-1">
                                <h4 className="font-semibold">
                                  {item.products.name}
                                </h4>
                                <p className="font-semibold mt-1">
                                  ₺{item.products.price.toLocaleString("tr-TR")}
                                </p>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="mt-2"
                                  onClick={() => removeFromFavorites(item.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Kaldır
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </TabsContent>
                </Tabs>
              </SheetContent>
            </Sheet>

            {isAdmin && (
              <Link to="/admin">
                <Button variant="ghost" size="icon" className="hover-scale">
                  <Shield className="h-5 w-5" />
                </Button>
              </Link>
            )}

            <Button
              variant="outline"
              className="hidden lg:inline-flex hover-scale"
              onClick={() => setAuthOpen(true)}
            >
              Giriş / Kayıt
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative hover-scale">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    Profilim
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/contact" className="cursor-pointer">
                    İletişim
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/faq" className="cursor-pointer">
                    Sık Sorulan Sorular
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                  Bizi Takip Edin
                </div>
                <DropdownMenuItem asChild>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Instagram className="h-4 w-4" />
                    Instagram
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Twitter className="h-4 w-4" />
                    Twitter
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Facebook className="h-4 w-4" />
                    Facebook
                  </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                  Çıkış Yap
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="space-y-4">
              <Link to="/products" onClick={() => setIsMenuOpen(false)}>
                <Button variant="ghost" className="w-full">
                  Tüm Ürünler
                </Button>
              </Link>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Ara..."
                  className="pl-10"
                  value={localSearchQuery}
                  onChange={(e) => setLocalSearchQuery(e.target.value)}
                  onFocus={() => localSearchQuery.length >= 2 && setShowSearchResults(true)}
                  onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                />
                {showSearchResults && searchResults.length > 0 && (
                  <div className="absolute top-full mt-2 w-full bg-card border border-border rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
                    {searchResults.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center gap-3 p-3 hover:bg-muted cursor-pointer transition-colors border-b border-border last:border-0"
                        onClick={() => {
                          handleSearchResultClick(product.id);
                          setIsMenuOpen(false);
                        }}
                      >
                        <img
                          src={
                            product.product_images?.find((img: any) => img.is_primary)?.image_url ||
                            product.product_images?.[0]?.image_url ||
                            "https://images.unsplash.com/photo-1542291026-7eec264c27ff"
                          }
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="font-semibold">{product.name}</p>
                          {product.brands && (
                            <p className="text-sm text-muted-foreground">{product.brands.name}</p>
                          )}
                          <p className="text-sm font-bold text-primary">
                            ₺{product.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center justify-around pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                  {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setAuthOpen(true);
                    setIsMenuOpen(false);
                  }}
                >
                  <User className="h-5 w-5 mr-2" />
                  Giriş / Kayıt
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Dialog open={authOpen} onOpenChange={setAuthOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="gradient-hero bg-clip-text text-transparent text-2xl">
              KICKZ
            </DialogTitle>
            <DialogDescription>
              Hesabınıza giriş yapın veya yeni hesap oluşturun
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="signin" className="w-full mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Giriş Yap</TabsTrigger>
              <TabsTrigger value="signup">Kayıt Ol</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="pt-4">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="navbar-signin-email">
                    E-posta
                  </label>
                  <Input
                    id="navbar-signin-email"
                    type="email"
                    placeholder="ornek@email.com"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="navbar-signin-password">
                    Şifre
                  </label>
                  <Input
                    id="navbar-signin-password"
                    type="password"
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full gradient-hero border-0"
                  disabled={isAuthLoading}
                >
                  {isAuthLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Giriş yapılıyor...
                    </>
                  ) : (
                    "Giriş Yap"
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="pt-4">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="navbar-first-name">
                      Ad
                    </label>
                    <Input
                      id="navbar-first-name"
                      type="text"
                      placeholder="Adınız"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="navbar-last-name">
                      Soyad
                    </label>
                    <Input
                      id="navbar-last-name"
                      type="text"
                      placeholder="Soyadınız"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="navbar-signup-email">
                    E-posta
                  </label>
                  <Input
                    id="navbar-signup-email"
                    type="email"
                    placeholder="ornek@email.com"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="navbar-signup-password">
                    Şifre
                  </label>
                  <Input
                    id="navbar-signup-password"
                    type="password"
                    placeholder="En az 6 karakter"
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full gradient-hero border-0"
                  disabled={isAuthLoading}
                >
                  {isAuthLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Kayıt yapılıyor...
                    </>
                  ) : (
                    "Kayıt Ol"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </nav>
  );
};

export default Navbar;
