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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";
import { useBusinessPlanSimulator } from "@/hooks/useBusinessPlanSimulator";

// PDF Styles for Business Model Canvas
const canvasStyles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#f8fafc",
    padding: 30,
    fontFamily: "Helvetica",
    fontSize: 10,
  },
  header: {
    backgroundColor: "#1e293b",
    padding: 20,
    marginBottom: 25,
    borderRadius: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    color: "#ffffff",
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#cbd5e1",
    fontWeight: "normal",
  },
  canvas: {
    position: "relative",
    height: 400,
    width: "100%",
  },
  row: {
    position: "absolute",
    flexDirection: "row",
    width: "100%",
    height: 120,
  },
  section: {
    border: "2px solid #e2e8f0",
    borderRadius: 8,
    padding: 8,
    height: 110,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginRight: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
    padding: 8,
    textAlign: "center",
    borderRadius: 4,
    letterSpacing: 0.5,
  },
  sectionContent: {
    fontSize: 9,
    lineHeight: 1.4,
    color: "#374151",
    textAlign: "justify",
  },
  // Specific section colors with gradients
  keyPartners: {
    backgroundColor: "#ffffff",
  },
  keyPartnersTitle: {
    backgroundColor: "#3b82f6",
  },
  keyActivities: {
    backgroundColor: "#ffffff",
  },
  keyActivitiesTitle: {
    backgroundColor: "#22c55e",
  },
  valuePropositions: {
    backgroundColor: "#ffffff",
  },
  valuePropositionsTitle: {
    backgroundColor: "#ef4444",
  },
  customerRelationships: {
    backgroundColor: "#ffffff",
  },
  customerRelationshipsTitle: {
    backgroundColor: "#9333ea",
  },
  customerSegments: {
    backgroundColor: "#ffffff",
  },
  customerSegmentsTitle: {
    backgroundColor: "#f97316",
  },
  keyResources: {
    backgroundColor: "#ffffff",
  },
  keyResourcesTitle: {
    backgroundColor: "#22c55e",
  },
  channels: {
    backgroundColor: "#ffffff",
  },
  channelsTitle: {
    backgroundColor: "#9333ea",
  },
  costStructure: {
    backgroundColor: "#ffffff",
  },
  costStructureTitle: {
    backgroundColor: "#eab308",
  },
  revenueStreams: {
    backgroundColor: "#ffffff",
  },
  revenueStreamsTitle: {
    backgroundColor: "#14b8a6",
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 30,
    right: 30,
    textAlign: "center",
    fontSize: 9,
    color: "#64748b",
    backgroundColor: "#f1f5f9",
    padding: 8,
    borderRadius: 4,
  },
  logo: {
    position: "absolute",
    top: 20,
    right: 20,
    fontSize: 12,
    fontWeight: "bold",
    color: "#3b82f6",
  },
});

// Business Model Canvas PDF Component
const BusinessModelCanvasPDF = ({ canvasData }: { canvasData: any }) => (
  <Document>
    <Page size="A4" orientation="landscape" style={canvasStyles.page}>
      {/* Header */}
      <View style={canvasStyles.header}>
        <Text style={canvasStyles.title}>Business Model Canvas</Text>
        <Text style={canvasStyles.subtitle}>Plan de Negocios - CEMSE</Text>
      </View>

      {/* Logo */}
      <Text style={canvasStyles.logo}>CEMSE</Text>

      {/* Canvas Grid */}
      <View style={canvasStyles.canvas}>
        {/* Top Row */}
        <View style={[canvasStyles.row, { top: 0 }]}>
          <View
            style={[
              canvasStyles.section,
              canvasStyles.keyPartners,
              { width: "18%" },
            ]}
          >
            <Text
              style={[canvasStyles.sectionTitle, canvasStyles.keyPartnersTitle]}
            >
              Socios Clave
            </Text>
            <Text style={canvasStyles.sectionContent}>
              {canvasData.keyPartners || "Sin contenido"}
            </Text>
          </View>

          <View
            style={[
              canvasStyles.section,
              canvasStyles.keyActivities,
              { width: "18%" },
            ]}
          >
            <Text
              style={[
                canvasStyles.sectionTitle,
                canvasStyles.keyActivitiesTitle,
              ]}
            >
              Actividades Clave
            </Text>
            <Text style={canvasStyles.sectionContent}>
              {canvasData.keyActivities || "Sin contenido"}
            </Text>
          </View>

          <View
            style={[
              canvasStyles.section,
              canvasStyles.valuePropositions,
              { width: "28%" },
            ]}
          >
            <Text
              style={[
                canvasStyles.sectionTitle,
                canvasStyles.valuePropositionsTitle,
              ]}
            >
              Propuesta de Valor
            </Text>
            <Text style={canvasStyles.sectionContent}>
              {canvasData.valuePropositions || "Sin contenido"}
            </Text>
          </View>

          <View
            style={[
              canvasStyles.section,
              canvasStyles.customerRelationships,
              { width: "18%" },
            ]}
          >
            <Text
              style={[
                canvasStyles.sectionTitle,
                canvasStyles.customerRelationshipsTitle,
              ]}
            >
              Relación con Clientes
            </Text>
            <Text style={canvasStyles.sectionContent}>
              {canvasData.customerRelationships || "Sin contenido"}
            </Text>
          </View>

          <View
            style={[
              canvasStyles.section,
              canvasStyles.customerSegments,
              { width: "18%" },
            ]}
          >
            <Text
              style={[
                canvasStyles.sectionTitle,
                canvasStyles.customerSegmentsTitle,
              ]}
            >
              Segmentos de Clientes
            </Text>
            <Text style={canvasStyles.sectionContent}>
              {canvasData.customerSegments || "Sin contenido"}
            </Text>
          </View>
        </View>

        {/* Middle Row */}
        <View style={[canvasStyles.row, { top: 130 }]}>
          <View
            style={[
              canvasStyles.section,
              canvasStyles.keyResources,
              { width: "18%" },
            ]}
          >
            <Text
              style={[
                canvasStyles.sectionTitle,
                canvasStyles.keyResourcesTitle,
              ]}
            >
              Recursos Clave
            </Text>
            <Text style={canvasStyles.sectionContent}>
              {canvasData.keyResources || "Sin contenido"}
            </Text>
          </View>

          <View
            style={[
              canvasStyles.section,
              canvasStyles.channels,
              { width: "18%" },
            ]}
          >
            <Text
              style={[canvasStyles.sectionTitle, canvasStyles.channelsTitle]}
            >
              Canales
            </Text>
            <Text style={canvasStyles.sectionContent}>
              {canvasData.channels || "Sin contenido"}
            </Text>
          </View>

          {/* Empty space for value propositions */}
          <View style={{ width: "28%", height: 100 }} />

          {/* Empty space for customer relationships */}
          <View style={{ width: "18%", height: 100 }} />

          {/* Empty space for customer segments */}
          <View style={{ width: "18%", height: 100 }} />
        </View>

        {/* Bottom Row */}
        <View style={[canvasStyles.row, { top: 260 }]}>
          <View
            style={[
              canvasStyles.section,
              canvasStyles.costStructure,
              { width: "36%" },
            ]}
          >
            <Text
              style={[
                canvasStyles.sectionTitle,
                canvasStyles.costStructureTitle,
              ]}
            >
              Estructura de Costos
            </Text>
            <Text style={canvasStyles.sectionContent}>
              {canvasData.costStructure || "Sin contenido"}
            </Text>
          </View>

          <View
            style={[
              canvasStyles.section,
              canvasStyles.revenueStreams,
              { width: "46%" },
            ]}
          >
            <Text
              style={[
                canvasStyles.sectionTitle,
                canvasStyles.revenueStreamsTitle,
              ]}
            >
              Fuentes de Ingresos
            </Text>
            <Text style={canvasStyles.sectionContent}>
              {canvasData.revenueStreams || "Sin contenido"}
            </Text>
          </View>
        </View>
      </View>

      {/* Footer */}
      <Text style={canvasStyles.footer}>
        Generado el {new Date().toLocaleDateString("es-ES")} • CEMSE - Centro de
        Emprendimiento y Servicios Empresariales
      </Text>
    </Page>
  </Document>
);

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
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [completionData, setCompletionData] = useState<any>(null);

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
            console.log("🔄 Auto-saving business plan data:", backendData);
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
        initialInvestment:
          businessPlan.financialProjections.startupCosts ||
          prev.initialInvestment,
        monthlyRevenue:
          businessPlan.financialProjections.monthlyRevenue ||
          prev.monthlyRevenue,
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
        managementTeam:
          typeof latestPlan.managementTeam === "object"
            ? latestPlan.managementTeam?.description || ""
            : latestPlan.managementTeam || "",
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
          const canvasData =
            typeof latestPlan.businessModelCanvas === "string"
              ? JSON.parse(latestPlan.businessModelCanvas)
              : latestPlan.businessModelCanvas;

          // Only update if canvasData has the expected structure
          if (
            canvasData &&
            typeof canvasData === "object" &&
            canvasData.keyPartners !== undefined
          ) {
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

  const calculateIUE = () => {
    // IUE (Impuesto sobre las Utilidades de las Empresas) - 25% sobre utilidades
    const monthlyProfit =
      financialData.monthlyRevenue -
      (financialData.fixedCosts + financialData.variableCosts);
    const annualProfit = monthlyProfit * 12;
    const iue = annualProfit > 0 ? annualProfit * 0.25 : 0;
    return iue;
  };

  const calculateIT = () => {
    // IT (Impuesto a las Transacciones) - 3% sobre ingresos brutos
    const monthlyIT = financialData.monthlyRevenue * 0.03;
    const annualIT = monthlyIT * 12;
    return annualIT;
  };

  const calculateNetProfit = () => {
    const monthlyProfit =
      financialData.monthlyRevenue -
      (financialData.fixedCosts + financialData.variableCosts);
    const annualProfit = monthlyProfit * 12;
    const iue = calculateIUE();
    const it = calculateIT();
    const netProfit = annualProfit - iue - it;
    return netProfit;
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

  const downloadCanvasPDF = async () => {
    try {
      const blob = await pdf(
        <BusinessModelCanvasPDF canvasData={businessModelCanvas} />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `business-model-canvas-${new Date().toISOString().split("T")[0]}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error al generar el PDF. Por favor, inténtalo de nuevo.");
    }
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
    <div className="container mx-auto p-4 sm:p-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">
          Simulador de Plan de Negocios
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Crea tu plan de negocios paso a paso con herramientas integradas de
          cálculo financiero
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4 sm:space-y-6"
      >
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 h-auto">
          <TabsTrigger
            value="wizard"
            className="text-xs sm:text-sm py-2 sm:py-3"
          >
            <span className="hidden sm:inline">Asistente Guiado</span>
            <span className="sm:hidden">Asistente</span>
          </TabsTrigger>
          <TabsTrigger
            value="canvas"
            className="text-xs sm:text-sm py-2 sm:py-3"
          >
            <span className="hidden sm:inline">Business Model Canvas</span>
            <span className="sm:hidden">Canvas</span>
          </TabsTrigger>
          <TabsTrigger
            value="calculator"
            className="text-xs sm:text-sm py-2 sm:py-3"
          >
            <span className="hidden sm:inline">Calculadora Financiera</span>
            <span className="sm:hidden">Calculadora</span>
          </TabsTrigger>
        </TabsList>

        {/* Guided Wizard */}
        <TabsContent value="wizard" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                      {planSteps[currentStep].icon}
                      <span className="hidden sm:inline">
                        Paso {currentStep + 1}:{" "}
                      </span>
                      <span className="sm:hidden">{currentStep + 1}. </span>
                      {planSteps[currentStep].title}
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
                    <p className="text-sm sm:text-base text-muted-foreground mt-1">
                      {planSteps[currentStep].description}
                    </p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="min-w-[80px] text-center self-start sm:self-auto"
                >
                  {currentStep + 1} de {planSteps.length}
                </Badge>
              </div>

              {/* Progress Bar */}
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Progreso del Plan</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {/* Step Navigation */}
              <div className="flex justify-between items-center mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  disabled={currentStep === 0}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Anterior</span>
                </Button>

                <div className="flex gap-2">
                  {planSteps.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentStep(index)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        index === currentStep
                          ? "bg-blue-600"
                          : index < currentStep
                            ? "bg-green-500"
                            : "bg-gray-300"
                      }`}
                      aria-label={`Ir al paso ${index + 1}`}
                    />
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentStep(
                      Math.min(planSteps.length - 1, currentStep + 1)
                    )
                  }
                  disabled={currentStep === planSteps.length - 1}
                  className="flex items-center gap-2"
                >
                  <span className="hidden sm:inline">Siguiente</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

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
                <div className="max-w-6xl mx-auto space-y-6">
                  {/* Introduction */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">
                      🌟 Descubre el Impacto de tu Negocio
                    </h3>
                    <p className="text-blue-800 text-sm sm:text-base">
                      Completa estas preguntas para entender cómo tu negocio
                      puede generar un <strong>triple impacto</strong>:
                      económico, social y ambiental. Esto te ayudará a crear un
                      negocio más sostenible y atractivo para inversionistas.
                    </p>
                  </div>

                  {/* Impact Questions Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {impactQuestions.map((q, index) => (
                      <div
                        key={index}
                        className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border-2 border-transparent hover:border-blue-100 transition-all"
                      >
                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <div className="bg-blue-50 rounded-full p-2 mt-1 flex-shrink-0">
                              <div className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600">
                                {index === 0 ? (
                                  <Lightbulb className="h-5 w-5 sm:h-6 sm:w-6" />
                                ) : index === 1 ? (
                                  <Users className="h-5 w-5 sm:h-6 sm:w-6" />
                                ) : index === 2 ? (
                                  <Leaf className="h-5 w-5 sm:h-6 sm:w-6" />
                                ) : index === 3 ? (
                                  <Heart className="h-5 w-5 sm:h-6 sm:w-6" />
                                ) : (
                                  <Target className="h-5 w-5 sm:h-6 sm:w-6" />
                                )}
                              </div>
                            </div>
                            <Label className="text-base sm:text-lg font-medium leading-tight">
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
                            className="min-h-[100px] sm:min-h-[120px] text-sm sm:text-base resize-none bg-gray-50/50"
                          />

                          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
                            <Link
                              href={q.helpLink}
                              className="flex items-center gap-1.5 text-xs sm:text-sm text-blue-600 hover:text-blue-700 hover:underline"
                            >
                              <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                              Ver guía
                            </Link>
                            <Link
                              href={q.videoLink}
                              className="flex items-center gap-1.5 text-xs sm:text-sm text-blue-600 hover:text-blue-700 hover:underline"
                            >
                              <Video className="h-3 w-3 sm:h-4 sm:w-4" />
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
                      <div className="mt-6 sm:mt-8 bg-white rounded-xl p-4 sm:p-6 shadow-sm border-2 border-transparent">
                        <div
                          className={`text-base sm:text-lg font-medium ${getImpactFeedback().color} flex items-center gap-2 mb-4`}
                        >
                          <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                          {getImpactFeedback().message}
                        </div>

                        {/* Impact Analysis Visual */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                          <div
                            className={`text-center p-3 sm:p-4 rounded-lg border-2 ${impacts.economic ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"}`}
                          >
                            <div
                              className={`text-xl sm:text-2xl mb-1 ${impacts.economic ? "text-green-600" : "text-gray-400"}`}
                            >
                              💰
                            </div>
                            <div className="text-sm font-medium">
                              Impacto Económico
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {impacts.economic
                                ? "✅ Detectado"
                                : "⏳ Pendiente"}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Genera valor económico
                            </div>
                          </div>

                          <div
                            className={`text-center p-3 sm:p-4 rounded-lg border-2 ${impacts.social ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200"}`}
                          >
                            <div
                              className={`text-xl sm:text-2xl mb-1 ${impacts.social ? "text-blue-600" : "text-gray-400"}`}
                            >
                              👥
                            </div>
                            <div className="text-sm font-medium">
                              Impacto Social
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {impacts.social ? "✅ Detectado" : "⏳ Pendiente"}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Beneficia a la comunidad
                            </div>
                          </div>

                          <div
                            className={`text-center p-3 sm:p-4 rounded-lg border-2 ${impacts.environmental ? "bg-emerald-50 border-emerald-200" : "bg-gray-50 border-gray-200"}`}
                          >
                            <div
                              className={`text-xl sm:text-2xl mb-1 ${impacts.environmental ? "text-emerald-600" : "text-gray-400"}`}
                            >
                              🌱
                            </div>
                            <div className="text-sm font-medium">
                              Impacto Ambiental
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {impacts.environmental
                                ? "✅ Detectado"
                                : "⏳ Pendiente"}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Cuida el medio ambiente
                            </div>
                          </div>
                        </div>

                        {/* Botón para analizar impacto */}
                        <div className="mt-4 sm:mt-6 flex justify-center">
                          <Button
                            onClick={analyzeTripleImpact}
                            className="bg-blue-600 hover:bg-blue-700 text-sm sm:text-base"
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
                      {/* Financial Introduction */}
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 sm:p-6">
                        <h3 className="text-lg font-semibold text-green-900 mb-2">
                          💰 Proyecciones Financieras
                        </h3>
                        <p className="text-green-800 text-sm sm:text-base">
                          Define los números clave de tu negocio. Estos datos te
                          ayudarán a entender la viabilidad financiera y
                          planificar el crecimiento.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        <div className="space-y-2">
                          <Label className="text-sm sm:text-base font-medium">
                            Costos de Inicio (Bs.)
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <HelpCircle className="h-4 w-4 ml-1 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent className="bg-white border border-gray-200 shadow-lg">
                                  <p className="max-w-xs text-gray-800">
                                    Incluye equipos, inventario inicial,
                                    permisos, marketing inicial, capital de
                                    trabajo, etc.
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </Label>
                          <Input
                            type="text"
                            inputMode="numeric"
                            placeholder="Ej: 50000"
                            value={
                              businessPlan.financialProjections.startupCosts ===
                              0
                                ? ""
                                : businessPlan.financialProjections.startupCosts.toString()
                            }
                            onChange={(e) => {
                              const value = e.target.value.replace(
                                /[^0-9]/g,
                                ""
                              );
                              updateBusinessPlan("financialProjections", {
                                ...businessPlan.financialProjections,
                                startupCosts: value === "" ? 0 : Number(value),
                              });
                            }}
                            className="text-sm sm:text-base"
                          />
                          <p className="text-xs text-muted-foreground">
                            💡 Tip: Incluye todos los gastos necesarios para
                            comenzar
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm sm:text-base font-medium">
                            Ingresos Mensuales Proyectados (Bs.)
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <HelpCircle className="h-4 w-4 ml-1 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent className="bg-white border border-gray-200 shadow-lg">
                                  <p className="max-w-xs text-gray-800">
                                    Estimación realista de tus ingresos
                                    mensuales basada en precios y volumen de
                                    ventas esperado.
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </Label>
                          <Input
                            type="text"
                            inputMode="numeric"
                            placeholder="Ej: 15000"
                            value={
                              businessPlan.financialProjections
                                .monthlyRevenue === 0
                                ? ""
                                : businessPlan.financialProjections.monthlyRevenue.toString()
                            }
                            onChange={(e) => {
                              const value = e.target.value.replace(
                                /[^0-9]/g,
                                ""
                              );
                              updateBusinessPlan("financialProjections", {
                                ...businessPlan.financialProjections,
                                monthlyRevenue:
                                  value === "" ? 0 : Number(value),
                              });
                            }}
                            className="text-sm sm:text-base"
                          />
                          <p className="text-xs text-muted-foreground">
                            💡 Tip: Sé conservador en tus estimaciones iniciales
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm sm:text-base font-medium">
                            Gastos Mensuales (Bs.)
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <HelpCircle className="h-4 w-4 ml-1 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent className="bg-white border border-gray-200 shadow-lg">
                                  <p className="max-w-xs text-gray-800">
                                    Incluye alquiler, salarios, servicios,
                                    marketing, insumos, etc. Todo lo que gastas
                                    mensualmente.
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </Label>
                          <Input
                            type="text"
                            inputMode="numeric"
                            placeholder="Ej: 8000"
                            value={
                              businessPlan.financialProjections
                                .monthlyExpenses === 0
                                ? ""
                                : businessPlan.financialProjections.monthlyExpenses.toString()
                            }
                            onChange={(e) => {
                              const value = e.target.value.replace(
                                /[^0-9]/g,
                                ""
                              );
                              updateBusinessPlan("financialProjections", {
                                ...businessPlan.financialProjections,
                                monthlyExpenses:
                                  value === "" ? 0 : Number(value),
                              });
                            }}
                            className="text-sm sm:text-base"
                          />
                          <p className="text-xs text-muted-foreground">
                            💡 Tip: No olvides incluir gastos fijos y variables
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm sm:text-base font-medium">
                            Mes de Punto de Equilibrio
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <HelpCircle className="h-4 w-4 ml-1 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent className="bg-white border border-gray-200 shadow-lg">
                                  <p className="max-w-xs text-gray-800">
                                    El mes en que tus ingresos cubren todos tus
                                    gastos. Se calcula automáticamente.
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </Label>
                          <Input
                            type="text"
                            inputMode="numeric"
                            placeholder="Se calcula automáticamente"
                            value={
                              businessPlan.financialProjections
                                .breakEvenMonth === 0
                                ? ""
                                : businessPlan.financialProjections.breakEvenMonth.toString()
                            }
                            onChange={(e) => {
                              const value = e.target.value.replace(
                                /[^0-9]/g,
                                ""
                              );
                              updateBusinessPlan("financialProjections", {
                                ...businessPlan.financialProjections,
                                breakEvenMonth:
                                  value === "" ? 0 : Number(value),
                              });
                            }}
                            className="text-sm sm:text-base"
                          />
                          <p className="text-xs text-muted-foreground">
                            💡 Tip: Se calcula automáticamente basado en tus
                            otros datos
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Risk Analysis Step */}
                  {currentStep === 9 && (
                    <div className="space-y-6">
                      {/* Risk Analysis Introduction */}
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 sm:p-6">
                        <h3 className="text-lg font-semibold text-orange-900 mb-2">
                          ⚠️ Análisis de Riesgos
                        </h3>
                        <p className="text-orange-800 text-sm sm:text-base">
                          Identifica los principales riesgos de tu negocio y las
                          estrategias para mitigarlos. Esto demuestra que has
                          pensado en los desafíos y tienes un plan para
                          superarlos.
                        </p>
                      </div>

                      <div className="space-y-4">
                        <Label className="text-lg font-medium">
                          Describe los principales riesgos y estrategias de
                          mitigación
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <HelpCircle className="h-4 w-4 ml-2 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent className="bg-white border border-gray-200 shadow-lg">
                                <p className="max-w-xs text-gray-800">
                                  Considera riesgos financieros, de mercado,
                                  operacionales, tecnológicos y regulatorios.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </Label>
                        <Textarea
                          placeholder="Ejemplo: Riesgo de competencia - Estrategia: Diferenciación por calidad y servicio al cliente. Riesgo financiero - Estrategia: Mantener reservas de efectivo y diversificar fuentes de ingresos..."
                          value={businessPlan.riskAnalysis}
                          onChange={(e) =>
                            updateBusinessPlan("riskAnalysis", e.target.value)
                          }
                          className="min-h-[200px] text-sm sm:text-base"
                        />
                        <div className="text-sm text-muted-foreground">
                          💡 Tip: Sé honesto sobre los riesgos. Los
                          inversionistas valoran la transparencia y ver que
                          tienes planes de contingencia.
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6">
                    <Button
                      variant="outline"
                      onClick={() =>
                        setCurrentStep(Math.max(0, currentStep - 1))
                      }
                      disabled={currentStep === 0}
                      className="w-full sm:w-auto"
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Anterior
                    </Button>
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
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
                            if (
                              result.data.message?.includes("created") &&
                              !businessPlan.entrepreneurshipId
                            ) {
                              message =
                                `🎉 ¡Emprendimiento creado automáticamente!\n\n` +
                                message +
                                `\n\n💡 Se ha creado un emprendimiento por defecto para tu plan de negocios. Puedes editarlo más tarde desde tu perfil.`;
                            }

                            if (
                              result.data.impactAnalysis?.recommendations
                                ?.length > 0
                            ) {
                              const recommendations =
                                result.data.impactAnalysis.recommendations.join(
                                  "\n• "
                                );
                              alert(
                                `${message}\n\n💡 Recomendaciones:\n• ${recommendations}`
                              );
                            } else {
                              alert(message);
                            }
                          } else {
                            alert(
                              "❌ Error al guardar el plan:\n" +
                                (result.error || "Error desconocido")
                            );
                          }
                        }}
                        disabled={loading || autoSaving}
                        className="w-full sm:w-auto"
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
                              // Store completion data and show dialog
                              setCompletionData(result.data);
                              setShowCompletionDialog(true);
                            } else {
                              alert(
                                "❌ Error al finalizar el plan:\n" +
                                  (result.error || "Error desconocido")
                              );
                            }
                          }}
                          disabled={loading || autoSaving}
                          className="w-full sm:w-auto"
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
                          className="w-full sm:w-auto"
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
              <CardTitle className="text-lg sm:text-xl">
                Progreso del Plan
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Haz clic en cualquier paso para navegar directamente
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
                {planSteps.map((step, index) => (
                  <div
                    key={index}
                    className={`text-center p-3 sm:p-4 rounded-lg border cursor-pointer transition-colors ${
                      index <= currentStep
                        ? "bg-green-50 border-green-200 hover:bg-green-100"
                        : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                    }`}
                    onClick={() => setCurrentStep(index)}
                  >
                    <div
                      className={`w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 rounded-full flex items-center justify-center ${
                        index <= currentStep
                          ? "bg-green-100 text-green-600"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {index < currentStep ? (
                        <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                      ) : (
                        <div className="scale-75 sm:scale-100">{step.icon}</div>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm font-medium leading-tight">
                      {step.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
                      {index + 1}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Business Model Canvas */}
        <TabsContent value="canvas" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">
                Business Model Canvas
              </CardTitle>
              <p className="text-sm sm:text-base text-muted-foreground">
                Visualiza tu modelo de negocio de forma interactiva
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 min-h-[400px] sm:min-h-[600px]">
                {/* Key Partners */}
                <Card className="border-2 border-blue-200">
                  <CardHeader className="pb-2 sm:pb-3">
                    <CardTitle className="text-xs sm:text-sm text-blue-600">
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
                      className="min-h-[80px] sm:min-h-[100px] border-none p-0 resize-none text-xs sm:text-sm"
                    />
                  </CardContent>
                </Card>

                {/* Key Activities */}
                <Card className="border-2 border-green-200">
                  <CardHeader className="pb-2 sm:pb-3">
                    <CardTitle className="text-xs sm:text-sm text-green-600">
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
                      className="min-h-[80px] sm:min-h-[100px] border-none p-0 resize-none text-xs sm:text-sm"
                    />
                  </CardContent>
                </Card>

                {/* Value Propositions */}
                <Card className="border-2 border-red-200 sm:row-span-2">
                  <CardHeader className="pb-2 sm:pb-3">
                    <CardTitle className="text-xs sm:text-sm text-red-600">
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
                      className="min-h-[120px] sm:min-h-[200px] border-none p-0 resize-none text-xs sm:text-sm"
                    />
                  </CardContent>
                </Card>

                {/* Customer Relationships */}
                <Card className="border-2 border-purple-200">
                  <CardHeader className="pb-2 sm:pb-3">
                    <CardTitle className="text-xs sm:text-sm text-purple-600">
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
                      className="min-h-[80px] sm:min-h-[100px] border-none p-0 resize-none text-xs sm:text-sm"
                    />
                  </CardContent>
                </Card>

                {/* Customer Segments */}
                <Card className="border-2 border-orange-200 sm:row-span-2">
                  <CardHeader className="pb-2 sm:pb-3">
                    <CardTitle className="text-xs sm:text-sm text-orange-600">
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
                      className="min-h-[120px] sm:min-h-[200px] border-none p-0 resize-none text-xs sm:text-sm"
                    />
                  </CardContent>
                </Card>

                {/* Key Resources */}
                <Card className="border-2 border-green-200">
                  <CardHeader className="pb-2 sm:pb-3">
                    <CardTitle className="text-xs sm:text-sm text-green-600">
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
                      className="min-h-[80px] sm:min-h-[100px] border-none p-0 resize-none text-xs sm:text-sm"
                    />
                  </CardContent>
                </Card>

                {/* Channels */}
                <Card className="border-2 border-purple-200">
                  <CardHeader className="pb-2 sm:pb-3">
                    <CardTitle className="text-xs sm:text-sm text-purple-600">
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
                      className="min-h-[80px] sm:min-h-[100px] border-none p-0 resize-none text-xs sm:text-sm"
                    />
                  </CardContent>
                </Card>

                {/* Cost Structure */}
                <Card className="border-2 border-yellow-200 sm:col-span-2">
                  <CardHeader className="pb-2 sm:pb-3">
                    <CardTitle className="text-xs sm:text-sm text-yellow-600">
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
                      className="min-h-[80px] sm:min-h-[100px] border-none p-0 resize-none text-xs sm:text-sm"
                    />
                  </CardContent>
                </Card>

                {/* Revenue Streams */}
                <Card className="border-2 border-teal-200 sm:col-span-3">
                  <CardHeader className="pb-2 sm:pb-3">
                    <CardTitle className="text-xs sm:text-sm text-teal-600">
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
                      className="min-h-[80px] sm:min-h-[100px] border-none p-0 resize-none text-xs sm:text-sm"
                    />
                  </CardContent>
                </Card>
              </div>

              <div className="flex flex-col sm:flex-row justify-end mt-4 sm:mt-6 gap-2">
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      const completionPercentage =
                        calculateCompletion(businessPlan);

                      // Format data for backend
                      const backendData = {
                        entrepreneurshipId: businessPlan.entrepreneurshipId,
                        tripleImpactAssessment:
                          businessPlan.tripleImpactAssessment,
                        executiveSummary: businessPlan.executiveSummary,
                        businessDescription: businessPlan.businessDescription,
                        marketAnalysis: businessPlan.marketAnalysis,
                        competitiveAnalysis: businessPlan.competitiveAnalysis,
                        marketingStrategy: businessPlan.marketingPlan,
                        operationalPlan: businessPlan.operationalPlan,
                        managementTeam: businessPlan.managementTeam,
                        costStructure: {
                          startupCosts:
                            businessPlan.financialProjections.startupCosts,
                          monthlyExpenses:
                            businessPlan.financialProjections.monthlyExpenses,
                          breakEvenMonth:
                            businessPlan.financialProjections.breakEvenMonth,
                        },
                        revenueStreams:
                          businessPlan.financialProjections.revenueStreams,
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
                        alert(
                          "❌ Error al guardar: " +
                            (result.error || "Error desconocido")
                        );
                      }
                    } catch (error) {
                      console.error("Error saving canvas:", error);
                      alert("❌ Error inesperado al guardar el canvas");
                    }
                  }}
                  disabled={loading || autoSaving}
                  className="w-full sm:w-auto"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading || autoSaving ? "Guardando..." : "Guardar Canvas"}
                </Button>
                <Button
                  onClick={downloadCanvasPDF}
                  className="w-full sm:w-auto"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar a PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Calculator */}
        <TabsContent value="calculator" className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Input Parameters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Calculator className="h-5 w-5" />
                  Parámetros Financieros
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm sm:text-base">
                    Inversión Inicial (Bs.)
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 ml-1 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent className="bg-white border border-gray-200 shadow-lg">
                          <p className="max-w-xs text-gray-800">
                            Capital inicial necesario para comenzar el negocio:
                            equipos, inventario, permisos, capital de trabajo,
                            etc.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="Ej: 50000"
                    value={
                      financialData.initialInvestment === 0
                        ? ""
                        : financialData.initialInvestment.toString()
                    }
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, "");
                      const numValue = value === "" ? 0 : Number(value);
                      setFinancialData((prev) => ({
                        ...prev,
                        initialInvestment: numValue,
                      }));
                      updateBusinessPlan("financialProjections", {
                        ...businessPlan.financialProjections,
                        startupCosts: numValue,
                      });
                    }}
                    className="text-sm sm:text-base"
                  />
                  <p className="text-xs text-muted-foreground">
                    💡 Tip: Incluye todos los gastos necesarios para comenzar
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm sm:text-base">
                    Ingresos Mensuales (Bs.)
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 ml-1 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent className="bg-white border border-gray-200 shadow-lg">
                          <p className="max-w-xs text-gray-800">
                            Estimación realista de tus ingresos mensuales basada
                            en precios y volumen de ventas esperado.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="Ej: 15000"
                    value={
                      financialData.monthlyRevenue === 0
                        ? ""
                        : financialData.monthlyRevenue.toString()
                    }
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, "");
                      const numValue = value === "" ? 0 : Number(value);
                      setFinancialData((prev) => ({
                        ...prev,
                        monthlyRevenue: numValue,
                      }));
                      updateBusinessPlan("financialProjections", {
                        ...businessPlan.financialProjections,
                        monthlyRevenue: numValue,
                      });
                    }}
                    className="text-sm sm:text-base"
                  />
                  <p className="text-xs text-muted-foreground">
                    💡 Tip: Sé conservador en tus estimaciones iniciales
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm sm:text-base">
                    Costos Fijos Mensuales (Bs.)
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 ml-1 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent className="bg-white border border-gray-200 shadow-lg">
                          <p className="max-w-xs text-gray-800">
                            Gastos que no cambian independientemente del volumen
                            de ventas: alquiler, salarios fijos, seguros,
                            servicios básicos, etc.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="Ej: 5000"
                    value={
                      financialData.fixedCosts === 0
                        ? ""
                        : financialData.fixedCosts.toString()
                    }
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, "");
                      const numValue = value === "" ? 0 : Number(value);
                      setFinancialData((prev) => ({
                        ...prev,
                        fixedCosts: numValue,
                      }));
                      // Update monthly expenses in business plan
                      const totalExpenses =
                        numValue + financialData.variableCosts;
                      updateBusinessPlan("financialProjections", {
                        ...businessPlan.financialProjections,
                        monthlyExpenses: totalExpenses,
                      });
                    }}
                    className="text-sm sm:text-base"
                  />
                  <p className="text-xs text-muted-foreground">
                    💡 Tip: Gastos que pagas sin importar cuánto vendas
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm sm:text-base">
                    Costos Variables Mensuales (Bs.)
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 ml-1 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent className="bg-white border border-gray-200 shadow-lg">
                          <p className="max-w-xs text-gray-800">
                            Gastos que cambian según el volumen de ventas:
                            materias primas, comisiones, empaques, transporte,
                            etc.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="Ej: 3000"
                    value={
                      financialData.variableCosts === 0
                        ? ""
                        : financialData.variableCosts.toString()
                    }
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, "");
                      const numValue = value === "" ? 0 : Number(value);
                      setFinancialData((prev) => ({
                        ...prev,
                        variableCosts: numValue,
                      }));
                      // Update monthly expenses in business plan
                      const totalExpenses = financialData.fixedCosts + numValue;
                      updateBusinessPlan("financialProjections", {
                        ...businessPlan.financialProjections,
                        monthlyExpenses: totalExpenses,
                      });
                    }}
                    className="text-sm sm:text-base"
                  />
                  <p className="text-xs text-muted-foreground">
                    💡 Tip: Gastos que aumentan con más ventas
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm sm:text-base">
                    Meses de Proyección
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 ml-1 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent className="bg-white border border-gray-200 shadow-lg">
                          <p className="max-w-xs text-gray-800">
                            Período de tiempo para proyectar el flujo de caja.
                            Recomendado: 12-24 meses para análisis inicial.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="Ej: 12"
                    value={
                      financialData.projectionMonths === 0
                        ? ""
                        : financialData.projectionMonths.toString()
                    }
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, "");
                      const numValue =
                        value === ""
                          ? 0
                          : Math.min(60, Math.max(1, Number(value)));
                      setFinancialData((prev) => ({
                        ...prev,
                        projectionMonths: numValue,
                      }));
                    }}
                    className="text-sm sm:text-base"
                  />
                  <p className="text-xs text-muted-foreground">
                    💡 Tip: 12-24 meses es ideal para análisis inicial
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Key Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <PieChart className="h-5 w-5" />
                  Indicadores Clave
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg">
                    <div className="text-xl sm:text-2xl font-bold text-green-600">
                      {calculateBreakEven()}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      Punto de Equilibrio (meses)
                    </div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-lg">
                    <div className="text-xl sm:text-2xl font-bold text-blue-600">
                      {calculateROI()}%
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      ROI Anual
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex justify-between text-sm sm:text-base">
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
                  <div className="flex justify-between text-sm sm:text-base">
                    <span>Margen de Ganancia:</span>
                    <span className="font-semibold">
                      {financialData.monthlyRevenue > 0
                        ? (
                            ((financialData.monthlyRevenue -
                              financialData.fixedCosts -
                              financialData.variableCosts) /
                              financialData.monthlyRevenue) *
                            100
                          ).toFixed(1)
                        : "0.0"}
                      %
                    </span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base">
                    <span>Ganancia Anual (Bruta):</span>
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

                <Separator />

                <div className="space-y-3">
                  <div className="text-sm font-medium text-orange-600 mb-2">
                    Impuestos Anuales
                  </div>
                  <div className="flex justify-between text-sm sm:text-base">
                    <span>IUE (25% sobre utilidades):</span>
                    <span className="font-semibold text-orange-600">
                      Bs. {calculateIUE().toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base">
                    <span>IT (3% sobre ingresos):</span>
                    <span className="font-semibold text-orange-600">
                      Bs. {calculateIT().toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base">
                    <span>Total Impuestos:</span>
                    <span className="font-semibold text-red-600">
                      Bs. {(calculateIUE() + calculateIT()).toLocaleString()}
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex justify-between text-sm sm:text-base">
                    <span>Ganancia Anual (Neta):</span>
                    <span className="font-semibold text-green-600">
                      Bs. {calculateNetProfit().toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base">
                    <span>ROI Neto:</span>
                    <span className="font-semibold text-green-600">
                      {financialData.initialInvestment > 0
                        ? (
                            (calculateNetProfit() /
                              financialData.initialInvestment) *
                            100
                          ).toFixed(1)
                        : "0.0"}
                      %
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cash Flow Projection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">
                Proyección de Flujo de Caja
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-1 sm:p-2">Mes</th>
                      <th className="text-right p-1 sm:p-2">Ingresos</th>
                      <th className="text-right p-1 sm:p-2">Gastos</th>
                      <th className="text-right p-1 sm:p-2">Ganancia</th>
                      <th className="text-right p-1 sm:p-2">Acumulado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {generateCashFlow().map((month) => (
                      <tr key={month.month} className="border-b">
                        <td className="p-1 sm:p-2 font-medium">
                          {month.month}
                        </td>
                        <td className="text-right p-1 sm:p-2">
                          <span className="hidden sm:inline">Bs. </span>
                          {month.revenue.toLocaleString()}
                        </td>
                        <td className="text-right p-1 sm:p-2">
                          <span className="hidden sm:inline">Bs. </span>
                          {month.expenses.toLocaleString()}
                        </td>
                        <td
                          className={`text-right p-1 sm:p-2 ${month.profit >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          <span className="hidden sm:inline">Bs. </span>
                          {month.profit.toLocaleString()}
                        </td>
                        <td
                          className={`text-right p-1 sm:p-2 font-semibold ${month.cumulative >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          <span className="hidden sm:inline">Bs. </span>
                          {month.cumulative.toLocaleString()}
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

      {/* Completion Dialog */}
      <Dialog
        open={showCompletionDialog}
        onOpenChange={setShowCompletionDialog}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center text-green-600 flex items-center justify-center gap-2">
              <CheckCircle className="h-8 w-8" />
              ¡Plan de Negocios Completado!
            </DialogTitle>
            <DialogDescription className="text-center text-lg">
              Felicitaciones por finalizar tu plan de negocios
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Progress Display */}
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {completionData?.completionPercentage || 100}%
              </div>
              <div className="text-sm text-muted-foreground">
                Progreso completado
              </div>
            </div>

            {/* Success Message */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">
                  ¡Tu plan de negocios ha sido guardado exitosamente!
                </span>
              </div>
            </div>

            {/* Entrepreneurship Creation Message */}
            {completionData?.message?.includes("created") &&
              !businessPlan.entrepreneurshipId && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-blue-800">
                    <Lightbulb className="h-5 w-5" />
                    <div>
                      <div className="font-medium">
                        ¡Emprendimiento creado automáticamente!
                      </div>
                      <div className="text-sm mt-1">
                        Se ha creado un emprendimiento por defecto para tu plan
                        de negocios. Puedes editarlo más tarde desde tu perfil.
                      </div>
                    </div>
                  </div>
                </div>
              )}

            {/* Recommendations */}
            {completionData?.impactAnalysis?.recommendations?.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-2 text-yellow-800">
                  <Target className="h-5 w-5 mt-0.5" />
                  <div>
                    <div className="font-medium mb-2">
                      Recomendaciones finales:
                    </div>
                    <ul className="text-sm space-y-1">
                      {completionData.impactAnalysis.recommendations.map(
                        (rec: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-yellow-600 mt-1">•</span>
                            <span>{rec}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                onClick={() => setShowCompletionDialog(false)}
                className="flex-1"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Continuar
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCompletionDialog(false);
                  setActiveTab("canvas");
                }}
                className="flex-1"
              >
                <FileText className="h-4 w-4 mr-2" />
                Ver Canvas
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCompletionDialog(false);
                  setActiveTab("calculator");
                }}
                className="flex-1"
              >
                <Calculator className="h-4 w-4 mr-2" />
                Ver Calculadora
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
