import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ProductDetail from "./pages/ProductDetail";
import Products from "./pages/Products";
import Profile from "./pages/Profile";
import Cart from "./pages/Cart";
import Favorites from "./pages/Favorites";
import Notifications from "./pages/Notifications";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import Admin from "./pages/Admin";
import AdminProducts from "./pages/admin/Products";
import Brands from "./pages/admin/Brands";
import Sliders from "./pages/admin/Sliders";
import Users from "./pages/admin/Users";
import Reviews from "./pages/admin/Reviews";
import SendNotification from "./pages/admin/SendNotification";
import Settings from "./pages/admin/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/products" element={<Products />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/brands" element={<Brands />} />
            <Route path="/admin/sliders" element={<Sliders />} />
            <Route path="/admin/users" element={<Users />} />
            <Route path="/admin/reviews" element={<Reviews />} />
            <Route path="/admin/notifications" element={<SendNotification />} />
            <Route path="/admin/settings" element={<Settings />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
