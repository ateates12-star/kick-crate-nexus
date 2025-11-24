import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2, Mail, Key } from "lucide-react";

interface User {
  id: string;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
  last_active_at: string | null;
}

interface UserRole {
  id: string;
  user_id: string;
  role: "admin" | "user";
}

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const [profilesRes, rolesRes] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("user_roles").select("*"),
      ]);

      if (profilesRes.error) throw profilesRes.error;
      if (rolesRes.error) throw rolesRes.error;

      setUsers(profilesRes.data || []);

      const rolesMap: Record<string, string> = {};
      (rolesRes.data || []).forEach((role: UserRole) => {
        rolesMap[role.user_id] = role.role;
      });
      setRoles(rolesMap);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Hata",
        description: "Kullanıcılar yüklenemedi.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: "admin" | "user") => {
    try {
      const { error } = await supabase
        .from("user_roles")
        .update({ role: newRole })
        .eq("user_id", userId);

      if (error) throw error;

      toast({
        title: "Başarılı",
        description: "Kullanıcı rolü güncellendi.",
      });

      fetchUsers();
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Hata",
        description: "Rol güncellenemedi.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Bu kullanıcıyı silmek istediğinizden emin misiniz?")) return;

    try {
      const { error } = await supabase.functions.invoke('delete-user', {
        body: { userId },
      });

      if (error) throw error;

      toast({
        title: "Başarılı",
        description: "Kullanıcı silindi.",
      });

      fetchUsers();
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Hata",
        description: "Kullanıcı silinemedi.",
        variant: "destructive",
      });
    }
  };

  const openEmailDialog = (user: User) => {
    setSelectedUser(user);
    setNewEmail("");
    setEmailDialogOpen(true);
  };

  const openPasswordDialog = (user: User) => {
    setSelectedUser(user);
    setNewPassword("");
    setPasswordDialogOpen(true);
  };

  const handleUpdateEmail = async () => {
    if (!selectedUser || !newEmail) return;

    try {
      const { error } = await supabase.functions.invoke('update-user-email', {
        body: { userId: selectedUser.id, email: newEmail },
      });

      if (error) throw error;

      toast({
        title: "Başarılı",
        description: "E-posta adresi güncellendi.",
      });

      setEmailDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Hata",
        description: "E-posta güncellenemedi.",
        variant: "destructive",
      });
    }
  };

  const handleUpdatePassword = async () => {
    if (!selectedUser || !newPassword) return;

    if (newPassword.length < 6) {
      toast({
        title: "Hata",
        description: "Şifre en az 6 karakter olmalıdır.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.functions.invoke('change-user-password', {
        body: { userId: selectedUser.id, newPassword },
      });

      if (error) throw error;

      toast({
        title: "Başarılı",
        description: "Şifre güncellendi.",
      });

      setPasswordDialogOpen(false);
      setNewPassword("");
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Hata",
        description: "Şifre güncellenemedi.",
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
      <h1 className="text-3xl font-bold mb-8">Kullanıcı Yönetimi</h1>

      <div className="grid gap-4">
        {users.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Henüz kullanıcı yok.</p>
            </CardContent>
          </Card>
        ) : (
          users.map((user) => (
            <Card key={user.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">
                      {user.first_name && user.last_name
                        ? `${user.first_name} ${user.last_name}`
                        : "İsimsiz Kullanıcı"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Kayıt: {new Date(user.created_at).toLocaleDateString("tr-TR")}
                    </p>
                    {user.last_active_at && (
                      <p className="text-sm text-muted-foreground">
                        Son Aktif: {new Date(user.last_active_at).toLocaleDateString("tr-TR")}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={roles[user.id] === "admin" ? "default" : "secondary"}>
                      {roles[user.id] === "admin" ? "Admin" : "Kullanıcı"}
                    </Badge>
                    <Select
                      value={roles[user.id] || "user"}
                      onValueChange={(value) => handleRoleChange(user.id, value as "admin" | "user")}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Kullanıcı</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEmailDialog(user)}
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openPasswordDialog(user)}
                    >
                      <Key className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteUser(user.id)}
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

      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>E-posta Adresini Değiştir</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Yeni E-posta Adresi</Label>
              <Input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="yeni@email.com"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleUpdateEmail} className="flex-1">
                Güncelle
              </Button>
              <Button
                variant="outline"
                onClick={() => setEmailDialogOpen(false)}
              >
                İptal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Şifre Değiştir</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Yeni Şifre</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="En az 6 karakter"
                minLength={6}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleUpdatePassword} className="flex-1">
                Güncelle
              </Button>
              <Button
                variant="outline"
                onClick={() => setPasswordDialogOpen(false)}
              >
                İptal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default Users;
