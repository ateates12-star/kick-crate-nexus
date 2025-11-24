import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    toast({
      title: "Mesajınız Gönderildi!",
      description: "En kısa sürede size geri dönüş yapacağız.",
    });
    
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 gradient-hero bg-clip-text text-transparent">
            İletişim
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Sorularınız, önerileriniz veya geri bildirimleriniz için bizimle iletişime geçebilirsiniz.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Contact Information */}
          <div className="space-y-6">
            <Card className="backdrop-blur-sm bg-card/50 hover:shadow-elegant transition-smooth">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-gradient-primary">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  E-posta
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">info@kickz.com</p>
                <p className="text-muted-foreground">destek@kickz.com</p>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-card/50 hover:shadow-elegant transition-smooth">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-gradient-primary">
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                  Telefon
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">+90 (212) 123 45 67</p>
                <p className="text-muted-foreground">+90 (532) 123 45 67</p>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-card/50 hover:shadow-elegant transition-smooth">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-gradient-primary">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  Adres
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Maslak Mahallesi, Büyükdere Caddesi
                  <br />
                  No: 123, Sarıyer
                  <br />
                  İstanbul, Türkiye
                </p>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-card/50">
              <CardHeader>
                <CardTitle>Çalışma Saatleri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pazartesi - Cuma:</span>
                  <span className="font-semibold">09:00 - 18:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cumartesi:</span>
                  <span className="font-semibold">10:00 - 16:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pazar:</span>
                  <span className="font-semibold">Kapalı</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <Card className="backdrop-blur-sm bg-card/50 hover:shadow-elegant transition-smooth">
            <CardHeader>
              <CardTitle>Bize Mesaj Gönderin</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Ad Soyad</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    placeholder="Adınız Soyadınız"
                  />
                </div>
                <div>
                  <Label htmlFor="email">E-posta</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                    placeholder="ornek@email.com"
                  />
                </div>
                <div>
                  <Label htmlFor="subject">Konu</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    required
                    placeholder="Mesaj konusu"
                  />
                </div>
                <div>
                  <Label htmlFor="message">Mesajınız</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    required
                    placeholder="Mesajınızı buraya yazın..."
                    rows={6}
                  />
                </div>
                <Button type="submit" className="w-full gradient-hero border-0">
                  <Send className="h-4 w-4 mr-2" />
                  Gönder
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Contact;
