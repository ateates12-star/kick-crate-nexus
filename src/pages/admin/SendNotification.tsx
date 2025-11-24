import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface User {
  id: string;
  first_name: string | null;
  last_name: string | null;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  created_at: string;
  user_id: string | null;
}

const SendNotification = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("all");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"kampanya" | "bilgi" | "önemli">("bilgi");
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
    fetchNotifications();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name");

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Aynı başlık/mesaj/tip ile gönderilen bildirimleri grupla
      const grouped: Record<string, Notification & { count: number }> = {};
      (data || []).forEach((n: any) => {
        const key = `${n.title}|${n.message}|${n.type}`;
        if (!grouped[key]) {
          grouped[key] = { ...(n as Notification), count: 1 };
        } else {
          grouped[key].count += 1;
        }
      });

      setNotifications(Object.values(grouped));
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const sendNotification = async () => {
    if (!title || !message) {
      toast({
        title: "Hata",
        description: "Başlık ve mesaj alanları zorunludur.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSending(true);

      if (selectedUser === "all") {
        // Send to all users
        const notifications = users.map((user) => ({
          user_id: user.id,
          title,
          message,
          type,
        }));

        const { error } = await supabase.from("notifications").insert(notifications);

        if (error) throw error;
      } else {
        // Send to specific user
        const { error } = await supabase.from("notifications").insert({
          user_id: selectedUser,
          title,
          message,
          type,
        });

        if (error) throw error;
      }

      toast({
        title: "Başarılı",
        description: "Bildirim gönderildi.",
      });

      setTitle("");
      setMessage("");
      setSelectedUser("all");
      setType("bilgi");
      fetchNotifications();
    } catch (error) {
      console.error("Error sending notification:", error);
      toast({
        title: "Hata",
        description: "Bildirim gönderilemedi.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const deleteNotification = async (notification: Notification) => {
    if (!confirm("Bu bildirimi tüm kullanıcılardan silmek istediğinizden emin misiniz?")) return;

    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("title", notification.title)
        .eq("message", notification.message)
        .eq("type", notification.type);

      if (error) throw error;

      toast({
        title: "Silindi",
        description: "Bildirim tüm kullanıcılardan silindi.",
      });
      fetchNotifications();
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast({
        title: "Hata",
        description: "Bildirim silinemedi.",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-8">Bildirim Gönder</h1>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Yeni Bildirim</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Alıcı</Label>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Kullanıcılar</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.first_name} {user.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Bildirim Türü</Label>
            <Select 
              value={type} 
              onValueChange={(value: "kampanya" | "bilgi" | "önemli") => setType(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bilgi">Bilgi</SelectItem>
                <SelectItem value="kampanya">Kampanya</SelectItem>
                <SelectItem value="önemli">Önemli</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Başlık</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Bildirim başlığı..."
            />
          </div>

          <div>
            <Label>Mesaj</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Bildirim mesajı..."
              rows={4}
            />
          </div>

          <Button
            onClick={sendNotification}
            disabled={sending}
            className="w-full gradient-hero border-0"
          >
            {sending ? "Gönderiliyor..." : "Bildirim Gönder"}
          </Button>
        </CardContent>
      </Card>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Gönderilen Bildirimler</h2>
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">Henüz bildirim gönderilmedi.</p>
              </CardContent>
            </Card>
          ) : (
            notifications.map((notification) => (
              <Card key={notification.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{notification.title}</h3>
                        <Badge
                          variant={
                            notification.type === "önemli"
                              ? "destructive"
                              : notification.type === "kampanya"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {notification.type}
                        </Badge>
                        {notification && (notification as any).count !== undefined && (
                          <Badge variant="secondary">
                            {(notification as any).count} alıcı
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(notification.created_at).toLocaleString("tr-TR")}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteNotification(notification)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default SendNotification;
