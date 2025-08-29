import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

// Helper function to handle empty strings and null values
function cleanStringValue(value: string | undefined, fallback: string | null = null): string | null {
  if (!value || value.trim() === '') {
    return fallback;
  }
  return value.trim();
}

// Helper function to convert numbers to Decimal safely
function toDecimal(value: number | undefined): Decimal | null {
  if (value === undefined || value === null || isNaN(value)) {
    return null;
  }
  return new Decimal(value);
}

interface TripleImpactAssessment {
  problemSolved: string;
  beneficiaries: string;
  resourcesUsed: string;
  communityInvolvement: string;
  longTermImpact: string;
}

interface ImpactAnalysis {
  economic: boolean;
  social: boolean;
  environmental: boolean;
  impactScore: number;
  recommendations: string[];
}

// Analyze triple impact based on text content
function analyzeTripleImpact(assessment: TripleImpactAssessment): ImpactAnalysis {
  const text = JSON.stringify(assessment).toLowerCase();
  
  const economic = text.includes('trabajo') || 
                   text.includes('empleo') || 
                   text.includes('ingresos') || 
                   text.includes('finanzas') || 
                   text.includes('rentabilidad') ||
                   text.includes('económico') ||
                   text.includes('ganancia') ||
                   text.includes('dinero');

  const social = text.includes('comunidad') || 
                 text.includes('personas') || 
                 text.includes('sociedad') || 
                 text.includes('familias') || 
                 text.includes('beneficiarios') ||
                 text.includes('social') ||
                 text.includes('educación') ||
                 text.includes('salud');

  const environmental = text.includes('sostenible') || 
                        text.includes('medio ambiente') || 
                        text.includes('verde') || 
                        text.includes('recicl') || 
                        text.includes('ambiental') ||
                        text.includes('ecológico') ||
                        text.includes('naturaleza') ||
                        text.includes('contaminación');

  const impactScore = [economic, social, environmental].filter(Boolean).length * 33.33;
  
  const recommendations = [];
  if (!economic) recommendations.push('Considera cómo tu negocio puede generar empleos o ingresos para la comunidad');
  if (!social) recommendations.push('Piensa en cómo tu negocio puede beneficiar a la sociedad');
  if (!environmental) recommendations.push('Evalúa cómo tu negocio puede cuidar el medio ambiente');

  return {
    economic,
    social,
    environmental,
    impactScore: Math.round(impactScore),
    recommendations
  };
}

// POST /api/businessplan/simulator - Save or update business plan from simulator
export async function POST(request: NextRequest) {
  try {
    console.log('💼 API: Received business plan simulator request');
    
    // Get auth token
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.log('💼 API: Authenticated user:', decoded.username);

    const body = await request.json();
    const {
      entrepreneurshipId,
      tripleImpactAssessment,
      executiveSummary = '',
      businessDescription = '',
      marketAnalysis = '',
      competitiveAnalysis = '',
      marketingStrategy = '',
      operationalPlan = '',
      managementTeam = '',
      costStructure,
      revenueStreams = [],
      riskAnalysis = '',
      businessModelCanvas,
      currentStep = 0,
      completionPercentage = 0,
      isCompleted = false
    } = body;

    console.log('💼 API: Processing simulator data for entrepreneurship:', entrepreneurshipId);
    console.log('💼 API: Request body keys:', Object.keys(body));
    console.log('💼 API: Triple impact assessment:', tripleImpactAssessment);

    // If no entrepreneurshipId provided, try to find user's active entrepreneurship
    let targetEntrepreneurshipId = entrepreneurshipId;
    
    if (!targetEntrepreneurshipId) {
      const userEntrepreneurship = await prisma.entrepreneurship.findFirst({
        where: {
          ownerId: decoded.id,
          isActive: true
        }
      });
      
      if (userEntrepreneurship) {
        targetEntrepreneurshipId = userEntrepreneurship.id;
        console.log('💼 API: Using user\'s active entrepreneurship:', targetEntrepreneurshipId);
      } else {
        // Create a default entrepreneurship for the business plan simulator
        console.log('💼 API: No entrepreneurship found, creating default one for user:', decoded.id);
        
        const defaultEntrepreneurship = await prisma.entrepreneurship.create({
          data: {
            ownerId: decoded.id,
            name: 'Mi Emprendimiento',
            description: 'Emprendimiento creado desde el simulador de plan de negocios',
            category: 'Otros',
            businessStage: 'IDEA',
            municipality: 'Cochabamba', // Default municipality
            department: 'Cochabamba',
            isPublic: false,
            isActive: true,
            viewsCount: 0,
            rating: 0,
            reviewsCount: 0,
          }
        });
        
        targetEntrepreneurshipId = defaultEntrepreneurship.id;
        console.log('💼 API: Created default entrepreneurship:', targetEntrepreneurshipId);
      }
    }

    // Verify entrepreneurship belongs to user
    const entrepreneurship = await prisma.entrepreneurship.findFirst({
      where: {
        id: targetEntrepreneurshipId,
        ownerId: decoded.id
      }
    });

    if (!entrepreneurship) {
      return NextResponse.json(
        { error: 'Entrepreneurship not found or access denied' },
        { status: 404 }
      );
    }

    // Analyze triple impact
    const impactAnalysis = tripleImpactAssessment ? 
      analyzeTripleImpact(tripleImpactAssessment) : 
      { economic: false, social: false, environmental: false, impactScore: 0, recommendations: [] };

    // Determine last section based on current step
    const sectionMap = [
      'triple_impact_assessment',
      'executive_summary', 
      'business_description',
      'market_analysis',
      'competitive_analysis',
      'marketing_plan',
      'operational_plan',
      'management_team',
      'financial_projections',
      'risk_analysis'
    ];
    const lastSection = sectionMap[currentStep] || 'triple_impact_assessment';

    // Check if business plan already exists
    const existingPlan = await prisma.businessPlan.findUnique({
      where: { entrepreneurshipId: targetEntrepreneurshipId }
    });

    let businessPlan;

    if (existingPlan) {
      // Update existing business plan
      console.log('💼 API: Updating existing business plan:', existingPlan.id);
      
      businessPlan = await prisma.businessPlan.update({
        where: { id: existingPlan.id },
        data: {
          tripleImpactAssessment: tripleImpactAssessment || existingPlan.tripleImpactAssessment,
          executiveSummary: cleanStringValue(executiveSummary) || existingPlan.executiveSummary,
          // Note: businessDescription doesn't exist in schema, storing in executiveSummary or missionStatement
          missionStatement: cleanStringValue(businessDescription) || existingPlan.missionStatement,
          marketAnalysis: cleanStringValue(marketAnalysis) || existingPlan.marketAnalysis,
          competitiveAnalysis: cleanStringValue(competitiveAnalysis) || existingPlan.competitiveAnalysis,
          marketingStrategy: cleanStringValue(marketingStrategy) || existingPlan.marketingStrategy,
          operationalPlan: cleanStringValue(operationalPlan) || existingPlan.operationalPlan,
          managementTeam: managementTeam ? (typeof managementTeam === 'string' ? { description: managementTeam } : managementTeam) : existingPlan.managementTeam,
          costStructure: costStructure || existingPlan.costStructure,
          initialInvestment: costStructure?.startupCosts ? toDecimal(costStructure.startupCosts) : existingPlan.initialInvestment,
          monthlyExpenses: costStructure?.monthlyExpenses ? toDecimal(costStructure.monthlyExpenses) : existingPlan.monthlyExpenses,
          breakEvenPoint: costStructure?.breakEvenMonth || existingPlan.breakEvenPoint,
          revenueStreams: revenueStreams.length > 0 ? revenueStreams : existingPlan.revenueStreams,
          riskAnalysis: cleanStringValue(riskAnalysis) || existingPlan.riskAnalysis,
          businessModelCanvas: businessModelCanvas || existingPlan.businessModelCanvas,
          lastSection,
          completionPercentage,
          isCompleted,
        },
        include: {
          entrepreneurship: {
            select: {
              id: true,
              name: true,
              description: true,
              category: true,
              businessStage: true,
              municipality: true,
              isActive: true,
              createdAt: true
            }
          }
        }
      });
    } else {
      // Create new business plan
      console.log('💼 API: Creating new business plan for entrepreneurship:', targetEntrepreneurshipId);
      
      businessPlan = await prisma.businessPlan.create({
        data: {
          entrepreneurshipId: targetEntrepreneurshipId,
          tripleImpactAssessment: tripleImpactAssessment || {},
          executiveSummary: cleanStringValue(executiveSummary),
          // Note: businessDescription doesn't exist in schema, storing in missionStatement
          missionStatement: cleanStringValue(businessDescription),
          marketAnalysis: cleanStringValue(marketAnalysis),
          competitiveAnalysis: cleanStringValue(competitiveAnalysis),
          marketingStrategy: cleanStringValue(marketingStrategy),
          operationalPlan: cleanStringValue(operationalPlan),
          managementTeam: managementTeam ? (typeof managementTeam === 'string' ? { description: managementTeam } : managementTeam) : {},
          costStructure: costStructure || {},
          initialInvestment: costStructure?.startupCosts ? toDecimal(costStructure.startupCosts) : null,
          monthlyExpenses: costStructure?.monthlyExpenses ? toDecimal(costStructure.monthlyExpenses) : null,
          breakEvenPoint: costStructure?.breakEvenMonth || null,
          revenueStreams,
          riskAnalysis: cleanStringValue(riskAnalysis),
          businessModelCanvas: businessModelCanvas || {},
          lastSection,
          completionPercentage,
          isCompleted,
        },
        include: {
          entrepreneurship: {
            select: {
              id: true,
              name: true,
              description: true,
              category: true,
              businessStage: true,
              municipality: true,
              isActive: true,
              createdAt: true
            }
          }
        }
      });
    }

    const response = {
      success: true,
      data: {
        businessPlanId: businessPlan.id,
        entrepreneurshipId: businessPlan.entrepreneurshipId,
        message: existingPlan ? 'Business plan updated successfully' : 'Business plan created successfully',
        completionPercentage: businessPlan.completionPercentage,
        nextRecommendedStep: currentStep < 9 ? currentStep + 1 : undefined,
        impactAnalysis
      }
    };

    console.log('💼 API: Business plan simulator response:', response.data.message);
    return NextResponse.json(response);

  } catch (error) {
    console.error('Error in business plan simulator:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      requestBody: body
    });
    
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }
    
    // Return more detailed error for debugging
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}

// GET /api/businessplan/simulator - Get business plan data for simulator
export async function GET(request: NextRequest) {
  try {
    console.log('💼 API: Received request for business plan simulator data');
    
    // Get auth token
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.log('💼 API: Authenticated user:', decoded.username);

    const { searchParams } = new URL(request.url);
    const entrepreneurshipId = searchParams.get('entrepreneurshipId');

    let whereCondition;
    if (entrepreneurshipId) {
      // Verify entrepreneurship belongs to user
      const entrepreneurship = await prisma.entrepreneurship.findFirst({
        where: {
          id: entrepreneurshipId,
          ownerId: decoded.id
        }
      });

      if (!entrepreneurship) {
        return NextResponse.json(
          { error: 'Entrepreneurship not found or access denied' },
          { status: 404 }
        );
      }

      whereCondition = { entrepreneurshipId };
    } else {
      // Get business plans for all user's entrepreneurships
      whereCondition = {
        entrepreneurship: {
          ownerId: decoded.id
        }
      };
    }

    const businessPlans = await prisma.businessPlan.findMany({
      where: whereCondition,
      include: {
        entrepreneurship: {
          select: {
            id: true,
            name: true,
            description: true,
            category: true,
            businessStage: true,
            municipality: true,
            isActive: true,
            createdAt: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    console.log('💼 API: Found', businessPlans.length, 'business plans for simulator');
    return NextResponse.json({ success: true, data: businessPlans });

  } catch (error) {
    console.error('Error fetching business plan simulator data:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
