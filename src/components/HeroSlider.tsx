import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SliderItem {
  id: string;
  title: string;
  description: string;
  image_url: string;
  button_text: string | null;
  button_link: string | null;
}

const HeroSlider = () => {
  const [slides, setSlides] = useState<SliderItem[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      const { data, error } = await supabase
        .from("slider_items")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      setSlides(data || []);
    } catch (error) {
      console.error("Error fetching slides:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (slides.length === 0) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  if (isLoading) {
    return (
      <div className="relative h-[500px] bg-muted animate-pulse rounded-lg" />
    );
  }

  if (slides.length === 0) {
    return null;
  }

  const slide = slides[currentSlide];

  return (
    <div className="relative h-[600px] overflow-hidden rounded-2xl shadow-2xl group">
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 group-hover:scale-105"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.6), rgba(0,0,0,0.3)), url(${slide.image_url})`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
        <div className="container mx-auto h-full flex items-center px-4 relative z-10">
          <div className="max-w-3xl animate-fade-in">
            <div className="inline-block mb-4 px-4 py-2 bg-primary/20 backdrop-blur-md border border-primary/30 rounded-full">
              <span className="text-primary font-bold text-sm tracking-wider uppercase">Yeni Sezon</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-bold mb-6 text-foreground drop-shadow-2xl leading-tight">
              {slide.title}
            </h1>
            <p className="text-xl md:text-3xl mb-10 text-foreground/90 font-medium leading-relaxed drop-shadow-lg">
              {slide.description}
            </p>
            {slide.button_text && slide.button_link && (
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground border-0 text-lg px-8 py-6 shadow-2xl hover:shadow-primary/50 hover:scale-105 transition-all duration-300 font-bold">
                {slide.button_text}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-6 top-1/2 -translate-y-1/2 bg-primary/90 hover:bg-primary backdrop-blur-md text-primary-foreground p-4 rounded-full transition-all duration-300 hover:scale-110 shadow-lg z-20"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-6 top-1/2 -translate-y-1/2 bg-primary/90 hover:bg-primary backdrop-blur-md text-primary-foreground p-4 rounded-full transition-all duration-300 hover:scale-110 shadow-lg z-20"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3 z-20">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? "bg-primary w-12 shadow-lg shadow-primary/50"
                    : "bg-foreground/30 hover:bg-foreground/50 w-3"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default HeroSlider;
