import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface SliderItem {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  button_text: string | null;
  button_link: string | null;
  is_active: boolean;
  display_order: number;
}

const Sliders = () => {
  const [sliders, setSliders] = useState<SliderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingSlider, setEditingSlider] = useState<SliderItem | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_url: "",
    button_text: "",
    button_link: "",
    is_active: true,
    display_order: "0",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchSliders();
  }, []);

  const fetchSliders = async () => {
    try {
      const { data, error } = await supabase
        .from("slider_items")
        .select("*")
        .order("display_order");

      if (error) throw error;
      setSliders(data || []);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Hata",
        description: "Slider öğeleri yüklenemedi.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const sliderData = {
        title: formData.title,
        description: formData.description || null,
        image_url: formData.image_url,
        button_text: formData.button_text || null,
        button_link: formData.button_link || null,
        is_active: formData.is_active,
        display_order: parseInt(formData.display_order),
      };

      if (editingSlider) {
        const { error } = await supabase
          .from("slider_items")
          .update(sliderData)
          .eq("id", editingSlider.id);

        if (error) throw error;
        toast({ title: "Başarılı", description: "Slider güncellendi." });
      } else {
        const { error } = await supabase.from("slider_items").insert(sliderData);

        if (error) throw error;
        toast({ title: "Başarılı", description: "Slider eklendi." });
      }

      setOpen(false);
      resetForm();
      fetchSliders();
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Hata",
        description: "İşlem başarısız.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu slider öğesini silmek istediğinizden emin misiniz?"))
      return;

    try {
      const { error } = await supabase
        .from("slider_items")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Silindi", description: "Slider silindi." });
      fetchSliders();
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Hata",
        description: "Slider silinemedi.",
        variant: "destructive",
      });
    }
  };

  const openDialog = (slider?: SliderItem) => {
    if (slider) {
      setEditingSlider(slider);
      setFormData({
        title: slider.title,
        description: slider.description || "",
        image_url: slider.image_url,
        button_text: slider.button_text || "",
        button_link: slider.button_link || "",
        is_active: slider.is_active,
        display_order: slider.display_order.toString(),
      });
    } else {
      resetForm();
    }
    setOpen(true);
  };

  const resetForm = () => {
    setEditingSlider(null);
    setFormData({
      title: "",
      description: "",
      image_url: "",
      button_text: "",
      button_link: "",
      is_active: true,
      display_order: "0",
    });
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
        <h1 className="text-3xl font-bold">Slider Yönetimi</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Yeni Slider
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingSlider ? "Slider Düzenle" : "Yeni Slider Ekle"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Başlık</Label>
                <Input
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Açıklama</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={2}
                />
              </div>
              <div>
                <Label>Görsel URL</Label>
                <Input
                  type="url"
                  required
                  value={formData.image_url}
                  onChange={(e) =>
                    setFormData({ ...formData, image_url: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Buton Metni</Label>
                  <Input
                    value={formData.button_text}
                    onChange={(e) =>
                      setFormData({ ...formData, button_text: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Buton Linki</Label>
                  <Input
                    value={formData.button_link}
                    onChange={(e) =>
                      setFormData({ ...formData, button_link: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <Label>Sıra</Label>
                <Input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) =>
                    setFormData({ ...formData, display_order: e.target.value })
                  }
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_active: checked })
                  }
                />
                <Label>Aktif</Label>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingSlider ? "Güncelle" : "Ekle"}
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
        {sliders.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Henüz slider yok.</p>
            </CardContent>
          </Card>
        ) : (
          sliders.map((slider) => (
            <Card key={slider.id}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <img
                    src={slider.image_url}
                    alt={slider.title}
                    className="w-32 h-24 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{slider.title}</h3>
                    {slider.description && (
                      <p className="text-muted-foreground text-sm mt-1">
                        {slider.description}
                      </p>
                    )}
                    <div className="flex gap-2 mt-2">
                      <span className="text-xs bg-secondary px-2 py-1 rounded">
                        Sıra: {slider.display_order}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          slider.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {slider.is_active ? "Aktif" : "Pasif"}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openDialog(slider)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(slider.id)}
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

export default Sliders;
