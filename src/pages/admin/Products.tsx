import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, Upload, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  is_featured: boolean;
  brand_id: string | null;
  brands: { name: string } | null;
  product_images?: { id: string; image_url: string; is_primary: boolean }[];
}

interface SizeStock {
  size: string;
  stock: number;
}

interface Brand {
  id: string;
  name: string;
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    brand_id: "",
    is_featured: false,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [sizes, setSizes] = useState<SizeStock[]>([
    { size: "", stock: 0 },
  ]);
  const [existingImages, setExistingImages] = useState<
    { id: string; image_url: string; is_primary: boolean }[]
  >([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
    fetchBrands();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*, brands(name), product_images(*)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Hata",
        description: "Ürünler yüklenemedi.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBrands = async () => {
    try {
      const { data, error } = await supabase
        .from("brands")
        .select("id, name")
        .order("name");

      if (error) throw error;
      setBrands(data || []);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const productData = {
        name: formData.name,
        description: formData.description || null,
        price: parseFloat(formData.price),
        brand_id: formData.brand_id || null,
        is_featured: formData.is_featured,
      };

      let productId: string;

      if (editingProduct) {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", editingProduct.id);

        if (error) throw error;
        productId = editingProduct.id;

        // Delete all existing images for this product before adding new ones
        await supabase
          .from("product_images")
          .delete()
          .eq("product_id", productId);

        toast({ title: "Başarılı", description: "Ürün güncellendi." });
      } else {
        const { data, error } = await supabase
          .from("products")
          .insert(productData)
          .select()
          .single();

        if (error) throw error;
        productId = data.id;
        toast({ title: "Başarılı", description: "Ürün eklendi." });
      }

      // Handle image upload
      let finalImageUrl = imageUrl;
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${productId}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(fileName);

        finalImageUrl = urlData.publicUrl;
      }

      // Save image to product_images table
      if (finalImageUrl) {
        const { error: imageError } = await supabase
          .from("product_images")
          .insert({
            product_id: productId,
            image_url: finalImageUrl,
            is_primary: true,
            display_order: 0,
          });

        if (imageError) throw imageError;
      }

      // Save sizes and stock
      const validSizes = sizes.filter((s) => s.size.trim() !== "");
      if (validSizes.length > 0) {
        // Delete existing sizes
        await supabase.from("product_sizes").delete().eq("product_id", productId);

        // Insert new sizes
        const { error: sizesError } = await supabase.from("product_sizes").insert(
          validSizes.map((s) => ({
            product_id: productId,
            size: s.size,
            stock: s.stock,
          }))
        );

        if (sizesError) throw sizesError;
      }

      setOpen(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Hata",
        description: "İşlem başarısız.",
        variant: "destructive",
      });
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImageUrl("");
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImageUrl("");
    setImagePreview(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu ürünü silmek istediğinizden emin misiniz?")) return;

    try {
      const { error } = await supabase.from("products").delete().eq("id", id);

      if (error) throw error;
      toast({ title: "Silindi", description: "Ürün silindi." });
      fetchProducts();
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Hata",
        description: "Ürün silinemedi.",
        variant: "destructive",
      });
    }
  };

  const openDialog = async (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || "",
        price: product.price.toString(),
        brand_id: product.brand_id || "",
        is_featured: product.is_featured || false,
      });

      // Fetch existing images
      const { data: images } = await supabase
        .from("product_images")
        .select("*")
        .eq("product_id", product.id)
        .order("display_order");
      setExistingImages(images || []);

      // Fetch existing sizes
      const { data: productSizes } = await supabase
        .from("product_sizes")
        .select("*")
        .eq("product_id", product.id);
      if (productSizes && productSizes.length > 0) {
        setSizes(productSizes.map((s) => ({ size: s.size, stock: s.stock })));
      }
    } else {
      resetForm();
    }
    setOpen(true);
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      brand_id: "",
      is_featured: false,
    });
    setSizes([{ size: "", stock: 0 }]);
    setExistingImages([]);
    clearImage();
  };

  const addSizeRow = () => {
    setSizes([...sizes, { size: "", stock: 0 }]);
  };

  const removeSizeRow = (index: number) => {
    setSizes(sizes.filter((_, i) => i !== index));
  };

  const updateSize = (index: number, field: "size" | "stock", value: string | number) => {
    const newSizes = [...sizes];
    if (field === "stock") {
      newSizes[index].stock = Number(value);
    } else {
      newSizes[index].size = String(value);
    }
    setSizes(newSizes);
  };

  const deleteImage = async (imageId: string) => {
    try {
      const { error } = await supabase
        .from("product_images")
        .delete()
        .eq("id", imageId);

      if (error) throw error;

      setExistingImages(existingImages.filter((img) => img.id !== imageId));
      toast({ title: "Başarılı", description: "Resim silindi." });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Hata",
        description: "Resim silinemedi.",
        variant: "destructive",
      });
    }
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Ürün Yönetimi</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openDialog()} size="sm" className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Yeni Ürün
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? "Ürünü Düzenle" : "Yeni Ürün Ekle"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Ürün Adı</Label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
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
                  rows={3}
                />
              </div>
              <div>
                <Label>Fiyat (₺)</Label>
                <Input
                  type="number"
                  step="0.01"
                  required
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Marka</Label>
                <Select
                  value={formData.brand_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, brand_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Marka seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.is_featured}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_featured: checked })
                  }
                />
                <Label>Öne Çıkan Ürün</Label>
              </div>
              <div>
                <Label>Bedenler ve Stok</Label>
                <div className="space-y-2 mt-2">
                  {sizes.map((size, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="Beden (örn: 42, M, L)"
                        value={size.size}
                        onChange={(e) => updateSize(index, "size", e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        placeholder="Stok"
                        value={size.stock}
                        onChange={(e) => updateSize(index, "stock", e.target.value)}
                        className="w-24"
                      />
                      {sizes.length > 1 && (
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={() => removeSizeRow(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={addSizeRow}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Beden Ekle
                  </Button>
                </div>
              </div>
              {editingProduct && existingImages.length > 0 && (
                <div>
                  <Label>Mevcut Resimler</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {existingImages.map((img) => (
                      <div key={img.id} className="relative">
                        <img
                          src={img.image_url}
                          alt="Ürün"
                          className="h-24 w-full object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          className="absolute -top-2 -right-2"
                          onClick={() => deleteImage(img.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <Label>Yeni Ürün Resmi Ekle</Label>
                <div className="space-y-4 mt-2">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Label className="text-sm text-muted-foreground">Resim URL</Label>
                      <Input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => {
                          setImageUrl(e.target.value);
                          setImageFile(null);
                          setImagePreview(null);
                        }}
                        placeholder="https://example.com/image.jpg"
                        disabled={!!imageFile}
                      />
                    </div>
                    <div className="flex items-end">
                      <Label
                        htmlFor="product-image-upload"
                        className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Yükle
                      </Label>
                      <input
                        id="product-image-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageFileChange}
                      />
                    </div>
                  </div>
                  {(imagePreview || imageUrl) && (
                    <div className="relative inline-block">
                      <img
                        src={imagePreview || imageUrl}
                        alt="Önizleme"
                        className="h-32 w-32 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        className="absolute -top-2 -right-2"
                        onClick={clearImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingProduct ? "Güncelle" : "Ekle"}
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
        {products.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Henüz ürün yok.</p>
            </CardContent>
          </Card>
        ) : (
          products.map((product) => (
            <Card key={product.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                    {product.brands && (
                      <p className="text-sm text-muted-foreground">
                        {product.brands.name}
                      </p>
                    )}
                    {product.description && (
                      <p className="text-muted-foreground mt-2">
                        {product.description}
                      </p>
                    )}
                    <p className="text-lg font-bold mt-2">
                      ₺{product.price.toLocaleString("tr-TR", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openDialog(product)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(product.id)}
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

export default Products;
