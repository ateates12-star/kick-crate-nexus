import { Link } from "react-router-dom";
import { Twitter, Mail, Phone, MapPin, Heart } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
const Footer = () => {
  const [email, setEmail] = useState("");
  const {
    toast
  } = useToast();
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast({
        title: "Abone oldunuz!",
        description: "Kampanya ve yeniliklerden haberdar olacaksınız."
      });
      setEmail("");
    }
  };
  return <footer className="relative mt-20 border-t border-border/40 bg-gradient-to-b from-background via-background/95 to-primary/5 backdrop-blur-xl">
      {/* Top decorative line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent"></div>
      
      <div className="container px-4 sm:px-6 lg:px-8 mx-[12px]">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 py-12 lg:py-16 pl-[10px]">
          {/* Brand Section */}
          <div className="space-y-4 lg:space-y-6">
            <div className="flex items-center space-x-2">
              
              
            </div>
            <p className="text-sm leading-relaxed sm:text-xl font-sans text-green-400 text-center">
              



Turtle
Trend ayakkabı ve spor giyim koleksiyonlarıyla stilinizi yansıtın. Kalite ve konfor bir arada.
2025 - Tüm Haklar SAklıdır        




            </p>
            <div className="flex gap-3">
              
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="group">
                
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="group">
                
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            
            <ul className="space-y-2.5">
              {[{
              to: "/products",
              label: "Tüm Ürünler"
            }, {
              to: "/faq",
              label: "Sık Sorulan Sorular"
            }, {
              to: "/contact",
              label: "İletişim"
            }, {
              to: "/profile",
              label: "Hesabım"
            }].map(link => <li key={link.to}>
                  
                </li>)}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg text-foreground flex items-center gap-2 my-0 text-left font-extrabold">
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
                  <a className="hover:text-primary transition-colors" href="mailto:-">
                    -
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3 text-sm sm:text-base text-muted-foreground group">
                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Phone className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Telefon</p>
                  <a className="hover:text-primary transition-colors" href="tel:-">
                    -
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3 text-sm sm:text-base text-muted-foreground group">
                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Adres</p>
                  <p className="text-sm">Ankara, Türkiye</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border/40 py-6 lg:py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            
            
          </div>
        </div>
      </div>

      {/* Bottom decorative gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-purple-500 to-pink-500 opacity-50"></div>
    </footer>;
};
export default Footer;