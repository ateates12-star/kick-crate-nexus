import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Users, MessageSquare, Image, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Admin = () => {
  const [stats, setStats] = useState({
    products: 0,
    users: 0,
    reviews: 0,
    sliderItems: 0,
  });
  const [viewStats, setViewStats] = useState<{
    daily: { date: string; count: number }[];
    monthly: { month: string; count: number }[];
  }>({
    daily: [],
    monthly: [],
  });

  useEffect(() => {
    fetchStats();
    fetchViewStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [productsRes, usersRes, reviewsRes, sliderRes] = await Promise.all([
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("reviews").select("*", { count: "exact", head: true }),
        supabase.from("slider_items").select("*", { count: "exact", head: true }),
      ]);

      setStats({
        products: productsRes.count || 0,
        users: usersRes.count || 0,
        reviews: reviewsRes.count || 0,
        sliderItems: sliderRes.count || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchViewStats = async () => {
    try {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Fetch daily views for the last 30 days
      const { data: dailyData, error: dailyError } = await supabase
        .from("product_views")
        .select("created_at")
        .gte("created_at", thirtyDaysAgo.toISOString());

      if (dailyError) throw dailyError;

      // Group by date
      const dailyMap = new Map<string, number>();
      dailyData?.forEach((view) => {
        const date = new Date(view.created_at).toLocaleDateString("tr-TR");
        dailyMap.set(date, (dailyMap.get(date) || 0) + 1);
      });

      const daily = Array.from(dailyMap.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(-7); // Last 7 days

      // Fetch monthly views for the last 12 months
      const twelveMonthsAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      const { data: monthlyData, error: monthlyError } = await supabase
        .from("product_views")
        .select("created_at")
        .gte("created_at", twelveMonthsAgo.toISOString());

      if (monthlyError) throw monthlyError;

      // Group by month
      const monthlyMap = new Map<string, number>();
      monthlyData?.forEach((view) => {
        const date = new Date(view.created_at);
        const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        monthlyMap.set(month, (monthlyMap.get(month) || 0) + 1);
      });

      const monthly = Array.from(monthlyMap.entries())
        .map(([month, count]) => ({ month, count }))
        .sort((a, b) => a.month.localeCompare(b.month))
        .slice(-6); // Last 6 months

      setViewStats({ daily, monthly });
    } catch (error) {
      console.error("Error fetching view stats:", error);
    }
  };

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ürünler</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.products}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Kullanıcılar</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Yorumlar</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.reviews}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Slider Öğeleri</CardTitle>
            <Image className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sliderItems}</div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Section */}
      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Günlük Ziyaretçiler (Son 7 Gün)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {viewStats.daily.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Henüz veri yok
              </p>
            ) : (
              <div className="space-y-2">
                {viewStats.daily.map((stat) => (
                  <div
                    key={stat.date}
                    className="flex items-center justify-between p-2 rounded hover:bg-accent"
                  >
                    <span className="text-sm">{stat.date}</span>
                    <span className="font-semibold">{stat.count} görüntüleme</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Aylık Ziyaretçiler (Son 6 Ay)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {viewStats.monthly.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Henüz veri yok
              </p>
            ) : (
              <div className="space-y-2">
                {viewStats.monthly.map((stat) => (
                  <div
                    key={stat.month}
                    className="flex items-center justify-between p-2 rounded hover:bg-accent"
                  >
                    <span className="text-sm">
                      {new Date(stat.month + "-01").toLocaleDateString("tr-TR", {
                        year: "numeric",
                        month: "long",
                      })}
                    </span>
                    <span className="font-semibold">{stat.count} görüntüleme</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Admin;
