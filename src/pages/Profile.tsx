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
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">Profilim</h1>
          <Button variant="outline" onClick={handleLogout}>
            Çıkış Yap
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Personal Info */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <User className="h-5 w-5 mr-2" />
                Kişisel Bilgiler
              </CardTitle>
            </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Ad</Label>
                <Input
                  value={profile?.first_name || ""}
                  onChange={(e) =>
                    setProfile({ ...profile!, first_name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Soyad</Label>
                <Input
                  value={profile?.last_name || ""}
                  onChange={(e) =>
                    setProfile({ ...profile!, last_name: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <Label>E-posta</Label>
              <Input value={email} disabled />
            </div>
          </CardContent>
          </Card>

          {/* Phone */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Phone className="h-5 w-5 mr-2" />
                İletişim
              </CardTitle>
            </CardHeader>
          <CardContent>
            <Label>Cep Telefonu</Label>
            <Input
              value={profile?.phone || ""}
              onChange={(e) =>
                setProfile({ ...profile!, phone: e.target.value })
              }
              placeholder="05XX XXX XX XX"
              disabled={!!profile?.phone}
            />
            {profile?.phone && (
              <p className="text-sm text-muted-foreground mt-2">
                Telefon numaranız eklendiğinde değiştirilemez.
              </p>
            )}
          </CardContent>
          </Card>
        </div>

        {/* Address */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <MapPin className="h-5 w-5 mr-2" />
              Adres Bilgileri
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
            <div className="grid grid-cols-2 gap-4">
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
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Heart className="h-5 w-5 mr-2" />
              Favorilerim
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
                    className="flex items-center gap-4 p-4 border rounded-lg"
                  >
                    <img
                      src={
                        item.products.product_images.find(
                          (img) => img.is_primary
                        )?.image_url || item.products.product_images[0]?.image_url
                      }
                      alt={item.products.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <Link to={`/product/${item.product_id}`}>
                        <h4 className="font-semibold hover:underline">
                          {item.products.name}
                        </h4>
                      </Link>
                      <p className="text-lg font-bold mt-1">
                        ₺{item.products.price.toLocaleString("tr-TR")}
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeFromFavorites(item.id)}
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
