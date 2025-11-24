import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";

const FAQ = () => {
  const faqs = [
    {
      category: "Sipariş ve Teslimat",
      questions: [
        {
          q: "Sipariş nasıl veririm?",
          a: "Beğendiğiniz ürünü sepete ekleyin, beden seçimini yapın ve ödeme sayfasından siparişinizi tamamlayın. Kayıtlı üye olarak daha hızlı alışveriş yapabilirsiniz.",
        },
        {
          q: "Kargo ücreti ne kadar?",
          a: "Tüm siparişlerimizde kargo ücretsizdir. Türkiye'nin her yerine 2-3 iş günü içinde teslimat yapıyoruz.",
        },
        {
          q: "Siparişimi nasıl takip edebilirim?",
          a: "Profilim sayfasındaki 'Siparişlerim' bölümünden veya size gönderilen e-posta linki üzerinden kargo takip numaranızı kullanarak siparişinizi takip edebilirsiniz.",
        },
        {
          q: "Yurt dışına kargo gönderimi yapıyor musunuz?",
          a: "Şu anda sadece Türkiye içi teslimat yapmaktayız. Yakında uluslararası gönderim seçeneğimiz aktif olacaktır.",
        },
      ],
    },
    {
      category: "İade ve Değişim",
      questions: [
        {
          q: "İade politikanız nedir?",
          a: "Ürünlerinizi teslim aldığınız tarihten itibaren 14 gün içinde, kullanılmamış ve orijinal ambalajında iade edebilirsiniz. İade işleminiz onaylandıktan sonra 5-7 iş günü içinde ödeme iadesi yapılır.",
        },
        {
          q: "Ürün değişimi yapabilir miyim?",
          a: "Evet, beden veya model değişimi için müşteri hizmetlerimizle iletişime geçebilirsiniz. İlk ürün iade edildikten sonra yeni ürün kargolanır.",
        },
        {
          q: "İade kargo ücreti kim tarafından ödenir?",
          a: "Ayıplı veya hatalı ürünlerde iade kargo ücreti tarafımızca karşılanır. Cayma hakkı kullanımlarında iade kargo ücreti müşteriye aittir.",
        },
      ],
    },
    {
      category: "Ödeme",
      questions: [
        {
          q: "Hangi ödeme yöntemlerini kabul ediyorsunuz?",
          a: "Kredi kartı, banka kartı, havale/EFT ve kapıda ödeme seçeneklerimiz bulunmaktadır. Taksit seçenekleri için ödeme sayfasını kontrol edebilirsiniz.",
        },
        {
          q: "Taksit yapabilir miyim?",
          a: "Evet, seçili kredi kartlarıyla 2, 3, 6 ve 9 taksit seçenekleri sunuyoruz. Taksit imkanı ödeme sayfasında otomatik olarak gösterilir.",
        },
        {
          q: "Ödeme güvenli mi?",
          a: "Tüm ödemeleriniz 256-bit SSL sertifikası ile şifrelenir ve güvenli ödeme altyapımız üzerinden işlenir. Kart bilgileriniz hiçbir şekilde sistemimizde saklanmaz.",
        },
      ],
    },
    {
      category: "Ürün ve Stok",
      questions: [
        {
          q: "Ürünler orijinal mi?",
          a: "Tüm ürünlerimiz %100 orijinal ve yetkili distribütörlerden temin edilmektedir. Her ürün orijinallik sertifikası ile gönderilir.",
        },
        {
          q: "Stokta olmayan ürün ne zaman gelir?",
          a: "Stokta olmayan ürünler için 'Stok Bildirimi Al' butonunu kullanarak e-posta bildirimi alabilirsiniz. Genellikle 1-2 hafta içinde stoklarımız yenilenir.",
        },
        {
          q: "Beden tablosu nasıl kullanılır?",
          a: "Her ürün sayfasında detaylı beden tablosu bulunmaktadır. Ayakkabı numaranızı cm cinsinden ölçerek en uygun bedeni seçebilirsiniz. Tereddüt durumunda bir büyük beden almanızı öneririz.",
        },
      ],
    },
    {
      category: "Hesap ve Üyelik",
      questions: [
        {
          q: "Üyelik oluşturmak zorunlu mu?",
          a: "Hayır, üyeliksiz misafir kullanıcı olarak da alışveriş yapabilirsiniz. Ancak üye olarak daha hızlı alışveriş, sipariş takibi ve özel kampanyalardan faydalanabilirsiniz.",
        },
        {
          q: "Şifremi unuttum, ne yapmalıyım?",
          a: "Giriş sayfasındaki 'Şifremi Unuttum' linkine tıklayarak e-posta adresinize şifre sıfırlama linki gönderebilirsiniz.",
        },
        {
          q: "Hesabımı nasıl silerim?",
          a: "Hesap silme talebi için müşteri hizmetlerimizle iletişime geçmeniz gerekmektedir. Talebiniz 48 saat içinde işleme alınır.",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      <main className="container mx-auto px-4 py-8 sm:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Sık Sorulan Sorular
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-4">
            Aklınıza takılan soruların cevaplarını burada bulabilirsiniz.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {faqs.map((category, idx) => (
            <Card
              key={idx}
              className="backdrop-blur-sm bg-card/50 hover:shadow-elegant transition-smooth"
            >
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold mb-6 text-foreground">
                  {category.category}
                </h2>
                <Accordion type="single" collapsible className="w-full">
                  {category.questions.map((faq, qIdx) => (
                    <AccordionItem key={qIdx} value={`item-${idx}-${qIdx}`}>
                      <AccordionTrigger className="text-left text-foreground hover:text-primary transition-colors">
                        {faq.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-12 max-w-4xl mx-auto backdrop-blur-sm bg-card/50">
          <CardContent className="pt-6 text-center">
            <h3 className="text-xl font-bold mb-2">Sorunuz mu var?</h3>
            <p className="text-muted-foreground mb-4">
              Aradığınız sorunun cevabını bulamadıysanız, bizimle iletişime geçebilirsiniz.
            </p>
            <a href="/contact">
              <button className="gradient-hero border-0 px-6 py-2 rounded-md text-white font-semibold hover:scale-105 transition-smooth">
                İletişime Geç
              </button>
            </a>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
};

export default FAQ;
