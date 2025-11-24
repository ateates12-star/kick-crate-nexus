import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, Heart } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Footer = () => {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast({
        title: "Abone oldunuz!",
        description: "Kampanya ve yeniliklerden haberdar olacaksınız.",
      });
      setEmail("");
    }
  };

  return (
    <footer className="relative mt-20 border-t border-border/40 bg-gradient-to-b from-background via-background/95 to-primary/5 backdrop-blur-xl">
      {/* Top decorative line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 py-12 lg:py-16">
          {/* Brand Section */}
          <div className="space-y-4 lg:space-y-6">
            <div className="flex items-center space-x-2">
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
                <span className="text-white font-black text-xl sm:text-2xl">K</span>
              </div>
              <span className="font-black text-2xl sm:text-3xl gradient-hero bg-clip-text text-transparent">
                KICKZ
              </span>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Trend ayakkabı ve spor giyim koleksiyonlarıyla stilinizi yansıtın. Kalite ve konfor bir arada.
            </p>
            <div className="flex gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="group"
              >
                <div className="p-2.5 rounded-lg bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-primary/20">
                  <Instagram className="h-5 w-5 text-primary group-hover:text-purple-500 transition-colors" />
                </div>
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="group"
              >
                <div className="p-2.5 rounded-lg bg-gradient-to-br from-primary/10 to-blue-500/10 border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-primary/20">
                  <Facebook className="h-5 w-5 text-primary group-hover:text-blue-500 transition-colors" />
                </div>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="group"
              >
                <div className="p-2.5 rounded-lg bg-gradient-to-br from-primary/10 to-cyan-500/10 border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-primary/20">
                  <Twitter className="h-5 w-5 text-primary group-hover:text-cyan-500 transition-colors" />
                </div>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
              Hızlı Erişim
            </h3>
            <ul className="space-y-2.5">
              {[
                { to: "/products", label: "Tüm Ürünler" },
                { to: "/faq", label: "Sık Sorulan Sorular" },
                { to: "/contact", label: "İletişim" },
                { to: "/profile", label: "Hesabım" },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm sm:text-base text-muted-foreground hover:text-primary transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="h-px w-0 bg-primary group-hover:w-4 transition-all duration-300"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
              İletişim
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm sm:text-base text-muted-foreground group">
                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">E-posta</p>
                  <a href="mailto:info@kickz.com" className="hover:text-primary transition-colors">
                    info@kickz.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3 text-sm sm:text-base text-muted-foreground group">
                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Phone className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Telefon</p>
                  <a href="tel:+905001234567" className="hover:text-primary transition-colors">
                    +90 (500) 123 45 67
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3 text-sm sm:text-base text-muted-foreground group">
                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Adres</p>
                  <p className="text-sm">İstanbul, Türkiye</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
              Bülten
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground">
              Kampanyalardan ve yeni ürünlerden haberdar olmak için abone olun.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-3">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary via-purple-500 to-pink-500 rounded-lg opacity-0 group-focus-within:opacity-75 blur transition duration-300"></div>
                <Input
                  type="email"
                  placeholder="E-posta adresiniz"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="relative border-2 border-border/60 focus-visible:border-primary transition-all bg-background/90 backdrop-blur-sm"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full gradient-hero border-0 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 font-bold"
              >
                Abone Ol
              </Button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border/40 py-6 lg:py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
              © {new Date().getFullYear()} KICKZ. Tüm hakları saklıdır.
            </p>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <span>Made with</span>
              <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-500 fill-red-500 animate-pulse" />
              <span>by KICKZ Team</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom decorative gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-purple-500 to-pink-500 opacity-50"></div>
    </footer>
  );
};

export default Footer;
