import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useFavorites } from "@/hooks/useFavorites";
import { User, Phone, MapPin, Trash2, Heart } from "lucide-react";

interface Profile {
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  address: string | null;
  address_title?: string | null;
  city?: string | null;
  district?: string | null;
  neighborhood?: string | null;
  postal_code?: string | null;
}

const Profile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { items: favoriteItems, removeFromFavorites } = useFavorites();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      setEmail(user.email || "");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Hata",
        description: "Profil bilgileri yüklenemedi.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: profile?.first_name,
          last_name: profile?.last_name,
          phone: profile?.phone,
          address: profile?.address,
          address_title: profile?.address_title,
          city: profile?.city,
          district: profile?.district,
          neighborhood: profile?.neighborhood,
          postal_code: profile?.postal_code,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Başarılı",
        description: "Profil bilgileriniz güncellendi.",
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Hata",
        description: "Profil güncellenemedi.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

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

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Profilim</h1>
          <Button variant="outline" onClick={handleLogout} className="w-full sm:w-auto">
            Çıkış Yap
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6">
          {/* Personal Info */}
          <Card className="backdrop-blur-sm bg-card/95 shadow-elegant border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center text-lg sm:text-xl">
                <User className="h-5 w-5 mr-2 text-primary" />
                Kişisel Bilgiler
              </CardTitle>
            </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Adınız</Label>
                <Input
                  value={profile?.first_name || ""}
                  onChange={(e) =>
                    setProfile({ ...profile!, first_name: e.target.value })
                  }
                  placeholder="Adınızı giriniz"
                />
              </div>
              <div>
                <Label>Soyadınız</Label>
                <Input
                  value={profile?.last_name || ""}
                  onChange={(e) =>
                    setProfile({ ...profile!, last_name: e.target.value })
                  }
                  placeholder="Soyadınızı giriniz"
                />
              </div>
            </div>
            <div>
              <Label>E-posta Adresi</Label>
              <Input value={email} disabled className="bg-muted" />
            </div>
          </CardContent>
          </Card>

          {/* Phone */}
          <Card className="backdrop-blur-sm bg-card/95 shadow-elegant border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center text-lg sm:text-xl">
                <Phone className="h-5 w-5 mr-2 text-primary" />
                İletişim Bilgileri
              </CardTitle>
            </CardHeader>
          <CardContent>
            <Label>Telefon Numarası</Label>
            <Input
              value={profile?.phone || ""}
              onChange={(e) =>
                setProfile({ ...profile!, phone: e.target.value })
              }
              placeholder="05XX XXX XX XX"
              disabled={!!profile?.phone}
              className={profile?.phone ? "bg-muted" : ""}
            />
            {profile?.phone ? (
              <p className="text-sm text-muted-foreground mt-2">
                ✓ Telefon numaranız kayıtlıdır
              </p>
            ) : (
              <p className="text-sm text-muted-foreground mt-2">
                Lütfen telefon numaranızı ekleyiniz
              </p>
            )}
          </CardContent>
          </Card>
        </div>

        {/* Address */}
        <Card className="mb-6 backdrop-blur-sm bg-card/95 shadow-elegant border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center text-lg sm:text-xl">
              <MapPin className="h-5 w-5 mr-2 text-primary" />
              Teslimat Adresi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Adres Başlığı</Label>
              <Input
                value={profile?.address_title || ""}
                onChange={(e) =>
                  setProfile({ ...profile!, address_title: e.target.value })
                }
                placeholder="Ev, İş, vb."
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>İl</Label>
                <Input
                  value={profile?.city || ""}
                  onChange={(e) =>
                    setProfile({ ...profile!, city: e.target.value })
                  }
                  placeholder="İl"
                />
              </div>
              <div>
                <Label>İlçe</Label>
                <Input
                  value={profile?.district || ""}
                  onChange={(e) =>
                    setProfile({ ...profile!, district: e.target.value })
                  }
                  placeholder="İlçe"
                />
              </div>
            </div>
            <div>
              <Label>Mahalle</Label>
              <Input
                value={profile?.neighborhood || ""}
                onChange={(e) =>
                  setProfile({ ...profile!, neighborhood: e.target.value })
                }
                placeholder="Mahalle"
              />
            </div>
            <div>
              <Label>Açık Adres</Label>
              <Textarea
                value={profile?.address || ""}
                onChange={(e) =>
                  setProfile({ ...profile!, address: e.target.value })
                }
                placeholder="Sokak, cadde, bina no, daire no..."
                rows={3}
              />
            </div>
            <div>
              <Label>Posta Kodu</Label>
              <Input
                value={profile?.postal_code || ""}
                onChange={(e) =>
                  setProfile({ ...profile!, postal_code: e.target.value })
                }
                placeholder="Posta kodu"
              />
            </div>
          </CardContent>
        </Card>

        {/* Favorites */}
        <Card className="mb-6 backdrop-blur-sm bg-card/95 shadow-elegant border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center text-lg sm:text-xl">
              <Heart className="h-5 w-5 mr-2 text-primary" />
              Favori Ürünlerim
            </CardTitle>
          </CardHeader>
          <CardContent>
            {favoriteItems.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                Henüz favori ürününüz yok.
              </p>
            ) : (
              <div className="space-y-4">
                {favoriteItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <Link to={`/product/${item.product_id}`} className="shrink-0">
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
                      <Link to={`/product/${item.product_id}`}>
                        <h4 className="font-semibold hover:text-primary transition-colors">
                          {item.products.name}
                        </h4>
                      </Link>
                      <p className="text-lg font-bold mt-1 text-primary">
                        ₺{item.products.price.toLocaleString("tr-TR", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeFromFavorites(item.id)}
                      className="w-full sm:w-auto"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4 justify-end">
          <Button
            onClick={handleSave}
            disabled={saving}
            size="lg"
            className="gradient-hero border-0 px-8"
          >
            {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Profile;
