import { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from './use-auth';
import { API_BASE, getAuthHeaders, apiCall } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface TripleImpactAssessment {
  problemSolved: string;
  beneficiaries: string;
  resourcesUsed: string;
  communityInvolvement: string;
  longTermImpact: string;
}

interface FinancialProjections {
  startupCosts: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  breakEvenMonth: number;
  revenueStreams: string[];
}

interface BusinessModelCanvas {
  keyPartners: string;
  keyActivities: string;
  valuePropositions: string;
  customerRelationships: string;
  customerSegments: string;
  keyResources: string;
  channels: string;
  costStructure: string;
  revenueStreams: string;
}

interface FinancialCalculator {
  initialInvestment: number;
  monthlyRevenue: number;
  fixedCosts: number;
  variableCosts: number;
  projectionMonths: number;
  cashFlowProjection: Array<{
    month: number;
    revenue: number;
    expenses: number;
    profit: number;
    cumulative: number;
  }>;
}

interface EntrepreneurshipData {
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  businessStage: 'IDEA' | 'STARTUP' | 'GROWING' | 'ESTABLISHED';
  municipality: string;
  department?: string;
}

interface SimulatorData {
  entrepreneurshipId?: string;
  entrepreneurshipData?: EntrepreneurshipData;
  tripleImpactAssessment: TripleImpactAssessment;
  executiveSummary: string;
  businessDescription: string;
  marketAnalysis: string;
  competitiveAnalysis: string;
  marketingStrategy?: string; // Para compatibilidad con backend
  marketingPlan?: string; // Para compatibilidad con frontend
  operationalPlan: string;
  managementTeam: string;
  financialProjections?: FinancialProjections; // Opcional para compatibilidad
  initialInvestment?: string; // Para compatibilidad con backend
  monthlyExpenses?: string; // Para compatibilidad con backend
  breakEvenPoint?: number; // Para compatibilidad con backend
  revenueStreams?: string[]; // Para compatibilidad con backend
  riskAnalysis: string;
  businessModelCanvas?: BusinessModelCanvas | {
    keyPartners: string;
    keyActivities: string;
    valuePropositions: string;
    customerRelationships: string;
    customerSegments: string;
    keyResources: string;
    channels: string;
    costStructure: string;
    revenueStreams: string;
  };
  financialCalculator?: FinancialCalculator;
  costStructure?: {
    startupCosts: number;
    monthlyExpenses: number;
    breakEvenMonth: number;
  };
  currentStep: number;
  completionPercentage?: number;
  isCompleted?: boolean;
}

interface ImpactAnalysis {
  economic: boolean;
  social: boolean;
  environmental: boolean;
  impactScore: number;
  recommendations: string[];
}

interface SimulatorResponse {
  success: boolean;
  data: {
    businessPlanId: string;
    entrepreneurshipId: string;
    message: string;
    completionPercentage: number;
    nextRecommendedStep?: number;
    impactAnalysis: ImpactAnalysis;
  };
}

interface BusinessPlan {
  id: string;
  entrepreneurshipId: string;
  executiveSummary?: string;
  businessDescription?: string;
  marketAnalysis?: string;
  competitiveAnalysis?: string;
  marketingStrategy?: string;
  operationalPlan?: string;
  managementTeam?: string;
  riskAnalysis?: string;
  initialInvestment?: number;
  monthlyExpenses?: number;
  breakEvenPoint?: number;
  businessModelCanvas?: string;
  revenueProjection?: string;
  isCompleted: boolean;
  lastSection?: string;
  completionPercentage: number;
  entrepreneurship?: {
    id: string;
    name: string;
    description: string;
    category: string;
    businessStage: string;
    municipality: string;
    isActive: boolean;
    createdAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export const useBusinessPlanSimulator = () => {
  const { user } = useAuthContext();
  const [plans, setPlans] = useState<BusinessPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveSimulatorData = async (
    data: SimulatorData,
    options?: { silent?: boolean }
  ): Promise<{ success: boolean; data?: SimulatorResponse['data']; error?: string }> => {
    try {
      setSaving(true);
      setError(null);

      const response = await apiCall('/businessplan/simulator', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      
      if (response.success) {
        // Update plans list solo si no es guardado silencioso
        if (!options?.silent) {
          await fetchPlans();
        }
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error || 'Error al guardar el plan' };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error de conexión';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setSaving(false);
    }
  };

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiCall('/businessplan/simulator');
      
      if (response.success) {
        // El backend devuelve el objeto directamente, no dentro de result.data
        // Si result es un array, usarlo directamente
        // Si result es un objeto, convertirlo en array
        const plansArray = Array.isArray(response.data) ? response.data : [response.data];
        setPlans(plansArray);
      } else {
        setError(response.error || 'Error al cargar los planes');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error de conexión';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const getPlan = async (planId: string): Promise<{ success: boolean; data?: BusinessPlan; error?: string }> => {
    try {
      setLoading(true);
      const response = await apiCall(`/businessplan/${planId}`);
      
      if (response.success) {
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error || 'Error al obtener el plan' };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error de conexión';
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const getPlanByEntrepreneurship = async (entrepreneurshipId: string): Promise<{ success: boolean; data?: BusinessPlan; error?: string }> => {
    try {
      setLoading(true);
      const response = await apiCall(`/businessplan/entrepreneurship/${entrepreneurshipId}`);
      
      if (response.success) {
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error || 'Error al obtener el plan' };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error de conexión';
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const updatePlan = async (planId: string, data: Partial<SimulatorData>): Promise<{ success: boolean; data?: BusinessPlan; error?: string }> => {
    try {
      setSaving(true);
      const response = await apiCall(`/businessplan/${planId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      
      if (response.success) {
        await fetchPlans(); // Refresh plans list
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error || 'Error al actualizar el plan' };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error de conexión';
      return { success: false, error: errorMessage };
    } finally {
      setSaving(false);
    }
  };

  const deletePlan = async (planId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setSaving(true);
      const response = await apiCall(`/businessplan/${planId}`, {
        method: 'DELETE',
      });
      
      if (response.success) {
        await fetchPlans(); // Refresh plans list
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Error al eliminar el plan' };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error de conexión';
      return { success: false, error: errorMessage };
    } finally {
      setSaving(false);
    }
  };

  // Auto-save functionality
  const autoSave = async (data: SimulatorData): Promise<void> => {
    try {
      await saveSimulatorData(data);
    } catch (err) {
      console.error('Auto-save failed:', err);
    }
  };

  // Calculate completion percentage locally
  const calculateCompletion = (data: Partial<SimulatorData>): number => {
    const sections = [
      'tripleImpactAssessment',
      'executiveSummary',
      'businessDescription',
      'marketAnalysis',
      'competitiveAnalysis',
      'marketingPlan',
      'operationalPlan',
      'managementTeam',
      'financialProjections',
      'riskAnalysis',
      'businessModelCanvas',
      'financialCalculator'
    ];

    let completedSections = 0;

    sections.forEach(section => {
      if (data[section as keyof SimulatorData]) {
        const sectionData = data[section as keyof SimulatorData];
        if (typeof sectionData === 'object') {
          const hasContent = Object.values(sectionData).some(value => 
            value && (typeof value === 'string' ? value.trim().length > 0 : true)
          );
          if (hasContent) completedSections++;
        } else if (typeof sectionData === 'string' && sectionData.trim().length > 0) {
          completedSections++;
        }
      }
    });

    return Math.round((completedSections / sections.length) * 100);
  };

  // Analyze triple impact locally
  const analyzeTripleImpact = useCallback((assessment: TripleImpactAssessment): ImpactAnalysis => {
    const text = JSON.stringify(assessment).toLowerCase();
    
    const economic = text.includes('trabajo') || 
                     text.includes('empleo') || 
                     text.includes('ingresos') || 
                     text.includes('finanzas') || 
                     text.includes('rentabilidad') ||
                     text.includes('económico');

    const social = text.includes('comunidad') || 
                   text.includes('personas') || 
                   text.includes('sociedad') || 
                   text.includes('familias') || 
                   text.includes('beneficiarios') ||
                   text.includes('social');

    const environmental = text.includes('sostenible') || 
                          text.includes('medio ambiente') || 
                          text.includes('verde') || 
                          text.includes('recicl') || 
                          text.includes('ambiental') ||
                          text.includes('ecológico');

    const impactScore = [economic, social, environmental].filter(Boolean).length * 33.33;
    
    const recommendations = [];
    if (!economic) recommendations.push('Analiza el impacto económico de tu negocio');
    if (!social) recommendations.push('Considera el impacto social en la comunidad');
    if (!environmental) recommendations.push('Evalúa el impacto ambiental de tu negocio');

    return {
      economic,
      social,
      environmental,
      impactScore: Math.round(impactScore),
      recommendations
    };
  }, []);

  useEffect(() => {
    if (user) {
      fetchPlans();
    }
  }, [user, fetchPlans]);

  return {
    plans,
    loading,
    saving,
    error,
    saveSimulatorData,
    fetchPlans,
    getPlan,
    getPlanByEntrepreneurship,
    updatePlan,
    deletePlan,
    autoSave,
    calculateCompletion,
    analyzeTripleImpact,
    refetch: fetchPlans
  };
};
