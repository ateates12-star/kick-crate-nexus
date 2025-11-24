import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, CheckCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchNotifications();

    const channel = supabase
      .channel("notifications_user")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", id);

      if (error) throw error;
      fetchNotifications();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false);

      if (error) throw error;

      toast({
        title: "Başarılı",
        description: "Tüm bildirimler okundu olarak işaretlendi.",
      });

      fetchNotifications();
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Hata",
        description: "İşlem başarısız.",
        variant: "destructive",
      });
    }
  };

  const openNotification = (notification: Notification) => {
    setSelectedNotification(notification);
    setDialogOpen(true);
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "kampanya":
        return "bg-green-500";
      case "önemli":
        return "bg-red-500";
      case "bilgi":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const getTypeBadgeVariant = (type: string): "default" | "destructive" | "secondary" => {
    switch (type) {
      case "kampanya":
        return "default";
      case "önemli":
        return "destructive";
      default:
        return "secondary";
    }
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
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Bildirimler</h1>
          {notifications.some(n => !n.is_read) && (
            <Button onClick={markAllAsRead} variant="outline">
              <CheckCheck className="h-4 w-4 mr-2" />
              Tümünü Okundu İşaretle
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Henüz bildiriminiz yok.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`cursor-pointer transition-smooth hover:shadow-card ${
                  !notification.is_read ? "border-primary" : ""
                }`}
                onClick={() => openNotification(notification)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`h-2 w-2 rounded-full mt-2 ${getTypeColor(notification.type)}`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{notification.title}</h3>
                          <Badge variant={getTypeBadgeVariant(notification.type)}>
                            {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                          </Badge>
                        </div>
                        {!notification.is_read && (
                          <Badge variant="default" className="gradient-hero border-0">
                            Yeni
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(notification.created_at).toLocaleDateString("tr-TR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${selectedNotification && getTypeColor(selectedNotification.type)}`} />
              {selectedNotification?.title}
              {selectedNotification && (
                <Badge variant={getTypeBadgeVariant(selectedNotification.type)}>
                  {selectedNotification.type.charAt(0).toUpperCase() + selectedNotification.type.slice(1)}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              {selectedNotification?.message}
            </p>
            <p className="text-sm text-muted-foreground">
              {selectedNotification && new Date(selectedNotification.created_at).toLocaleDateString("tr-TR", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Notifications;
