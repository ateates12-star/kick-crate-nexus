import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CartItem {
  id: string;
  product_id: string;
  size: string;
  quantity: number;
  products: {
    name: string;
    price: number;
    product_images: { image_url: string; is_primary: boolean }[];
  };
}

export const useCart = () => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCart();

    const channel = supabase
      .channel("cart_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "cart_items",
        },
        () => {
          fetchCart();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchCart = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setItems([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("cart_items")
        .select(`
          *,
          products (
            name,
            price,
            product_images (image_url, is_primary)
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: string, size: string, quantity: number = 1) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Giriş Yapın",
          description: "Sepete eklemek için giriş yapmalısınız.",
          variant: "destructive",
        });
        return;
      }

      // Check if item already exists
      const { data: existing } = await supabase
        .from("cart_items")
        .select("*")
        .eq("user_id", user.id)
        .eq("product_id", productId)
        .eq("size", size)
        .maybeSingle();

      if (existing) {
        // Update quantity
        const { error } = await supabase
          .from("cart_items")
          .update({ quantity: existing.quantity + quantity })
          .eq("id", existing.id);

        if (error) throw error;
      } else {
        // Insert new item
        const { error } = await supabase
          .from("cart_items")
          .insert({ user_id: user.id, product_id: productId, size, quantity });

        if (error) throw error;
      }

      toast({
        title: "Sepete Eklendi!",
        description: "Ürün sepetinize eklendi.",
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast({
        title: "Hata",
        description: "Ürün sepete eklenemedi.",
        variant: "destructive",
      });
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity })
        .eq("id", itemId);

      if (error) throw error;
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast({
        title: "Hata",
        description: "Miktar güncellenemedi.",
        variant: "destructive",
      });
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;

      toast({
        title: "Silindi",
        description: "Ürün sepetten kaldırıldı.",
      });
    } catch (error) {
      console.error("Error removing item:", error);
      toast({
        title: "Hata",
        description: "Ürün silinemedi.",
        variant: "destructive",
      });
    }
  };

  const total = items.reduce(
    (sum, item) => sum + item.products.price * item.quantity,
    0
  );

  return {
    items,
    loading,
    addToCart,
    updateQuantity,
    removeItem,
    total,
  };
};
