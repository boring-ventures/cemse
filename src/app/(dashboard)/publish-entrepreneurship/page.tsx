"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  X,
  Plus,
  Info,
  Eye,
  Save,
  Send,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  Link as LinkIcon,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useCreateEntrepreneurship } from "@/hooks/useEntrepreneurshipApi";
import { useAuthContext } from "@/hooks/use-auth";
import { ImageUploadService } from "@/services/imageUpload.service";

interface EntrepreneurshipForm {
  basicInfo: {
    businessName: string;
    description: string;
    category: string;
    subcategory: string;
    location: string;
    foundedYear: string;
    website: string;
    socialMedia: {
      facebook: string;
      instagram: string;
      linkedin: string;
    };
    municipality: string;
    priceMin: string;
    priceMax: string;
  };
  services: {
    services: string[];
    priceRange: {
      min: number;
      max: number;
    };
    serviceDetails: string;
  };
  contact: {
    contactPerson: string;
    email: string;
    phone: string;
    whatsapp: string;
    preferredContact: string;
    availableHours: string;
  };
  media: {
    logo: File | null;
    images: File[];
    videos: string[];
  };
  visibility: {
    isPublic: boolean;
    allowDirectContact: boolean;
    showPricing: boolean;
    featured: boolean;
  };
}

export default function PublishEntrepreneurshipPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuthContext();
  const { create, loading: createLoading } = useCreateEntrepreneurship();
  
  // Move all useState hooks to the top before any conditional returns
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<EntrepreneurshipForm>({
    basicInfo: {
      businessName: "",
      description: "",
      category: "",
      subcategory: "",
      location: "",
      foundedYear: "",
      website: "",
      socialMedia: {
        facebook: "",
        instagram: "",
        linkedin: "",
      },
      municipality: "",
      priceMin: "",
      priceMax: "",
    },
    services: {
      services: [],
      priceRange: { min: 0, max: 0 },
      serviceDetails: "",
    },
    contact: {
      contactPerson: "",
      email: "",
      phone: "",
      whatsapp: "",
      preferredContact: "",
      availableHours: "",
    },
    media: {
      logo: null,
      images: [],
      videos: [],
    },
    visibility: {
      isPublic: true,
      allowDirectContact: true,
      showPricing: true,
      featured: false,
    },
  });
  const [newService, setNewService] = useState("");
  const [previewMode, setPreviewMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedMunicipality, setSelectedMunicipality] = useState("");
  const [dragActive, setDragActive] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      toast({
        title: "Acceso requerido",
        description: "Debes iniciar sesión para publicar un emprendimiento",
        variant: "destructive",
      });
      router.push("/login");
    }
  }, [user, router, toast]);

  // Early returns after all hooks
  if (!user) {
    return null;
  }

  const steps = [
    {
      title: "Información Básica",
      description: "Datos principales de tu emprendimiento",
      icon: <Info className="h-5 w-5" />,
    },
    {
      title: "Servicios y Precios",
      description: "Qué ofreces y a qué precio",
      icon: <Plus className="h-5 w-5" />,
    },
    {
      title: "Información de Contacto",
      description: "Cómo pueden contactarte",
      icon: <LinkIcon className="h-5 w-5" />,
    },
    {
      title: "Imágenes y Videos",
      description: "Galería visual de tu emprendimiento",
      icon: <ImageIcon className="h-5 w-5" />,
    },
  ];

  const categories = [
    {
      value: "tecnologia",
      label: "Tecnología",
      subcategories: [
        "Desarrollo Web",
        "Apps Móviles",
        "Consultoría IT",
        "Diseño UX/UI",
      ],
    },
    {
      value: "ecommerce",
      label: "E-commerce",
      subcategories: [
        "Tienda Online",
        "Marketplace",
        "Dropshipping",
        "Servicios Digitales",
      ],
    },
    {
      value: "alimentacion",
      label: "Alimentación",
      subcategories: [
        "Delivery",
        "Catering",
        "Productos Artesanales",
        "Consultoría Nutricional",
      ],
    },
    {
      value: "educacion",
      label: "Educación",
      subcategories: [
        "Cursos Online",
        "Tutorías",
        "Capacitación Empresarial",
        "Material Educativo",
      ],
    },
    {
      value: "servicios",
      label: "Servicios",
      subcategories: [
        "Consultoría",
        "Marketing",
        "Diseño Gráfico",
        "Fotografía",
      ],
    },
    {
      value: "manufactura",
      label: "Manufactura",
      subcategories: [
        "Artesanías",
        "Textiles",
        "Productos Ecológicos",
        "Joyería",
      ],
    },
  ];

  const locations = [
    "La Paz",
    "Santa Cruz",
    "Cochabamba",
    "Oruro",
    "Potosí",
    "Sucre",
    "Tarija",
    "Beni",
    "Pando",
  ];

  const municipalitiesByCity: Record<string, string[]> = {
    "La Paz": ["Viacha", "El Alto", "Achocalla"],
    Cochabamba: ["Sacaba", "Quillacollo"],
    "Santa Cruz": ["Warnes", "Montero"],
    Oruro: ["Challapata"],
    Potosí: ["Uyuni"],
    Sucre: ["Yotala"],
    Tarija: ["Bermejo"],
    Beni: ["Trinidad"],
    Pando: ["Cobija"],
  };

  const updateFormData = (
    section: keyof EntrepreneurshipForm,
    field: string,
    value: unknown
  ) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const updateNestedFormData = (
    section: keyof EntrepreneurshipForm,
    subsection: string,
    field: string,
    value: unknown
  ) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...(prev[section] as any)[subsection],
          [field]: value,
        },
      },
    }));
  };

  const addService = () => {
    if (newService.trim()) {
      updateFormData("services", "services", [
        ...formData.services.services,
        newService.trim(),
      ]);
      setNewService("");
    }
  };

  const removeService = (index: number) => {
    const updatedServices = formData.services.services.filter(
      (_, i) => i !== index
    );
    updateFormData("services", "services", updatedServices);
  };

  const handleImageUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);
      if (files.length > 0) {
        // Validate file sizes
        const validFiles = files.filter(file => {
          if (file.size > 5 * 1024 * 1024) {
            toast({
              title: "Archivo muy grande",
              description: `${file.name} es mayor a 5MB`,
              variant: "destructive",
            });
            return false;
          }
          return true;
        });

        if (validFiles.length > 0) {
          // Limit to 10 images total
          const totalImages = formData.media.images.length + validFiles.length;
          if (totalImages > 10) {
            toast({
              title: "Demasiadas imágenes",
              description: "Máximo 10 imágenes permitidas",
              variant: "destructive",
            });
            return;
          }
          
          updateFormData("media", "images", [...formData.media.images, ...validFiles]);
        }
      }
    },
    [formData.media.images, toast]
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, type: 'logo' | 'images') => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length === 0) {
      toast({
        title: "Tipo de archivo no válido",
        description: "Solo se permiten archivos de imagen",
        variant: "destructive",
      });
      return;
    }

    if (type === 'logo') {
      const file = imageFiles[0];
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Archivo muy grande",
          description: "El logo debe ser menor a 5MB",
          variant: "destructive",
        });
        return;
      }
      updateFormData("media", "logo", file);
    } else {
      // Validate file sizes for multiple images
      const validFiles = imageFiles.filter(file => {
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: "Archivo muy grande",
            description: `${file.name} es mayor a 5MB`,
            variant: "destructive",
          });
          return false;
        }
        return true;
      });

      if (validFiles.length > 0) {
        // Limit to 10 images total
        const totalImages = formData.media.images.length + validFiles.length;
        if (totalImages > 10) {
          toast({
            title: "Demasiadas imágenes",
            description: "Máximo 10 imágenes permitidas",
            variant: "destructive",
          });
          return;
        }
        
        updateFormData("media", "images", [...formData.media.images, ...validFiles]);
      }
    }
  }, [formData.media.images, toast]);

  const removeImage = (index: number) => {
    const updatedImages = formData.media.images.filter((_, i) => i !== index);
    updateFormData("media", "images", updatedImages);
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const selectedCategory = categories.find(
    (cat) => cat.value === formData.basicInfo.category
  );

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return (
          formData.basicInfo.businessName &&
          formData.basicInfo.description &&
          formData.basicInfo.category &&
          formData.basicInfo.location &&
          formData.basicInfo.municipality
        );
      case 1:
        return formData.services.services.length > 0;
      case 2:
        return (
          formData.contact.contactPerson &&
          formData.contact.email &&
          formData.contact.phone
        );
      case 3:
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para publicar un emprendimiento",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // Upload images first if they exist
      let logoUrl: string | undefined;
      let imageUrls: string[] = [];

      if (formData.media.logo) {
        try {
          const logoResult = await ImageUploadService.uploadLogo(formData.media.logo);
          logoUrl = logoResult.logoUrl;
        } catch (error) {
          console.error('Error uploading logo:', error);
          toast({
            title: "Error al subir logo",
            description: "No se pudo subir el logo. Intenta nuevamente.",
            variant: "destructive",
          });
          return;
        }
      }

      if (formData.media.images.length > 0) {
        try {
          const imagesResult = await ImageUploadService.uploadImages(formData.media.images);
          imageUrls = imagesResult.map((img: { imageUrl: string; filename: string }) => img.imageUrl);
        } catch (error) {
          console.error('Error uploading images:', error);
          toast({
            title: "Error al subir imágenes",
            description: "No se pudieron subir las imágenes. Intenta nuevamente.",
            variant: "destructive",
          });
          return;
        }
      }

      // Prepare data for API according to the backend specification
      const entrepreneurshipData = {
        name: formData.basicInfo.businessName,
        description: formData.basicInfo.description,
        category: formData.basicInfo.category,
        subcategory: formData.basicInfo.subcategory || undefined,
        businessStage: "IDEA" as const, // Default stage
        municipality: formData.basicInfo.municipality,
        department: "Cochabamba", // Default department
        logo: logoUrl,
        images: imageUrls,
        website: formData.basicInfo.website || undefined,
        email: formData.contact.email,
        phone: formData.contact.phone,
        address: formData.basicInfo.location,
        socialMedia: {
          facebook: formData.basicInfo.socialMedia.facebook || undefined,
          instagram: formData.basicInfo.socialMedia.instagram || undefined,
          linkedin: formData.basicInfo.socialMedia.linkedin || undefined,
        },
        founded: formData.basicInfo.foundedYear
          ? new Date(parseInt(formData.basicInfo.foundedYear), 0, 1)
          : undefined,
        businessModel: formData.services.serviceDetails || undefined,
        targetMarket: "General", // Default target market
        isPublic: formData.visibility.isPublic,
        // Additional fields from the form
        employees: undefined, // Could be added to form later
        annualRevenue: undefined, // Could be added to form later
      };

      console.log("Submitting entrepreneurship data:", entrepreneurshipData);
      console.log("User ID:", user.id);

      await create(entrepreneurshipData);

      toast({
        title: "¡Éxito!",
        description: "Tu emprendimiento ha sido publicado exitosamente",
      });

      // Reset form
      setFormData({
        basicInfo: {
          businessName: "",
          description: "",
          category: "",
          subcategory: "",
          location: "",
          foundedYear: "",
          website: "",
          socialMedia: {
            facebook: "",
            instagram: "",
            linkedin: "",
          },
          municipality: "",
          priceMin: "",
          priceMax: "",
        },
        services: {
          services: [],
          priceRange: { min: 0, max: 0 },
          serviceDetails: "",
        },
        contact: {
          contactPerson: "",
          email: "",
          phone: "",
          whatsapp: "",
          preferredContact: "",
          availableHours: "",
        },
        media: {
          logo: null,
          images: [],
          videos: [],
        },
        visibility: {
          isPublic: true,
          allowDirectContact: true,
          showPricing: true,
          featured: false,
        },
      });

      // Redirect to my entrepreneurships
      router.push("/my-entrepreneurships");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description:
          "No se pudo publicar el emprendimiento. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (previewMode) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Vista Previa</h1>
          <Button variant="outline" onClick={() => setPreviewMode(false)}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Volver a Editar
          </Button>
        </div>

        <Card className="overflow-hidden">
          <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-700">
                {formData.basicInfo.businessName}
              </h2>
              <p className="text-gray-500">{formData.basicInfo.category}</p>
            </div>
          </div>

          <CardContent className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  {formData.basicInfo.businessName}
                </h3>
                <p className="text-muted-foreground">
                  {formData.basicInfo.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Servicios</h4>
                  <div className="flex flex-wrap gap-2">
                    {formData.services.services.map((service, index) => (
                      <Badge key={index} variant="secondary">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Rango de Precios</h4>
                  <p>
                    Bs. {formData.basicInfo.priceMin} - Bs.{" "}
                    {formData.basicInfo.priceMax}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Ubicación</h4>
                  <p>{formData.basicInfo.location}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Contacto</h4>
                  <p>{formData.contact.contactPerson}</p>
                  <p className="text-sm text-muted-foreground">
                    {formData.contact.email}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formData.contact.phone}
                  </p>
                  {formData.contact.availableHours && (
                    <p className="text-sm text-muted-foreground">
                      Horarios: {formData.contact.availableHours}
                    </p>
                  )}
                </div>
              </div>

              {formData.basicInfo.website && (
                <div>
                  <h4 className="font-semibold mb-2">Sitio Web</h4>
                  <a
                    href={formData.basicInfo.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {formData.basicInfo.website}
                  </a>
                </div>
              )}

              {Object.values(formData.basicInfo.socialMedia).some(
                (value) => value
              ) && (
                <div>
                  <h4 className="font-semibold mb-2">Redes Sociales</h4>
                  <div className="flex gap-4">
                    {formData.basicInfo.socialMedia.facebook && (
                      <a
                        href={`https://facebook.com/${formData.basicInfo.socialMedia.facebook}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Facebook
                      </a>
                    )}
                    {formData.basicInfo.socialMedia.instagram && (
                      <a
                        href={`https://instagram.com/${formData.basicInfo.socialMedia.instagram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-pink-600 hover:underline"
                      >
                        Instagram
                      </a>
                    )}
                    {formData.basicInfo.socialMedia.linkedin && (
                      <a
                        href={`https://linkedin.com/in/${formData.basicInfo.socialMedia.linkedin}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-700 hover:underline"
                      >
                        LinkedIn
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center mt-6">
          <Button size="lg">
            <Send className="h-4 w-4 mr-2" />
            Publicar Emprendimiento
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Publicar mi Emprendimiento</h1>
        <p className="text-muted-foreground">
          Comparte tu emprendimiento con la comunidad y conecta con clientes
          potenciales
        </p>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">
              Paso {currentStep + 1} de {steps.length}
            </h3>
            <span className="text-sm text-muted-foreground">
              {Math.round(progress)}% completado
            </span>
          </div>
          <Progress value={progress} className="mb-4" />

          <div className="flex items-center gap-2">
            {steps[currentStep].icon}
            <div>
              <h4 className="font-medium">{steps[currentStep].title}</h4>
              <p className="text-sm text-muted-foreground">
                {steps[currentStep].description}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          {/* Step 1: Basic Information */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <Tabs
                value={formData.basicInfo.category}
                onValueChange={(value: string) =>
                  updateFormData("basicInfo", "category", value)
                }
              >
                <TabsList>
                  {categories.map((category) => (
                    <TabsTrigger key={category.value} value={category.value}>
                      {category.label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value="tecnologia">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nombre del Emprendimiento *</Label>
                        <Input
                          value={formData.basicInfo.businessName}
                          onChange={(e) =>
                            updateFormData(
                              "basicInfo",
                              "businessName",
                              e.target.value
                            )
                          }
                          placeholder="Ej: EcoTech Bolivia"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Año de Fundación</Label>
                        <Input
                          type="number"
                          value={formData.basicInfo.foundedYear}
                          onChange={(e) =>
                            updateFormData(
                              "basicInfo",
                              "foundedYear",
                              e.target.value
                            )
                          }
                          placeholder="2024"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Descripción *</Label>
                      <Textarea
                        value={formData.basicInfo.description}
                        onChange={(e) =>
                          updateFormData(
                            "basicInfo",
                            "description",
                            e.target.value
                          )
                        }
                        placeholder="Describe tu emprendimiento, qué hace, cuál es su propósito..."
                        className="min-h-[120px]"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Categoría *</Label>
                        <Select
                          value={formData.basicInfo.category}
                          onValueChange={(value) =>
                            updateFormData("basicInfo", "category", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una categoría" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem
                                key={category.value}
                                value={category.value}
                              >
                                {category.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Subcategoría</Label>
                        <Select
                          value={formData.basicInfo.subcategory}
                          onValueChange={(value) =>
                            updateFormData("basicInfo", "subcategory", value)
                          }
                          disabled={!selectedCategory}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una subcategoría" />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedCategory?.subcategories.map(
                              (subcategory) => (
                                <SelectItem
                                  key={subcategory}
                                  value={subcategory}
                                >
                                  {subcategory}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Ubicación *</Label>
                        <Select
                          value={formData.basicInfo.location}
                          onValueChange={(value) => {
                            updateFormData("basicInfo", "location", value);
                            setSelectedMunicipality("");
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona tu ubicación" />
                          </SelectTrigger>
                          <SelectContent>
                            {locations.map((location) => (
                              <SelectItem key={location} value={location}>
                                {location}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Municipio *</Label>
                        <Select
                          value={selectedMunicipality}
                          onValueChange={(value) => {
                            setSelectedMunicipality(value);
                            updateFormData("basicInfo", "municipality", value);
                          }}
                          disabled={!formData.basicInfo.location}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un municipio" />
                          </SelectTrigger>
                          <SelectContent>
                            {(
                              municipalitiesByCity[
                                formData.basicInfo.location
                              ] || []
                            ).map((muni) => (
                              <SelectItem key={muni} value={muni}>
                                {muni}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Sitio Web</Label>
                      <Input
                        type="url"
                        value={formData.basicInfo.website}
                        onChange={(e) =>
                          updateFormData("basicInfo", "website", e.target.value)
                        }
                        placeholder="https://miemprendimiento.com"
                      />
                    </div>

                    <div className="space-y-4">
                      <Label>Redes Sociales</Label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm">Facebook</Label>
                          <Input
                            value={formData.basicInfo.socialMedia.facebook}
                            onChange={(e) =>
                              updateNestedFormData(
                                "basicInfo",
                                "socialMedia",
                                "facebook",
                                e.target.value
                              )
                            }
                            placeholder="@mi-emprendimiento"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">Instagram</Label>
                          <Input
                            value={formData.basicInfo.socialMedia.instagram}
                            onChange={(e) =>
                              updateNestedFormData(
                                "basicInfo",
                                "socialMedia",
                                "instagram",
                                e.target.value
                              )
                            }
                            placeholder="@mi-emprendimiento"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">LinkedIn</Label>
                          <Input
                            value={formData.basicInfo.socialMedia.linkedin}
                            onChange={(e) =>
                              updateNestedFormData(
                                "basicInfo",
                                "socialMedia",
                                "linkedin",
                                e.target.value
                              )
                            }
                            placeholder="mi-emprendimiento"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="ecommerce">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nombre del Emprendimiento *</Label>
                        <Input
                          value={formData.basicInfo.businessName}
                          onChange={(e) =>
                            updateFormData(
                              "basicInfo",
                              "businessName",
                              e.target.value
                            )
                          }
                          placeholder="Ej: Mi Tienda Online"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Año de Fundación</Label>
                        <Input
                          type="number"
                          value={formData.basicInfo.foundedYear}
                          onChange={(e) =>
                            updateFormData(
                              "basicInfo",
                              "foundedYear",
                              e.target.value
                            )
                          }
                          placeholder="2024"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Descripción *</Label>
                      <Textarea
                        value={formData.basicInfo.description}
                        onChange={(e) =>
                          updateFormData(
                            "basicInfo",
                            "description",
                            e.target.value
                          )
                        }
                        placeholder="Describe tu emprendimiento, qué hace, cuál es su propósito..."
                        className="min-h-[120px]"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Categoría *</Label>
                        <Select
                          value={formData.basicInfo.category}
                          onValueChange={(value) =>
                            updateFormData("basicInfo", "category", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una categoría" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem
                                key={category.value}
                                value={category.value}
                              >
                                {category.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Subcategoría</Label>
                        <Select
                          value={formData.basicInfo.subcategory}
                          onValueChange={(value) =>
                            updateFormData("basicInfo", "subcategory", value)
                          }
                          disabled={!selectedCategory}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una subcategoría" />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedCategory?.subcategories.map(
                              (subcategory) => (
                                <SelectItem
                                  key={subcategory}
                                  value={subcategory}
                                >
                                  {subcategory}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Ubicación *</Label>
                        <Select
                          value={formData.basicInfo.location}
                          onValueChange={(value) => {
                            updateFormData("basicInfo", "location", value);
                            setSelectedMunicipality("");
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona tu ubicación" />
                          </SelectTrigger>
                          <SelectContent>
                            {locations.map((location) => (
                              <SelectItem key={location} value={location}>
                                {location}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Municipio *</Label>
                        <Select
                          value={selectedMunicipality}
                          onValueChange={(value) => {
                            setSelectedMunicipality(value);
                            updateFormData("basicInfo", "municipality", value);
                          }}
                          disabled={!formData.basicInfo.location}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un municipio" />
                          </SelectTrigger>
                          <SelectContent>
                            {(
                              municipalitiesByCity[
                                formData.basicInfo.location
                              ] || []
                            ).map((muni) => (
                              <SelectItem key={muni} value={muni}>
                                {muni}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="alimentacion">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nombre del Emprendimiento *</Label>
                        <Input
                          value={formData.basicInfo.businessName}
                          onChange={(e) =>
                            updateFormData(
                              "basicInfo",
                              "businessName",
                              e.target.value
                            )
                          }
                          placeholder="Ej: Mi Restaurante"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Año de Fundación</Label>
                        <Input
                          type="number"
                          value={formData.basicInfo.foundedYear}
                          onChange={(e) =>
                            updateFormData(
                              "basicInfo",
                              "foundedYear",
                              e.target.value
                            )
                          }
                          placeholder="2024"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Descripción *</Label>
                      <Textarea
                        value={formData.basicInfo.description}
                        onChange={(e) =>
                          updateFormData(
                            "basicInfo",
                            "description",
                            e.target.value
                          )
                        }
                        placeholder="Describe tu emprendimiento, qué hace, cuál es su propósito..."
                        className="min-h-[120px]"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Categoría *</Label>
                        <Select
                          value={formData.basicInfo.category}
                          onValueChange={(value) =>
                            updateFormData("basicInfo", "category", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una categoría" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem
                                key={category.value}
                                value={category.value}
                              >
                                {category.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Subcategoría</Label>
                        <Select
                          value={formData.basicInfo.subcategory}
                          onValueChange={(value) =>
                            updateFormData("basicInfo", "subcategory", value)
                          }
                          disabled={!selectedCategory}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una subcategoría" />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedCategory?.subcategories.map(
                              (subcategory) => (
                                <SelectItem
                                  key={subcategory}
                                  value={subcategory}
                                >
                                  {subcategory}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Ubicación *</Label>
                        <Select
                          value={formData.basicInfo.location}
                          onValueChange={(value) => {
                            updateFormData("basicInfo", "location", value);
                            setSelectedMunicipality("");
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona tu ubicación" />
                          </SelectTrigger>
                          <SelectContent>
                            {locations.map((location) => (
                              <SelectItem key={location} value={location}>
                                {location}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Municipio *</Label>
                        <Select
                          value={selectedMunicipality}
                          onValueChange={(value) => {
                            setSelectedMunicipality(value);
                            updateFormData("basicInfo", "municipality", value);
                          }}
                          disabled={!formData.basicInfo.location}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un municipio" />
                          </SelectTrigger>
                          <SelectContent>
                            {(
                              municipalitiesByCity[
                                formData.basicInfo.location
                              ] || []
                            ).map((muni) => (
                              <SelectItem key={muni} value={muni}>
                                {muni}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="educacion">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nombre del Emprendimiento *</Label>
                        <Input
                          value={formData.basicInfo.businessName}
                          onChange={(e) =>
                            updateFormData(
                              "basicInfo",
                              "businessName",
                              e.target.value
                            )
                          }
                          placeholder="Ej: Mi Academia"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Año de Fundación</Label>
                        <Input
                          type="number"
                          value={formData.basicInfo.foundedYear}
                          onChange={(e) =>
                            updateFormData(
                              "basicInfo",
                              "foundedYear",
                              e.target.value
                            )
                          }
                          placeholder="2024"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Descripción *</Label>
                      <Textarea
                        value={formData.basicInfo.description}
                        onChange={(e) =>
                          updateFormData(
                            "basicInfo",
                            "description",
                            e.target.value
                          )
                        }
                        placeholder="Describe tu emprendimiento, qué hace, cuál es su propósito..."
                        className="min-h-[120px]"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Categoría *</Label>
                        <Select
                          value={formData.basicInfo.category}
                          onValueChange={(value) =>
                            updateFormData("basicInfo", "category", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una categoría" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem
                                key={category.value}
                                value={category.value}
                              >
                                {category.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Subcategoría</Label>
                        <Select
                          value={formData.basicInfo.subcategory}
                          onValueChange={(value) =>
                            updateFormData("basicInfo", "subcategory", value)
                          }
                          disabled={!selectedCategory}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una subcategoría" />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedCategory?.subcategories.map(
                              (subcategory) => (
                                <SelectItem
                                  key={subcategory}
                                  value={subcategory}
                                >
                                  {subcategory}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Ubicación *</Label>
                        <Select
                          value={formData.basicInfo.location}
                          onValueChange={(value) => {
                            updateFormData("basicInfo", "location", value);
                            setSelectedMunicipality("");
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona tu ubicación" />
                          </SelectTrigger>
                          <SelectContent>
                            {locations.map((location) => (
                              <SelectItem key={location} value={location}>
                                {location}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Municipio *</Label>
                        <Select
                          value={selectedMunicipality}
                          onValueChange={(value) => {
                            setSelectedMunicipality(value);
                            updateFormData("basicInfo", "municipality", value);
                          }}
                          disabled={!formData.basicInfo.location}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un municipio" />
                          </SelectTrigger>
                          <SelectContent>
                            {(
                              municipalitiesByCity[
                                formData.basicInfo.location
                              ] || []
                            ).map((muni) => (
                              <SelectItem key={muni} value={muni}>
                                {muni}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="servicios">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nombre del Emprendimiento *</Label>
                        <Input
                          value={formData.basicInfo.businessName}
                          onChange={(e) =>
                            updateFormData(
                              "basicInfo",
                              "businessName",
                              e.target.value
                            )
                          }
                          placeholder="Ej: Mi Consultoría"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Año de Fundación</Label>
                        <Input
                          type="number"
                          value={formData.basicInfo.foundedYear}
                          onChange={(e) =>
                            updateFormData(
                              "basicInfo",
                              "foundedYear",
                              e.target.value
                            )
                          }
                          placeholder="2024"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Descripción *</Label>
                      <Textarea
                        value={formData.basicInfo.description}
                        onChange={(e) =>
                          updateFormData(
                            "basicInfo",
                            "description",
                            e.target.value
                          )
                        }
                        placeholder="Describe tu emprendimiento, qué hace, cuál es su propósito..."
                        className="min-h-[120px]"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Categoría *</Label>
                        <Select
                          value={formData.basicInfo.category}
                          onValueChange={(value) =>
                            updateFormData("basicInfo", "category", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una categoría" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem
                                key={category.value}
                                value={category.value}
                              >
                                {category.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Subcategoría</Label>
                        <Select
                          value={formData.basicInfo.subcategory}
                          onValueChange={(value) =>
                            updateFormData("basicInfo", "subcategory", value)
                          }
                          disabled={!selectedCategory}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una subcategoría" />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedCategory?.subcategories.map(
                              (subcategory) => (
                                <SelectItem
                                  key={subcategory}
                                  value={subcategory}
                                >
                                  {subcategory}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Ubicación *</Label>
                        <Select
                          value={formData.basicInfo.location}
                          onValueChange={(value) => {
                            updateFormData("basicInfo", "location", value);
                            setSelectedMunicipality("");
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona tu ubicación" />
                          </SelectTrigger>
                          <SelectContent>
                            {locations.map((location) => (
                              <SelectItem key={location} value={location}>
                                {location}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Municipio *</Label>
                        <Select
                          value={selectedMunicipality}
                          onValueChange={(value) => {
                            setSelectedMunicipality(value);
                            updateFormData("basicInfo", "municipality", value);
                          }}
                          disabled={!formData.basicInfo.location}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un municipio" />
                          </SelectTrigger>
                          <SelectContent>
                            {(
                              municipalitiesByCity[
                                formData.basicInfo.location
                              ] || []
                            ).map((muni) => (
                              <SelectItem key={muni} value={muni}>
                                {muni}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="manufactura">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nombre del Emprendimiento *</Label>
                        <Input
                          value={formData.basicInfo.businessName}
                          onChange={(e) =>
                            updateFormData(
                              "basicInfo",
                              "businessName",
                              e.target.value
                            )
                          }
                          placeholder="Ej: Mi Taller"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Año de Fundación</Label>
                        <Input
                          type="number"
                          value={formData.basicInfo.foundedYear}
                          onChange={(e) =>
                            updateFormData(
                              "basicInfo",
                              "foundedYear",
                              e.target.value
                            )
                          }
                          placeholder="2024"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Descripción *</Label>
                      <Textarea
                        value={formData.basicInfo.description}
                        onChange={(e) =>
                          updateFormData(
                            "basicInfo",
                            "description",
                            e.target.value
                          )
                        }
                        placeholder="Describe tu emprendimiento, qué hace, cuál es su propósito..."
                        className="min-h-[120px]"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Categoría *</Label>
                        <Select
                          value={formData.basicInfo.category}
                          onValueChange={(value) =>
                            updateFormData("basicInfo", "category", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una categoría" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem
                                key={category.value}
                                value={category.value}
                              >
                                {category.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Subcategoría</Label>
                        <Select
                          value={formData.basicInfo.subcategory}
                          onValueChange={(value) =>
                            updateFormData("basicInfo", "subcategory", value)
                          }
                          disabled={!selectedCategory}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una subcategoría" />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedCategory?.subcategories.map(
                              (subcategory) => (
                                <SelectItem
                                  key={subcategory}
                                  value={subcategory}
                                >
                                  {subcategory}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Ubicación *</Label>
                        <Select
                          value={formData.basicInfo.location}
                          onValueChange={(value) => {
                            updateFormData("basicInfo", "location", value);
                            setSelectedMunicipality("");
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona tu ubicación" />
                          </SelectTrigger>
                          <SelectContent>
                            {locations.map((location) => (
                              <SelectItem key={location} value={location}>
                                {location}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Municipio *</Label>
                        <Select
                          value={selectedMunicipality}
                          onValueChange={(value) => {
                            setSelectedMunicipality(value);
                            updateFormData("basicInfo", "municipality", value);
                          }}
                          disabled={!formData.basicInfo.location}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un municipio" />
                          </SelectTrigger>
                          <SelectContent>
                            {(
                              municipalitiesByCity[
                                formData.basicInfo.location
                              ] || []
                            ).map((muni) => (
                              <SelectItem key={muni} value={muni}>
                                {muni}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* Step 2: Services */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <Label>Servicios que Ofreces *</Label>
                <div className="flex gap-2">
                  <Input
                    value={newService}
                    onChange={(e) => setNewService(e.target.value)}
                    placeholder="Ej: Desarrollo de sitios web"
                    onKeyPress={(e) => e.key === "Enter" && addService()}
                  />
                  <Button onClick={addService} type="button">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.services.services.map((service, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {service}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeService(index)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Detalles de Servicios</Label>
                <Textarea
                  value={formData.services.serviceDetails}
                  onChange={(e) =>
                    updateFormData("services", "serviceDetails", e.target.value)
                  }
                  placeholder="Describe en detalle los servicios que ofreces, metodología, tiempos de entrega..."
                  className="min-h-[120px]"
                />
              </div>
            </div>
          )}

          {/* Contact Information Step */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Persona de Contacto *</Label>
                  <Input
                    value={formData.contact.contactPerson}
                    onChange={(e) =>
                      updateFormData("contact", "contactPerson", e.target.value)
                    }
                    placeholder="Tu nombre completo"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={formData.contact.email}
                    onChange={(e) =>
                      updateFormData("contact", "email", e.target.value)
                    }
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Teléfono *</Label>
                  <Input
                    value={formData.contact.phone}
                    onChange={(e) =>
                      updateFormData("contact", "phone", e.target.value)
                    }
                    placeholder="+591 70000000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>WhatsApp</Label>
                  <Input
                    value={formData.contact.whatsapp}
                    onChange={(e) =>
                      updateFormData("contact", "whatsapp", e.target.value)
                    }
                    placeholder="+591 70000000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Método de Contacto Preferido</Label>
                  <Select
                    value={formData.contact.preferredContact}
                    onValueChange={(value) =>
                      updateFormData("contact", "preferredContact", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tu preferencia" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="phone">Teléfono</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Horarios de Atención</Label>
                  <Input
                    value={formData.contact.availableHours}
                    onChange={(e) =>
                      updateFormData(
                        "contact",
                        "availableHours",
                        e.target.value
                      )
                    }
                    placeholder="Lunes a Viernes 9:00 - 18:00"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Media Step */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <Label>Logo del Emprendimiento</Label>
                <div 
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                    dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => document.getElementById('logo-upload')?.click()}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={(e) => handleDrop(e, 'logo')}
                >
                  {formData.media.logo ? (
                    <div className="relative">
                      <Image
                        src={URL.createObjectURL(formData.media.logo)}
                        alt="Logo preview"
                        width={120}
                        height={120}
                        className="mx-auto rounded-lg object-cover"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateFormData("media", "logo", null);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">
                        Arrastra tu logo aquí o haz clic para seleccionar
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Formatos: JPG, PNG, GIF (máx. 5MB)
                      </p>
                    </>
                  )}
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 5 * 1024 * 1024) {
                          toast({
                            title: "Archivo muy grande",
                            description: "El logo debe ser menor a 5MB",
                            variant: "destructive",
                          });
                          return;
                        }
                        updateFormData("media", "logo", file);
                      }
                    }}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label>Imágenes del Emprendimiento</Label>
                <div 
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                    dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => document.getElementById('images-upload')?.click()}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={(e) => handleDrop(e, 'images')}
                >
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">
                    Arrastra imágenes aquí o haz clic para seleccionar
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Formatos: JPG, PNG, GIF (máx. 5MB por imagen)
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    {formData.media.images.length}/10 imágenes seleccionadas
                  </p>
                  <input
                    id="images-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>
                {formData.media.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {formData.media.images.map((image, index) => (
                      <div key={index} className="relative">
                        <Image
                          src={URL.createObjectURL(image)}
                          alt={`Imagen ${index + 1}`}
                          width={200}
                          height={200}
                          className="rounded-lg object-cover"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setPreviewMode(true)}>
                <Eye className="h-4 w-4 mr-2" />
                Vista Previa
              </Button>

              <Button variant="outline">
                <Save className="h-4 w-4 mr-2" />
                Guardar Borrador
              </Button>

              {currentStep === steps.length - 1 ? (
                <Button
                  disabled={!isStepValid() || createLoading}
                  onClick={handleSubmit}
                >
                  {createLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Publicando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Publicar
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={() =>
                    setCurrentStep(Math.min(steps.length - 1, currentStep + 1))
                  }
                  disabled={!isStepValid()}
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
