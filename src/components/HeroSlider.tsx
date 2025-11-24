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
    <div className="relative h-[500px] md:h-[600px] overflow-hidden rounded-2xl shadow-2xl group">
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-out"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.5), rgba(0,0,0,0.2)), url(${slide.image_url})`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-transparent" />
        <div className="container mx-auto h-full flex items-center px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-2xl lg:max-w-3xl animate-fade-in">
            <div className="inline-block mb-3 md:mb-4 px-3 md:px-4 py-1.5 md:py-2 bg-primary/20 backdrop-blur-md border border-primary/30 rounded-full">
              <span className="text-primary font-bold text-xs md:text-sm tracking-wider uppercase">Yeni Sezon</span>
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-4 md:mb-6 text-foreground drop-shadow-2xl leading-tight">
              {slide.title}
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl mb-6 md:mb-10 text-foreground/90 font-medium leading-relaxed drop-shadow-lg">
              {slide.description}
            </p>
            {slide.button_text && slide.button_link && (
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground border-0 text-sm md:text-base lg:text-lg px-6 md:px-8 py-4 md:py-6 shadow-2xl hover:shadow-primary/50 transition-all duration-300 font-bold">
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
            className="absolute left-2 sm:left-4 md:left-6 top-1/2 -translate-y-1/2 bg-primary/90 hover:bg-primary backdrop-blur-md text-primary-foreground p-2 sm:p-3 md:p-4 rounded-full transition-all duration-300 shadow-lg z-20"
          >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 sm:right-4 md:right-6 top-1/2 -translate-y-1/2 bg-primary/90 hover:bg-primary backdrop-blur-md text-primary-foreground p-2 sm:p-3 md:p-4 rounded-full transition-all duration-300 shadow-lg z-20"
          >
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex space-x-2 sm:space-x-3 z-20">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 sm:h-2.5 md:h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? "bg-primary w-8 sm:w-10 md:w-12 shadow-lg shadow-primary/50"
                    : "bg-foreground/30 hover:bg-foreground/50 w-2 sm:w-2.5 md:w-3"
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
