import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Upload, X } from "lucide-react";

const Settings = () => {
  const [logoUrl, setLogoUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "site_logo")
        .maybeSingle();

      if (error) throw error;
      setLogoUrl(data?.value || "");
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Hata",
        description: "Ayarlar yüklenemedi.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let finalLogoUrl = logoUrl;

      // Handle logo upload
      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `site-logo-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('site-assets')
          .upload(fileName, logoFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('site-assets')
          .getPublicUrl(fileName);

        finalLogoUrl = urlData.publicUrl;
      }

      const { data: existing } = await supabase
        .from("site_settings")
        .select("id")
        .eq("key", "site_logo")
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("site_settings")
          .update({ value: finalLogoUrl })
          .eq("key", "site_logo");

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("site_settings")
          .insert({ key: "site_logo", value: finalLogoUrl });

        if (error) throw error;
      }

      toast({
        title: "Başarılı",
        description: "Logo güncellendi.",
      });
      
      setLogoUrl(finalLogoUrl);
      setLogoFile(null);
      setLogoPreview(null);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Hata",
        description: "Logo güncellenemedi.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoUrl("");
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearLogo = () => {
    setLogoFile(null);
    setLogoUrl("");
    setLogoPreview(null);
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
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Site Ayarları</h1>

      <div className="max-w-2xl w-full">
        <Card>
          <CardHeader>
            <CardTitle>Site Logosu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Site Logosu</Label>
              <div className="space-y-4 mt-2">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label className="text-sm text-muted-foreground">Logo URL</Label>
                    <Input
                      type="url"
                      value={logoUrl}
                      onChange={(e) => {
                        setLogoUrl(e.target.value);
                        setLogoFile(null);
                        setLogoPreview(null);
                      }}
                      placeholder="https://example.com/logo.png"
                      disabled={!!logoFile}
                    />
                  </div>
                  <div className="flex items-end">
                    <Label
                      htmlFor="site-logo-upload"
                      className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Yükle
                    </Label>
                    <input
                      id="site-logo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoFileChange}
                    />
                  </div>
                </div>
                {(logoPreview || logoUrl) && (
                  <div>
                    <Label>Önizleme</Label>
                    <div className="mt-2 p-4 bg-muted rounded-lg relative inline-block">
                      <img
                        src={logoPreview || logoUrl}
                        alt="Site Logo"
                        className="h-16 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
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
                  </div>
                )}
              </div>
            </div>

            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Settings;
