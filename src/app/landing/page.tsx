"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Zap, ChevronLeft, ChevronRight } from "lucide-react";
import { EntrepreneurshipCarousel } from "@/components/landing/entrepreneurship-carousel";
import { MunicipalitySelector } from "@/components/landing/municipality-selector";
import { usePublicEntrepreneurships } from "@/hooks/useEntrepreneurshipApi";

// Imágenes del carrusel
const carouselImages = [
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=800&fit=crop&crop=center",
    alt: "Cristo de la Concordia al atardecer",
    title: "Developing Potential Market",
    description: "Cochabamba, Bolivia",
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=800&fit=crop&crop=center",
    alt: "Cristo de la Concordia de día",
    title: "Innovation Hub",
    description: "Centro de desarrollo tecnológico",
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=800&fit=crop&crop=center",
    alt: "Cristo de la Concordia de noche",
    title: "Future Leaders",
    description: "Formando líderes del mañana",
  },
];

// Configuración de colores por municipio
const municipalityColors = {
  cercado: {
    primary: "purple",
    gradient: "from-purple-600 to-purple-700",
    bgGradient: "from-purple-50 to-purple-100",
    accent: "purple",
    textGradient: "from-purple-600 to-purple-700",
    hoverBg: "hover:bg-purple-50",
    buttonGradient: "from-purple-600 to-purple-700",
    buttonHover: "hover:from-purple-700 hover:to-purple-800",
  },
  quillacollo: {
    primary: "blue",
    gradient: "from-blue-800 to-blue-900",
    bgGradient: "from-blue-50 to-blue-100",
    accent: "blue",
    textGradient: "from-blue-800 to-blue-900",
    hoverBg: "hover:bg-blue-50",
    buttonGradient: "from-blue-800 to-blue-900",
    buttonHover: "hover:from-blue-900 hover:to-blue-950",
  },
  sacaba: {
    primary: "sky",
    gradient: "from-sky-400 to-sky-500",
    bgGradient: "from-sky-50 to-sky-100",
    accent: "sky",
    textGradient: "from-sky-400 to-sky-500",
    hoverBg: "hover:bg-sky-50",
    buttonGradient: "from-sky-400 to-sky-500",
    buttonHover: "hover:from-sky-500 hover:to-sky-600",
  },
  tiquipaya: {
    primary: "cyan",
    gradient: "from-cyan-400 to-cyan-500",
    bgGradient: "from-cyan-50 to-cyan-100",
    accent: "cyan",
    textGradient: "from-cyan-400 to-cyan-500",
    hoverBg: "hover:bg-cyan-50",
    buttonGradient: "from-cyan-400 to-cyan-500",
    buttonHover: "hover:from-cyan-500 hover:to-cyan-600",
  },
};

export default function LandingPage() {
  const {
    data: entrepreneurships,
    loading,
    error,
  } = usePublicEntrepreneurships();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedMunicipality, setSelectedMunicipality] = useState("cercado");
  const [isPaused, setIsPaused] = useState(false);

  const colors =
    municipalityColors[selectedMunicipality as keyof typeof municipalityColors];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + carouselImages.length) % carouselImages.length
    );
  };

  const handleMunicipalityChange = (municipality: string) => {
    setSelectedMunicipality(municipality);
  };

  // Auto-play del carrusel
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPaused) {
        setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused, carouselImages.length]);

  // Pausar auto-play cuando el usuario interactúa con los controles
  const handleManualNavigation = (newIndex: number) => {
    setCurrentImageIndex(newIndex);
    setIsPaused(true);
    // Reiniciar auto-play después de 3 segundos de inactividad
    setTimeout(() => setIsPaused(false), 3000);
  };

  const handlePrevClick = () => {
    prevImage();
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 3000);
  };

  const handleNextClick = () => {
    nextImage();
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 3000);
  };

  const handleCarouselHover = () => {
    setIsPaused(true);
  };

  const handleCarouselLeave = () => {
    setIsPaused(false);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${colors.bgGradient}`}>
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div
              className={`w-8 h-8 bg-gradient-to-r ${colors.gradient} rounded-lg flex items-center justify-center`}
            >
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h1
              className={`text-xl font-bold bg-gradient-to-r ${colors.textGradient} bg-clip-text text-transparent`}
            >
              Cemse
            </h1>
          </div>
          <Link href="/login">
            <Button
              variant="outline"
              className={`${colors.hoverBg} bg-transparent`}
            >
              Iniciar Sesión
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section with Carousel */}
      <section
        className="relative h-screen flex items-center justify-center overflow-hidden"
        onMouseEnter={handleCarouselHover}
        onMouseLeave={handleCarouselLeave}
      >
        {/* Background Image Carousel */}
        <div className="absolute inset-0">
          {carouselImages.map((image, index) => (
            <div
              key={image.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentImageIndex ? "opacity-100" : "opacity-0"
              }`}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover"
                priority={index === 0}
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-black/30" />
            </div>
          ))}
        </div>

        {/* Carousel Controls */}
        <button
          onClick={handlePrevClick}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={handleNextClick}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-all"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Carousel Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
          {carouselImages.map((_, index) => (
            <button
              key={index}
              onClick={() => handleManualNavigation(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentImageIndex ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <Badge
            variant="secondary"
            className="mb-4 bg-white/20 backdrop-blur-sm text-white border-white/30"
          >
            🚀 Plataforma de Emprendimientos
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {carouselImages[currentImageIndex].title}
          </h1>
          <p className="text-xl mb-8 leading-relaxed text-white/90">
            {carouselImages[currentImageIndex].description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button
                size="lg"
                className={`bg-gradient-to-r ${colors.buttonGradient} ${colors.buttonHover} text-white px-8`}
              >
                Comenzar Ahora
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="px-8 bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
              >
                Ver Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* CARRUSEL Label */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="flex items-center space-x-2">
            <span className="text-white font-bold text-lg">CARRUSEL</span>
            {!isPaused && (
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <div
                  className="w-2 h-2 bg-white rounded-full animate-pulse"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-white rounded-full animate-pulse"
                  style={{ animationDelay: "0.4s" }}
                ></div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Emprendimientos Destacados */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Emprendimientos Destacados
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Conoce las startups más prometedoras creadas por jóvenes
              emprendedores
            </p>
          </div>

          <EntrepreneurshipCarousel
            entrepreneurships={entrepreneurships}
            loading={loading}
            error={error}
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-20 px-4 bg-gradient-to-r ${colors.gradient}`}>
        <div className="container mx-auto text-center max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            ¿Listo para Emprender?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Únete a nuestra plataforma y accede a herramientas exclusivas,
            networking y oportunidades de inversión.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button
                size="lg"
                variant="secondary"
                className="px-8 bg-white text-gray-900 hover:bg-gray-100"
              >
                Acceder a la Plataforma
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div
              className={`w-8 h-8 bg-gradient-to-r ${colors.gradient} rounded-lg flex items-center justify-center`}
            >
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold">Cemse</h3>
          </div>
          <p className="text-gray-400 mb-6">
            Conectando emprendedores con el futuro de la innovación
          </p>
          <Link href="/login">
            <Button
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
            >
              Iniciar Sesión
            </Button>
          </Link>
        </div>
      </footer>

      {/* Municipality Selector */}
      <MunicipalitySelector onMunicipalityChange={handleMunicipalityChange} />
    </div>
  );
}
