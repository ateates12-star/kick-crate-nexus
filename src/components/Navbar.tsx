import { useState, useEffect, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, User, Moon, Sun, Menu, X, Trash2, Instagram, Facebook, Twitter, Loader2, UserCircle, Mail, HelpCircle, LogOut, Sparkles } from "lucide-react";
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
  const [user, setUser] = useState<any>(null);
  const [captchaQuestion, setCaptchaQuestion] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState<number | null>(null);
  const [captchaInput, setCaptchaInput] = useState("");

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (authOpen) {
      const a = Math.floor(Math.random() * 9) + 1;
      const b = Math.floor(Math.random() * 9) + 1;
      setCaptchaQuestion(`${a} + ${b} = ?`);
      setCaptchaAnswer(a + b);
      setCaptchaInput("");
    }
  }, [authOpen]);

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
      const { data, error } = await supabase.auth.signInWithPassword({
        email: signInEmail,
        password: signInPassword,
      });

      if (error) throw error;

      if (data.user) {
        const { data: roleData, error: roleError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.user.id)
          .maybeSingle();

        if (roleError) {
          console.error("Role check error (navbar):", roleError);
        }

        if (roleData?.role === "banned") {
          await supabase.auth.signOut();
          toast({
            title: "Hesabınız yasaklandı",
            description: "Lütfen müşteri hizmetleri ile iletişime geçin.",
            variant: "destructive",
          });
          setIsAuthLoading(false);
          return;
        }
      }

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
      if (
        !captchaInput ||
        captchaAnswer === null ||
        parseInt(captchaInput, 10) !== captchaAnswer
      ) {
        toast({
          title: "Güvenlik doğrulaması hatalı",
          description: "Lütfen doğrulama sorusunu doğru yanıtlayın.",
          variant: "destructive",
        });
        setIsAuthLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
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

      if (data.user && data.session) {
        toast({
          title: "Kayıt başarılı!",
          description: "Otomatik giriş yapıldı. Hoş geldiniz!",
        });
      } else {
        toast({
          title: "Kayıt başarılı!",
          description: "Hesabınız oluşturuldu. Giriş yapabilirsiniz.",
        });
      }
      setAuthOpen(false);
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
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex h-16 sm:h-20 md:h-24 items-center justify-between gap-2 sm:gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 sm:space-x-3 hover-scale">
            {siteLogo ? (
              <img src={siteLogo} alt="Logo" className="h-10 sm:h-12 md:h-16 lg:h-20 object-contain" />
            ) : (
              <div className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black gradient-hero bg-clip-text text-transparent">
                KICKZ
              </div>
            )}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
            <Link to="/products">
              <Button variant="ghost" className="text-sm lg:text-base font-bold relative group overflow-hidden px-6 py-2.5">
                <span className="relative z-10 flex items-center gap-1.5 sm:gap-2 text-foreground group-hover:text-white transition-colors duration-300">
                  <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 group-hover:animate-spin" />
                  <span className="hidden sm:inline">Tüm Ürünler</span>
                  <span className="sm:hidden">Ürünler</span>
                </span>
                {/* Glowing background */}
                <span className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></span>
                {/* Solid background */}
                <span className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-pink-500 opacity-0 group-hover:opacity-90 transition-opacity duration-300 rounded-lg"></span>
                {/* Animated border */}
                <span className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="absolute inset-0 rounded-lg border-2 border-transparent bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-border animate-pulse"></span>
                </span>
                {/* Moving shine effect */}
                <span className="absolute inset-0 rounded-lg overflow-hidden">
                  <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"></span>
                </span>
              </Button>
            </Link>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md lg:max-w-xl mx-3 lg:mx-6">
            <div className="relative w-full group">
              {/* Glowing border effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary via-purple-500 to-pink-500 rounded-full opacity-0 group-focus-within:opacity-75 blur transition duration-300"></div>
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 via-purple-500/20 to-pink-500/20 pointer-events-none opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-300 z-10" />
                <Input
                  type="search"
                  placeholder="Marka, model veya numara ara..."
                  className="relative pl-11 pr-4 h-11 rounded-full bg-background/90 backdrop-blur-sm border-2 border-border/60 focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:border-primary text-sm transition-all duration-300"
                  value={localSearchQuery}
                  onChange={(e) => setLocalSearchQuery(e.target.value)}
                  onFocus={() => localSearchQuery.length >= 2 && setShowSearchResults(true)}
                  onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                />
              </div>
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute top-full mt-3 w-full bg-card/95 backdrop-blur-xl border-2 border-primary/20 rounded-2xl shadow-2xl shadow-primary/10 max-h-96 overflow-y-auto z-50 animate-fade-in">
                  {searchResults.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-3 p-3 hover:bg-primary/10 cursor-pointer transition-all duration-300 border-b border-border/60 last:border-0 hover:pl-4 hover:border-l-2 hover:border-l-primary"
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
          <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="hover:bg-primary/20 hover:text-primary transition-all duration-300 h-9 w-9 lg:h-10 lg:w-10"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 lg:h-5 lg:w-5" />
              ) : (
                <Moon className="h-4 w-4 lg:h-5 lg:w-5" />
              )}
            </Button>

            <NotificationBell />

            <Sheet open={cartSheetOpen} onOpenChange={setCartSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative hover:bg-primary/20 hover:text-primary transition-all duration-300 h-9 w-9 lg:h-10 lg:w-10">
                  <ShoppingCart className="h-4 w-4 lg:h-5 lg:w-5" />
                  {(cartItems.length + favoriteItems.length) > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-4 w-4 lg:h-5 lg:w-5 flex items-center justify-center p-0 text-[10px] lg:text-xs"
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
                                <Link 
                                  to={`/product/${item.product_id}`} 
                                  onClick={() => setCartSheetOpen(false)}
                                  className="shrink-0"
                                >
                                  <img
                                    src={
                                      item.products.product_images?.find(
                                        (img) => img.is_primary
                                      )?.image_url ||
                                      item.products.product_images?.[0]?.image_url ||
                                      "https://images.unsplash.com/photo-1542291026-7eec264c27ff"
                                    }
                                    alt={item.products.name}
                                    className="w-20 h-20 object-cover rounded hover:opacity-80 transition-opacity cursor-pointer"
                                  />
                                </Link>
                                <div className="flex-1">
                                  <Link 
                                    to={`/product/${item.product_id}`} 
                                    onClick={() => setCartSheetOpen(false)}
                                  >
                                    <h4 className="font-semibold hover:text-primary transition-colors cursor-pointer">
                                      {item.products.name}
                                    </h4>
                                  </Link>
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
                            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground border-0 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] transition-all duration-300 font-semibold">
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
                              <Link 
                                to={`/product/${item.product_id}`} 
                                onClick={() => setCartSheetOpen(false)}
                                className="shrink-0"
                              >
                                <img
                                  src={
                                    item.products.product_images?.find(
                                      (img) => img.is_primary
                                    )?.image_url ||
                                    item.products.product_images?.[0]?.image_url ||
                                    "https://images.unsplash.com/photo-1542291026-7eec264c27ff"
                                  }
                                  alt={item.products.name}
                                  className="w-20 h-20 object-cover rounded hover:opacity-80 transition-opacity cursor-pointer"
                                />
                              </Link>
                              <div className="flex-1">
                                <Link 
                                  to={`/product/${item.product_id}`} 
                                  onClick={() => setCartSheetOpen(false)}
                                >
                                  <h4 className="font-semibold hover:text-primary transition-colors cursor-pointer">
                                    {item.products.name}
                                  </h4>
                                </Link>
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
                <Button variant="ghost" size="icon" className="hover:bg-primary/20 hover:text-primary transition-all duration-300 hover:scale-110">
                  <Shield className="h-5 w-5" />
                </Button>
              </Link>
            )}

            {!user && (
              <Button
                variant="outline"
                className="hidden lg:inline-flex hover:bg-primary hover:text-primary-foreground border-primary/50 hover:border-primary transition-all duration-300 text-sm lg:text-base"
                onClick={() => setAuthOpen(true)}
              >
                Giriş / Kayıt
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative hover:bg-primary/20 hover:text-primary transition-all duration-300 h-9 w-9 lg:h-10 lg:w-10">
                  <User className="h-4 w-4 lg:h-5 lg:w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer flex items-center gap-3 py-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <UserCircle className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold">Profilim</span>
                      <span className="text-xs text-muted-foreground">Hesap ayarlarını yönet</span>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/contact" className="cursor-pointer flex items-center gap-3 py-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold">İletişim</span>
                      <span className="text-xs text-muted-foreground">Bize ulaşın</span>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/faq" className="cursor-pointer flex items-center gap-3 py-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <HelpCircle className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold">Sık Sorulan Sorular</span>
                      <span className="text-xs text-muted-foreground">Yardım ve destek</span>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <div className="px-3 py-2 text-xs font-bold text-primary uppercase tracking-wider">
                  Bizi Takip Edin
                </div>
                <div className="grid grid-cols-3 gap-2 px-3 py-2">
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noreferrer"
                    className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-primary/10 transition-colors cursor-pointer group"
                  >
                    <Instagram className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-xs font-medium">Instagram</span>
                  </a>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noreferrer"
                    className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-primary/10 transition-colors cursor-pointer group"
                  >
                    <Twitter className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-xs font-medium">Twitter</span>
                  </a>
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noreferrer"
                    className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-primary/10 transition-colors cursor-pointer group"
                  >
                    <Facebook className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-xs font-medium">Facebook</span>
                  </a>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive py-3 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-destructive/10">
                    <LogOut className="h-5 w-5" />
                  </div>
                  <span className="font-semibold">Çıkış Yap</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden hover:bg-primary/20 transition-all duration-300 h-9 w-9"
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
          <div className="md:hidden py-3 sm:py-4 border-t border-border animate-fade-in">
            <div className="space-y-3 sm:space-y-4">
              <Link to="/products" onClick={() => setIsMenuOpen(false)}>
                <Button variant="ghost" className="w-full hover:bg-primary/10 transition-all duration-300 relative group text-sm sm:text-base overflow-hidden">
                  <span className="relative z-10 flex items-center gap-2 text-foreground group-hover:text-white transition-colors duration-300">
                    <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 group-hover:animate-spin" />
                    Tüm Ürünler
                  </span>
                  {/* Mobile neon effect */}
                  <span className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-pink-500 opacity-0 group-hover:opacity-90 transition-opacity duration-300 rounded-lg"></span>
                  <span className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></span>
                  <span className="absolute inset-0 border-2 border-primary rounded-lg opacity-0 group-hover:opacity-50 transition-opacity"></span>
                </Button>
              </Link>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Ara..."
                  className="pl-9 sm:pl-10 text-sm"
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
                        className="flex items-center gap-3 p-3 hover:bg-primary/10 cursor-pointer transition-all duration-300 border-b border-border last:border-0 hover:border-l-2 hover:border-l-primary"
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
                  className="hover:bg-primary/20 transition-all duration-300 hover:scale-110"
                >
                  {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
                {!user && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setAuthOpen(true);
                      setIsMenuOpen(false);
                    }}
                    className="hover:bg-primary/20 transition-all duration-300"
                  >
                    <User className="h-5 w-5 mr-2" />
                    Giriş / Kayıt
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <Dialog open={authOpen} onOpenChange={setAuthOpen}>
        <DialogContent className="w-[95vw] max-w-sm sm:max-w-md sm:w-full p-6 sm:p-8">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              {siteLogo ? (
                <img src={siteLogo} alt="Logo" className="h-16 object-contain" />
              ) : (
                <div className="text-3xl font-bold gradient-hero bg-clip-text text-transparent">
                  KICKZ
                </div>
              )}
            </div>
            <DialogTitle className="text-center">Hoş Geldiniz</DialogTitle>
            <DialogDescription className="text-center">
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
                    E-posta Adresi
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
                    placeholder="Şifrenizi giriniz"
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="navbar-first-name">
                      Adınız
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
                      Soyadınız
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
                    E-posta Adresi
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
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Güvenlik Doğrulaması
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Lütfen şu soruyu yanıtlayın: {" "}
                    <span className="font-semibold">{captchaQuestion}</span>
                  </p>
                  <Input
                    type="text"
                    placeholder="Cevabınızı yazın"
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
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
