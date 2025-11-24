import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAdmin } from "@/hooks/useAdmin";
import {
  LayoutDashboard,
  Package,
  Tag,
  Image,
  Users,
  MessageSquare,
  Bell,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { isAdmin, loading } = useAdmin();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Yükleniyor...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Yetkisiz Erişim</h1>
          <p className="text-muted-foreground mb-6">
            Bu sayfaya erişim yetkiniz bulunmamaktadır.
          </p>
          <Link to="/">
            <Button>Ana Sayfaya Dön</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const menuItems = [
    { path: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/admin/products", icon: Package, label: "Ürünler" },
    { path: "/admin/brands", icon: Tag, label: "Markalar" },
    { path: "/admin/sliders", icon: Image, label: "Slider" },
    { path: "/admin/users", icon: Users, label: "Kullanıcılar" },
    { path: "/admin/reviews", icon: MessageSquare, label: "Yorumlar" },
    { path: "/admin/notifications", icon: Bell, label: "Bildirimler" },
    { path: "/admin/settings", icon: Settings, label: "Ayarlar" },
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="flex flex-col lg:flex-row">
        {/* Sidebar */}
        <aside className="lg:w-64 w-full bg-background border-b lg:border-r lg:border-b-0 p-3 sm:p-4 lg:min-h-screen sticky top-0 z-40 lg:static">
          <div className="mb-4 lg:mb-8">
            <h1 className="text-xl sm:text-2xl font-bold text-primary">
              Admin Panel
            </h1>
          </div>
          <nav className="overflow-x-auto lg:overflow-visible">
            <div className="flex lg:flex-col gap-1.5 sm:gap-2 pb-2 lg:pb-0 min-w-max lg:min-w-0">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path} className="shrink-0 lg:w-full">
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      className={`justify-start whitespace-nowrap w-full ${
                        isActive ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""
                      }`}
                    >
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5 lg:mr-2" />
                      <span className="hidden lg:inline ml-2">{item.label}</span>
                    </Button>
                  </Link>
                );
              })}
              <Link to="/" className="shrink-0 lg:w-full">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="justify-start mt-2 lg:mt-4 whitespace-nowrap w-full"
                >
                  <span className="hidden lg:inline">Ana Sayfaya Dön</span>
                  <span className="lg:hidden">Ana Sayfa</span>
                </Button>
              </Link>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-3 sm:p-4 lg:p-8 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
