import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Favorite {
  id: string;
  product_id: string;
  products: {
    name: string;
    price: number;
    product_images: { image_url: string; is_primary: boolean }[];
  };
}

export const useFavorites = () => {
  const [items, setItems] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchFavorites();

    const channel = supabase
      .channel("favorites_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "favorites",
        },
        () => {
          fetchFavorites();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchFavorites = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setItems([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("favorites")
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
      console.error("Error fetching favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  const addToFavorites = async (productId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Giriş Yapın",
          description: "Favorilere eklemek için giriş yapmalısınız.",
          variant: "destructive",
        });
        return;
      }

      // Check if already favorited
      const { data: existing } = await supabase
        .from("favorites")
        .select("*")
        .eq("user_id", user.id)
        .eq("product_id", productId)
        .maybeSingle();

      if (existing) {
        toast({
          title: "Zaten Favorilerde",
          description: "Bu ürün favorilerinizde bulunuyor.",
        });
        return;
      }

      const { error } = await supabase
        .from("favorites")
        .insert({ user_id: user.id, product_id: productId });

      if (error) throw error;

      toast({
        title: "Favorilere Eklendi!",
        description: "Ürün favorilerinize eklendi.",
      });
    } catch (error) {
      console.error("Error adding to favorites:", error);
      toast({
        title: "Hata",
        description: "Ürün favorilere eklenemedi.",
        variant: "destructive",
      });
    }
  };

  const removeFromFavorites = async (favoriteId: string) => {
    try {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("id", favoriteId);

      if (error) throw error;

      toast({
        title: "Silindi",
        description: "Ürün favorilerden kaldırıldı.",
      });
    } catch (error) {
      console.error("Error removing from favorites:", error);
      toast({
        title: "Hata",
        description: "Ürün silinemedi.",
        variant: "destructive",
      });
    }
  };

  const isFavorite = (productId: string) => {
    return items.some((item) => item.product_id === productId);
  };

  return {
    items,
    loading,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
  };
};
