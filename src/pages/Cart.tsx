import Navbar from "@/components/Navbar";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

const Cart = () => {
  const { items, loading, updateQuantity, removeItem, total } = useCart();

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

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-foreground">Sepetiniz Boş</h1>
          <p className="text-muted-foreground mb-6 text-sm sm:text-base">
            Henüz sepetinize ürün eklemediniz.
          </p>
          <Link to="/">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground border-0 w-full sm:w-auto">Alışverişe Başla</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-foreground">Sepetim</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              return (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Link to={`/product/${item.product_id}`}>
                        <img
                          src={
                            item.products.product_images?.find(
                              (img) => img.is_primary
                            )?.image_url ||
                            item.products.product_images?.[0]?.image_url ||
                            "https://images.unsplash.com/photo-1542291026-7eec264c27ff"
                          }
                          alt={item.products.name}
                          className="w-full sm:w-24 h-48 sm:h-24 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                        />
                      </Link>
                      <div className="flex-1">
                        <Link to={`/product/${item.product_id}`}>
                          <h3 className="font-semibold hover:text-primary transition-colors cursor-pointer">{item.products.name}</h3>
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          Numara: {item.size}
                        </p>
                        <p className="text-lg font-bold mt-2 text-primary">
                          ₺{item.products.price.toLocaleString("tr-TR", {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-between">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.id)}
                          className="hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              updateQuantity(item.id, Math.max(1, item.quantity - 1))
                            }
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="text-xl font-bold">Sipariş Özeti</h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Ara Toplam</span>
                    <span>
                      ₺{total.toLocaleString("tr-TR", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kargo</span>
                    <span className="text-green-600">Ücretsiz</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Toplam</span>
                    <span>
                      ₺{total.toLocaleString("tr-TR", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
                <Button className="w-full gradient-hero border-0">
                  Siparişi Tamamla
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Cart;
