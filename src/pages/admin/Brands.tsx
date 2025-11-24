import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Upload, X } from "lucide-react";

interface Brand {
  id: string;
  name: string;
  logo_url: string | null;
}

const Brands = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    logo_url: "",
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const { data, error } = await supabase
        .from("brands")
        .select("*")
        .order("name");

      if (error) throw error;
      setBrands(data || []);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Hata",
        description: "Markalar yüklenemedi.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let finalLogoUrl = formData.logo_url;

      // Handle logo upload (optional)
      if (logoFile) {
        try {
          const fileExt = logoFile.name.split(".").pop();
          const fileName = `${Date.now()}-${formData.name.replace(/\s+/g, "-")}.${fileExt}`;
          const { error: uploadError } = await supabase.storage
            .from("brand-logos")
            .upload(fileName, logoFile);

          if (uploadError) {
            console.error("Logo upload error:", uploadError);
            toast({
              title: "Logo yüklenemedi",
              description: "Marka logonuz yüklenemedi, logosuz devam ediliyor.",
              variant: "destructive",
            });
          } else {
            const { data: urlData } = supabase.storage
              .from("brand-logos")
              .getPublicUrl(fileName);

            finalLogoUrl = urlData.publicUrl;
          }
        } catch (error) {
          console.error("Logo upload unexpected error:", error);
          toast({
            title: "Logo yüklenemedi",
            description: "Lütfen daha sonra tekrar deneyin.",
            variant: "destructive",
          });
        }
      }

      const brandData = {
        name: formData.name,
        logo_url: finalLogoUrl || null,
      };

      if (editingBrand) {
        const { error } = await supabase
          .from("brands")
          .update(brandData)
          .eq("id", editingBrand.id);

        if (error) throw error;
        toast({ title: "Başarılı", description: "Marka güncellendi." });
      } else {
        const { error } = await supabase.from("brands").insert(brandData);

        if (error) throw error;
        toast({ title: "Başarılı", description: "Marka eklendi." });
      }

      setOpen(false);
      resetForm();
      fetchBrands();
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Hata",
        description: error?.message || "İşlem başarısız.",
        variant: "destructive",
      });
    }
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setFormData({ ...formData, logo_url: "" });
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearLogo = () => {
    setLogoFile(null);
    setFormData({ ...formData, logo_url: "" });
    setLogoPreview(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu markayı silmek istediğinizden emin misiniz?")) return;

    try {
      const { error } = await supabase.from("brands").delete().eq("id", id);

      if (error) throw error;
      toast({ title: "Silindi", description: "Marka silindi." });
      fetchBrands();
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Hata",
        description: "Marka silinemedi.",
        variant: "destructive",
      });
    }
  };

  const openDialog = (brand?: Brand) => {
    if (brand) {
      setEditingBrand(brand);
      setFormData({
        name: brand.name,
        logo_url: brand.logo_url || "",
      });
    } else {
      resetForm();
    }
    setOpen(true);
  };

  const resetForm = () => {
    setEditingBrand(null);
    setFormData({
      name: "",
      logo_url: "",
    });
    clearLogo();
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="animate-pulse">Yükleniyor...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Marka Yönetimi</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Yeni Marka
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingBrand ? "Markayı Düzenle" : "Yeni Marka Ekle"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Marka Adı</Label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Logo</Label>
                <div className="space-y-4 mt-2">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Label className="text-sm text-muted-foreground">Logo URL</Label>
                      <Input
                        type="url"
                        value={formData.logo_url}
                        onChange={(e) => {
                          setFormData({ ...formData, logo_url: e.target.value });
                          setLogoFile(null);
                          setLogoPreview(null);
                        }}
                        placeholder="https://example.com/logo.png"
                        disabled={!!logoFile}
                      />
                    </div>
                    <div className="flex items-end">
                      <Label
                        htmlFor="brand-logo-upload"
                        className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Yükle
                      </Label>
                      <input
                        id="brand-logo-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoFileChange}
                      />
                    </div>
                  </div>
                  {(logoPreview || formData.logo_url) && (
                    <div className="relative inline-block">
                      <img
                        src={logoPreview || formData.logo_url}
                        alt="Logo önizleme"
                        className="h-20 w-20 object-contain rounded-lg bg-muted p-2"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        className="absolute -top-2 -right-2"
                        onClick={clearLogo}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingBrand ? "Güncelle" : "Ekle"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  İptal
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {brands.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Henüz marka yok.</p>
            </CardContent>
          </Card>
        ) : (
          brands.map((brand) => (
            <Card key={brand.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {brand.logo_url && (
                      <img
                        src={brand.logo_url}
                        alt={brand.name}
                        className="h-12 w-12 object-contain"
                      />
                    )}
                    <h3 className="font-semibold text-lg">{brand.name}</h3>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openDialog(brand)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(brand.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </AdminLayout>
  );
};

export default Brands;
