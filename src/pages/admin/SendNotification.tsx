import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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

const SendNotification = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("all");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"kampanya" | "bilgi" | "önemli">("bilgi");
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
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
    </AdminLayout>
  );
};

export default SendNotification;
