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
    <div className="relative h-[500px] overflow-hidden rounded-lg shadow-card">
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-700"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${slide.image_url})`,
        }}
      >
        <div className="container mx-auto h-full flex items-center px-4">
          <div className="max-w-2xl text-white animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold mb-4">
              {slide.title}
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              {slide.description}
            </p>
            {slide.button_text && slide.button_link && (
              <Button size="lg" className="gradient-hero border-0">
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
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 rounded-full transition-smooth"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 rounded-full transition-smooth"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-smooth ${
                  index === currentSlide
                    ? "bg-white w-8"
                    : "bg-white/50 hover:bg-white/75"
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
