"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Calculator,
  FileText,
  TrendingUp,
  DollarSign,
  PieChart,
  Target,
  Users,
  Lightbulb,
  Shield,
  Cog,
  Save,
  Download,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Leaf,
  Heart,
  HelpCircle,
  ExternalLink,
  Video,
} from "lucide-react";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useBusinessPlanSimulator } from "@/hooks/useBusinessPlanSimulator";

interface BusinessPlan {
  id?: string;
  entrepreneurshipId?: string;
  tripleImpactAssessment: {
    problemSolved: string;
    beneficiaries: string;
    resourcesUsed: string;
    communityInvolvement: string;
    longTermImpact: string;
  };
  executiveSummary: string;
  businessDescription: string;
  marketAnalysis: string;
  competitiveAnalysis: string;
  marketingPlan: string;
  operationalPlan: string;
  managementTeam: string;
  financialProjections: {
    startupCosts: number;
    monthlyRevenue: number;
    monthlyExpenses: number;
    breakEvenMonth: number;
    revenueStreams: string[];
  };
  riskAnalysis: string;
  appendices: string;
  completionPercentage?: number;
  isCompleted?: boolean;
  lastSection?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Interfaz para los datos que vienen del backend
interface BackendBusinessPlan {
  id: string;
  entrepreneurshipId: string;
  tripleImpactAssessment?: {
    problemSolved: string;
    beneficiaries: string;
    resourcesUsed: string;
    communityInvolvement: string;
    longTermImpact: string;
  };
  executiveSummary?: string;
  missionStatement?: string; // Maps to businessDescription in frontend
  visionStatement?: string;
  marketAnalysis?: string;
  competitiveAnalysis?: string;
  marketingStrategy?: string;
  operationalPlan?: string;
  managementTeam?: any; // JSON object
  initialInvestment?: any; // Decimal
  monthlyExpenses?: any; // Decimal
  breakEvenPoint?: number;
  revenueStreams?: string[];
  riskAnalysis?: string;
  businessModelCanvas?: any; // JSON object from backend
  completionPercentage?: number;
  isCompleted?: boolean;
  lastSection?: string;
  createdAt?: string;
  updatedAt?: string;
  costStructure?: {
    startupCosts: number;
    breakEvenMonth: number;
    monthlyExpenses: number;
  };
}

interface FinancialData {
  initialInvestment: number;
  monthlyRevenue: number;
  fixedCosts: number;
  variableCosts: number;
  projectionMonths: number;
}

export default function BusinessPlanSimulatorPage() {
  const {
    plans: businessPlans,
    loading,
    saveSimulatorData,
    calculateCompletion,
    analyzeTripleImpact: analyzeTripleImpactHook,
  } = useBusinessPlanSimulator();
  const [currentStep, setCurrentStep] = useState(0);
  const [impacts, setImpacts] = useState({
    economic: false,
    social: false,
    environmental: false,
  });

  const [businessPlan, setBusinessPlan] = useState<BusinessPlan>({
    tripleImpactAssessment: {
      problemSolved: "",
      beneficiaries: "",
      resourcesUsed: "",
      communityInvolvement: "",
      longTermImpact: "",
    },
    executiveSummary: "",
    businessDescription: "",
    marketAnalysis: "",
    competitiveAnalysis: "",
    marketingPlan: "",
    operationalPlan: "",
    managementTeam: "",
    financialProjections: {
      startupCosts: 0,
      monthlyRevenue: 0,
      monthlyExpenses: 0,
      breakEvenMonth: 0,
      revenueStreams: [],
    },
    riskAnalysis: "",
    appendices: "",
  });

  const [financialData, setFinancialData] = useState<FinancialData>({
    initialInvestment: 10000,
    monthlyRevenue: 5000,
    fixedCosts: 2000,
    variableCosts: 1000,
    projectionMonths: 12,
  });

  const [activeTab, setActiveTab] = useState("wizard");
  const [autoSaving, setAutoSaving] = useState(false);

  const [businessModelCanvas, setBusinessModelCanvas] = useState({
    keyPartners: "",
    keyActivities: "",
    valuePropositions: "",
    customerRelationships: "",
    customerSegments: "",
    keyResources: "",
    channels: "",
    costStructure: "",
    revenueStreams: "",
  });

  // Use refs to manage autosave timeout and prevent multiple calls
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedDataRef = useRef<string>("");

  // Memoize progress calculation to prevent unnecessary recalculations
  const progress = useMemo(
    () => calculateCompletion(businessPlan),
    [businessPlan]
  );

  // Debounced autosave function
  const debouncedAutoSave = useCallback(
    async (data: BusinessPlan) => {
      // Clear existing timeout
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      // Create new timeout
      autoSaveTimeoutRef.current = setTimeout(async () => {
        try {
          const completionPercentage = calculateCompletion(data);

          // Mapear al formato que espera el backend
          const backendData = {
            entrepreneurshipId: data.entrepreneurshipId,
            tripleImpactAssessment: data.tripleImpactAssessment,
            executiveSummary: data.executiveSummary,
            businessDescription: data.businessDescription,
            marketAnalysis: data.marketAnalysis,
            competitiveAnalysis: data.competitiveAnalysis,
            marketingStrategy: data.marketingPlan,
            operationalPlan: data.operationalPlan,
            managementTeam: data.managementTeam,
            costStructure: {
              startupCosts: data.financialProjections.startupCosts,
              monthlyExpenses: data.financialProjections.monthlyExpenses,
              breakEvenMonth: data.financialProjections.breakEvenMonth,
            },
            revenueStreams: data.financialProjections.revenueStreams,
            riskAnalysis: data.riskAnalysis,
            currentStep,
            completionPercentage,
            isCompleted: completionPercentage === 100,
          };

          // Only save if data has actually changed
          const currentDataString = JSON.stringify(backendData);
          if (currentDataString !== lastSavedDataRef.current) {
            setAutoSaving(true);
            console.log('🔄 Auto-saving business plan data:', backendData);
            await saveSimulatorData(backendData, { silent: true });
            lastSavedDataRef.current = currentDataString;
          }
        } catch (error) {
          console.error("Auto-save error:", error);
          // Don't show error alerts for auto-save failures to avoid interrupting user experience
        } finally {
          setAutoSaving(false);
        }
      }, 3000); // Increased delay to 3 seconds for less aggressive autosave
    },
    [saveSimulatorData, currentStep, calculateCompletion]
  );

  const updateBusinessPlan = useCallback(
    (field: string, value: unknown) => {
      setBusinessPlan((prev) => {
        const updated = {
          ...prev,
          [field]: value,
        };

        // Trigger debounced autosave
        debouncedAutoSave(updated);

        return updated;
      });
    },
    [debouncedAutoSave]
  );

  // Sync financial data with business plan when switching tabs
  useEffect(() => {
    if (activeTab === "calculator") {
      // Sync from business plan to calculator
      setFinancialData((prev) => ({
        ...prev,
        initialInvestment: businessPlan.financialProjections.startupCosts || prev.initialInvestment,
        monthlyRevenue: businessPlan.financialProjections.monthlyRevenue || prev.monthlyRevenue,
      }));
    }
  }, [activeTab, businessPlan.financialProjections]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  // Cargar datos del backend cuando el componente se monte
  useEffect(() => {
    if (businessPlans && businessPlans.length > 0 && businessPlans[0]) {
      const latestPlan = businessPlans[0] as BackendBusinessPlan; // Tomar el plan más reciente

      // Mapear los datos del backend al formato del componente
      const mappedPlan: BusinessPlan = {
        id: latestPlan.id,
        entrepreneurshipId: latestPlan.entrepreneurshipId,
        tripleImpactAssessment: {
          problemSolved: latestPlan.tripleImpactAssessment?.problemSolved ?? "",
          beneficiaries: latestPlan.tripleImpactAssessment?.beneficiaries ?? "",
          resourcesUsed: latestPlan.tripleImpactAssessment?.resourcesUsed ?? "",
          communityInvolvement:
            latestPlan.tripleImpactAssessment?.communityInvolvement ?? "",
          longTermImpact:
            latestPlan.tripleImpactAssessment?.longTermImpact ?? "",
        },
        executiveSummary: latestPlan.executiveSummary || "",
        businessDescription: latestPlan.missionStatement || "",
        marketAnalysis: latestPlan.marketAnalysis || "",
        competitiveAnalysis: latestPlan.competitiveAnalysis || "",
        marketingPlan: latestPlan.marketingStrategy || "",
        operationalPlan: latestPlan.operationalPlan || "",
        managementTeam: typeof latestPlan.managementTeam === 'object' 
          ? (latestPlan.managementTeam?.description || "") 
          : (latestPlan.managementTeam || ""),
        financialProjections: {
          startupCosts:
            latestPlan.costStructure?.startupCosts ||
            (latestPlan.initialInvestment
              ? parseFloat(latestPlan.initialInvestment)
              : 0),
          monthlyRevenue: 0, // No viene en el backend
          monthlyExpenses:
            latestPlan.costStructure?.monthlyExpenses ||
            (latestPlan.monthlyExpenses
              ? parseFloat(latestPlan.monthlyExpenses)
              : 0),
          breakEvenMonth:
            latestPlan.costStructure?.breakEvenMonth ||
            latestPlan.breakEvenPoint ||
            0,
          revenueStreams: latestPlan.revenueStreams || [],
        },
        riskAnalysis: latestPlan.riskAnalysis || "",
        appendices: "",
        completionPercentage: latestPlan.completionPercentage,
        isCompleted: latestPlan.isCompleted,
        lastSection: latestPlan.lastSection,
        createdAt: latestPlan.createdAt,
        updatedAt: latestPlan.updatedAt,
      };

      setBusinessPlan(mappedPlan);

      // Establecer el paso actual basado en lastSection
      if (latestPlan.lastSection) {
        const stepMap: { [key: string]: number } = {
          triple_impact_assessment: 0,
          executive_summary: 1,
          business_description: 2,
          market_analysis: 3,
          competitive_analysis: 4,
          marketing_plan: 5,
          operational_plan: 6,
          management_team: 7,
          financial_projections: 8,
          risk_analysis: 9,
        };
        const step = stepMap[latestPlan.lastSection] || 0;
        setCurrentStep(step);
      }

      // Analizar triple impacto cuando se cargan los datos
      if (latestPlan.tripleImpactAssessment) {
        const impactAnalysis = analyzeTripleImpactHook(
          latestPlan.tripleImpactAssessment
        );
        setImpacts({
          economic: impactAnalysis.economic,
          social: impactAnalysis.social,
          environmental: impactAnalysis.environmental,
        });
      }

      // Cargar datos del canvas si existen
      if (latestPlan.businessModelCanvas) {
        try {
          const canvasData = typeof latestPlan.businessModelCanvas === 'string' 
            ? JSON.parse(latestPlan.businessModelCanvas)
            : latestPlan.businessModelCanvas;
          
          // Only update if canvasData has the expected structure
          if (canvasData && typeof canvasData === 'object' && canvasData.keyPartners !== undefined) {
            setBusinessModelCanvas({
              keyPartners: canvasData.keyPartners || "",
              keyActivities: canvasData.keyActivities || "",
              valuePropositions: canvasData.valuePropositions || "",
              customerRelationships: canvasData.customerRelationships || "",
              customerSegments: canvasData.customerSegments || "",
              keyResources: canvasData.keyResources || "",
              channels: canvasData.channels || "",
              costStructure: canvasData.costStructure || "",
              revenueStreams: canvasData.revenueStreams || "",
            });
          }
        } catch (error) {
          console.error("Error parsing business model canvas data:", error);
        }
      }
    }
  }, [businessPlans, analyzeTripleImpactHook]);

  const planSteps = [
    {
      title: "¿Tu Negocio Ayuda?",
      description: "Cuéntanos sobre el impacto de tu negocio",
      icon: <Leaf className="h-5 w-5" />,
      field: "tripleImpactAssessment",
      tooltip:
        "Vamos a descubrir juntos si tu negocio puede ayudar a la sociedad y al medio ambiente",
    },
    {
      title: "Resumen Ejecutivo",
      description: "Una visión general de tu negocio",
      icon: <FileText className="h-5 w-5" />,
      field: "executiveSummary",
      tooltip:
        "Resume los puntos clave de tu plan de negocio, incluyendo la propuesta de valor y los objetivos principales",
    },
    {
      title: "Descripción del Negocio",
      description: "¿Qué hace tu empresa?",
      icon: <Lightbulb className="h-5 w-5" />,
      field: "businessDescription",
      tooltip:
        "Detalla el propósito de tu empresa, los productos o servicios que ofrece y el problema que resuelve",
    },
    {
      title: "Análisis de Mercado",
      description: "Tu mercado objetivo y oportunidades",
      icon: <TrendingUp className="h-5 w-5" />,
      field: "marketAnalysis",
      tooltip:
        "Identifica y analiza tu mercado objetivo, tendencias del sector y oportunidades de crecimiento",
    },
    {
      title: "Análisis Competitivo",
      description: "Quiénes son tus competidores",
      icon: <Target className="h-5 w-5" />,
      field: "competitiveAnalysis",
      tooltip:
        "Evalúa tus competidores directos e indirectos, sus fortalezas y debilidades, y tu ventaja competitiva",
    },
    {
      title: "Plan de Marketing",
      description: "Cómo vas a atraer clientes",
      icon: <Users className="h-5 w-5" />,
      field: "marketingPlan",
      tooltip:
        "Define tus estrategias de marketing, canales de distribución y tácticas para llegar a tus clientes",
    },
    {
      title: "Plan Operacional",
      description: "Cómo funcionará tu negocio",
      icon: <Cog className="h-5 w-5" />,
      field: "operationalPlan",
      tooltip:
        "Describe los procesos operativos, recursos necesarios y estructura organizacional de tu negocio",
    },
    {
      title: "Equipo de Gestión",
      description: "Quiénes están detrás del negocio",
      icon: <Users className="h-5 w-5" />,
      field: "managementTeam",
      tooltip:
        "Presenta al equipo directivo, sus roles, experiencia y las posiciones clave por cubrir",
    },
    {
      title: "Proyecciones Financieras",
      description: "Números y proyecciones",
      icon: <DollarSign className="h-5 w-5" />,
      field: "financialProjections",
      tooltip:
        "Desarrolla proyecciones financieras realistas, incluyendo costos, ingresos y punto de equilibrio",
    },
    {
      title: "Análisis de Riesgos",
      description: "Identificar y mitigar riesgos",
      icon: <Shield className="h-5 w-5" />,
      field: "riskAnalysis",
      tooltip:
        "Identifica los principales riesgos del negocio y las estrategias para mitigarlos",
    },
  ];

  const impactQuestions = [
    {
      field: "problemSolved",
      question: "¿Qué problema ayuda a resolver tu negocio?",
      placeholder:
        "Por ejemplo: reducir la basura, dar trabajo a jóvenes, mejorar la educación...",
      helpLink: "/courses/impact/problem-identification",
      videoLink: "/courses/impact/video-1",
    },
    {
      field: "beneficiaries",
      question: "¿A quiénes beneficia tu negocio además de tus clientes?",
      placeholder: "Por ejemplo: familias locales, estudiantes, el barrio...",
      helpLink: "/courses/impact/beneficiaries",
      videoLink: "/courses/impact/video-2",
    },
    {
      field: "resourcesUsed",
      question: "¿Qué recursos naturales usa tu negocio?",
      placeholder: "Por ejemplo: agua, electricidad, materiales reciclados...",
      helpLink: "/courses/impact/resources",
      videoLink: "/courses/impact/video-3",
    },
    {
      field: "communityInvolvement",
      question: "¿Cómo participa la comunidad en tu negocio?",
      placeholder: "Por ejemplo: como trabajadores, proveedores, socios...",
      helpLink: "/courses/impact/community",
      videoLink: "/courses/impact/video-4",
    },
    {
      field: "longTermImpact",
      question: "¿Cómo ayudará tu negocio en el futuro?",
      placeholder:
        "Por ejemplo: crear más empleos, cuidar el medio ambiente...",
      helpLink: "/courses/impact/long-term",
      videoLink: "/courses/impact/video-5",
    },
  ];

  const calculateBreakEven = () => {
    const netMonthlyProfit =
      financialData.monthlyRevenue -
      (financialData.fixedCosts + financialData.variableCosts);
    if (netMonthlyProfit <= 0) return "No alcanza punto de equilibrio";
    return Math.ceil(financialData.initialInvestment / netMonthlyProfit);
  };

  const calculateROI = () => {
    const annualProfit =
      (financialData.monthlyRevenue -
        (financialData.fixedCosts + financialData.variableCosts)) *
      12;
    return ((annualProfit / financialData.initialInvestment) * 100).toFixed(1);
  };

  const generateCashFlow = () => {
    const months = [];
    let cumulativeCash = -financialData.initialInvestment;

    for (let i = 1; i <= financialData.projectionMonths; i++) {
      const monthlyProfit =
        financialData.monthlyRevenue -
        (financialData.fixedCosts + financialData.variableCosts);
      cumulativeCash += monthlyProfit;
      months.push({
        month: i,
        revenue: financialData.monthlyRevenue,
        expenses: financialData.fixedCosts + financialData.variableCosts,
        profit: monthlyProfit,
        cumulative: cumulativeCash,
      });
    }
    return months;
  };

  const analyzeTripleImpact = () => {
    const assessment = businessPlan.tripleImpactAssessment;
    if (!assessment) return null;

    const impactAnalysis = analyzeTripleImpactHook(assessment);
    setImpacts({
      economic: impactAnalysis.economic,
      social: impactAnalysis.social,
      environmental: impactAnalysis.environmental,
    });
    return impactAnalysis;
  };

  const getImpactFeedback = () => {
    const impactCount = Object.values(impacts).filter(Boolean).length;

    if (impactCount === 0) {
      return {
        message:
          "Tu negocio aún puede crecer en su impacto. ¡Sigue explorando!",
        color: "text-blue-600",
      };
    } else if (impactCount === 3) {
      return {
        message: "¡Excelente! Tu negocio tiene triple impacto. 🌟",
        color: "text-green-600",
      };
    } else {
      return {
        message: `Tu negocio ya genera ${impactCount} tipos de impacto. ¡Vas por buen camino!`,
        color: "text-blue-600",
      };
    }
  };

  // Mostrar loading mientras se cargan los datos
  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Simulador de Plan de Negocios
          </h1>
          <p className="text-muted-foreground">
            Crea tu plan de negocios paso a paso con herramientas integradas de
            cálculo financiero
          </p>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">
              Cargando datos del plan de negocios...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Simulador de Plan de Negocios
        </h1>
        <p className="text-muted-foreground">
          Crea tu plan de negocios paso a paso con herramientas integradas de
          cálculo financiero
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="wizard">Asistente Guiado</TabsTrigger>
          <TabsTrigger value="canvas">Business Model Canvas</TabsTrigger>
          <TabsTrigger value="calculator">Calculadora Financiera</TabsTrigger>
        </TabsList>

        {/* Guided Wizard */}
        <TabsContent value="wizard" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {planSteps[currentStep].icon}
                      Paso {currentStep + 1}: {planSteps[currentStep].title}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="h-4 w-4 ml-2 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">
                              {planSteps[currentStep].tooltip}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </CardTitle>
                    <p className="text-muted-foreground mt-1">
                      {planSteps[currentStep].description}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="min-w-[80px] text-center">
                  {currentStep + 1} de {planSteps.length}
                </Badge>
              </div>
              <Progress value={progress} className="mt-4" />
              <div className="h-6 mt-2">
                {autoSaving && (
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span>Guardando cambios...</span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {currentStep === 0 ? (
                <div className="max-w-6xl mx-auto">
                  {/* Impact Questions Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {impactQuestions.map((q, index) => (
                      <div
                        key={index}
                        className="bg-white rounded-xl p-6 shadow-sm border-2 border-transparent hover:border-blue-100 transition-all"
                      >
                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <div className="bg-blue-50 rounded-full p-2 mt-1">
                              <div className="h-6 w-6 text-blue-600">
                                {index === 0 ? (
                                  <Lightbulb className="h-6 w-6" />
                                ) : index === 1 ? (
                                  <Users className="h-6 w-6" />
                                ) : index === 2 ? (
                                  <Leaf className="h-6 w-6" />
                                ) : index === 3 ? (
                                  <Heart className="h-6 w-6" />
                                ) : (
                                  <Target className="h-6 w-6" />
                                )}
                              </div>
                            </div>
                            <Label className="text-lg font-medium leading-tight">
                              {q.question}
                            </Label>
                          </div>

                          <Textarea
                            value={
                              businessPlan.tripleImpactAssessment?.[
                                q.field as keyof typeof businessPlan.tripleImpactAssessment
                              ] ?? ""
                            }
                            onChange={(e) =>
                              updateBusinessPlan("tripleImpactAssessment", {
                                ...businessPlan.tripleImpactAssessment,
                                [q.field]: e.target.value,
                              })
                            }
                            placeholder={q.placeholder}
                            className="min-h-[120px] text-base resize-none bg-gray-50/50"
                          />

                          <div className="flex gap-3 pt-2">
                            <Link
                              href={q.helpLink}
                              className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 hover:underline"
                            >
                              <FileText className="h-4 w-4" />
                              Ver guía
                            </Link>
                            <Link
                              href={q.videoLink}
                              className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 hover:underline"
                            >
                              <Video className="h-4 w-4" />
                              Ver video
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Impact Feedback */}
                  {businessPlan.tripleImpactAssessment &&
                    Object.values(businessPlan.tripleImpactAssessment).some(
                      (value) => value && value.length > 0
                    ) && (
                      <div className="mt-8 bg-white rounded-xl p-6 shadow-sm border-2 border-transparent">
                        <div
                          className={`text-lg font-medium ${getImpactFeedback().color} flex items-center gap-2 mb-4`}
                        >
                          <CheckCircle className="h-5 w-5" />
                          {getImpactFeedback().message}
                        </div>

                        {/* Impact Analysis Visual */}
                        <div className="grid grid-cols-3 gap-4">
                          <div
                            className={`text-center p-3 rounded-lg border-2 ${impacts.economic ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"}`}
                          >
                            <div
                              className={`text-2xl mb-1 ${impacts.economic ? "text-green-600" : "text-gray-400"}`}
                            >
                              💰
                            </div>
                            <div className="text-sm font-medium">Económico</div>
                            <div className="text-xs text-muted-foreground">
                              {impacts.economic ? "Detectado" : "Pendiente"}
                            </div>
                          </div>

                          <div
                            className={`text-center p-3 rounded-lg border-2 ${impacts.social ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200"}`}
                          >
                            <div
                              className={`text-2xl mb-1 ${impacts.social ? "text-blue-600" : "text-gray-400"}`}
                            >
                              👥
                            </div>
                            <div className="text-sm font-medium">Social</div>
                            <div className="text-xs text-muted-foreground">
                              {impacts.social ? "Detectado" : "Pendiente"}
                            </div>
                          </div>

                          <div
                            className={`text-center p-3 rounded-lg border-2 ${impacts.environmental ? "bg-emerald-50 border-emerald-200" : "bg-gray-50 border-gray-200"}`}
                          >
                            <div
                              className={`text-2xl mb-1 ${impacts.environmental ? "text-emerald-600" : "text-gray-400"}`}
                            >
                              🌱
                            </div>
                            <div className="text-sm font-medium">Ambiental</div>
                            <div className="text-xs text-muted-foreground">
                              {impacts.environmental
                                ? "Detectado"
                                : "Pendiente"}
                            </div>
                          </div>
                        </div>

                        {/* Botón para analizar impacto */}
                        <div className="mt-6 flex justify-center">
                          <Button
                            onClick={analyzeTripleImpact}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Target className="h-4 w-4 mr-2" />
                            Analizar Triple Impacto
                          </Button>
                        </div>
                      </div>
                    )}
                </div>
              ) : (
                <>
                  {currentStep < 8 && (
                    <div className="space-y-4">
                      <Label className="text-lg">
                        Describe {planSteps[currentStep].title.toLowerCase()}
                      </Label>
                      <Textarea
                        placeholder={`Explica ${planSteps[currentStep].description.toLowerCase()}...`}
                        value={
                          businessPlan[
                            planSteps[currentStep].field as keyof BusinessPlan
                          ] as string
                        }
                        onChange={(e) =>
                          updateBusinessPlan(
                            planSteps[currentStep].field,
                            e.target.value
                          )
                        }
                        className="min-h-[200px]"
                      />
                      <div className="space-y-2">
                        <Label>Material de Apoyo</Label>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <ExternalLink className="h-4 w-4 text-blue-600" />
                            <Input
                              placeholder="URL de recursos adicionales..."
                              className="flex-1"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Video className="h-4 w-4 text-blue-600" />
                            <Input
                              placeholder="URL del video explicativo..."
                              className="flex-1"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Tip: Sé específico y detallado. Esto te ayudará a
                        clarificar tu idea de negocio.
                      </div>
                    </div>
                  )}

                  {currentStep === 8 && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Costos de Inicio (Bs.)</Label>
                          <Input
                            type="number"
                            value={
                              businessPlan.financialProjections.startupCosts
                            }
                            onChange={(e) =>
                              updateBusinessPlan("financialProjections", {
                                ...businessPlan.financialProjections,
                                startupCosts: Number(e.target.value),
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Ingresos Mensuales Proyectados (Bs.)</Label>
                          <Input
                            type="number"
                            value={
                              businessPlan.financialProjections.monthlyRevenue
                            }
                            onChange={(e) =>
                              updateBusinessPlan("financialProjections", {
                                ...businessPlan.financialProjections,
                                monthlyRevenue: Number(e.target.value),
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Gastos Mensuales (Bs.)</Label>
                          <Input
                            type="number"
                            value={
                              businessPlan.financialProjections.monthlyExpenses
                            }
                            onChange={(e) =>
                              updateBusinessPlan("financialProjections", {
                                ...businessPlan.financialProjections,
                                monthlyExpenses: Number(e.target.value),
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Mes de Punto de Equilibrio</Label>
                          <Input
                            type="number"
                            value={
                              businessPlan.financialProjections.breakEvenMonth
                            }
                            onChange={(e) =>
                              updateBusinessPlan("financialProjections", {
                                ...businessPlan.financialProjections,
                                breakEvenMonth: Number(e.target.value),
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() =>
                        setCurrentStep(Math.max(0, currentStep - 1))
                      }
                      disabled={currentStep === 0}
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Anterior
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={async () => {
                          const completionPercentage =
                            calculateCompletion(businessPlan);
                          const result = await saveSimulatorData({
                            ...businessPlan,
                            currentStep,
                            completionPercentage,
                            isCompleted: completionPercentage === 100,
                          });

                                                      if (result.success && result.data) {
                              // Show success message with better formatting
                              let message = `✅ Plan guardado exitosamente!\n\n📊 Progreso: ${result.data.completionPercentage}%`;
                              
                              // Check if this is a new entrepreneurship creation
                              if (result.data.message?.includes('created') && !businessPlan.entrepreneurshipId) {
                                message = `🎉 ¡Emprendimiento creado automáticamente!\n\n` + message + `\n\n💡 Se ha creado un emprendimiento por defecto para tu plan de negocios. Puedes editarlo más tarde desde tu perfil.`;
                              }
                              
                              if (result.data.impactAnalysis?.recommendations?.length > 0) {
                                const recommendations = result.data.impactAnalysis.recommendations.join('\n• ');
                                alert(`${message}\n\n💡 Recomendaciones:\n• ${recommendations}`);
                              } else {
                                alert(message);
                              }
                            } else {
                              alert(
                                "❌ Error al guardar el plan:\n" + (result.error || "Error desconocido")
                              );
                            }
                        }}
                        disabled={loading || autoSaving}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {loading || autoSaving
                          ? "Guardando..."
                          : "Guardar Borrador"}
                      </Button>
                      {currentStep === planSteps.length - 1 ? (
                        <Button
                          onClick={async () => {
                            const result = await saveSimulatorData({
                              ...businessPlan,
                              currentStep,
                              completionPercentage: 100,
                              isCompleted: true,
                            });

                            if (result.success && result.data) {
                              // Show completion message with better formatting
                              const message = `🎉 ¡Plan de negocios finalizado!\n\n📊 Progreso: ${result.data.completionPercentage}%\n\n¡Felicitaciones por completar tu plan de negocios!`;
                              
                              if (result.data.impactAnalysis?.recommendations?.length > 0) {
                                const recommendations = result.data.impactAnalysis.recommendations.join('\n• ');
                                alert(`${message}\n\n💡 Recomendaciones finales:\n• ${recommendations}`);
                              } else {
                                alert(message);
                              }
                            } else {
                              alert(
                                "❌ Error al finalizar el plan:\n" + (result.error || "Error desconocido")
                              );
                            }
                          }}
                          disabled={loading || autoSaving}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          {loading || autoSaving
                            ? "Finalizando..."
                            : "Finalizar Plan"}
                        </Button>
                      ) : (
                        <Button
                          onClick={() =>
                            setCurrentStep(
                              Math.min(planSteps.length - 1, currentStep + 1)
                            )
                          }
                        >
                          Siguiente
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Progress Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Progreso del Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                {planSteps.map((step, index) => (
                  <div
                    key={index}
                    className={`text-center p-3 rounded-lg border cursor-pointer transition-colors ${
                      index <= currentStep
                        ? "bg-green-50 border-green-200"
                        : "bg-gray-50 border-gray-200"
                    }`}
                    onClick={() => setCurrentStep(index)}
                  >
                    <div
                      className={`w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center ${
                        index <= currentStep
                          ? "bg-green-100 text-green-600"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {index < currentStep ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        step.icon
                      )}
                    </div>
                    <p className="text-xs font-medium">{step.title}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Business Model Canvas */}
        <TabsContent value="canvas" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Model Canvas</CardTitle>
              <p className="text-muted-foreground">
                Visualiza tu modelo de negocio de forma interactiva
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-4 min-h-[600px]">
                {/* Key Partners */}
                <Card className="border-2 border-blue-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-blue-600">
                      Socios Clave
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Textarea
                      placeholder="¿Quiénes son tus socios estratégicos?"
                      value={businessModelCanvas.keyPartners}
                      onChange={(e) =>
                        setBusinessModelCanvas((prev) => ({
                          ...prev,
                          keyPartners: e.target.value,
                        }))
                      }
                      className="min-h-[100px] border-none p-0 resize-none"
                    />
                  </CardContent>
                </Card>

                {/* Key Activities */}
                <Card className="border-2 border-green-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-green-600">
                      Actividades Clave
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Textarea
                      placeholder="¿Qué actividades son esenciales?"
                      value={businessModelCanvas.keyActivities}
                      onChange={(e) =>
                        setBusinessModelCanvas((prev) => ({
                          ...prev,
                          keyActivities: e.target.value,
                        }))
                      }
                      className="min-h-[100px] border-none p-0 resize-none"
                    />
                  </CardContent>
                </Card>

                {/* Value Propositions */}
                <Card className="border-2 border-red-200 row-span-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-red-600">
                      Propuesta de Valor
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Textarea
                      placeholder="¿Qué valor único ofreces?"
                      value={businessModelCanvas.valuePropositions}
                      onChange={(e) =>
                        setBusinessModelCanvas((prev) => ({
                          ...prev,
                          valuePropositions: e.target.value,
                        }))
                      }
                      className="min-h-[200px] border-none p-0 resize-none"
                    />
                  </CardContent>
                </Card>

                {/* Customer Relationships */}
                <Card className="border-2 border-purple-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-purple-600">
                      Relación con Clientes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Textarea
                      placeholder="¿Cómo te relacionas con clientes?"
                      value={businessModelCanvas.customerRelationships}
                      onChange={(e) =>
                        setBusinessModelCanvas((prev) => ({
                          ...prev,
                          customerRelationships: e.target.value,
                        }))
                      }
                      className="min-h-[100px] border-none p-0 resize-none"
                    />
                  </CardContent>
                </Card>

                {/* Customer Segments */}
                <Card className="border-2 border-orange-200 row-span-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-orange-600">
                      Segmentos de Clientes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Textarea
                      placeholder="¿Quiénes son tus clientes?"
                      value={businessModelCanvas.customerSegments}
                      onChange={(e) =>
                        setBusinessModelCanvas((prev) => ({
                          ...prev,
                          customerSegments: e.target.value,
                        }))
                      }
                      className="min-h-[200px] border-none p-0 resize-none"
                    />
                  </CardContent>
                </Card>

                {/* Key Resources */}
                <Card className="border-2 border-green-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-green-600">
                      Recursos Clave
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Textarea
                      placeholder="¿Qué recursos necesitas?"
                      value={businessModelCanvas.keyResources}
                      onChange={(e) =>
                        setBusinessModelCanvas((prev) => ({
                          ...prev,
                          keyResources: e.target.value,
                        }))
                      }
                      className="min-h-[100px] border-none p-0 resize-none"
                    />
                  </CardContent>
                </Card>

                {/* Channels */}
                <Card className="border-2 border-purple-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-purple-600">
                      Canales
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Textarea
                      placeholder="¿Cómo llegas a tus clientes?"
                      value={businessModelCanvas.channels}
                      onChange={(e) =>
                        setBusinessModelCanvas((prev) => ({
                          ...prev,
                          channels: e.target.value,
                        }))
                      }
                      className="min-h-[100px] border-none p-0 resize-none"
                    />
                  </CardContent>
                </Card>

                {/* Cost Structure */}
                <Card className="border-2 border-yellow-200 col-span-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-yellow-600">
                      Estructura de Costos
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Textarea
                      placeholder="¿Cuáles son tus principales costos?"
                      value={businessModelCanvas.costStructure}
                      onChange={(e) =>
                        setBusinessModelCanvas((prev) => ({
                          ...prev,
                          costStructure: e.target.value,
                        }))
                      }
                      className="min-h-[100px] border-none p-0 resize-none"
                    />
                  </CardContent>
                </Card>

                {/* Revenue Streams */}
                <Card className="border-2 border-teal-200 col-span-3">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-teal-600">
                      Fuentes de Ingresos
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Textarea
                      placeholder="¿Cómo generas ingresos?"
                      value={businessModelCanvas.revenueStreams}
                      onChange={(e) =>
                        setBusinessModelCanvas((prev) => ({
                          ...prev,
                          revenueStreams: e.target.value,
                        }))
                      }
                      className="min-h-[100px] border-none p-0 resize-none"
                    />
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-end mt-6 gap-2">
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      const completionPercentage = calculateCompletion(businessPlan);
                      
                      // Format data for backend
                      const backendData = {
                        entrepreneurshipId: businessPlan.entrepreneurshipId,
                        tripleImpactAssessment: businessPlan.tripleImpactAssessment,
                        executiveSummary: businessPlan.executiveSummary,
                        businessDescription: businessPlan.businessDescription,
                        marketAnalysis: businessPlan.marketAnalysis,
                        competitiveAnalysis: businessPlan.competitiveAnalysis,
                        marketingStrategy: businessPlan.marketingPlan,
                        operationalPlan: businessPlan.operationalPlan,
                        managementTeam: businessPlan.managementTeam,
                        costStructure: {
                          startupCosts: businessPlan.financialProjections.startupCosts,
                          monthlyExpenses: businessPlan.financialProjections.monthlyExpenses,
                          breakEvenMonth: businessPlan.financialProjections.breakEvenMonth,
                        },
                        revenueStreams: businessPlan.financialProjections.revenueStreams,
                        riskAnalysis: businessPlan.riskAnalysis,
                        businessModelCanvas,
                        currentStep,
                        completionPercentage,
                        isCompleted: completionPercentage === 100,
                      };
                      
                      const result = await saveSimulatorData(backendData);
                      if (result.success) {
                        alert("✅ Canvas guardado exitosamente!");
                      } else {
                        alert("❌ Error al guardar: " + (result.error || "Error desconocido"));
                      }
                    } catch (error) {
                      console.error("Error saving canvas:", error);
                      alert("❌ Error inesperado al guardar el canvas");
                    }
                  }}
                  disabled={loading || autoSaving}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading || autoSaving ? "Guardando..." : "Guardar Canvas"}
                </Button>
                <Button
                  onClick={() => {
                    // TODO: Implement PDF export functionality
                    alert("Funcionalidad de exportación a PDF en desarrollo");
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar a PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Calculator */}
        <TabsContent value="calculator" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Parameters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Parámetros Financieros
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Inversión Inicial (Bs.)</Label>
                  <Input
                    type="number"
                    value={financialData.initialInvestment}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      setFinancialData((prev) => ({
                        ...prev,
                        initialInvestment: value,
                      }));
                      updateBusinessPlan("financialProjections", {
                        ...businessPlan.financialProjections,
                        startupCosts: value,
                      });
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ingresos Mensuales (Bs.)</Label>
                  <Input
                    type="number"
                    value={financialData.monthlyRevenue}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      setFinancialData((prev) => ({
                        ...prev,
                        monthlyRevenue: value,
                      }));
                      updateBusinessPlan("financialProjections", {
                        ...businessPlan.financialProjections,
                        monthlyRevenue: value,
                      });
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Costos Fijos Mensuales (Bs.)</Label>
                  <Input
                    type="number"
                    value={financialData.fixedCosts}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      setFinancialData((prev) => ({
                        ...prev,
                        fixedCosts: value,
                      }));
                      // Update monthly expenses in business plan
                      const totalExpenses = value + financialData.variableCosts;
                      updateBusinessPlan("financialProjections", {
                        ...businessPlan.financialProjections,
                        monthlyExpenses: totalExpenses,
                      });
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Costos Variables Mensuales (Bs.)</Label>
                  <Input
                    type="number"
                    value={financialData.variableCosts}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      setFinancialData((prev) => ({
                        ...prev,
                        variableCosts: value,
                      }));
                      // Update monthly expenses in business plan
                      const totalExpenses = financialData.fixedCosts + value;
                      updateBusinessPlan("financialProjections", {
                        ...businessPlan.financialProjections,
                        monthlyExpenses: totalExpenses,
                      });
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Meses de Proyección</Label>
                  <Input
                    type="number"
                    min="1"
                    max="60"
                    value={financialData.projectionMonths}
                    onChange={(e) =>
                      setFinancialData((prev) => ({
                        ...prev,
                        projectionMonths: Number(e.target.value),
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Key Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Indicadores Clave
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {calculateBreakEven()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Punto de Equilibrio (meses)
                    </div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {calculateROI()}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ROI Anual
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Ganancia Mensual:</span>
                    <span className="font-semibold">
                      Bs.{" "}
                      {(
                        financialData.monthlyRevenue -
                        financialData.fixedCosts -
                        financialData.variableCosts
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Margen de Ganancia:</span>
                    <span className="font-semibold">
                      {(
                        ((financialData.monthlyRevenue -
                          financialData.fixedCosts -
                          financialData.variableCosts) /
                          financialData.monthlyRevenue) *
                        100
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ganancia Anual:</span>
                    <span className="font-semibold">
                      Bs.{" "}
                      {(
                        (financialData.monthlyRevenue -
                          financialData.fixedCosts -
                          financialData.variableCosts) *
                        12
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cash Flow Projection */}
          <Card>
            <CardHeader>
              <CardTitle>Proyección de Flujo de Caja</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Mes</th>
                      <th className="text-right p-2">Ingresos</th>
                      <th className="text-right p-2">Gastos</th>
                      <th className="text-right p-2">Ganancia</th>
                      <th className="text-right p-2">Acumulado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {generateCashFlow().map((month) => (
                      <tr key={month.month} className="border-b">
                        <td className="p-2">{month.month}</td>
                        <td className="text-right p-2">
                          Bs. {month.revenue.toLocaleString()}
                        </td>
                        <td className="text-right p-2">
                          Bs. {month.expenses.toLocaleString()}
                        </td>
                        <td
                          className={`text-right p-2 ${month.profit >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          Bs. {month.profit.toLocaleString()}
                        </td>
                        <td
                          className={`text-right p-2 font-semibold ${month.cumulative >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          Bs. {month.cumulative.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
