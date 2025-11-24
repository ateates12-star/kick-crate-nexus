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
      
      

      {/* Bottom decorative gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-purple-500 to-pink-500 opacity-50"></div>
    </footer>;
};
export default Footer;