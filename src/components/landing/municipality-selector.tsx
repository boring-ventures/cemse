"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { MapPin, ExternalLink, Globe, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MunicipalitySelectorProps {
  onMunicipalityChange: (municipality: string) => void;
  initialMunicipality?: string;
  showOnLoad?: boolean;
  delay?: number;
}

interface Municipality {
  id: string;
  name: string;
  description: string;
  color: string;
  gradient: string;
  bgGradient: string;
  accentColor: string;
  borderColor: string;
  bgColor: string;
  textColor: string;
  hoverColor: string;
  website: string;
  population?: string;
  area?: string;
}

const municipalities: Municipality[] = [
  {
    id: "cercado",
    name: "Cercado",
    description: "Centro urbano principal de Cochabamba",
    color: "purple",
    gradient: "from-purple-600 to-purple-700",
    bgGradient: "from-purple-50 to-purple-100",
    accentColor: "purple",
    borderColor: "border-purple-500",
    bgColor: "bg-purple-50",
    textColor: "text-purple-700",
    hoverColor: "hover:bg-purple-50",
    website: "https://cochabamba.bo/",
    population: "630,587",
    area: "391 km²",
  },
  {
    id: "quillacollo",
    name: "Quillacollo",
    description: "Municipio histórico y comercial",
    color: "blue",
    gradient: "from-blue-800 to-blue-900",
    bgGradient: "from-blue-50 to-blue-100",
    accentColor: "blue",
    borderColor: "border-blue-500",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    hoverColor: "hover:bg-blue-50",
    website: "http://www.quillacollo.gob.bo/",
    population: "137,182",
    area: "720 km²",
  },
  {
    id: "sacaba",
    name: "Sacaba",
    description: "Municipio en crecimiento y desarrollo",
    color: "sky",
    gradient: "from-sky-400 to-sky-500",
    bgGradient: "from-sky-50 to-sky-100",
    accentColor: "sky",
    borderColor: "border-sky-500",
    bgColor: "bg-sky-50",
    textColor: "text-sky-700",
    hoverColor: "hover:bg-sky-50",
    website: "https://www.sacaba.gob.bo/",
    population: "172,466",
    area: "1,650 km²",
  },
  {
    id: "tiquipaya",
    name: "Tiquipaya",
    description: "Municipio con enfoque en desarrollo sostenible",
    color: "cyan",
    gradient: "from-cyan-400 to-cyan-500",
    bgGradient: "from-cyan-50 to-cyan-100",
    accentColor: "cyan",
    borderColor: "border-cyan-500",
    bgColor: "bg-cyan-50",
    textColor: "text-cyan-700",
    hoverColor: "hover:bg-cyan-50",
    website: "https://www.facebook.com/ConcejoMunicipalTiquipaya/?locale=es_LA",
    population: "53,062",
    area: "384 km²",
  },
];

export function MunicipalitySelector({
  onMunicipalityChange,
  initialMunicipality = "cercado",
  showOnLoad = true,
  delay = 1000,
}: MunicipalitySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMunicipality, setSelectedMunicipality] =
    useState(initialMunicipality);
  const [isLoading, setIsLoading] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    if (showOnLoad && !hasInteracted) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [showOnLoad, delay, hasInteracted]);

  const handleMunicipalitySelect = async (municipalityId: string) => {
    if (municipalityId === selectedMunicipality) {
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    setSelectedMunicipality(municipalityId);
    setHasInteracted(true);

    try {
      // Simulate API call or state update
      await new Promise((resolve) => setTimeout(resolve, 300));
      onMunicipalityChange(municipalityId);
    } catch (error) {
      console.error("Error changing municipality:", error);
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  const handleWebsiteClick = (website: string, event: React.MouseEvent) => {
    event.stopPropagation();
    window.open(website, "_blank", "noopener,noreferrer");
  };

  const getMunicipalityData = (id: string): Municipality => {
    return municipalities.find((m) => m.id === id) || municipalities[0];
  };

  const currentMunicipality = getMunicipalityData(selectedMunicipality);

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3 },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.3,
      },
    }),
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="max-w-lg p-0 overflow-hidden">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="relative"
              >
                <DialogHeader className="px-6 pt-6 pb-4 bg-gradient-to-r from-gray-50 to-gray-100">
                  <DialogTitle className="text-center text-2xl font-bold text-gray-900">
                    Selecciona tu Municipio
                  </DialogTitle>
                  <DialogDescription className="text-center text-gray-600 mt-2">
                    Elige tu municipio para personalizar la experiencia y ver
                    contenido relevante para tu área
                  </DialogDescription>
                </DialogHeader>

                <div className="px-6 py-4 space-y-3 max-h-96 overflow-y-auto">
                  {municipalities.map((municipality, index) => (
                    <motion.div
                      key={municipality.id}
                      custom={index}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <Button
                        variant="outline"
                        className={`w-full h-auto p-4 flex flex-col items-start space-y-3 hover:shadow-lg transition-all duration-200 group relative overflow-hidden ${
                          selectedMunicipality === municipality.id
                            ? `${municipality.borderColor} ${municipality.bgColor} shadow-md`
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() =>
                          handleMunicipalitySelect(municipality.id)
                        }
                        disabled={isLoading}
                      >
                        {/* Selection indicator */}
                        {selectedMunicipality === municipality.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className={`absolute top-3 right-3 w-6 h-6 rounded-full ${municipality.bgColor} ${municipality.borderColor} border-2 flex items-center justify-center`}
                          >
                            <CheckCircle2
                              className={`w-4 h-4 ${municipality.textColor}`}
                            />
                          </motion.div>
                        )}

                        <div className="flex items-start space-x-4 w-full">
                          <div
                            className={`w-12 h-12 rounded-full bg-gradient-to-r ${municipality.gradient} flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-200`}
                          >
                            <MapPin className="w-6 h-6 text-white" />
                          </div>

                          <div className="flex-1 text-left min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-semibold text-gray-900 truncate">
                                {municipality.name}
                              </h3>
                              {selectedMunicipality === municipality.id && (
                                <Badge
                                  variant="secondary"
                                  className={`${municipality.textColor} ${municipality.bgColor}`}
                                >
                                  Seleccionado
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {municipality.description}
                            </p>

                            {/* Additional info */}
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              {municipality.population && (
                                <span className="flex items-center space-x-1">
                                  <Globe className="w-3 h-3" />
                                  <span>{municipality.population} hab.</span>
                                </span>
                              )}
                              {municipality.area && (
                                <span>{municipality.area}</span>
                              )}
                            </div>
                          </div>

                          {municipality.website && (
                            <button
                              onClick={(e) =>
                                handleWebsiteClick(municipality.website, e)
                              }
                              className={`p-2 rounded-full transition-all duration-200 ${
                                selectedMunicipality === municipality.id
                                  ? `${municipality.textColor} ${municipality.bgColor}`
                                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                              }`}
                              title={`Visitar sitio web de ${municipality.name}`}
                              aria-label={`Visitar sitio web de ${municipality.name}`}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </Button>
                    </motion.div>
                  ))}
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t">
                  <p className="text-sm text-gray-500 text-center">
                    Puedes cambiar esta selección en cualquier momento desde el
                    botón flotante
                  </p>
                </div>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* Floating button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.3 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          variant="outline"
          size="sm"
          className={`bg-white/95 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-200 ${currentMunicipality.borderColor} ${currentMunicipality.textColor} ${currentMunicipality.hoverColor} group`}
          onClick={() => {
            setIsOpen(true);
            setHasInteracted(true);
          }}
          disabled={isLoading}
        >
          <MapPin className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
          <span className="font-medium">{currentMunicipality.name}</span>
          {isLoading && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="ml-2 w-4 h-4 border-2 border-current border-t-transparent rounded-full"
            />
          )}
        </Button>
      </motion.div>
    </>
  );
}
