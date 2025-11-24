import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

const Contact = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-foreground animate-fade-in">
            İletişim
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Sorularınız, önerileriniz veya geri bildirimleriniz için bizimle iletişime geçebilirsiniz.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Email Card */}
          <Card className="backdrop-blur-sm bg-card/95 hover:shadow-elegant transition-smooth border-border/60 hover:border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-primary shadow-lg">
                  <Mail className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="text-xl">E-posta</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <a 
                href="mailto:info@kickz.com" 
                className="block text-muted-foreground hover:text-primary transition-colors hover:underline"
              >
                info@kickz.com
              </a>
              <a 
                href="mailto:destek@kickz.com" 
                className="block text-muted-foreground hover:text-primary transition-colors hover:underline"
              >
                destek@kickz.com
              </a>
            </CardContent>
          </Card>

          {/* Phone Card */}
          <Card className="backdrop-blur-sm bg-card/95 hover:shadow-elegant transition-smooth border-border/60 hover:border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-primary shadow-lg">
                  <Phone className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="text-xl">Telefon</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <a 
                href="tel:+902121234567" 
                className="block text-muted-foreground hover:text-primary transition-colors hover:underline"
              >
                +90 (212) 123 45 67
              </a>
              <a 
                href="tel:+905321234567" 
                className="block text-muted-foreground hover:text-primary transition-colors hover:underline"
              >
                +90 (532) 123 45 67
              </a>
              <p className="text-sm text-muted-foreground pt-2">
                Müşteri hizmetleri ile görüşmek için arayabilirsiniz
              </p>
            </CardContent>
          </Card>

          {/* Address Card */}
          <Card className="backdrop-blur-sm bg-card/95 hover:shadow-elegant transition-smooth border-border/60 hover:border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-primary shadow-lg">
                  <MapPin className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="text-xl">Adres</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                Maslak Mahallesi<br />
                Büyükdere Caddesi No: 123<br />
                Sarıyer / İstanbul<br />
                Türkiye 34398
              </p>
            </CardContent>
          </Card>

          {/* Working Hours Card - Full Width */}
          <Card className="backdrop-blur-sm bg-card/95 border-border/60 md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-primary shadow-lg">
                  <Clock className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="text-xl">Çalışma Saatleri</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium">Pazartesi - Cuma</span>
                    <span className="font-bold text-primary">09:00 - 18:00</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium">Cumartesi</span>
                    <span className="font-bold text-primary">10:00 - 16:00</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium">Pazar</span>
                    <span className="font-bold text-destructive">Kapalı</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Info Section */}
        <Card className="mt-8 max-w-6xl mx-auto backdrop-blur-sm bg-card/95 border-border/60">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-bold">Sosyal Medyadan Takip Edin</h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                En yeni ürünlerden, kampanyalardan ve haberlerden haberdar olmak için sosyal medya hesaplarımızı takip edebilirsiniz.
              </p>
              <div className="flex justify-center gap-4 pt-4">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="p-4 rounded-full bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af] hover:scale-110 transition-transform shadow-lg"
                >
                  <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noreferrer"
                  className="p-4 rounded-full bg-[#1da1f2] hover:scale-110 transition-transform shadow-lg hover:bg-[#1da1f2]/90"
                >
                  <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="p-4 rounded-full bg-[#1877f2] hover:scale-110 transition-transform shadow-lg hover:bg-[#1877f2]/90"
                >
                  <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Contact;
