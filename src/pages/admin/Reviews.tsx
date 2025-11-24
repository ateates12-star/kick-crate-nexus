import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  is_approved: boolean;
  created_at: string;
  products: {
    name: string;
  };
  user_id: string;
}

const Reviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select(`
          *,
          products (name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast({
        title: "Hata",
        description: "Yorumlar yüklenemedi.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateReviewStatus = async (id: string, isApproved: boolean) => {
    try {
      const { error } = await supabase
        .from("reviews")
        .update({ is_approved: isApproved })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Başarılı",
        description: `Yorum ${isApproved ? "onaylandı" : "reddedildi"}.`,
      });

      fetchReviews();
    } catch (error) {
      console.error("Error updating review:", error);
      toast({
        title: "Hata",
        description: "Yorum güncellenemedi.",
        variant: "destructive",
      });
    }
  };

  const deleteReview = async (id: string) => {
    try {
      const { error } = await supabase.from("reviews").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Silindi",
        description: "Yorum silindi.",
      });

      fetchReviews();
    } catch (error) {
      console.error("Error deleting review:", error);
      toast({
        title: "Hata",
        description: "Yorum silinemedi.",
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
      <h1 className="text-3xl font-bold mb-8">Yorum Yönetimi</h1>

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Henüz yorum yok.</p>
            </CardContent>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{review.products.name}</h3>
                      <Badge
                        variant={review.is_approved ? "default" : "secondary"}
                      >
                        {review.is_approved ? "Onaylandı" : "Beklemede"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? "fill-primary text-primary"
                              : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                    {review.comment && (
                      <p className="text-muted-foreground mb-2">{review.comment}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(review.created_at), {
                        addSuffix: true,
                        locale: tr,
                      })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!review.is_approved && (
                      <Button
                        size="sm"
                        onClick={() => updateReviewStatus(review.id, true)}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Onayla
                      </Button>
                    )}
                    {review.is_approved && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateReviewStatus(review.id, false)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Onayı Kaldır
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteReview(review.id)}
                    >
                      Sil
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

export default Reviews;
